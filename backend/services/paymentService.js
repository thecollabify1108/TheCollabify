const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpay;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Razorpay:', error.message);
    }
} else {
    console.warn('⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment features will be disabled.');
}

// Helper to ensure razorpay is initialized before use
const ensureRazorpay = () => {
    if (!razorpay) {
        throw new Error('Razorpay is not initialized. Please check your environment variables.');
    }
    return razorpay;
};

/**
 * Create subscription
 */
exports.createSubscription = async (planId, userId) => {
    try {
        const rp = ensureRazorpay();
        const subscription = await rp.subscriptions.create({
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
        const rp = ensureRazorpay();
        const order = await rp.orders.create({
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
        const rp = ensureRazorpay();
        const refund = await rp.payments.refund(paymentId, {
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
        const rp = ensureRazorpay();
        const payment = await rp.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        throw new Error('Failed to fetch payment: ' + error.message);
    }
};
