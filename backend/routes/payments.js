const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const prisma = require('../config/prisma');

/**
 * @route   POST /api/payments/onboard
 * @desc    Start Stripe Connect onboarding for Creator
 */
router.post('/onboard', auth, async (req, res) => {
    try {
        if (req.user.activeRole !== 'CREATOR') {
            return res.status(403).json({ success: false, message: 'Only creators can onboard for payments' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const accountId = await paymentService.stripe.createConnectAccount(user);

        // Save account ID
        await prisma.user.update({
            where: { id: req.userId },
            data: { stripeAccountId: accountId }
        });

        const onboardingUrl = await paymentService.stripe.createAccountLink(accountId);

        res.json({
            success: true,
            data: { onboardingUrl }
        });
    } catch (error) {
        console.error('Stripe onboarding error:', error);
        res.status(500).json({ success: false, message: 'Failed to start onboarding' });
    }
});

/**
 * @route   POST /api/payments/create-escrow-session
 * @desc    Create Stripe Checkout session for Campaign Escrow
 */
router.post('/create-escrow-session', auth, async (req, res) => {
    try {
        const { amount, promotionId, creatorId } = req.body;

        if (req.user.activeRole !== 'SELLER') {
            return res.status(403).json({ success: false, message: 'Only sellers can initiate payments' });
        }

        const creator = await prisma.user.findUnique({ where: { id: creatorId } });
        if (!creator || !creator.stripeAccountId) {
            return res.status(400).json({ success: false, message: 'Creator is not onboarded for payments' });
        }

        const promotion = await prisma.promotionRequest.findUnique({ where: { id: promotionId } });

        const session = await paymentService.stripe.createEscrowSession(
            amount,
            req.userId,
            creator.stripeAccountId,
            { promotionId, campaignTitle: promotion.title }
        );

        // Create pending payment record
        await prisma.payment.create({
            data: {
                userId: req.userId,
                amount: amount,
                currency: 'INR',
                status: 'PENDING',
                stripeSessionId: session.id,
                orderId: `stripe_${session.id.substring(0, 10)}`, // Link to unique order field
                metadata: { promotionId, creatorId }
            }
        });

        res.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            }
        });
    } catch (error) {
        console.error('Escrow session error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/payments/verify-session/:sessionId
 * @desc    Verify Stripe session status
 */
router.get('/verify-session/:sessionId', auth, async (req, res) => {
    try {
        const payment = await prisma.payment.findUnique({
            where: { stripeSessionId: req.params.sessionId }
        });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        // Webhooks will handle the actual completion, 
        // this is just for UI to check if it's already done.
        res.json({
            success: true,
            data: { status: payment.status }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/payments/release-escrow/:paymentId
 * @desc    Release funds to creator (Platform/Seller action)
 */
router.post('/release-escrow/:paymentId', auth, async (req, res) => {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: req.params.paymentId },
            include: { user: true }
        });

        if (!payment || payment.status !== 'COMPLETED') {
            return res.status(400).json({ success: false, message: 'Invalid payment or payment not completed yet' });
        }

        const { promotionId, creatorId } = payment.metadata;
        const creator = await prisma.user.findUnique({ where: { id: creatorId } });

        if (!creator || !creator.stripeAccountId) {
            return res.status(400).json({ success: false, message: 'Creator Stripe account not found' });
        }

        // Release funds
        const transfer = await paymentService.stripe.releaseEscrow(
            payment.stripePaymentIntentId,
            creator.stripeAccountId,
            payment.amount * 0.9 // Platform takes 10% fee
        );

        // Update payment and promotion status
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: payment.id },
                data: {
                    stripeTransferId: transfer.id,
                    status: 'RELEASED'
                }
            }),
            prisma.promotionRequest.update({
                where: { id: promotionId },
                data: { status: 'COMPLETED' }
            })
        ]);

        res.json({
            success: true,
            message: 'Funds released to creator successfully',
            data: { transferId: transfer.id }
        });
    } catch (error) {
        console.error('Release escrow error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe Webhook Handler
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                await prisma.payment.update({
                    where: { stripeSessionId: session.id },
                    data: {
                        status: 'COMPLETED',
                        stripePaymentIntentId: session.payment_intent,
                        completedAt: new Date()
                    }
                });
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                await prisma.payment.update({
                    where: { stripePaymentIntentId: failedIntent.id },
                    data: {
                        status: 'FAILED',
                        failureReason: failedIntent.last_payment_error?.message
                    }
                });
                break;

            case 'account.updated':
                const account = event.data.object;
                if (account.details_submitted) {
                    await prisma.user.update({
                        where: { stripeAccountId: account.id },
                        data: { stripeOnboardingComplete: true }
                    });
                }
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
