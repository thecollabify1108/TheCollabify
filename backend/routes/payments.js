const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const User = require('../models/User');

/**
 * Create order
 */
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount, planId } = req.body;

        const order = await paymentService.createOrder(amount);

        // Save order to database
        const payment = new Payment({
            userId: req.user.id,
            orderId: order.id,
            amount: amount,
            currency: 'INR',
            status: 'created',
            planId
        });

        await payment.save();

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Verify payment
 */
router.post('/verify-payment', auth, async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        const isValid = paymentService.verifyPayment(orderId, paymentId, signature);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Update payment status
        const payment = await Payment.findOne({ orderId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        payment.paymentId = paymentId;
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // Update user subscription
        const user = await User.findById(req.user.id);
        user.subscription = {
            plan: payment.planId,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
        await user.save();

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                paymentId,
                subscription: user.subscription
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Webhook handler
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];

        const isValid = paymentService.verifyWebhook(req.body, signature);

        if (!isValid) {
            return res.status(400).json({ success: false });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        // Handle different events
        switch (event) {
            case 'payment.captured':
                // Handle successful payment
                // We typically verify via the frontend route too, but webhook is backup
                break;

            case 'payment.failed':
                // Handle failed payment
                break;

            case 'subscription.charged':
                // Handle subscription renewal
                break;

            default:
                console.log(`Unhandled event: ${event}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false });
    }
});

/**
 * Get payment history
 */
router.get('/history', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: { payments }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
