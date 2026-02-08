const prisma = require('../config/prisma');

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
            const existing = await prisma.analytics.findFirst({
                where: {
                    userId,
                    type,
                    period: 'daily',
                    date: today
                }
            });

            if (existing) {
                return existing;
            }

            // Calculate metrics based on type
            const metrics = type === 'creator'
                ? await this.calculateCreatorMetrics(userId)
                : await this.calculateSellerMetrics(userId);

            const analytics = await prisma.analytics.create({
                data: {
                    userId,
                    type,
                    period: 'daily',
                    date: today,
                    metrics: metrics
                }
            });

            return analytics;
        } catch (error) {
            console.error('Error recording analytics:', error);
            throw error;
        }
    }

    /**
     * Record match feedback for AI learning
     */
    static async recordMatchFeedback(data) {
        try {
            return await prisma.matchFeedback.create({
                data: {
                    userId: data.userId,
                    targetUserId: data.targetUserId,
                    action: data.action,
                    source: data.source || 'unknown',
                    matchId: data.matchId,
                    meta: data.meta || {}
                }
            });
        } catch (error) {
            console.error('Error recording match feedback:', error);
            // Non-blocking failure
            return null;
        }
    }

    /**
     * Calculate creator metrics
     */
    static async calculateCreatorMetrics(userId) {
        const campaigns = await prisma.promotionRequest.findMany({
            where: {
                matchedCreators: {
                    some: { creatorId: userId }
                }
            },
            include: {
                matchedCreators: true
            }
        });

        const completedCampaigns = campaigns.filter(c =>
            c.matchedCreators.some(mc =>
                mc.creatorId === userId && mc.status === 'ACCEPTED'
            )
        );

        const totalEarnings = completedCampaigns.reduce((sum, c) => {
            const creatorMatch = c.matchedCreators.find(mc =>
                mc.creatorId === userId
            );
            return sum + (creatorMatch?.agreedAmount || 0);
        }, 0);

        return {
            totalEarnings,
            campaignsCompleted: completedCampaigns.length,
            campaignsActive: campaigns.filter(c => c.status === 'ACCEPTED').length,
            averageRating: 0,
            profileViews: 0,
            applicationsSent: campaigns.length,
            acceptanceRate: campaigns.length > 0 ? (completedCampaigns.length / campaigns.length) * 100 : 0
        };
    }

    /**
     * Calculate seller metrics
     */
    static async calculateSellerMetrics(userId) {
        const campaigns = await prisma.promotionRequest.findMany({
            where: { sellerId: userId },
            include: { matchedCreators: true }
        });

        const totalSpent = campaigns.reduce((sum, c) => {
            const acceptedCreators = c.matchedCreators.filter(mc => mc.status === 'ACCEPTED');
            return sum + acceptedCreators.reduce((s, mc) => s + (mc.agreedAmount || 0), 0);
        }, 0);

        const campaignsByStatus = {
            open: campaigns.filter(c => c.status === 'OPEN').length,
            active: campaigns.filter(c => c.status === 'ACCEPTED').length,
            completed: campaigns.filter(c => c.status === 'COMPLETED').length,
            cancelled: campaigns.filter(c => c.status === 'CANCELLED').length
        };

        return {
            totalSpent,
            campaignsCreated: campaigns.length,
            campaignsActive: campaignsByStatus.active,
            campaignsCompleted: campaignsByStatus.completed,
            creatorsHired: campaigns.reduce((sum, c) =>
                sum + c.matchedCreators.filter(mc => mc.status === 'ACCEPTED').length, 0
            ),
            campaignsByStatus
        };
    }

    /**
     * Get analytics dashboard data
     */
    static async getDashboardAnalytics(userId, type, period = 'monthly', limit = 12) {
        const analytics = await prisma.analytics.findMany({
            where: { userId, period },
            orderBy: { date: 'desc' },
            take: limit
        });

        if (analytics.length === 0) {
            await this.recordDailySnapshot(userId, type);
            return await prisma.analytics.findMany({
                where: { userId, period },
                orderBy: { date: 'desc' },
                take: limit
            });
        }

        return analytics;
    }

    /**
     * Get analytics summary
     */
    static async getAnalyticsSummary(userId, type) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const analytics = await prisma.analytics.findMany({
            where: {
                userId,
                type,
                date: { gte: thirtyDaysAgo }
            },
            orderBy: { date: 'asc' }
        });

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
        if (previous) {
            growth.earningsGrowth = this.calculateGrowth(
                type === 'creator' ? current.metrics.totalEarnings : current.metrics.totalSpent,
                type === 'creator' ? previous.metrics.totalEarnings : previous.metrics.totalSpent
            );
            growth.campaignsGrowth = this.calculateGrowth(
                type === 'creator' ? current.metrics.campaignsCompleted : current.metrics.campaignsCreated,
                type === 'creator' ? previous.metrics.campaignsCompleted : previous.metrics.campaignsCreated
            );
        }

        return {
            current: current.metrics,
            previous: previous ? previous.metrics : null,
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
        // Since metrics is a JSON field, sorting by nested fields in Prisma varies by DB.
        // For PostgreSQL, we can use raw query or findMany with limited results if list is small.
        // We'll use findMany and manual sort for now, or raw SQL for better performance.
        const analytics = await prisma.analytics.findMany({
            where: { type },
            include: {
                user: {
                    select: { name: true, email: true, avatar: true }
                }
            }
        });

        return analytics
            .sort((a, b) => {
                const valA = type === 'creator' ? (a.metrics.totalEarnings || 0) : (a.metrics.totalSpent || 0);
                const valB = type === 'creator' ? (b.metrics.totalEarnings || 0) : (b.metrics.totalSpent || 0);
                return valB - valA;
            })
            .slice(0, limit);
    }
}

module.exports = AnalyticsService;
