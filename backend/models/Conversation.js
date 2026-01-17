const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromotionRequest',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreatorProfile'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'closed', 'archived'],
        default: 'active'
    },
    // For accept/reject feature - tracks if conversation needs approval
    acceptanceStatus: {
        byCreator: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        bySeller: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'accepted' }
    },
    // For one-sided delete - tracks who has deleted the conversation from their view
    deletedBy: [{
        userId: mongoose.Schema.Types.ObjectId,
        deletedAt: { type: Date, default: Date.now }
    }],
    lastMessage: {
        content: String,
        senderId: mongoose.Schema.Types.ObjectId,
        createdAt: Date
    },
    unreadCountSeller: {
        type: Number,
        default: 0
    },
    unreadCountCreator: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient querying
conversationSchema.index({ sellerId: 1, createdAt: -1 });
conversationSchema.index({ creatorUserId: 1, createdAt: -1 });
conversationSchema.index({ promotionId: 1 });

// Ensure unique conversation per promotion-creator pair
conversationSchema.index({ promotionId: 1, creatorUserId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
