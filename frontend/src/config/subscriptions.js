/**
 * Subscription Tiers & Pricing Configuration
 * FREE, Creator Pro, and Brand Pro plans
 *
 * Tier mapping:
 *   FREE        – default for all new users
 *   CREATOR_PRO – for creators (paid upgrade)
 *   BRAND_PRO   – for brands/sellers (paid upgrade)
 */

export const TIERS = {
    FREE: 'FREE',
    CREATOR_PRO: 'CREATOR_PRO',
    BRAND_PRO: 'BRAND_PRO',
};

export const subscriptionPlans = {
    free: {
        id: 'free',
        tier: TIERS.FREE,
        name: 'Free',
        price: 0,
        billingPeriod: 'forever',
        description: 'Get started with basic intelligence',
        badge: 'Free',
        color: '#6B7280',
        targetRole: null,
        features: {
            campaigns: { limit: 2, description: '2 active campaigns' },
            creators: { limit: 50, description: 'Browse up to 50 creators' },
            aiFeatures: {
                matchIntelligence: 'summary',
                creatorAudit: 'summary',
                campaignStrategy: false,
                roiForecast: false,
                optimization: false,
                dailyAILimit: 3,
                toolkit: true,
                description: 'Limited AI (3 queries/day, summary only)',
            },
            analytics: { enabled: true, advanced: false, description: 'Basic analytics' },
            riskBreakdown: false,
            verificationPriority: false,
            support: { email: true, priority: false, description: 'Email support (48h)' },
        },
        cta: 'Start Free',
        popular: false,
    },

    creator_pro: {
        id: 'creator_pro',
        tier: TIERS.CREATOR_PRO,
        name: 'Creator Pro',
        price: 499,
        billingPeriod: 'month',
        yearlyPrice: 4990,
        description: 'Full intelligence for creators',
        badge: 'Pro',
        color: '#6366f1',
        targetRole: 'creator',
        features: {
            campaigns: { limit: 'unlimited', description: 'Unlimited applications' },
            creators: { limit: 'unlimited', description: 'Full discovery access' },
            aiFeatures: {
                matchIntelligence: 'summary',
                creatorAudit: 'full',
                campaignStrategy: false,
                roiForecast: false,
                optimization: 'full',
                dailyAILimit: -1,
                toolkit: true,
                description: 'Full Audit + Optimization, unlimited queries',
            },
            analytics: { enabled: true, advanced: true, description: 'Advanced analytics' },
            riskBreakdown: false,
            verificationPriority: true,
            support: { email: true, priority: true, description: 'Priority support (4h)' },
        },
        highlights: [
            'Full Creator Audit breakdown',
            'Optimization Mode',
            'Unlimited AI queries',
            'Verification priority queue',
            'Advanced audience insights',
        ],
        cta: 'Upgrade to Creator Pro',
        popular: true,
    },

    brand_pro: {
        id: 'brand_pro',
        tier: TIERS.BRAND_PRO,
        name: 'Brand Pro',
        price: 999,
        billingPeriod: 'month',
        yearlyPrice: 9990,
        description: 'Complete intelligence for brands',
        badge: 'Pro+',
        color: '#818cf8',
        targetRole: 'seller',
        features: {
            campaigns: { limit: 'unlimited', description: 'Unlimited campaigns' },
            creators: { limit: 'unlimited', description: 'Unlimited creator access' },
            aiFeatures: {
                matchIntelligence: 'full',
                creatorAudit: 'full',
                campaignStrategy: 'full',
                roiForecast: 'full',
                optimization: 'full',
                dailyAILimit: -1,
                toolkit: true,
                description: 'Full AI suite — all 5 intelligence modes',
            },
            analytics: { enabled: true, advanced: true, description: 'Advanced analytics & insights' },
            riskBreakdown: true,
            verificationPriority: false,
            support: { email: true, priority: true, description: 'Priority support (4h)' },
        },
        highlights: [
            'Full Match Intelligence breakdown',
            'ROI & Performance Forecast',
            'Campaign Strategy (full)',
            'Risk score breakdown transparency',
            'Advanced analytics insights',
        ],
        cta: 'Upgrade to Brand Pro',
        popular: false,
    },
};

/**
 * Feature comparison table
 */
export const featureComparison = [
    {
        category: 'Intelligence Modes',
        features: [
            { name: 'Match Intelligence', free: 'Summary', creator_pro: 'Summary', brand_pro: 'Full' },
            { name: 'Creator Audit', free: 'Summary', creator_pro: 'Full', brand_pro: 'Full' },
            { name: 'Campaign Strategy', free: false, creator_pro: false, brand_pro: 'Full' },
            { name: 'ROI Forecast', free: false, creator_pro: false, brand_pro: 'Full' },
            { name: 'Optimization', free: false, creator_pro: 'Full', brand_pro: 'Full' },
        ],
    },
    {
        category: 'AI Queries',
        features: [
            { name: 'Daily AI Limit', free: '3/day', creator_pro: 'Unlimited', brand_pro: 'Unlimited' },
            { name: 'Toolkit (Captions & Tags)', free: true, creator_pro: true, brand_pro: true },
        ],
    },
    {
        category: 'Risk & Verification',
        features: [
            { name: 'Risk Level Display', free: 'Basic', creator_pro: 'Basic', brand_pro: 'Full Breakdown' },
            { name: 'Verification Priority', free: false, creator_pro: true, brand_pro: false },
        ],
    },
    {
        category: 'Analytics',
        features: [
            { name: 'Basic Analytics', free: true, creator_pro: true, brand_pro: true },
            { name: 'Advanced Insights', free: false, creator_pro: true, brand_pro: true },
        ],
    },
];

/**
 * Get the right upgrade plan for a user's role.
 */
export const getUpgradePlan = (role) => {
    if (role === 'creator') return subscriptionPlans.creator_pro;
    if (role === 'seller') return subscriptionPlans.brand_pro;
    return subscriptionPlans.creator_pro;
};

/**
 * Check if a tier has access to a specific intelligence mode.
 * Returns 'full', 'summary', or false.
 */
export const canAccessMode = (tier, modeId) => {
    const MODE_MAP = {
        match: 'matchIntelligence',
        audit: 'creatorAudit',
        campaign: 'campaignStrategy',
        roi: 'roiForecast',
        optimize: 'optimization',
    };

    const featureKey = MODE_MAP[modeId];
    if (!featureKey) return false;

    const plan = Object.values(subscriptionPlans).find(p => p.tier === tier);
    if (!plan) return false;

    return plan.features.aiFeatures[featureKey] || false;
};

/**
 * Platform fees configuration
 */
export const platformFees = {
    transactionFee: {
        free: 15,
        creator_pro: 8,
        brand_pro: 5,
    },
    minTransaction: 100,
    paymentProcessing: 2.9,
};

export default {
    TIERS,
    subscriptionPlans,
    featureComparison,
    getUpgradePlan,
    canAccessMode,
    platformFees,
};
