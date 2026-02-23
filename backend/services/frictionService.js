const prisma = require('../config/prisma');
const AnalyticsService = require('./analyticsService');

/**
 * Service to detect and log friction points and drop-offs
 */
class FrictionService {
    /**
     * Detect Onboarding Drop-offs
     * Runs periodically to find users who started registration but didn't complete onboarding in 24h
     */
    static async detectOnboardingDropOffs() {
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Find users who registered more than 24h ago but haven't completed onboarding
            const potentialDropOffs = await prisma.user.findMany({
                where: {
                    createdAt: { lt: twentyFourHoursAgo },
                    creatorProfile: {
                        onboardingCompleted: false
                    }
                },
                include: {
                    creatorProfile: true
                }
            });

            // H6 Fix: batch-fetch all existing drop-off events in ONE query, deduplicate in-memory
            const potentialUserIds = potentialDropOffs.map(u => u.id);
            const existingDropOffEvents = await prisma.frictionEvent.findMany({
                where: { userId: { in: potentialUserIds }, type: 'ONBOARDING_DROP_OFF' },
                select: { userId: true }
            });
            const alreadyLoggedDropOffIds = new Set(existingDropOffEvents.map(e => e.userId));
            const dropOffs = potentialDropOffs.filter(u => !alreadyLoggedDropOffIds.has(u.id));

            for (const user of dropOffs) {
                await AnalyticsService.recordFrictionEvent({
                    userId: user.id,
                    type: 'ONBOARDING_DROP_OFF',
                    severity: 'HIGH',
                    meta: {
                        completionPercentage: user.creatorProfile?.profileCompletionPercentage || 0,
                        registeredAt: user.createdAt
                    }
                });
            }

            return dropOffs.length;
        } catch (error) {
            console.error('Error detecting onboarding drop-offs:', error);
            return 0;
        }
    }

    /**
     * Detect Collaboration Stalls
     */
    static async detectCollaborationStalls() {
        try {
            const now = new Date();
            const threeDaysAgo = new Date(now - 72 * 60 * 60 * 1000);
            const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000);

            // 1. Requested > 72h
            const requestedStalls = await prisma.collaboration.findMany({
                where: { status: 'REQUESTED', statusUpdatedAt: { lt: threeDaysAgo } }
            });

            // 2. Accepted > 5 days
            const acceptedStalls = await prisma.collaboration.findMany({
                where: { status: 'ACCEPTED', statusUpdatedAt: { lt: fiveDaysAgo } }
            });

            // 3. In Discussion > 5 days without update
            const discussionStalls = await prisma.collaboration.findMany({
                where: { status: 'IN_DISCUSSION', statusUpdatedAt: { lt: fiveDaysAgo } }
            });

            const allStalls = [...requestedStalls, ...acceptedStalls, ...discussionStalls];
            if (allStalls.length === 0) return 0;

            // H6 Fix: batch-fetch ALL existing COLLABORATION_STALL events in a single query,
            // then deduplicate in-memory using a Set — eliminates N+1 pattern
            const existingStallEvents = await prisma.frictionEvent.findMany({
                where: { type: 'COLLABORATION_STALL' },
                select: { meta: true }
            });
            const alreadyLoggedCollabIds = new Set(
                existingStallEvents.map(e => e.meta?.collaborationId).filter(Boolean)
            );

            let logged = 0;
            for (const stall of allStalls) {
                if (!alreadyLoggedCollabIds.has(stall.id)) {
                    await AnalyticsService.recordFrictionEvent({
                        type: 'COLLABORATION_STALL',
                        severity: 'MEDIUM',
                        meta: {
                            collaborationId: stall.id,
                            currentStatus: stall.status,
                            lastUpdated: stall.statusUpdatedAt,
                            timeElapsedDays: Math.floor((now - stall.statusUpdatedAt) / (1000 * 60 * 60 * 24))
                        }
                    });
                    logged++;
                }
            }

            return logged;
        } catch (error) {
            console.error('Error detecting collaboration stalls:', error);
            return 0;
        }
    }

    /**
     * Detect Creator Non-Response
     * Matches that stay in 'MATCHED' or 'INVITED' too long
     */
    static async detectCreatorNonResponse() {
        try {
            const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

            const nonResponses = await prisma.matchedCreator.findMany({
                where: {
                    status: { in: ['MATCHED', 'INVITED'] },
                    respondedAt: null,
                    promotion: {
                        createdAt: { lt: fortyEightHoursAgo }
                    }
                },
                include: {
                    promotion: true
                }
            });

            for (const match of nonResponses) {
                await AnalyticsService.recordFrictionEvent({
                    userId: match.creatorId,
                    type: 'CREATOR_NON_RESPONSE',
                    severity: 'MEDIUM',
                    meta: {
                        matchId: match.id,
                        campaignId: match.promotionId,
                        campaignTitle: match.promotion.title,
                        timeElapsedHours: 48
                    }
                });
            }

            return nonResponses.length;
        } catch (error) {
            console.error('Error detecting creator non-response:', error);
            return 0;
        }
    }

    /**
     * Track Campaign Intent (call this when seller OPENS the campaign wizard, before submission).
     * Used for abandonment detection: if no campaign is created within X hours after this event,
     * it counts as a CAMPAIGN_ABANDONMENT friction point.
     * This should be called from a dedicated 'campaign-intent' frontend step, not the create route.
     */
    static async trackCampaignIntent(userId, context) {
        try {
            await AnalyticsService.recordFrictionEvent({
                userId,
                type: 'CAMPAIGN_FLOW_STARTED',
                severity: 'LOW',
                meta: { context }
            });
        } catch (error) {
            console.error('Error tracking campaign intent:', error);
        }
    }

    /**
     * Track Campaign Created (call this after a campaign is successfully submitted).
     * Paired with CAMPAIGN_FLOW_STARTED — if no CAMPAIGN_CREATED event follows within
     * the detection window, the flow is counted as an abandonment.
     */
    static async trackCampaignStart(userId, context) {
        try {
            await AnalyticsService.recordFrictionEvent({
                userId,
                type: 'CAMPAIGN_CREATED',
                severity: 'LOW',
                meta: { context }
            });
        } catch (error) {
            console.error('Error tracking campaign creation:', error);
        }
    }
}

module.exports = FrictionService;
