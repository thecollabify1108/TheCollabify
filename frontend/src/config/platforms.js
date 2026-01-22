/**
 * Multi-Platform Support Configuration
 * Supports Instagram, YouTube, TikTok, Twitter, and LinkedIn
 */

export const platforms = {
    instagram: {
        id: 'instagram',
        name: 'Instagram',
        icon: '📸',
        color: '#E1306C',
        contentTypes: ['Post', 'Story', 'Reel', 'IGTV', 'Live'],
        metrics: ['followers', 'engagement', 'reach', 'impressions', 'saves'],
        minFollowers: 1000,
        pricing: {
            base: 500,
            perFollower: 0.05
        }
    },
    youtube: {
        id: 'youtube',
        name: 'YouTube',
        icon: '🎥',
        color: '#FF0000',
        contentTypes: ['Video', 'Short', 'Live Stream', 'Community Post'],
        metrics: ['subscribers', 'views', 'watchTime', 'engagement', 'ctr'],
        minFollowers: 1000,
        pricing: {
            base: 2000,
            perFollower: 0.10
        }
    },
    tiktok: {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        color: '#000000',
        contentTypes: ['Video', 'Live'],
        metrics: ['followers', 'views', 'likes', 'shares', 'engagement'],
        minFollowers: 5000,
        pricing: {
            base: 1000,
            perFollower: 0.08
        }
    },
    twitter: {
        id: 'twitter',
        name: 'Twitter (X)',
        icon: '🐦',
        color: '#1DA1F2',
        contentTypes: ['Tweet', 'Thread', 'Space', 'Reply'],
        metrics: ['followers', 'impressions', 'engagement', 'retweets', 'likes'],
        minFollowers: 2000,
        pricing: {
            base: 800,
            perFollower: 0.06
        }
    },
    linkedin: {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        color: '#0077B5',
        contentTypes: ['Post', 'Article', 'Poll', 'Document'],
        metrics: ['connections', 'impressions', 'engagement', 'shares', 'comments'],
        minFollowers: 500,
        pricing: {
            base: 1500,
            perFollower: 0.12
        }
    }
};

/**
 * Platform-specific metrics and requirements
 */
export const platformMetrics = {
    instagram: {
        engagementRate: {
            excellent: 6.0,
            good: 3.0,
            average: 1.5,
            poor: 0.5
        },
        optimalPostingTimes: [
            { day: 'Monday', time: '11:00', label: 'Lunch break' },
            { day: 'Tuesday', time: '13:00', label: 'Mid-afternoon' },
            { day: 'Wednesday', time: '11:00', label: 'Lunch break' },
            { day: 'Thursday', time: '17:00', label: 'Evening commute' },
            { day: 'Friday', time: '10:00', label: 'Late morning' }
        ]
    },
    youtube: {
        watchTimeThreshold: {
            excellent: 60, // percentage
            good: 45,
            average: 30,
            poor: 15
        },
        optimalPostingTimes: [
            { day: 'Saturday', time: '9:00', label: 'Weekend morning' },
            { day: 'Sunday', time: '11:00', label: 'Weekend mid-morning' },
            { day: 'Thursday', time: '18:00', label: 'Evening entertainment' },
            { day: 'Friday', time: '15:00', label: 'Weekend prep' }
        ]
    },
    tiktok: {
        engagementRate: {
            excellent: 10.0,
            good: 5.0,
            average: 2.5,
            poor: 1.0
        },
        optimalPostingTimes: [
            { day: 'Monday', time: '6:00', label: 'Morning scroll' },
            { day: 'Tuesday', time: '2:00', label: 'Afternoon break' },
            { day: 'Friday', time: '5:00', label: 'Weekend mode' },
            { day: 'Saturday', time: '11:00', label: 'Weekend prime' }
        ]
    },
    twitter: {
        engagementRate: {
            excellent: 2.0,
            good: 1.0,
            average: 0.5,
            poor: 0.2
        },
        optimalPostingTimes: [
            { day: 'Monday', time: '8:00', label: 'Morning news' },
            { day: 'Wednesday', time: '9:00', label: 'Mid-week update' },
            { day: 'Friday', time: '12:00', label: 'Lunch discussion' }
        ]
    },
    linkedin: {
        engagementRate: {
            excellent: 3.0,
            good: 1.5,
            average: 0.8,
            poor: 0.3
        },
        optimalPostingTimes: [
            { day: 'Tuesday', time: '10:00', label: 'Professional hours' },
            { day: 'Wednesday', time: '12:00', label: 'Lunch break' },
            { day: 'Thursday', time: '9:00', label: 'Morning browse' }
        ]
    }
};

/**
 * Calculate platform-specific pricing
 */
export const calculatePlatformPricing = (platform, followerCount, contentType) => {
    const config = platforms[platform];
    if (!config) return 0;

    let basePrice = config.pricing.base;
    const followerPrice = followerCount * config.pricing.perFollower;

    // Content type multiplier
    const typeMultipliers = {
        'Post': 1.0,
        'Story': 0.6,
        'Reel': 1.3,
        'Video': 1.5,
        'Short': 1.2,
        'Article': 1.4,
        'Thread': 0.8,
        'Live': 1.8,
        'IGTV': 1.3,
        'Live Stream': 2.0
    };

    const multiplier = typeMultipliers[contentType] || 1.0;

    return Math.round((basePrice + followerPrice) * multiplier);
};

/**
 * Get platform-specific campaign template
 */
export const getPlatformTemplate = (platform, campaignType) => {
    const templates = {
        instagram: {
            productLaunch: {
                contentTypes: ['Reel', 'Post', 'Story'],
                requiredPosts: 3,
                duration: 14,
                hashtags: 20
            },
            brandAwareness: {
                contentTypes: ['Post', 'Story'],
                requiredPosts: 5,
                duration: 21,
                hashtags: 15
            }
        },
        youtube: {
            productReview: {
                contentTypes: ['Video'],
                requiredPosts: 1,
                duration: 30,
                minLength: '5 minutes'
            },
            tutorial: {
                contentTypes: ['Video'],
                requiredPosts: 1,
                duration: 30,
                minLength: '8 minutes'
            }
        },
        tiktok: {
            challenge: {
                contentTypes: ['Video'],
                requiredPosts: 3,
                duration: 7,
                hashtags: 5
            },
            trending: {
                contentTypes: ['Video'],
                requiredPosts: 5,
                duration: 14,
                hashtags: 8
            }
        },
        twitter: {
            announcement: {
                contentTypes: ['Tweet', 'Thread'],
                requiredPosts: 5,
                duration: 7,
                hashtags: 3
            },
            engagement: {
                contentTypes: ['Tweet', 'Poll'],
                requiredPosts: 10,
                duration: 14,
                hashtags: 5
            }
        },
        linkedin: {
            thought_leadership: {
                contentTypes: ['Article', 'Post'],
                requiredPosts: 3,
                duration: 30,
                hashtags: 5
            },
            company_update: {
                contentTypes: ['Post'],
                requiredPosts: 5,
                duration: 21,
                hashtags: 3
            }
        }
    };

    return templates[platform]?.[campaignType] || templates.instagram.brandAwareness;
};

/**
 * Cross-platform campaign orchestration
 */
export const createCrossPlatformCampaign = (params) => {
    const {
        platforms: selectedPlatforms = ['instagram'],
        budget,
        duration = 14,
        primaryMessage
    } = params;

    const budgetPerPlatform = budget / selectedPlatforms.length;

    const campaignPlan = selectedPlatforms.map(platformId => {
        const platform = platforms[platformId];
        const template = getPlatformTemplate(platformId, 'brandAwareness');

        return {
            platform: platformId,
            platformName: platform.name,
            budget: Math.round(budgetPerPlatform),
            contentTypes: template.contentTypes,
            requiredPosts: template.requiredPosts,
            duration,
            recommendations: {
                postingTimes: platformMetrics[platformId].optimalPostingTimes.slice(0, 3),
                hashtags: template.hashtags || 10
            }
        };
    });

    return {
        totalBudget: budget,
        duration,
        platforms: campaignPlan,
        estimatedReach: calculateCrossPlatformReach(campaignPlan),
        diversityScore: (selectedPlatforms.length / Object.keys(platforms).length) * 100
    };
};

/**
 * Calculate combined reach across platforms
 */
function calculateCrossPlatformReach(platformPlans) {
    // Estimate based on typical creator following
    const avgFollowersByPlatform = {
        instagram: 50000,
        youtube: 25000,
        tiktok: 100000,
        twitter: 30000,
        linkedin: 15000
    };

    const totalReach = platformPlans.reduce((sum, plan) => {
        const avgFollowers = avgFollowersByPlatform[plan.platform] || 50000;
        const reachRate = 0.3; // 30% typical reach
        return sum + (avgFollowers * reachRate * plan.requiredPosts);
    }, 0);

    return Math.round(totalReach);
}

/**
 * Platform verification requirements
 */
export const verificationRequirements = {
    instagram: {
        minFollowers: 10000,
        verificationBadge: 'Blue checkmark',
        requirements: ['Authentic account', 'Unique presence', 'Complete profile', 'Active account']
    },
    youtube: {
        minSubscribers: 100000,
        verificationBadge: 'Silver Play Button',
        requirements: ['Creator Program', 'Community Guidelines', 'Active uploads', '4000 watch hours']
    },
    tiktok: {
        minFollowers: 10000,
        verificationBadge: 'Verified badge',
        requirements: ['Original content', 'Active account', 'Community Guidelines', 'Follower engagement']
    },
    twitter: {
        minFollowers: 500,
        verificationBadge: 'Blue/Gold checkmark',
        requirements: ['Active account', 'Complete profile', 'Phone verified', 'Authentic identity']
    },
    linkedin: {
        minConnections: 500,
        verificationBadge: 'Top Voice badge',
        requirements: ['Complete profile', 'Recent activity', 'Quality content', 'Professional network']
    }
};

export default {
    platforms,
    platformMetrics,
    calculatePlatformPricing,
    getPlatformTemplate,
    createCrossPlatformCampaign,
    verificationRequirements
};
