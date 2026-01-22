# 💰 TheCollabify - Payment Integration Guide

## Razorpay Integration (Complete)

### Backend Service

```javascript
// backend/services/paymentService.js
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create subscription
 */
exports.createSubscription = async (planId, userId) => {
    try {
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 12, // 12 months
            notes: {
                userId: userId
            }
        });

        return subscription;
    } catch (error) {
        throw new Error('Subscription creation failed: ' + error.message);
    }
};

/**
 * Create order for one-time payment
 */
exports.createOrder = async (amount, currency = 'INR') => {
    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                description: 'TheCollabify payment'
            }
        });

        return order;
    } catch (error) {
        throw new Error('Order creation failed: ' + error.message);
    }
};

/**
 * Verify payment signature
 */
exports.verifyPayment = (orderId, paymentId, signature) => {
    const text = orderId + '|' + paymentId;
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

    return generatedSignature === signature;
};

/**
 * Verify webhook signature
 */
exports.verifyWebhook = (body, signature) => {
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');

    return expectedSignature === signature;
};

/**
 * Refund payment
 */
exports.refundPayment = async (paymentId, amount = null) => {
    try {
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount ? amount * 100 : undefined,
            speed: 'normal'
        });

        return refund;
    } catch (error) {
        throw new Error('Refund failed: ' + error.message);
    }
};

/**
 * Get payment details
 */
exports.getPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        throw new Error('Failed to fetch payment: ' + error.message);
    }
};
```

### Backend Routes

```javascript
// backend/routes/payments.js
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
                await handlePaymentSuccess(payload.payment.entity);
                break;

            case 'payment.failed':
                // Handle failed payment
                await handlePaymentFailure(payload.payment.entity);
                break;

            case 'subscription.charged':
                // Handle subscription renewal
                await handleSubscriptionRenewal(payload.subscription.entity);
                break;

            case 'subscription.cancelled':
                // Handle subscription cancellation
                await handleSubscriptionCancellation(payload.subscription.entity);
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
```

### Payment Model

```javascript
// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: String,
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'completed', 'failed', 'refunded'],
        default: 'created'
    },
    planId: String,
    refundId: String,
    refundAmount: Number,
    completedAt: Date,
    failedAt: Date,
    refundedAt: Date,
    failureReason: String,
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
```

### Frontend Integration

```javascript
// frontend/src/components/payment/PaymentModal.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const PaymentModal = ({ plan, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        try {
            setProcessing(true);

            // Create order
            const { data } = await axios.post('/api/payments/create-order', {
                amount: plan.price,
                planId: plan.id
            });

            // Razorpay options
            const options = {
                key: data.data.keyId,
                amount: data.data.amount,
                currency: data.data.currency,
                order_id: data.data.orderId,
                name: 'TheCollabify',
                description: `${plan.name} Subscription`,
                image: '/logo.png',
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyRes = await axios.post('/api/payments/verify-payment', {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            toast.success('Payment successful!');
                            onSuccess?.(verifyRes.data.data);
                           onClose?.();
                        }
                    } catch (error) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ''
                },
                theme: {
                    color: '#8B5CF6'
                },
                modal: {
                    ondismiss: function() {
                        setProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error('Failed to initiate payment');
            setProcessing(false);
        }
    };

    return (
        <div className="payment-modal">
            {/* Your modal UI */}
            <button onClick={handlePayment} disabled={processing}>
                {processing ? 'Processing...' : `Pay ₹${plan.price}`}
            </button>
        </div>
    );
};

export default PaymentModal;
```

## Testing Payments

### Test Card Numbers (Razorpay Test Mode)

```
Success: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Failure: 4000 0000 0000 0002
```

### Test Mode Setup

1. Use test API keys (starts with `rzp_test_`)
2. Test webhook with Razorpay CLI:
```bash
npm install -g razorpay-webhook
razorpay-webhook localhost:5000/api/payments/webhook
```

## Go Live Checklist

- [ ] KYC verified on Razorpay
- [ ] Replace test keys with live keys
- [ ] Test with real small amount (₹1)
- [ ] Set up webhook endpoint
- [ ] Enable 3D Secure
- [ ] Set up auto-capture
- [ ] Configure email notifications
- [ ] Test refund flow
- [ ] Monitor first few transactions

## Support

Razorpay Support: support@razorpay.com  
Documentation: https://razorpay.com/docs/
