const prisma = require('../config/prisma');
const { getReliabilityLevel } = require('./reliabilityService');

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
     * Record friction event for drop-off intelligence
     */
    static async recordFrictionEvent(data) {
        try {
            return await prisma.frictionEvent.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    severity: data.severity || 'MEDIUM',
                    meta: data.meta || {}
                }
            });
        } catch (error) {
            console.error('Error recording friction event:', error);
            return null;
        }
    }

    /**
     * Track match outcome and update timeline
     */
    static async trackMatchOutcome(data) {
        try {
            const { matchId, status } = data;

            // Find existing outcome or create new
            const existing = await prisma.matchOutcome.findUnique({
                where: { matchId }
            });

            const timeline = existing ? (existing.timeline || {}) : {};

            // Add new status to timeline if not present
            if (!timeline[status]) {
                timeline[status] = new Date();
            }

            return await prisma.matchOutcome.upsert({
                where: { matchId },
                update: {
                    status,
                    timeline,
                    updatedAt: new Date()
                },
                create: {
                    matchId,
                    status,
                    timeline
                }
            });
        } catch (error) {
            console.error('Error tracking match outcome:', error);
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

    // ─── Insights (Lifecycle-based) ─────────────────────────────

    /**
     * Helper: Calculate average days between two statusHistory entries
     */
    static _avgDaysBetween(collaborations, fromStatus, toStatus) {
        const durations = [];
        for (const collab of collaborations) {
            const history = Array.isArray(collab.statusHistory) ? collab.statusHistory : [];
            const fromEntry = history.find(h => h.to === fromStatus);
            const toEntry = history.find(h => h.to === toStatus);
            if (fromEntry?.at && toEntry?.at) {
                const ms = new Date(toEntry.at) - new Date(fromEntry.at);
                if (ms > 0) durations.push(ms / (1000 * 60 * 60 * 24));
            }
        }
        if (durations.length === 0) return null;
        return Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10;
    }

    /**
     * Admin Insights — Platform-wide analytics
     */
    static async getAdminInsights() {
        const [
            totalBrands,
            totalCreators,
            collabsByStatus,
            allCollabs
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'SELLER', isActive: true } }),
            prisma.user.count({ where: { role: 'CREATOR', isActive: true } }),
            prisma.collaboration.groupBy({
                by: ['status'],
                _count: { id: true }
            }),
            prisma.collaboration.findMany({
                select: { status: true, statusHistory: true, createdAt: true, completedAt: true }
            })
        ]);

        const statusMap = {};
        for (const g of collabsByStatus) statusMap[g.status] = g._count.id;

        const totalCollabs = allCollabs.length;
        const requested = statusMap['REQUESTED'] || 0;
        const accepted = (statusMap['ACCEPTED'] || 0) + (statusMap['IN_DISCUSSION'] || 0) +
            (statusMap['AGREED'] || 0) + (statusMap['IN_PROGRESS'] || 0) +
            (statusMap['COMPLETED'] || 0);
        const active = (statusMap['ACCEPTED'] || 0) + (statusMap['IN_DISCUSSION'] || 0) +
            (statusMap['AGREED'] || 0) + (statusMap['IN_PROGRESS'] || 0);

        return {
            totalBrands,
            totalCreators,
            activeCollaborations: active,
            completedCollaborations: statusMap['COMPLETED'] || 0,
            cancelledCollaborations: statusMap['CANCELLED'] || 0,
            acceptanceRate: totalCollabs > 0
                ? Math.round((accepted / totalCollabs) * 100)
                : 0,
            avgDaysToAccept: this._avgDaysBetween(allCollabs, 'REQUESTED', 'ACCEPTED'),
            avgDaysToComplete: this._avgDaysBetween(allCollabs, 'AGREED', 'COMPLETED')
        };
    }

    /**
     * Brand Insights — Scoped to a single seller
     */
    static async getBrandInsights(sellerId) {
        // Get all promotion requests for this seller
        const campaigns = await prisma.promotionRequest.findMany({
            where: { sellerId },
            select: {
                id: true,
                status: true,
                matchedCreators: {
                    select: {
                        id: true,
                        status: true,
                        collaboration: true,
                        creatorId: true
                    }
                }
            }
        });

        // Get brand's own reliability score
        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: { reliabilityScore: true }
        });

        const campaignsLaunched = campaigns.length;
        let creatorsShortlisted = 0;
        let totalCollabs = 0;
        let acceptedCollabs = 0;
        let completedCollabs = 0;
        const durations = [];

        let totalReliabilitySum = 0;
        let creatorCountWithReliability = 0;

        for (const campaign of campaigns) {
            creatorsShortlisted += campaign.matchedCreators.length;
            for (const mc of campaign.matchedCreators) {
                // Fetch creator reliability score for averaging
                const cp = await prisma.creatorProfile.findUnique({
                    where: { userId: mc.creatorId },
                    select: { reliabilityScore: true }
                });
                if (cp) {
                    totalReliabilitySum += cp.reliabilityScore;
                    creatorCountWithReliability++;
                }

                if (mc.collaboration) {
                    totalCollabs++;
                    const c = mc.collaboration;
                    if (['ACCEPTED', 'IN_DISCUSSION', 'AGREED', 'IN_PROGRESS', 'COMPLETED'].includes(c.status)) {
                        acceptedCollabs++;
                    }
                    if (c.status === 'COMPLETED') {
                        completedCollabs++;
                        if (c.createdAt && c.completedAt) {
                            const days = (new Date(c.completedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
                            if (days > 0) durations.push(days);
                        }
                    }
                }
            }
        }

        return {
            campaignsLaunched,
            creatorsShortlisted,
            acceptanceRate: totalCollabs > 0 ? Math.round((acceptedCollabs / totalCollabs) * 100) : 0,
            completionRate: totalCollabs > 0 ? Math.round((completedCollabs / totalCollabs) * 100) : 0,
            avgCollaborationDays: durations.length > 0
                ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
                : null,
            reliabilityScore: seller?.reliabilityScore || 1.0,
            matchReliabilityAvg: creatorCountWithReliability > 0
                ? (totalReliabilitySum / creatorCountWithReliability).toFixed(2)
                : 1.0
        };
    }

    /**
     * Creator Insights — Scoped to a single creator user
     */
    static async getCreatorInsights(userId) {
        // Get creator profile for completion %
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: {
                id: true,
                profileCompletionPercentage: true,
                reliabilityScore: true
            }
        });

        if (!profile) {
            return {
                requestsReceived: 0,
                acceptanceRate: 0,
                completedCollaborations: 0,
                responseLikelihood: 'New',
                profileCompletion: 0
            };
        }

        // Get all matches where this creator was involved
        const matches = await prisma.matchedCreator.findMany({
            where: { creatorId: userId },
            select: {
                status: true,
                collaboration: {
                    select: { status: true }
                }
            }
        });

        const requestsReceived = matches.length;
        let accepted = 0;
        let completed = 0;

        for (const m of matches) {
            if (['ACCEPTED', 'APPLIED'].includes(m.status)) accepted++;
            if (m.collaboration?.status === 'COMPLETED') completed++;
        }

        const acceptanceRate = requestsReceived > 0 ? Math.round((accepted / requestsReceived) * 100) : 0;

        let responseLikelihood = 'New';
        if (requestsReceived >= 3) {
            if (acceptanceRate >= 70) responseLikelihood = 'High';
            else if (acceptanceRate >= 40) responseLikelihood = 'Medium';
            else responseLikelihood = 'Low';
        }

        return {
            requestsReceived,
            acceptanceRate,
            completedCollaborations: completed,
            responseLikelihood,
            profileCompletion: profile.profileCompletionPercentage || 0,
            reliabilityScore: profile.reliabilityScore || 1.0,
            reliabilityLevel: getReliabilityLevel(profile.reliabilityScore || 1.0)
        };
    }
}

module.exports = AnalyticsService;
