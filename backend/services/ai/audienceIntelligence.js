/**
 * Audience Intelligence Layer
 * 
 * Infers audience characteristics from creator metrics:
 * - Demographic clustering (inferred from niche + engagement patterns)
 * - Interest similarity scoring
 * - Brand-audience fit probability
 * 
 * Matches brands to creator AUDIENCES, not just creators.
 */

const prisma = require('../../config/prisma');

// Category → Inferred audience demographics mapping
const CATEGORY_DEMOGRAPHICS = {
    Fashion: { ageDistribution: { '18-24': 0.35, '25-34': 0.40, '35-44': 0.15, '45+': 0.10 }, genderSplit: { female: 0.70, male: 0.25, other: 0.05 }, topInterests: ['fashion', 'beauty', 'shopping', 'lifestyle', 'trends'] },
    Beauty: { ageDistribution: { '18-24': 0.30, '25-34': 0.40, '35-44': 0.20, '45+': 0.10 }, genderSplit: { female: 0.80, male: 0.15, other: 0.05 }, topInterests: ['beauty', 'skincare', 'makeup', 'selfcare', 'fashion'] },
    Tech: { ageDistribution: { '18-24': 0.25, '25-34': 0.40, '35-44': 0.25, '45+': 0.10 }, genderSplit: { female: 0.30, male: 0.65, other: 0.05 }, topInterests: ['technology', 'gadgets', 'programming', 'startups', 'ai'] },
    Fitness: { ageDistribution: { '18-24': 0.30, '25-34': 0.40, '35-44': 0.20, '45+': 0.10 }, genderSplit: { female: 0.50, male: 0.45, other: 0.05 }, topInterests: ['fitness', 'health', 'nutrition', 'workout', 'wellness'] },
    Food: { ageDistribution: { '18-24': 0.20, '25-34': 0.35, '35-44': 0.25, '45+': 0.20 }, genderSplit: { female: 0.55, male: 0.40, other: 0.05 }, topInterests: ['food', 'cooking', 'restaurants', 'recipes', 'health'] },
    Travel: { ageDistribution: { '18-24': 0.25, '25-34': 0.40, '35-44': 0.25, '45+': 0.10 }, genderSplit: { female: 0.50, male: 0.45, other: 0.05 }, topInterests: ['travel', 'adventure', 'photography', 'culture', 'nature'] },
    Lifestyle: { ageDistribution: { '18-24': 0.30, '25-34': 0.35, '35-44': 0.20, '45+': 0.15 }, genderSplit: { female: 0.60, male: 0.35, other: 0.05 }, topInterests: ['lifestyle', 'wellness', 'home', 'fashion', 'food'] },
    Gaming: { ageDistribution: { '18-24': 0.45, '25-34': 0.35, '35-44': 0.15, '45+': 0.05 }, genderSplit: { female: 0.30, male: 0.65, other: 0.05 }, topInterests: ['gaming', 'esports', 'technology', 'entertainment', 'streaming'] },
    Education: { ageDistribution: { '18-24': 0.35, '25-34': 0.35, '35-44': 0.20, '45+': 0.10 }, genderSplit: { female: 0.45, male: 0.50, other: 0.05 }, topInterests: ['education', 'learning', 'career', 'self-improvement', 'books'] },
    Entertainment: { ageDistribution: { '18-24': 0.40, '25-34': 0.35, '35-44': 0.15, '45+': 0.10 }, genderSplit: { female: 0.50, male: 0.45, other: 0.05 }, topInterests: ['entertainment', 'movies', 'music', 'comedy', 'viral'] },
    Health: { ageDistribution: { '18-24': 0.20, '25-34': 0.35, '35-44': 0.30, '45+': 0.15 }, genderSplit: { female: 0.55, male: 0.40, other: 0.05 }, topInterests: ['health', 'wellness', 'mental-health', 'nutrition', 'fitness'] },
    Business: { ageDistribution: { '18-24': 0.15, '25-34': 0.40, '35-44': 0.30, '45+': 0.15 }, genderSplit: { female: 0.35, male: 0.60, other: 0.05 }, topInterests: ['business', 'entrepreneurship', 'investing', 'marketing', 'startup'] },
    Art: { ageDistribution: { '18-24': 0.35, '25-34': 0.35, '35-44': 0.20, '45+': 0.10 }, genderSplit: { female: 0.55, male: 0.40, other: 0.05 }, topInterests: ['art', 'design', 'creativity', 'photography', 'illustration'] },
    Music: { ageDistribution: { '18-24': 0.45, '25-34': 0.30, '35-44': 0.15, '45+': 0.10 }, genderSplit: { female: 0.45, male: 0.50, other: 0.05 }, topInterests: ['music', 'concerts', 'instruments', 'production', 'culture'] },
    Sports: { ageDistribution: { '18-24': 0.30, '25-34': 0.35, '35-44': 0.25, '45+': 0.10 }, genderSplit: { female: 0.35, male: 0.60, other: 0.05 }, topInterests: ['sports', 'fitness', 'competition', 'outdoors', 'training'] },
    Other: { ageDistribution: { '18-24': 0.25, '25-34': 0.35, '35-44': 0.25, '45+': 0.15 }, genderSplit: { female: 0.50, male: 0.45, other: 0.05 }, topInterests: ['general', 'lifestyle', 'entertainment', 'social', 'trends'] }
};

class AudienceIntelligenceService {

    /**
     * Build or update audience profile for a creator
     */
    static async buildAudienceProfile(creatorId) {
        const creator = await prisma.creatorProfile.findUnique({
            where: { id: creatorId },
            include: {
                qualityIndex: true,
                matchedCampaigns: {
                    where: { status: 'ACCEPTED' },
                    include: { promotion: { select: { targetCategory: true } } },
                    take: 20
                }
            }
        });

        if (!creator) throw new Error(`Creator ${creatorId} not found`);

        // Infer demographics from category + engagement patterns
        const demographics = this._inferDemographics(creator);

        // Build interest clusters
        const interests = this._buildInterestClusters(creator);

        // Precompute brand fit scores for all categories
        const brandFitScores = this._computeBrandFitScores(creator, demographics, interests);

        // Audience quality metrics
        const authenticity = this._estimateAuthenticity(creator);
        const activeRatio = this._estimateActiveRatio(creator);

        // Determine data source & confidence
        const confidence = this._calculateConfidence(creator);

        // Upsert audience profile
        const profile = await prisma.audienceProfile.upsert({
            where: { creatorId },
            update: {
                demographics,
                interests,
                brandFitScores,
                authenticity,
                activeRatio,
                confidence,
                computedAt: new Date()
            },
            create: {
                creatorId,
                demographics,
                interests,
                brandFitScores,
                authenticity,
                activeRatio,
                confidence,
                dataSource: 'inferred'
            }
        });

        return profile;
    }

    /**
     * Infer audience demographics from creator niche and engagement
     */
    static _inferDemographics(creator) {
        const baseDemographics = CATEGORY_DEMOGRAPHICS[creator.category] || CATEGORY_DEMOGRAPHICS.Other;

        // Adjust based on engagement patterns and follower count
        const demographics = JSON.parse(JSON.stringify(baseDemographics));

        // If creator has collaborated across categories, blend demographics
        const campaignCategories = creator.matchedCampaigns
            ?.map(mc => mc.promotion?.targetCategory)
            .filter(Boolean) || [];

        if (campaignCategories.length > 0) {
            const categoryCounts = {};
            campaignCategories.forEach(cat => {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });

            // Blend demographics from cross-category campaigns
            for (const [cat, count] of Object.entries(categoryCounts)) {
                if (cat !== creator.category && CATEGORY_DEMOGRAPHICS[cat]) {
                    const blend = CATEGORY_DEMOGRAPHICS[cat];
                    const weight = Math.min(0.2, count * 0.05); // Max 20% blend

                    for (const age of Object.keys(demographics.ageDistribution)) {
                        if (blend.ageDistribution[age]) {
                            demographics.ageDistribution[age] =
                                demographics.ageDistribution[age] * (1 - weight) +
                                blend.ageDistribution[age] * weight;
                        }
                    }
                }
            }
        }

        // Add inferred location data
        demographics.topLocations = [];
        if (creator.location) {
            const loc = creator.location;
            if (loc.state) demographics.topLocations.push(loc.state);
            if (loc.city) demographics.topLocations.push(loc.city);
        }

        return demographics;
    }

    /**
     * Build interest clusters from creator niche and activity
     */
    static _buildInterestClusters(creator) {
        const baseInterests = CATEGORY_DEMOGRAPHICS[creator.category]?.topInterests || ['general'];

        const clusters = baseInterests.map((interest, index) => ({
            cluster: interest,
            weight: Math.max(0.2, 1.0 - index * 0.15) // Primary interest = highest weight
        }));

        // Add cross-category interests from campaign history
        const campaignCategories = creator.matchedCampaigns
            ?.map(mc => mc.promotion?.targetCategory)
            .filter(c => c && c !== creator.category) || [];

        const uniqueCategories = [...new Set(campaignCategories)];
        for (const cat of uniqueCategories) {
            const catInterests = CATEGORY_DEMOGRAPHICS[cat]?.topInterests || [];
            if (catInterests[0] && !clusters.find(c => c.cluster === catInterests[0])) {
                clusters.push({ cluster: catInterests[0], weight: 0.3 });
            }
        }

        // Sort by weight descending
        clusters.sort((a, b) => b.weight - a.weight);
        return clusters.slice(0, 10);
    }

    /**
     * Compute brand fit scores for all categories
     */
    static _computeBrandFitScores(creator, demographics, interests) {
        const scores = {};
        const interestSet = new Set(interests.map(i => i.cluster));

        for (const category of Object.keys(CATEGORY_DEMOGRAPHICS)) {
            const targetDemographics = CATEGORY_DEMOGRAPHICS[category];

            // 1. Demographic overlap (age distribution similarity)
            let demoScore = this._demographicOverlap(demographics.ageDistribution, targetDemographics.ageDistribution);

            // 2. Interest overlap
            const targetInterests = new Set(targetDemographics.topInterests);
            const overlap = [...interestSet].filter(i => targetInterests.has(i)).length;
            const interestScore = overlap / Math.max(1, targetInterests.size);

            // 3. Direct category match bonus
            const categoryBonus = creator.category === category ? 0.3 : 0;

            // Combined score
            scores[category] = Math.min(1.0, (demoScore * 0.3 + interestScore * 0.4 + categoryBonus + 0.1));
        }

        return scores;
    }

    /**
     * Calculate demographic distribution overlap
     */
    static _demographicOverlap(dist1, dist2) {
        if (!dist1 || !dist2) return 0.5;

        let overlap = 0;
        for (const key of Object.keys(dist1)) {
            if (dist2[key]) {
                overlap += Math.min(dist1[key], dist2[key]);
            }
        }
        return overlap; // Max 1.0 for identical distributions
    }

    /**
     * Estimate audience authenticity (0–1)
     */
    static _estimateAuthenticity(creator) {
        const { engagementRate, followerCount } = creator;
        if (!engagementRate || !followerCount) return 0.5;

        // Expected engagement ranges by tier
        const tiers = [
            { max: 10000, min: 3, max_rate: 15 },
            { max: 50000, min: 2, max_rate: 8 },
            { max: 500000, min: 1.5, max_rate: 5 },
            { max: Infinity, min: 0.5, max_rate: 3 }
        ];

        const tier = tiers.find(t => followerCount < t.max);
        if (!tier) return 0.5;

        if (engagementRate >= tier.min && engagementRate <= tier.max_rate) {
            return 0.7 + (engagementRate - tier.min) / (tier.max_rate - tier.min) * 0.3;
        }

        if (engagementRate < tier.min) {
            return Math.max(0.2, 0.5 * (engagementRate / tier.min));
        }

        // Above expected max — slightly suspicious
        return Math.max(0.3, 0.7 - (engagementRate - tier.max_rate) / tier.max_rate * 0.3);
    }

    /**
     * Estimate active audience ratio
     */
    static _estimateActiveRatio(creator) {
        if (!creator.engagementRate) return 0.5;

        // Active ratio ≈ engagement rate / 100 * engagement depth multiplier
        const baseRatio = creator.engagementRate / 100;
        const depthMult = creator.qualityIndex?.engagementConsistency
            ? creator.qualityIndex.engagementConsistency / 100
            : 0.5;

        return Math.min(1, baseRatio * (1 + depthMult));
    }

    /**
     * Calculate confidence in audience inference
     */
    static _calculateConfidence(creator) {
        let confidence = 0.3; // Base for inferred data

        // More campaigns = better audience understanding
        const campaigns = creator.matchedCampaigns?.length || 0;
        if (campaigns >= 10) confidence += 0.25;
        else if (campaigns >= 5) confidence += 0.15;
        else if (campaigns >= 1) confidence += 0.08;

        // CQI data available
        if (creator.qualityIndex) confidence += 0.15;

        // Higher follower count = more stable audience signal
        if (creator.followerCount >= 50000) confidence += 0.1;
        else if (creator.followerCount >= 10000) confidence += 0.05;

        return Math.min(0.9, confidence); // Cap at 0.9 since all data is inferred
    }

    /**
     * Get brand-audience fit score for a specific brand-creator pair
     */
    static async getBrandCreatorFit(creatorId, brandCategory) {
        let profile = await prisma.audienceProfile.findUnique({
            where: { creatorId }
        });

        if (!profile) {
            profile = await this.buildAudienceProfile(creatorId);
        }

        return {
            fitScore: profile.brandFitScores?.[brandCategory] || 0.5,
            audienceAuthenticity: profile.authenticity,
            activeRatio: profile.activeRatio,
            demographics: profile.demographics,
            interests: profile.interests,
            confidence: profile.confidence
        };
    }

    /**
     * Find best creators for a brand's target audience
     */
    static async findBestAudienceMatch(brandCategory, limit = 20) {
        const profiles = await prisma.audienceProfile.findMany({
            include: { creator: { include: { user: { select: { name: true } } } } }
        });

        const scored = profiles.map(p => ({
            creatorId: p.creatorId,
            creatorName: p.creator?.user?.name,
            fitScore: p.brandFitScores?.[brandCategory] || 0,
            authenticity: p.authenticity,
            activeRatio: p.activeRatio,
            confidence: p.confidence,
            // Weighted final score
            finalScore: (p.brandFitScores?.[brandCategory] || 0) * 0.5 +
                        p.authenticity * 0.3 +
                        p.activeRatio * 0.2
        }));

        scored.sort((a, b) => b.finalScore - a.finalScore);
        return scored.slice(0, limit);
    }

    /**
     * Batch build audience profiles for all creators
     */
    static async buildAllProfiles(batchSize = 20) {
        let processed = 0;
        let skip = 0;

        while (true) {
            const creators = await prisma.creatorProfile.findMany({
                skip,
                take: batchSize,
                select: { id: true }
            });

            if (creators.length === 0) break;

            for (const creator of creators) {
                try {
                    await this.buildAudienceProfile(creator.id);
                    processed++;
                } catch (err) {
                    console.error(`[AudienceIntel] Error for ${creator.id}:`, err.message);
                }
            }

            skip += batchSize;
            console.log(`[AudienceIntel] Processed ${processed} profiles`);
        }

        return { processed };
    }
}

module.exports = AudienceIntelligenceService;
