const Analytics = require('../models/Analytics');
const PromotionRequest = require('../models/PromotionRequest');
const User = require('../models/User');

/**
 * Service for analytics data aggregation and calculations
 */
class AnalyticsService {
    /**
     * Record daily analytics snapshot
     */
    static async recordDailySnapshot(userId, type) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if snapshot already exists
            const existing = await Analytics.findOne({
                userId,
                type,
                period: 'daily',
                date: today
            });

            if (existing) {
                return existing;
            }

            // Calculate metrics based on type
            const metrics = type === 'creator'
                ? await this.calculateCreatorMetrics(userId)
                : await this.calculateSellerMetrics(userId);

            const analytics = new Analytics({
                userId,
                type,
                period: 'daily',
                date: today,
                ...(type === 'creator' ? { creatorMetrics: metrics } : { sellerMetrics: metrics })
            });

            await analytics.save();
            return analytics;
        } catch (error) {
            console.error('Error recording analytics:', error);
            throw error;
        }
    }

    /**
     * Calculate creator metrics
     */
    static async calculateCreatorMetrics(userId) {
        const campaigns = await PromotionRequest.find({
            'matchedCreators.creatorId': userId
        });

        const completedCampaigns = campaigns.filter(c =>
            c.matchedCreators.some(mc =>
                mc.creatorId.toString() === userId.toString() && mc.status === 'Accepted'
            )
        );

        const totalEarnings = completedCampaigns.reduce((sum, c) => {
            const creator = c.matchedCreators.find(mc =>
                mc.creatorId.toString() === userId.toString()
            );
            return sum + (creator?.agreedAmount || 0);
        }, 0);

        return {
            totalEarnings,
            campaignsCompleted: completedCampaigns.length,
            campaignsActive: campaigns.filter(c => c.status === 'Accepted').length,
            averageRating: 0, // Calculate from reviews
            profileViews: 0, // Track separately
            applicationsSent: campaigns.length,
            acceptanceRate: campaigns.length > 0 ? (completedCampaigns.length / campaigns.length) * 100 : 0
        };
    }

    /**
     * Calculate seller metrics
     */
    static async calculateSellerMetrics(userId) {
        const campaigns = await PromotionRequest.find({ sellerId: userId });

        const totalSpent = campaigns.reduce((sum, c) => {
            const acceptedCreators = c.matchedCreators.filter(mc => mc.status === 'Accepted');
            return sum + acceptedCreators.reduce((s, mc) => s + (mc.agreedAmount || 0), 0);
        }, 0);

        const campaignsByStatus = {
            open: campaigns.filter(c => c.status === 'Open').length,
            active: campaigns.filter(c => c.status === 'Accepted').length,
            completed: campaigns.filter(c => c.status === 'Completed').length,
            cancelled: campaigns.filter(c => c.status === 'Cancelled').length
        };

        return {
            totalSpent,
            campaignsCreated: campaigns.length,
            campaignsActive: campaignsByStatus.active,
            campaignsCompleted: campaignsByStatus.completed,
            creatorsHired: campaigns.reduce((sum, c) =>
                sum + c.matchedCreators.filter(mc => mc.status === 'Accepted').length, 0
            ),
            campaignsByStatus
        };
    }

    /**
     * Get analytics dashboard data
     */
    static async getDashboardAnalytics(userId, type, period = 'monthly', limit = 12) {
        const analytics = await Analytics.getUserAnalytics(userId, period, limit);

        if (analytics.length === 0) {
            // Generate first snapshot
            await this.recordDailySnapshot(userId, type);
            return await Analytics.getUserAnalytics(userId, period, limit);
        }

        return analytics;
    }

    /**
     * Get analytics summary
     */
    static async getAnalyticsSummary(userId, type) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const analytics = await Analytics.find({
            userId,
            type,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: 1 });

        if (analytics.length === 0) {
            return {
                current: {},
                previous: {},
                growth: {}
            };
        }

        const current = analytics[analytics.length - 1];
        const previous = analytics.length > 1 ? analytics[analytics.length - 2] : null;

        const growth = {};
        if (previous && type === 'creator') {
            growth.earningsGrowth = this.calculateGrowth(
                current.creatorMetrics.totalEarnings,
                previous.creatorMetrics.totalEarnings
            );
            growth.campaignsGrowth = this.calculateGrowth(
                current.creatorMetrics.campaignsCompleted,
                previous.creatorMetrics.campaignsCompleted
            );
        } else if (previous && type === 'seller') {
            growth.spentGrowth = this.calculateGrowth(
                current.sellerMetrics.totalSpent,
                previous.sellerMetrics.totalSpent
            );
            growth.campaignsGrowth = this.calculateGrowth(
                current.sellerMetrics.campaignsCreated,
                previous.sellerMetrics.campaignsCreated
            );
        }

        return {
            current: type === 'creator' ? current.creatorMetrics : current.sellerMetrics,
            previous: previous ? (type === 'creator' ? previous.creatorMetrics : previous.sellerMetrics) : null,
            growth
        };
    }

    /**
     * Calculate growth percentage
     */
    static calculateGrowth(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    }

    /**
     * Get top performers
     */
    static async getTopPerformers(type, limit = 10) {
        const field = type === 'creator' ? 'creatorMetrics.totalEarnings' : 'sellerMetrics.totalSpent';

        const topAnalytics = await Analytics.find({ type })
            .sort({ [field]: -1 })
            .limit(limit)
            .populate('userId', 'name email profilePicture');

        return topAnalytics;
    }
}

module.exports = AnalyticsService;
