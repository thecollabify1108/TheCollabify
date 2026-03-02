/**
 * Feature Gate Service
 * Controls access to platform features based on subscription tier and user role.
 *
 * Tiers:
 *   FREE        – Limited Match + Audit (summary only), 3 AI queries/day, basic risk level
 *   CREATOR_PRO – Full Creator Audit, Optimization, unlimited queries, verification priority
 *   BRAND_PRO   – Full Match Intelligence, ROI Forecast, Campaign Strategy, risk breakdown
 */

const prisma = require('../config/prisma');

// ─── Tier → feature matrix ─────────────────────────────────────────────────

const TIER_FEATURES = {
    FREE: {
        intelligenceModes: {
            'match-intelligence': 'summary',   // summary-only response
            'creator-audit': 'summary',        // summary-only response
            'campaign-strategy': false,
            'roi-forecast': false,
            'optimization': false,
        },
        dailyAILimit: 3,
        riskBreakdown: false,       // basic risk level label only
        verificationPriority: false,
        advancedAnalytics: false,
        toolkit: true,              // basic toolkit always available
    },
    CREATOR_PRO: {
        intelligenceModes: {
            'match-intelligence': 'summary',   // creators see summary match
            'creator-audit': 'full',
            'campaign-strategy': false,         // brand feature
            'roi-forecast': false,              // brand feature
            'optimization': 'full',
        },
        dailyAILimit: Infinity,     // reasonable backend cap still applies via rateLimiter
        riskBreakdown: false,       // risk breakdown is a brand feature
        verificationPriority: true,
        advancedAnalytics: true,
        toolkit: true,
    },
    BRAND_PRO: {
        intelligenceModes: {
            'match-intelligence': 'full',
            'creator-audit': 'full',
            'campaign-strategy': 'full',
            'roi-forecast': 'full',
            'optimization': 'full',
        },
        dailyAILimit: Infinity,
        riskBreakdown: true,
        verificationPriority: false,
        advancedAnalytics: true,
        toolkit: true,
    },
};

// Admin always has full access
const ADMIN_FEATURES = {
    intelligenceModes: {
        'match-intelligence': 'full',
        'creator-audit': 'full',
        'campaign-strategy': 'full',
        'roi-forecast': 'full',
        'optimization': 'full',
    },
    dailyAILimit: Infinity,
    riskBreakdown: true,
    verificationPriority: true,
    advancedAnalytics: true,
    toolkit: true,
};

// ─── Public helpers ─────────────────────────────────────────────────────────

/**
 * Get full feature set for a tier (or admin override).
 */
function getFeatureAccess(tier, role) {
    if (role === 'ADMIN') return ADMIN_FEATURES;
    return TIER_FEATURES[tier] || TIER_FEATURES.FREE;
}

/**
 * Check if a specific intelligence mode is accessible.
 * Returns 'full', 'summary', or false.
 */
function getModeAccess(tier, mode, role) {
    const features = getFeatureAccess(tier, role);
    return features.intelligenceModes[mode] || false;
}

/**
 * Enforce daily AI query limit for FREE tier.
 * Returns { allowed, remaining, limit } or throws.
 */
async function checkDailyAILimit(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true, dailyAIQueryCount: true, lastAIQueryDate: true, activeRole: true }
    });

    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    if (user.activeRole === 'ADMIN') return { allowed: true, remaining: Infinity, limit: Infinity };

    const features = getFeatureAccess(user.subscriptionTier, user.activeRole);
    const limit = features.dailyAILimit;

    if (limit === Infinity) return { allowed: true, remaining: Infinity, limit };

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = user.lastAIQueryDate ? user.lastAIQueryDate.toISOString().slice(0, 10) : null;

    // Reset counter if new day
    let currentCount = (lastDate === today) ? user.dailyAIQueryCount : 0;

    if (currentCount >= limit) {
        return { allowed: false, remaining: 0, limit };
    }

    return { allowed: true, remaining: limit - currentCount, limit };
}

/**
 * Increment the daily AI query counter after a successful call.
 */
async function incrementAIQuery(userId) {
    const today = new Date().toISOString().slice(0, 10);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastAIQueryDate: true }
    });

    const lastDate = user?.lastAIQueryDate ? user.lastAIQueryDate.toISOString().slice(0, 10) : null;

    await prisma.user.update({
        where: { id: userId },
        data: {
            dailyAIQueryCount: lastDate === today ? { increment: 1 } : 1,
            lastAIQueryDate: new Date(),
        }
    });
}

/**
 * Build a client-safe feature manifest (sent to frontend).
 */
function buildFeatureManifest(tier, role) {
    const features = getFeatureAccess(tier, role);
    return {
        tier: role === 'ADMIN' ? 'ADMIN' : (tier || 'FREE'),
        modes: features.intelligenceModes,
        dailyAILimit: features.dailyAILimit === Infinity ? -1 : features.dailyAILimit,
        riskBreakdown: features.riskBreakdown,
        verificationPriority: features.verificationPriority,
        advancedAnalytics: features.advancedAnalytics,
        toolkit: features.toolkit,
    };
}

module.exports = {
    TIER_FEATURES,
    getFeatureAccess,
    getModeAccess,
    checkDailyAILimit,
    incrementAIQuery,
    buildFeatureManifest,
};
