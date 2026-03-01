/**
 * Fraud / Authenticity Detection Service
 * 
 * Anomaly detection for creator accounts:
 * - Sudden follower spikes (potential bot purchases)
 * - Engagement manipulation patterns
 * - Bot probability scoring
 * 
 * Output: Fraud risk score (0–1) integrated into CQI and match scoring.
 */

const prisma = require('../../config/prisma');

// Detection thresholds
const THRESHOLDS = {
    // Follower spike: >15% growth in a single period
    FOLLOWER_SPIKE_PERCENT: 0.15,
    // Engagement anomaly: engagement rate > 3x the tier average
    ENGAGEMENT_ANOMALY_MULTIPLIER: 3.0,
    // Engagement too low for follower count (potential bought followers)
    ENGAGEMENT_FLOOR: {
        nano: 1.5,    // <10K followers: below 1.5% is suspicious
        micro: 0.8,   // 10K-50K: below 0.8%
        mid: 0.5,     // 50K-500K: below 0.5%
        macro: 0.3,   // 500K+: below 0.3%
    },
    // Bot probability patterns
    ROUND_NUMBER_THRESHOLD: 0.3, // >30% of followers are round numbers = suspicious
};

class FraudDetectionService {

    /**
     * Run full fraud analysis on a creator
     */
    static async analyzeCreator(creatorId) {
        const creator = await prisma.creatorProfile.findUnique({
            where: { id: creatorId },
            include: { user: { select: { name: true, createdAt: true } } }
        });

        if (!creator) throw new Error(`Creator ${creatorId} not found`);

        // Get historical data for trend analysis
        const analyticsHistory = await prisma.analytics.findMany({
            where: { userId: creator.userId, type: 'creator' },
            orderBy: { date: 'desc' },
            take: 30
        });

        // Get existing fraud signals
        const existingSignals = await prisma.fraudSignal.findMany({
            where: { creatorId, resolved: false }
        });

        // Run detection algorithms
        const signals = [];

        // 1. Follower Spike Detection
        const spikeResult = this._detectFollowerSpikes(creator, analyticsHistory);
        if (spikeResult) signals.push(spikeResult);

        // 2. Engagement Manipulation
        const engResult = this._detectEngagementManipulation(creator);
        if (engResult) signals.push(engResult);

        // 3. Bot Probability
        const botResult = this._detectBotProbability(creator, analyticsHistory);
        if (botResult) signals.push(botResult);

        // 4. Engagement/Follower Mismatch
        const mismatchResult = this._detectFollowerEngagementMismatch(creator);
        if (mismatchResult) signals.push(mismatchResult);

        // 5. Rapid Account Age vs Followers
        const ageResult = this._detectSuspiciousGrowthRate(creator);
        if (ageResult) signals.push(ageResult);

        // Store new signals
        for (const signal of signals) {
            // Check if similar signal already exists
            const exists = existingSignals.find(
                s => s.signalType === signal.signalType && !s.resolved
            );

            if (!exists) {
                await prisma.fraudSignal.create({
                    data: {
                        creatorId,
                        signalType: signal.signalType,
                        severity: signal.severity,
                        confidence: signal.confidence,
                        evidence: signal.evidence
                    }
                });
            }
        }

        // Calculate overall fraud risk score
        const fraudRiskScore = this._calculateOverallRisk(signals, existingSignals);

        return {
            creatorId,
            fraudRiskScore,
            signals,
            existingSignals: existingSignals.length,
            recommendation: this._getRecommendation(fraudRiskScore)
        };
    }

    /**
     * Detect sudden follower spikes
     */
    static _detectFollowerSpikes(creator, history) {
        if (history.length < 3) return null;

        const followerCounts = history
            .map(h => h.metrics?.followerCount || h.metrics?.totalFollowers)
            .filter(c => c != null && c > 0);

        if (followerCounts.length < 2) return null;

        // Check consecutive periods for spikes
        for (let i = 0; i < followerCounts.length - 1; i++) {
            const current = followerCounts[i];
            const previous = followerCounts[i + 1];

            if (previous === 0) continue;

            const growthRate = (current - previous) / previous;

            if (growthRate > THRESHOLDS.FOLLOWER_SPIKE_PERCENT) {
                return {
                    signalType: 'FOLLOWER_SPIKE',
                    severity: growthRate > 0.5 ? 'CRITICAL' : growthRate > 0.3 ? 'HIGH' : 'MEDIUM',
                    confidence: Math.min(0.95, 0.5 + growthRate),
                    evidence: {
                        metric: 'follower_count',
                        previousValue: previous,
                        currentValue: current,
                        growthRate: Math.round(growthRate * 100) / 100,
                        expectedMaxGrowth: THRESHOLDS.FOLLOWER_SPIKE_PERCENT,
                        periodIndex: i,
                        window: '1 analytics period'
                    }
                };
            }
        }

        return null;
    }

    /**
     * Detect engagement manipulation patterns
     * Suspiciously high engagement for follower tier
     */
    static _detectEngagementManipulation(creator) {
        const { engagementRate, followerCount } = creator;
        if (!engagementRate || !followerCount) return null;

        // Get tier benchmark
        let tierAvg;
        if (followerCount < 10000) tierAvg = 6;
        else if (followerCount < 50000) tierAvg = 4;
        else if (followerCount < 500000) tierAvg = 2.5;
        else if (followerCount < 1000000) tierAvg = 1.5;
        else tierAvg = 1.0;

        const anomalyRatio = engagementRate / tierAvg;

        if (anomalyRatio > THRESHOLDS.ENGAGEMENT_ANOMALY_MULTIPLIER) {
            return {
                signalType: 'ENGAGEMENT_MANIPULATION',
                severity: anomalyRatio > 5 ? 'CRITICAL' : anomalyRatio > 4 ? 'HIGH' : 'MEDIUM',
                confidence: Math.min(0.9, 0.4 + (anomalyRatio - 3) * 0.15),
                evidence: {
                    metric: 'engagement_rate',
                    actual: engagementRate,
                    tierAverage: tierAvg,
                    anomalyRatio: Math.round(anomalyRatio * 100) / 100,
                    threshold: THRESHOLDS.ENGAGEMENT_ANOMALY_MULTIPLIER,
                    followerTier: this._getFollowerTier(followerCount)
                }
            };
        }

        return null;
    }

    /**
     * Detect bot probability based on engagement-to-follower ratio peculiarities
     */
    static _detectBotProbability(creator, history) {
        const { engagementRate, followerCount } = creator;
        if (!followerCount || followerCount < 1000) return null;

        // Check for suspiciously consistent engagement (bots produce uniform patterns)
        if (history.length >= 5) {
            const rates = history
                .map(h => h.metrics?.acceptanceRate || h.metrics?.engagementRate)
                .filter(r => r != null);

            if (rates.length >= 5) {
                // Very low variance might indicate bot engagement
                const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
                const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
                const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

                // Natural engagement has CV of 0.1–0.5. Below 0.05 is suspicious
                if (cv < 0.05 && rates.length >= 7) {
                    return {
                        signalType: 'BOT_ACTIVITY',
                        severity: 'MEDIUM',
                        confidence: Math.min(0.7, 0.3 + (0.05 - cv) * 5),
                        evidence: {
                            metric: 'engagement_consistency',
                            coefficientOfVariation: Math.round(cv * 1000) / 1000,
                            expectedMinCV: 0.05,
                            rateSamples: rates.length,
                            interpretation: 'Engagement rate is suspiciously uniform across periods'
                        }
                    };
                }
            }
        }

        return null;
    }

    /**
     * Detect follower-engagement mismatch (bought followers)
     */
    static _detectFollowerEngagementMismatch(creator) {
        const { engagementRate, followerCount } = creator;
        if (!engagementRate || !followerCount || followerCount < 5000) return null;

        const tier = this._getFollowerTier(followerCount);
        const floor = THRESHOLDS.ENGAGEMENT_FLOOR[tier];

        if (engagementRate < floor) {
            const ratio = engagementRate / floor;
            return {
                signalType: 'FAKE_COMMENTS',
                severity: ratio < 0.3 ? 'HIGH' : ratio < 0.5 ? 'MEDIUM' : 'LOW',
                confidence: Math.min(0.8, 0.3 + (1 - ratio) * 0.4),
                evidence: {
                    metric: 'follower_engagement_ratio',
                    engagementRate,
                    expectedMinimum: floor,
                    followerCount,
                    tier,
                    interpretation: 'Engagement is suspiciously low for follower count — possible bought followers'
                }
            };
        }

        return null;
    }

    /**
     * Detect suspicious growth rate relative to account age
     */
    static _detectSuspiciousGrowthRate(creator) {
        if (!creator.user?.createdAt || !creator.followerCount) return null;

        const accountAgeDays = (Date.now() - new Date(creator.user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (accountAgeDays < 30) return null; // Too new to judge

        const dailyGrowthRate = creator.followerCount / accountAgeDays;

        // Organic growth rarely exceeds 500 followers/day for accounts under 100K
        if (creator.followerCount < 100000 && dailyGrowthRate > 500) {
            return {
                signalType: 'FOLLOWER_SPIKE',
                severity: dailyGrowthRate > 2000 ? 'CRITICAL' : dailyGrowthRate > 1000 ? 'HIGH' : 'MEDIUM',
                confidence: Math.min(0.8, 0.3 + (dailyGrowthRate - 500) / 2000),
                evidence: {
                    metric: 'growth_rate_vs_age',
                    followerCount: creator.followerCount,
                    accountAgeDays: Math.round(accountAgeDays),
                    dailyGrowthRate: Math.round(dailyGrowthRate),
                    sustainableThreshold: 500,
                    interpretation: 'Follower growth rate is unusually high for account age'
                }
            };
        }

        return null;
    }

    /**
     * Calculate overall fraud risk score (0–1)
     */
    static _calculateOverallRisk(newSignals, existingSignals) {
        const allSignals = [...newSignals, ...existingSignals.map(s => ({
            severity: s.severity,
            confidence: s.confidence
        }))];

        if (allSignals.length === 0) return 0;

        const severityWeights = { LOW: 0.1, MEDIUM: 0.25, HIGH: 0.5, CRITICAL: 0.8 };

        let totalRisk = 0;
        for (const signal of allSignals) {
            totalRisk += (severityWeights[signal.severity] || 0.25) * (signal.confidence || 0.5);
        }

        return Math.min(1, totalRisk);
    }

    /**
     * Get recommendation based on fraud risk
     */
    static _getRecommendation(riskScore) {
        if (riskScore >= 0.7) return { action: 'FLAG_FOR_REVIEW', label: 'High Risk — Manual review required', color: 'red' };
        if (riskScore >= 0.4) return { action: 'MONITOR', label: 'Elevated Risk — Monitor closely', color: 'amber' };
        if (riskScore >= 0.2) return { action: 'LOW_CONCERN', label: 'Minor anomalies detected', color: 'yellow' };
        return { action: 'CLEAR', label: 'No significant fraud indicators', color: 'green' };
    }

    /**
     * Get follower tier name
     */
    static _getFollowerTier(followerCount) {
        if (followerCount < 10000) return 'nano';
        if (followerCount < 50000) return 'micro';
        if (followerCount < 500000) return 'mid';
        return 'macro';
    }

    /**
     * Batch analyze all creators (periodic job)
     */
    static async analyzeAllCreators(batchSize = 20) {
        let processed = 0;
        let flagged = 0;
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
                    const result = await this.analyzeCreator(creator.id);
                    if (result.fraudRiskScore > 0.3) flagged++;
                    processed++;
                } catch (err) {
                    console.error(`[FraudDetection] Error analyzing ${creator.id}:`, err.message);
                }
            }

            skip += batchSize;
        }

        console.log(`[FraudDetection] Analyzed ${processed} creators, ${flagged} flagged`);
        return { processed, flagged };
    }

    /**
     * Resolve a fraud signal (admin action)
     */
    static async resolveSignal(signalId, adminUserId) {
        return prisma.fraudSignal.update({
            where: { id: signalId },
            data: {
                resolved: true,
                resolvedAt: new Date(),
                resolvedBy: adminUserId
            }
        });
    }
}

module.exports = FraudDetectionService;
