const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['creator', 'seller'],
        required: true
    },
    // Time period
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },

    // Creator Analytics
    creatorMetrics: {
        totalEarnings: { type: Number, default: 0 },
        campaignsCompleted: { type: Number, default: 0 },
        campaignsActive: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        profileViews: { type: Number, default: 0 },
        applicationsSent: { type: Number, default: 0 },
        acceptanceRate: { type: Number, default: 0 },

        // Engagement
        totalEngagement: { type: Number, default: 0 },
        avgEngagementRate: { type: Number, default: 0 },

        // Followers by platform
        followersByPlatform: {
            instagram: { type: Number, default: 0 },
            youtube: { type: Number, default: 0 },
            tiktok: { type: Number, default: 0 },
            twitter: { type: Number, default: 0 },
            linkedin: { type: Number, default: 0 }
        },

        // Top performing content
        topContentTypes: [{
            type: String,
            count: Number,
            avgEngagement: Number
        }],

        // Growth metrics
        followerGrowth: { type: Number, default: 0 },
        earningsGrowth: { type: Number, default: 0 }
    },

    // Seller Analytics
    sellerMetrics: {
        totalSpent: { type: Number, default: 0 },
        campaignsCreated: { type: Number, default: 0 },
        campaignsActive: { type: Number, default: 0 },
        campaignsCompleted: { type: Number, default: 0 },
        creatorsHired: { type: Number, default: 0 },
        totalReach: { type: Number, default: 0 },
        totalEngagement: { type: Number, default: 0 },
        averageROI: { type: Number, default: 0 },

        // Campaign performance
        campaignsByStatus: {
            open: { type: Number, default: 0 },
            active: { type: Number, default: 0 },
            completed: { type: Number, default: 0 },
            cancelled: { type: Number, default: 0 }
        },

        // Top performing campaigns
        topCampaigns: [{
            campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionRequest' },
            name: String,
            roi: Number,
            engagement: Number
        }],

        // Spending by category
        spendingByCategory: [{
            category: String,
            amount: Number
        }]
    },

    // Common metrics
    commonMetrics: {
        messagesExchanged: { type: Number, default: 0 },
        responseTime: { type: Number, default: 0 }, // in hours
        satisfactionScore: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Indexes for fast queries
analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ type: 1, period: 1, date: -1 });

// Static method to get analytics for user
analyticsSchema.statics.getUserAnalytics = async function (userId, period = 'monthly', limit = 12) {
    return await this.find({ userId, period })
        .sort({ date: -1 })
        .limit(limit);
};

// Static method to aggregate analytics
analyticsSchema.statics.aggregateAnalytics = async function (userId, startDate, endDate) {
    return await this.aggregate([
        {
            $match: {
                userId: mongoose.Types.ObjectId(userId),
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: '$creatorMetrics.totalEarnings' },
                totalSpent: { $sum: '$sellerMetrics.totalSpent' },
                totalCampaigns: { $sum: '$creatorMetrics.campaignsCompleted' },
                avgRating: { $avg: '$creatorMetrics.averageRating' }
            }
        }
    ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);
