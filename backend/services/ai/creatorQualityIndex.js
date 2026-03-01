/**
 * Creator Quality Index (CQI) Service
 * 
 * Proprietary 0–100 quality score computed from:
 * - Engagement rate consistency
 * - Follower growth stability
 * - Comment authenticity patterns
 * - Posting frequency
 * - Content niche authority
 * - Audience retention metrics
 * - Fraud risk penalty
 * 
 * Updates weekly via scheduled job.
 */

const prisma = require('../../config/prisma');

// CQI Sub-score weights (must sum to 1.0)
const CQI_WEIGHTS = {
    engagementConsistency: 0.20,
    followerGrowthStability: 0.15,
    commentAuthenticity: 0.15,
    postingFrequency: 0.12,
    nicheAuthority: 0.18,
    audienceRetention: 0.10,
    fraudPenalty: 0.10  // Subtracted, not added
};

class CreatorQualityIndexService {

    /**
     * Compute CQI for a single creator
     */
    static async computeCQI(creatorId) {
        const creator = await prisma.creatorProfile.findUnique({
            where: { id: creatorId },
            include: {
                user: true,
                matchedCampaigns: {
                    include: {
                        promotion: true,
                        outcome: true,
                        collaboration: true
                    }
                }
            }
        });

        if (!creator) throw new Error(`Creator ${creatorId} not found`);

        // Gather historical snapshots for trend analysis
        const analyticsHistory = await prisma.analytics.findMany({
            where: { userId: creator.userId, type: 'creator' },
            orderBy: { date: 'desc' },
            take: 30 // Last 30 snapshots
        });

        // Get fraud signals
        const fraudSignals = await prisma.fraudSignal.findMany({
            where: { creatorId, resolved: false },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate each sub-score
        const subscores = {
            engagementConsistency: this._calcEngagementConsistency(creator, analyticsHistory),
            followerGrowthStability: this._calcFollowerGrowthStability(creator, analyticsHistory),
            commentAuthenticity: this._calcCommentAuthenticity(creator),
            postingFrequency: this._calcPostingFrequency(creator, analyticsHistory),
            nicheAuthority: this._calcNicheAuthority(creator),
            audienceRetention: this._calcAudienceRetention(creator, analyticsHistory)
        };

        // Fraud penalty (0–1 scale, applied as reduction)
        const fraudRiskScore = this._calcFraudRisk(creator, fraudSignals);

        // Weighted sum
        let rawScore =
            (subscores.engagementConsistency * CQI_WEIGHTS.engagementConsistency) +
            (subscores.followerGrowthStability * CQI_WEIGHTS.followerGrowthStability) +
            (subscores.commentAuthenticity * CQI_WEIGHTS.commentAuthenticity) +
            (subscores.postingFrequency * CQI_WEIGHTS.postingFrequency) +
            (subscores.nicheAuthority * CQI_WEIGHTS.nicheAuthority) +
            (subscores.audienceRetention * CQI_WEIGHTS.audienceRetention);

        // Apply fraud penalty (reduce up to 10% of total)
        const fraudPenalty = fraudRiskScore * CQI_WEIGHTS.fraudPenalty * 100;
        const score = Math.max(0, Math.min(100, rawScore - fraudPenalty));

        // Calculate data confidence
        const dataPoints = analyticsHistory.length + creator.matchedCampaigns.length;
        const confidence = Math.min(1.0, dataPoints / 20); // Full confidence after 20 data points

        // Upsert CQI record
        const cqi = await prisma.creatorQualityIndex.upsert({
            where: { creatorId },
            update: {
                score,
                engagementConsistency: subscores.engagementConsistency,
                followerGrowthStability: subscores.followerGrowthStability,
                commentAuthenticity: subscores.commentAuthenticity,
                postingFrequency: subscores.postingFrequency,
                nicheAuthority: subscores.nicheAuthority,
                audienceRetention: subscores.audienceRetention,
                fraudRiskScore,
                dataPoints,
                confidence,
                computedAt: new Date()
            },
            create: {
                creatorId,
                score,
                engagementConsistency: subscores.engagementConsistency,
                followerGrowthStability: subscores.followerGrowthStability,
                commentAuthenticity: subscores.commentAuthenticity,
                postingFrequency: subscores.postingFrequency,
                nicheAuthority: subscores.nicheAuthority,
                audienceRetention: subscores.audienceRetention,
                fraudRiskScore,
                dataPoints,
                confidence
            }
        });

        // Create snapshot for history tracking
        await prisma.cQISnapshot.create({
            data: {
                cqiId: cqi.id,
                score,
                subscores: subscores,
                metrics: {
                    engagementRate: creator.engagementRate,
                    followerCount: creator.followerCount,
                    successfulPromotions: creator.successfulPromotions,
                    averageRating: creator.averageRating,
                    fraudSignalsCount: fraudSignals.length,
                    analyticsSnapshots: analyticsHistory.length
                }
            }
        });

        // Update creator profile AI score to reflect CQI
        await prisma.creatorProfile.update({
            where: { id: creatorId },
            data: { aiScore: Math.round(score) }
        });

        return { score, subscores, fraudRiskScore, confidence, dataPoints };
    }

    /**
     * Engagement Rate Consistency (0–100)
     * High score = engagement rate stays stable over time, not volatile
     */
    static _calcEngagementConsistency(creator, history) {
        if (history.length < 3) {
            // Not enough data — use current engagement as proxy
            return this._normalizeEngagement(creator.engagementRate, creator.followerCount);
        }

        const rates = history
            .map(h => h.metrics?.engagementRate || h.metrics?.acceptanceRate)
            .filter(r => r != null && r > 0);

        if (rates.length < 2) {
            return this._normalizeEngagement(creator.engagementRate, creator.followerCount);
        }

        // Calculate coefficient of variation (CV) — lower CV = more consistent
        const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
        const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
        const stdDev = Math.sqrt(variance);
        const cv = mean > 0 ? stdDev / mean : 1;

        // CV < 0.1 = very consistent (score 100), CV > 1.0 = chaotic (score 0)
        const consistencyScore = Math.max(0, 100 * (1 - cv));

        // Blend with absolute engagement quality
        const absScore = this._normalizeEngagement(creator.engagementRate, creator.followerCount);
        return Math.round(consistencyScore * 0.6 + absScore * 0.4);
    }

    /**
     * Normalize engagement rate relative to follower tier
     */
    static _normalizeEngagement(engagementRate, followerCount) {
        let benchmark = 1.5;
        if (followerCount < 10000) benchmark = 6;
        else if (followerCount < 50000) benchmark = 4;
        else if (followerCount < 500000) benchmark = 2.5;
        else if (followerCount < 1000000) benchmark = 1.5;

        return Math.min(100, (engagementRate / benchmark) * 50);
    }

    /**
     * Follower Growth Stability (0–100)
     * Penalizes sudden spikes (potential bot purchase) or steep drops
     */
    static _calcFollowerGrowthStability(creator, history) {
        if (history.length < 3) return 50; // Neutral for new creators

        const counts = history
            .map(h => h.metrics?.followerCount || h.metrics?.totalFollowers)
            .filter(c => c != null && c > 0);

        if (counts.length < 2) return 50;

        // Calculate week-over-week growth rates
        const growthRates = [];
        for (let i = 1; i < counts.length; i++) {
            const rate = counts[i] > 0 ? (counts[i - 1] - counts[i]) / counts[i] : 0;
            growthRates.push(rate);
        }

        // Look for suspicious spikes (>20% growth in a single period)
        const maxGrowth = Math.max(...growthRates.map(Math.abs));
        if (maxGrowth > 0.2) return Math.max(10, 50 - maxGrowth * 100);

        // Stable, gradual growth scores highest
        const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
        if (avgGrowth >= 0 && avgGrowth <= 0.05) return 90; // Healthy growth
        if (avgGrowth > 0.05 && avgGrowth <= 0.1) return 70; // Fast but okay
        if (avgGrowth < 0 && avgGrowth >= -0.02) return 75; // Minor decline, normal
        if (avgGrowth < -0.02) return 40; // Losing followers

        return 60;
    }

    /**
     * Comment Authenticity (0–100)
     * Estimates based on engagement-to-follower ratio patterns
     */
    static _calcCommentAuthenticity(creator) {
        const engRate = creator.engagementRate || 0;
        const followers = creator.followerCount || 0;

        if (followers === 0) return 50;

        // Engagement rate expectations by tier
        const expectedRanges = {
            nano: { min: 3, max: 15, maxFollowers: 10000 },
            micro: { min: 2, max: 8, maxFollowers: 50000 },
            mid: { min: 1.5, max: 5, maxFollowers: 500000 },
            macro: { min: 0.5, max: 3, maxFollowers: 1000000 },
            mega: { min: 0.3, max: 2, maxFollowers: Infinity }
        };

        let tier;
        if (followers < 10000) tier = expectedRanges.nano;
        else if (followers < 50000) tier = expectedRanges.micro;
        else if (followers < 500000) tier = expectedRanges.mid;
        else if (followers < 1000000) tier = expectedRanges.macro;
        else tier = expectedRanges.mega;

        // Within expected range = authentic
        if (engRate >= tier.min && engRate <= tier.max) {
            return 85 + Math.min(15, (engRate - tier.min) / (tier.max - tier.min) * 15);
        }

        // Below range = possibly low-quality or bought followers
        if (engRate < tier.min) {
            return Math.max(20, 60 * (engRate / tier.min));
        }

        // Above range = suspicious (possibly engagement pods or bots)
        if (engRate > tier.max) {
            const excess = (engRate - tier.max) / tier.max;
            return Math.max(30, 80 - excess * 50);
        }

        return 50;
    }

    /**
     * Posting Frequency (0–100)
     * Active creators who post regularly score higher
     */
    static _calcPostingFrequency(creator, history) {
        // Use content calendar and analytics as proxy
        const recentActivity = history.filter(h => {
            const daysAgo = (Date.now() - new Date(h.date).getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo <= 30;
        });

        if (recentActivity.length >= 20) return 95; // Daily activity
        if (recentActivity.length >= 12) return 80; // ~3x/week
        if (recentActivity.length >= 4) return 60;  // ~1x/week
        if (recentActivity.length >= 1) return 40;  // Some activity
        
        // Fallback: if profile was recently updated, assume active
        const daysSinceUpdate = (Date.now() - new Date(creator.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 7) return 50;
        if (daysSinceUpdate < 30) return 30;
        return 15;
    }

    /**
     * Niche Authority (0–100)
     * Based on campaign performance, ratings, and category depth
     */
    static _calcNicheAuthority(creator) {
        let score = 30; // Base

        // Successful campaigns boost authority
        if (creator.successfulPromotions >= 20) score += 30;
        else if (creator.successfulPromotions >= 10) score += 25;
        else if (creator.successfulPromotions >= 5) score += 20;
        else if (creator.successfulPromotions >= 1) score += 10;

        // High ratings = trusted in niche
        if (creator.averageRating >= 4.8) score += 20;
        else if (creator.averageRating >= 4.5) score += 15;
        else if (creator.averageRating >= 4.0) score += 10;
        else if (creator.averageRating >= 3.5) score += 5;

        // Follower count contributes to authority
        if (creator.followerCount >= 500000) score += 15;
        else if (creator.followerCount >= 100000) score += 10;
        else if (creator.followerCount >= 50000) score += 7;
        else if (creator.followerCount >= 10000) score += 4;

        // Profile completeness signals commitment
        if (creator.profileCompletionPercentage >= 90) score += 5;

        return Math.min(100, score);
    }

    /**
     * Audience Retention (0–100)
     * Measures how well creator retains audience interest over time
     */
    static _calcAudienceRetention(creator, history) {
        if (history.length < 5) {
            // Use engagement as proxy for retention
            return Math.min(80, (creator.engagementRate || 0) * 15);
        }

        // Compare recent vs older metrics
        const recent = history.slice(0, Math.ceil(history.length / 2));
        const older = history.slice(Math.ceil(history.length / 2));

        const recentAvg = recent.reduce((sum, h) => sum + (h.metrics?.acceptanceRate || 50), 0) / recent.length;
        const olderAvg = older.reduce((sum, h) => sum + (h.metrics?.acceptanceRate || 50), 0) / older.length;

        // Improving retention
        if (recentAvg >= olderAvg * 1.1) return 90;
        // Stable retention
        if (recentAvg >= olderAvg * 0.9) return 75;
        // Declining retention
        if (recentAvg >= olderAvg * 0.7) return 50;
        return 30;
    }

    /**
     * Fraud Risk Score (0–1)
     */
    static _calcFraudRisk(creator, fraudSignals) {
        if (fraudSignals.length === 0) return 0;

        const severityWeights = {
            LOW: 0.1,
            MEDIUM: 0.25,
            HIGH: 0.5,
            CRITICAL: 0.8
        };

        let totalRisk = 0;
        for (const signal of fraudSignals) {
            totalRisk += (severityWeights[signal.severity] || 0.25) * signal.confidence;
        }

        return Math.min(1, totalRisk);
    }

    /**
     * Batch compute CQI for all creators (weekly job)
     */
    static async computeAllCQI(batchSize = 20) {
        let processed = 0;
        let errors = 0;
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
                    await this.computeCQI(creator.id);
                    processed++;
                } catch (err) {
                    console.error(`[CQI] Error computing for ${creator.id}:`, err.message);
                    errors++;
                }
            }

            skip += batchSize;
            console.log(`[CQI] Processed ${processed} creators (${errors} errors)`);
        }

        return { processed, errors };
    }

    /**
     * Get CQI with trend data
     */
    static async getCQIWithTrend(creatorId) {
        const cqi = await prisma.creatorQualityIndex.findUnique({
            where: { creatorId },
            include: {
                history: {
                    orderBy: { createdAt: 'desc' },
                    take: 12  // Last 12 snapshots
                }
            }
        });

        if (!cqi) return null;

        // Calculate trend
        const scores = cqi.history.map(h => h.score);
        let trend = 'STABLE';
        if (scores.length >= 2) {
            const recentAvg = scores.slice(0, Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(scores.length / 2);
            const olderAvg = scores.slice(Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0) / (scores.length - Math.ceil(scores.length / 2));
            if (recentAvg > olderAvg * 1.05) trend = 'IMPROVING';
            else if (recentAvg < olderAvg * 0.95) trend = 'DECLINING';
        }

        return { ...cqi, trend };
    }
}

module.exports = CreatorQualityIndexService;
