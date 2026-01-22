/**
 * Subscription Tiers & Pricing Configuration
 * Free, Pro, and Enterprise plans
 */

export const subscriptionPlans = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        billingPeriod: 'forever',
        description: 'Perfect for getting started',
        badge: '🆓',
        color: '#6B7280',
        features: {
            campaigns: {
                limit: 2,
                description: '2 active campaigns'
            },
            creators: {
                limit: 50,
                description: 'Browse up to 50 creators'
            },
            applications: {
                limit: 10,
                description: '10 applications per campaign'
            },
            analytics: {
                enabled: true,
                advanced: false,
                description: 'Basic analytics'
            },
            aiFeatures: {
                contentGenerator: false,
                predictiveAnalytics: false,
                autoMatching: false,
                sentimentAnalysis: false description: 'No AI features'
            },
            support: {
                email: true,
                priority: false,
                dedicated: false,
                description: 'Email support (48h response)'
            },
            platforms: {
                limit: ['instagram'],
                description: 'Instagram only'
            },
            teamMembers: {
                limit: 1,
                description: 'Solo account'
            },
            exports: {
                enabled: false,
                description: 'No data exports'
            },
            branding: {
                removable: false,
                description: 'TheCollabify branding'
            }
        },
        cta: 'Start Free',
        popular: false
    },

    pro: {
        id: 'pro',
        name: 'Pro',
        price: 999,
        billingPeriod: 'month',
        yearlyPrice: 9990, // 2 months free
        description: 'For serious brands and agencies',
        badge: '⭐',
        color: '#8B5CF6',
        features: {
            campaigns: {
                limit: 25,
                description: '25 active campaigns'
            },
            creators: {
                limit: 'unlimited',
                description: 'Unlimited creator browsing'
            },
            applications: {
                limit: 'unlimited',
                description: 'Unlimited applications'
            },
            analytics: {
                enabled: true,
                advanced: true,
                description: 'Advanced analytics & insights'
            },
            aiFeatures: {
                contentGenerator: true,
                predictiveAnalytics: true,
                autoMatching: true,
                sentimentAnalysis: true,
                description: 'Full AI suite included'
            },
            support: {
                email: true,
                priority: true,
                dedicated: false,
                description: 'Priority support (4h response)'
            },
            platforms: {
                limit: ['instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'],
                description: 'All 5 platforms'
            },
            teamMembers: {
                limit: 5,
                description: 'Up to 5 team members'
            },
            exports: {
                enabled: true,
                description: 'Unlimited CSV/PDF exports'
            },
            branding: {
                removable: true,
                description: 'Remove TheCollabify branding'
            },
            extras: [
                'Campaign templates library',
                'Saved search filters',
                'Bulk creator invites',
                'Custom reports',
                'API access (basic)',
                'White-label reports'
            ]
        },
        cta: 'Start Pro Trial',
        trialDays: 14,
        popular: true
    },

    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'custom',
        billingPeriod: 'custom',
        description: 'For large teams and enterprises',
        badge: '💎',
        color: '#EC4899',
        features: {
            campaigns: {
                limit: 'unlimited',
                description: 'Unlimited campaigns'
            },
            creators: {
                limit: 'unlimited',
                description: 'Unlimited creator access'
            },
            applications: {
                limit: 'unlimited',
                description: 'Unlimited applications'
            },
            analytics: {
                enabled: true,
                advanced: true,
                custom: true,
                description: 'Custom analytics & BI tools'
            },
            aiFeatures: {
                contentGenerator: true,
                predictiveAnalytics: true,
                autoMatching: true,
                sentimentAnalysis: true,
                customModels: true,
                description: 'AI suite + custom models'
            },
            support: {
                email: true,
                priority: true,
                dedicated: true,
                description: 'Dedicated account manager'
            },
            platforms: {
                limit: ['instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'],
                description: 'All platforms + custom integrations'
            },
            teamMembers: {
                limit: 'unlimited',
                description: 'Unlimited team members'
            },
            exports: {
                enabled: true,
                api: true,
                description: 'Unlimited exports + API access'
            },
            branding: {
                removable: true,
                whiteLabel: true,
                description: 'Full white-label solution'
            },
            extras: [
                'Everything in Pro',
                'Custom integrations',
                'Advanced API access',
                'SSO authentication',
                'Custom workflows',
                'Dedicated infrastructure',
                'SLA guarantee',
                'Training & onboarding',
                'Custom contract terms',
                'Volume discounts'
            ]
        },
        cta: 'Contact Sales',
        popular: false
    }
};

/**
 * Feature comparison table
 */
export const featureComparison = [
    {
        category: 'Campaigns',
        features: [
            { name: 'Active Campaigns', free: '2', pro: '25', enterprise: 'Unlimited' },
            { name: 'Campaign Templates', free: false, pro: true, enterprise: true },
            { name: 'Cross-platform Campaigns', free: false, pro: true, enterprise: true },
            { name: 'Automated Scheduling', free: false, pro: true, enterprise: true }
        ]
    },
    {
        category: 'Creator Discovery',
        features: [
            { name: 'Creator Browse Limit', free: '50', pro: 'Unlimited', enterprise: 'Unlimited' },
            { name: 'Advanced Filters', free: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
            { name: 'AI Match Scoring', free: false, pro: true, enterprise: true },
            { name: 'Bulk Invites', free: false, pro: true, enterprise: true }
        ]
    },
    {
        category: 'AI Features',
        features: [
            { name: 'Content Generator', free: false, pro: true, enterprise: true },
            { name: 'ROI Predictions', free: false, pro: true, enterprise: true },
            { name: 'Sentiment Analysis', free: false, pro: true, enterprise: true },
            { name: 'Custom AI Models', free: false, pro: false, enterprise: true }
        ]
    },
    {
        category: 'Analytics',
        features: [
            { name: 'Basic Analytics', free: true, pro: true, enterprise: true },
            { name: 'Advanced Insights', free: false, pro: true, enterprise: true },
            { name: 'Custom Reports', free: false, pro: true, enterprise: true },
            { name: 'BI Integration', free: false, pro: false, enterprise: true }
        ]
    },
    {
        category: 'Collaboration',
        features: [
            { name: 'Team Members', free: '1', pro: '5', enterprise: 'Unlimited' },
            { name: 'Role Permissions', free: false, pro: true, enterprise: true },
            { name: 'Approval Workflows', free: false, pro: false, enterprise: true },
            { name: 'SSO Integration', free: false, pro: false, enterprise: true }
        ]
    }
];

/**
 * Add-ons available for Pro plan
 */
export const addOns = {
    extraTeamMembers: {
        id: 'extra-team',
        name: 'Additional Team Members',
        price: 199,
        unit: 'per member/month',
        description: 'Add more team members beyond plan limit'
    },
    prioritySupport: {
        id: 'priority-support',
        name: 'Priority Support Upgrade',
        price: 499,
        unit: 'per month',
        description: '1-hour response time, phone support'
    },
    customBranding: {
        id: 'custom-branding',
        name: 'Custom Branding',
        price: 299,
        unit: 'per month',
        description: 'White-label reports with your branding'
    },
    apiAccess: {
        id: 'api-access',
        name: 'Advanced API Access',
        price: 799,
        unit: 'per month',
        description: 'Higher rate limits and webhook support'
    }
};

/**
 * Calculate plan price with add-ons
 */
export const calculateTotalPrice = (planId, addOnIds = [], isYearly = false) => {
    const plan = subscriptionPlans[planId];
    if (!plan) return 0;

    let basePrice = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;

    if (typeof basePrice === 'string') return 'custom';

    const addOnsTotal = addOnIds.reduce((sum, addonId) => {
        const addon = addOns[addonId];
        return sum + (addon ? addon.price : 0);
    }, 0);

    const monthlyTotal = basePrice + addOnsTotal;

    return isYearly ? monthlyTotal * 12 : monthlyTotal;
};

/**
 * Get recommended plan based on usage
 */
export const recommendPlan = (usage) => {
    const {
        monthlyBudget = 0,
        activeCampaigns = 0,
        teamSize = 1,
        needsAI = false,
        needsMultiPlatform = false
    } = usage;

    if (monthlyBudget > 100000 || teamSize > 5 || needsMultiPlatform) {
        return 'enterprise';
    }

    if (monthlyBudget > 20000 || activeCampaigns > 2 || teamSize > 1 || needsAI) {
        return 'pro';
    }

    return 'free';
};

/**
 * Platform fees configuration
 */
export const platformFees = {
    transactionFee: {
        free: 15, // 15% on free plan
        pro: 8, // 8% on pro plan
        enterprise: 5 // 5% on enterprise plan
    },
    minTransaction: 100,
    paymentProcessing: 2.9 // 2.9% + platform fee
};

export default {
    subscriptionPlans,
    featureComparison,
    addOns,
    calculateTotalPrice,
    recommendPlan,
    platformFees
};
