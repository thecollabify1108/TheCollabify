const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'NEW_MATCH',           // Creator: New promotion request matches their profile
            'CREATOR_APPLIED',     // Seller: A creator applied to their request
            'CREATOR_ACCEPTED',    // Creator: Seller accepted their application
            'CREATOR_REJECTED',    // Creator: Seller rejected their application
            'REQUEST_UPDATE',      // General: Campaign status updated
            'PROFILE_INSIGHT',     // Creator: New insights generated
            'WELCOME'              // Both: Welcome notification
        ],
        required: true
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },

    // Related entities for navigation
    relatedRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromotionRequest'
    },
    relatedCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreatorProfile'
    },

    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Mark notification as read
notificationSchema.methods.markAsRead = async function () {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        await this.save();
    }
    return this;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
    return await this.countDocuments({ userId, isRead: false });
};

// Index for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
