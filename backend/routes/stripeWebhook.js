/**
 * Stripe Webhook Handler
 *
 * IMPORTANT: This route uses express.raw() to preserve the raw request body,
 * which is required by Stripe for signature verification.
 * It MUST be registered in app.js BEFORE express.json() middleware.
 *
 * Handled events:
 *   - checkout.session.completed → auto-confirms escrow deposit & unlocks chat
 */

const express = require('express');
const router = express.Router();
let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    } else {
        console.warn('[Stripe Webhook] STRIPE_SECRET_KEY missing — webhook will reject events.');
    }
} catch (e) {
    console.warn('[Stripe Webhook] Failed to init Stripe:', e.message);
}
const prisma = require('../config/prisma');

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured');
        return res.status(500).json({ error: 'Webhook not configured on server' });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle checkout.session.completed → confirm escrow deposit automatically
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const escrowId = session.metadata?.escrowId;
        const paymentIntentId = session.payment_intent;

        if (!escrowId) {
            // Not an escrow checkout — ignore silently
            return res.json({ received: true });
        }

        try {
            const escrow = await prisma.escrowPayment.findUnique({ where: { id: escrowId } });

            if (!escrow) {
                console.error(`[Stripe Webhook] Escrow not found: ${escrowId}`);
                // Return 200 so Stripe doesn't retry — the record is genuinely missing
                return res.json({ received: true });
            }

            if (escrow.status !== 'PENDING_DEPOSIT') {
                // Already processed (idempotency guard)
                console.warn(`[Stripe Webhook] Escrow ${escrowId} already at status ${escrow.status} — skipping`);
                return res.json({ received: true });
            }

            // Mark escrow as HELD
            await prisma.escrowPayment.update({
                where: { id: escrowId },
                data: {
                    status: 'HELD',
                    depositedAt: new Date(),
                    stripePaymentIntentId: paymentIntentId || null
                }
            });

            // Unlock full chat for this collaboration
            const collaboration = await prisma.collaboration.findUnique({
                where: { id: escrow.collaborationId },
                include: { matchedCreator: { include: { promotion: true } } }
            });
            if (collaboration) {
                await prisma.conversation.updateMany({
                    where: {
                        promotionId: collaboration.matchedCreator.promotionId,
                        creatorUserId: escrow.creatorUserId,
                        sellerId: escrow.brandUserId
                    },
                    data: { isEscrowUnlocked: true }
                });
            }

            // Notify creator
            try {
                const { createNotification } = require('../services/notificationService');
                await createNotification({
                    userId: escrow.creatorUserId,
                    title: 'Escrow Payment Received',
                    message: `A brand has deposited ₹${escrow.collaborationAmount} into escrow. Full chat is now unlocked.`,
                    type: 'escrow_payment',
                    link: `/collaborations/${escrow.collaborationId}`
                });
            } catch (notifErr) {
                console.warn('[Stripe Webhook] Creator notification failed (non-fatal):', notifErr.message);
            }

            console.log(`[Stripe Webhook] ✅ Escrow ${escrowId} auto-confirmed as HELD (PaymentIntent: ${paymentIntentId})`);
        } catch (err) {
            console.error('[Stripe Webhook] Failed to process escrow confirmation:', err);
            // Return 500 so Stripe retries the event
            return res.status(500).json({ error: 'Internal error processing escrow' });
        }
    }

    res.json({ received: true });
});

module.exports = router;
