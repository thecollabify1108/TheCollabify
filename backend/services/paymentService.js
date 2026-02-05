const Razorpay = require('razorpay');
const crypto = require('crypto');
const stripeService = require('./stripeService');

let razorpay;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay initialized (Legacy Mode)');
    } catch (error) {
        console.warn('⚠️ Razorpay initialization failed');
    }
}

/**
 * Modern Payment Service (Stripe + Razorpay Fallback)
 */

// 1. Stripe Methods (Preferred for Guardian Elite)
exports.stripe = stripeService;

// 2. Legacy Razorpay Methods
const ensureRazorpay = () => {
    if (!razorpay) throw new Error('Razorpay not initialized');
    return razorpay;
};

exports.createRazorpayOrder = async (amount, currency = 'INR') => {
    const rp = ensureRazorpay();
    const order = await rp.orders.create({
        amount: amount * 100,
        currency,
        receipt: `receipt_${Date.now()}`
    });
    return order;
};

exports.verifyRazorpayPayment = (orderId, paymentId, signature) => {
    const text = orderId + '|' + paymentId;
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');
    return generatedSignature === signature;
};

exports.refundPayment = async (paymentId, amount = null) => {
    // We'll need to check if it's a Stripe or Razorpay payment in a higher-level logic
    // For now, keep the Razorpay logic here
    try {
        const rp = ensureRazorpay();
        return await rp.payments.refund(paymentId, {
            amount: amount ? amount * 100 : undefined,
            speed: 'normal'
        });
    } catch (error) {
        throw new Error('Refund failed: ' + error.message);
    }
};
