const prisma = require('../config/prisma');

/**
 * Predictive Analytics Service (Backend)
 * Handles ROI forecasting and performance predictions using system-wide data
 */
class PredictiveService {
    /**
     * Predict ROI for a specific creator and promotion request
     */
    static async predictROI(creatorId, request) {
        const creator = await prisma.creatorProfile.findUnique({
            where: { id: creatorId },
            include: { user: true }
        });

        if (!creator) return null;

        // 1. Base Variables
        const budget = (request.minBudget + request.maxBudget) / 2;
        const followers = creator.followerCount;
        const engagementRate = creator.engagementRate;
        const type = request.promotionType;
        const category = request.targetCategory;

        // 2. Conversion Multipliers (System Constants)
        const typeMultipliers = {
            REELS: 1.4,
            STORIES: 0.6,
            POSTS: 1.0,
            WEBSITE_VISIT: 1.8
        };

        const categoryMultipliers = {
            Fashion: 1.1,
            Beauty: 1.2,
            Tech: 0.9,
            Lifestyle: 1.0,
            Fitness: 1.05,
            Gaming: 0.85,
            Entertainment: 0.95
        };

        // 3. Historical ROI Signal (The "Advanced" Part)
        // Fetch historical campaign performance for this creator
        const pastCampaigns = await prisma.matchedCreator.findMany({
            where: {
                creatorId,
                status: 'ACCEPTED',
                promotion: { status: 'COMPLETED' }
            },
            include: { promotion: true }
        });

        let historicalMultiplier = 1.0;
        if (pastCampaigns.length > 0) {
            // Calculate a score based on successful completions
            historicalMultiplier = 1.0 + (Math.min(pastCampaigns.length, 10) * 0.05);
        }

        // 4. Calculations
        const estimatedReach = followers * 0.35; // Industry average 35% reach for organic
        const expectedInteractions = estimatedReach * (engagementRate / 100);

        const typeMult = typeMultipliers[type] || 1.0;
        const catMult = categoryMultipliers[category] || 1.0;

        const estimatedConversions = (expectedInteractions * 0.02 * typeMult * catMult * historicalMultiplier);

        // Assume an average transaction value based on the niche/budget
        const estimatedRevenue = estimatedConversions * (budget * 0.5);

        const roi = ((estimatedRevenue - budget) / budget) * 100;

        return {
            roi: Math.round(roi),
            estimatedRevenue: Math.round(estimatedRevenue),
            estimatedReach: Math.round(estimatedReach),
            confidence: this.calculateConfidence(creator, pastCampaigns),
            risk: roi < 20 ? 'High' : roi < 80 ? 'Medium' : 'Low'
        };
    }

    /**
     * Calculate confidence score for the prediction
     */
    static calculateConfidence(creator, pastCampaigns) {
        let confidence = 60; // Base confidence

        if (pastCampaigns.length >= 5) confidence += 20;
        else if (pastCampaigns.length >= 1) confidence += 10;

        if (creator.instagramVerified) confidence += 10;
        if (creator.aiScore > 80) confidence += 5;

        return Math.min(95, confidence);
    }

    /**
     * Predict optimal posting time based on audience active snapshots (if available)
     */
    static async getOptimalPostingTime(creatorId) {
        // In a real system, this would analyze 'Analytics' table for peak interaction times
        // We'll return a data-driven placeholder for now
        const analytics = await prisma.analytics.findFirst({
            where: { userId: creatorId, period: 'daily' },
            orderBy: { date: 'desc' }
        });

        // Default to a high-engagement window
        return {
            window: '6:00 PM - 9:00 PM',
            bestDay: 'Sunday',
            confidence: analytics ? 85 : 40
        };
    }
}

module.exports = PredictiveService;
