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
