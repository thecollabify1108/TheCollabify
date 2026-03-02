const prisma = require('../config/prisma');

/**
 * Composite Risk Score Service
 * 
 * Calculates a 0–100 risk score from four weighted components.
 * Higher score = higher risk. Uses neutral, non-accusatory language.
 * 
 * Components:
 *   - Follower Mismatch   (40%) — Discrepancy between reported and verified follower data
 *   - Engagement Anomaly  (25%) — Unusual engagement patterns relative to audience size
 *   - Growth Instability   (20%) — Irregular or volatile follower growth patterns
 *   - Content Inactivity   (15%) — Reduced posting frequency or content gaps
 * 
 * Risk Levels:
 *   Low    (0–30)   — Metrics appear consistent
 *   Medium (31–60)  — Some metrics warrant review
 *   High   (61–100) — Significant metric inconsistencies detected
 */

const WEIGHTS = {
    followerMismatch: 0.40,
    engagementAnomaly: 0.25,
    growthInstability: 0.20,
    contentInactivity: 0.15
};

/**
 * Calculate follower mismatch component (0–100)
 * Based on verification data: how much the self-reported count deviates from verified range
 */
function calcFollowerMismatchScore(profile) {
    const mismatchPct = profile.followerMismatchPercentage;

    // No verification data available → neutral score
    if (mismatchPct == null || profile.verificationStatus === 'pending') {
        return 15; // Baseline — unverified, not penalised heavily
    }

    // Verified with no mismatch
    if (mismatchPct <= 2) return 0;
    if (mismatchPct <= 5) return 10;
    if (mismatchPct <= 10) return 25;
    if (mismatchPct <= 15) return 45;
    if (mismatchPct <= 25) return 65;
    if (mismatchPct <= 40) return 80;
    return Math.min(100, 80 + (mismatchPct - 40) * 0.5);
}

/**
 * Calculate engagement anomaly component (0–100)
 * Based on CQI engagementConsistency sub-score (0–100, higher = better)
 * and basic engagement rate sanity check
 */
function calcEngagementAnomalyScore(profile, cqi) {
    let score = 20; // Default baseline

    // Use CQI engagement consistency if available (invert: high consistency = low risk)
    if (cqi && cqi.engagementConsistency != null) {
        score = Math.max(0, 100 - cqi.engagementConsistency);
    }

    // Sanity check: extremely high engagement rates for large accounts suggest irregularities
    const followers = profile.followerCount || 0;
    const engagement = profile.engagementRate || 0;

    if (followers > 50000 && engagement > 10) {
        score = Math.min(100, score + 20); // Unusually high engagement for large accounts
    } else if (followers > 10000 && engagement > 15) {
        score = Math.min(100, score + 15);
    }

    // Very low engagement can also indicate inactive/purchased audience
    if (followers > 5000 && engagement < 0.5) {
        score = Math.min(100, score + 15);
    }

    return Math.round(score);
}

/**
 * Calculate growth instability component (0–100)
 * Based on CQI followerGrowthStability sub-score (0–100, higher = more stable)
 */
function calcGrowthInstabilityScore(profile, cqi) {
    // Use CQI growth stability if available (invert: high stability = low risk)
    if (cqi && cqi.followerGrowthStability != null) {
        return Math.round(Math.max(0, 100 - cqi.followerGrowthStability));
    }

    // No CQI data — return neutral baseline
    return 20;
}

/**
 * Calculate content inactivity component (0–100)
 * Based on CQI postingFrequency sub-score (0–100, higher = more active)
 */
function calcContentInactivityScore(profile, cqi) {
    // Use CQI posting frequency if available (invert: high frequency = low risk)
    if (cqi && cqi.postingFrequency != null) {
        return Math.round(Math.max(0, 100 - cqi.postingFrequency));
    }

    // No CQI data — return neutral baseline
    return 20;
}

/**
 * Calculate composite risk score and level
 * @param {Object} profile - CreatorProfile record
 * @param {Object|null} cqi - CreatorQualityIndex record (optional)
 * @returns {{ compositeRiskScore, riskLevel, riskFollowerMismatch, riskEngagementAnomaly, riskGrowthInstability, riskContentInactivity }}
 */
function calculateRiskScore(profile, cqi = null) {
    const riskFollowerMismatch = calcFollowerMismatchScore(profile);
    const riskEngagementAnomaly = calcEngagementAnomalyScore(profile, cqi);
    const riskGrowthInstability = calcGrowthInstabilityScore(profile, cqi);
    const riskContentInactivity = calcContentInactivityScore(profile, cqi);

    const compositeRiskScore = Math.round(
        (riskFollowerMismatch * WEIGHTS.followerMismatch) +
        (riskEngagementAnomaly * WEIGHTS.engagementAnomaly) +
        (riskGrowthInstability * WEIGHTS.growthInstability) +
        (riskContentInactivity * WEIGHTS.contentInactivity)
    );

    let riskLevel = 'low';
    if (compositeRiskScore > 60) riskLevel = 'high';
    else if (compositeRiskScore > 30) riskLevel = 'medium';

    return {
        compositeRiskScore,
        riskLevel,
        riskFollowerMismatch,
        riskEngagementAnomaly,
        riskGrowthInstability,
        riskContentInactivity,
        riskLastCalculated: new Date()
    };
}

/**
 * Calculate and persist risk score for a creator profile
 * @param {string} creatorProfileId - The creator profile ID
 * @returns {Object} Updated risk data
 */
async function updateRiskScore(creatorProfileId) {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { id: creatorProfileId },
            include: { qualityIndex: true }
        });

        if (!profile) {
            console.warn(`[RiskScore] Profile not found: ${creatorProfileId}`);
            return null;
        }

        const riskData = calculateRiskScore(profile, profile.qualityIndex);

        await prisma.creatorProfile.update({
            where: { id: creatorProfileId },
            data: riskData
        });

        return riskData;
    } catch (error) {
        console.error(`[RiskScore] Failed to update for ${creatorProfileId}:`, error);
        return null;
    }
}

/**
 * Calculate and persist risk score by userId
 * @param {string} userId - The user ID
 * @returns {Object} Updated risk data
 */
async function updateRiskScoreByUserId(userId) {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!profile) return null;
        return await updateRiskScore(profile.id);
    } catch (error) {
        console.error(`[RiskScore] Failed to update for userId ${userId}:`, error);
        return null;
    }
}

/**
 * Get risk level label with neutral language
 */
function getRiskLabel(riskLevel) {
    switch (riskLevel) {
        case 'low': return 'Low Risk';
        case 'medium': return 'Medium Risk';
        case 'high': return 'High Risk';
        default: return 'Unscored';
    }
}

/**
 * Get neutral description for a risk level
 */
function getRiskDescription(riskLevel) {
    switch (riskLevel) {
        case 'low':
            return 'Metrics appear consistent across all evaluated dimensions. No significant irregularities detected.';
        case 'medium':
            return 'Some metrics show variance that may warrant review. This does not necessarily indicate an issue — minor fluctuations are common.';
        case 'high':
            return 'Significant inconsistencies detected across one or more metric dimensions. We recommend reviewing the creator\'s data before proceeding.';
        default:
            return 'Risk assessment has not yet been calculated for this profile.';
    }
}

module.exports = {
    calculateRiskScore,
    updateRiskScore,
    updateRiskScoreByUserId,
    getRiskLabel,
    getRiskDescription,
    WEIGHTS
};
