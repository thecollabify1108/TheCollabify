/**
 * Creator Analytics Dashboard Service
 * Comprehensive analytics for creators to track performance
 */

/**
 * Calculate creator performance metrics
 */
export const calculateCreatorMetrics = (data) => {
    const {
        campaigns = [],
        totalEarnings = 0,
        profileViews = 0,
        applicationsSent = 0,
        acceptanceRate = 0,
        avgRating = 0,
        followers = {},
        engagement = {}
    } = data;

    const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const pendingCampaigns = campaigns.filter(c => c.status === 'Pending').length;

    return {
        overview: {
            totalCampaigns: campaigns.length,
            completedCampaigns,
            activeCampaigns,
            pendingCampaigns,
            totalEarnings,
            avgEarningsPerCampaign: campaigns.length > 0 ? Math.round(totalEarnings / campaigns.length) : 0,
            successRate: campaigns.length > 0 ? Math.round((completedCampaigns / campaigns.length) * 100) : 0
        },
        engagement: {
            profileViews,
            profileViewsGrowth: calculateGrowth(profileViews, data.previousProfileViews || 0),
            applicationsSent,
            acceptanceRate,
            avgRating,
            responseRate: calculateResponseRate(data.messagesReceived || 0, data.messagesReplied || 0)
        },
        audience: {
            totalFollowers: Object.values(followers).reduce((sum, count) => sum + count, 0),
            followersByPlatform: followers,
            avgEngagement: calculateAverageEngagement(engagement),
            engagementByPlatform: engagement,
            audienceGrowth: calculateAudienceGrowth(data.historicalFollowers || [])
        },
        performance: {
            topPerformingPlatform: getTopPlatform(engagement),
            bestContentType: getBestContentType(campaigns),
            peakPerformanceDays: getPeakDays(data.activityLog || []),
            trendscore: calculateTrendScore(data)
        }
    };
};

/**
 * Generate earnings breakdown
 */
export const generateEarningsReport = (transactions) => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return {
            total: 0,
            byMonth: [],
            byPlatform: {},
            byCategory: {},
            topBrands: []
        };
    }

    // Group by month
    const byMonth = {};
    transactions.forEach(t => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        byMonth[month] = (byMonth[month] || 0) + t.amount;
    });

    // Group by platform
    const byPlatform = {};
    transactions.forEach(t => {
        byPlatform[t.platform] = (byPlatform[t.platform] || 0) + t.amount;
    });

    // Group by category
    const byCategory = {};
    transactions.forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    // Top brands
    const brandEarnings = {};
    transactions.forEach(t => {
        brandEarnings[t.brandName] = (brandEarnings[t.brandName] || 0) + t.amount;
    });

    const topBrands = Object.entries(brandEarnings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([brand, amount]) => ({ brand, amount }));

    return {
        total: transactions.reduce((sum, t) => sum + t.amount, 0),
        byMonth: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })),
        byPlatform,
        byCategory,
        topBrands,
        avgTransactionValue: Math.round(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length),
        totalTransactions: transactions.length
    };
};

/**
 * Audience demographics analysis
 */
export const analyzeAudienceDemographics = (audienceData) => {
    const {
        ageGroups = {},
        genderSplit = {},
        topLocations = [],
        interests = [],
        deviceTypes = {}
    } = audienceData;

    return {
        age: {
            distribution: ageGroups,
            dominant: Object.keys(ageGroups).reduce((a, b) => ageGroups[a] > ageGroups[b] ? a : b, ''),
            diversity: calculateDiversity(Object.values(ageGroups))
        },
        gender: {
            distribution: genderSplit,
            balance: Math.abs(50 - (genderSplit.male || 0))
        },
        geography: {
            topLocations,
            reach: topLocations.length,
            concentration: topLocations.length > 0 ? topLocations[0].percentage : 0
        },
        interests,
        devices: deviceTypes,
        audienceQuality: calculateAudienceQuality(audienceData)
    };
};

/**
 * Content performance analysis
 */
export const analyzeContentPerformance = (posts) => {
    if (!Array.isArray(posts) || posts.length === 0) {
        return {
            totalPosts: 0,
            avgEngagement: 0,
            topPosts: [],
            contentTypes: {},
            bestTimes: []
        };
    }

    const contentTypes = {};
    const hourlyPerformance = {};

    posts.forEach(post => {
        // By content type
        contentTypes[post.type] = contentTypes[post.type] || { count: 0, totalEngagement: 0 };
        contentTypes[post.type].count++;
        contentTypes[post.type].totalEngagement += post.engagement || 0;

        // By hour
        const hour = new Date(post.postedAt).getHours();
        hourlyPerformance[hour] = hourlyPerformance[hour] || { count: 0, totalEngagement: 0 };
        hourlyPerformance[hour].count++;
        hourlyPerformance[hour].totalEngagement += post.engagement || 0;
    });

    // Calculate averages
    Object.keys(contentTypes).forEach(type => {
        contentTypes[type].avgEngagement = Math.round(
            contentTypes[type].totalEngagement / contentTypes[type].count
        );
    });

    // Best posting times
    const bestTimes = Object.entries(hourlyPerformance)
        .map(([hour, data]) => ({
            hour: parseInt(hour),
            avgEngagement: Math.round(data.totalEngagement / data.count),
            posts: data.count
        }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 5);

    // Top performing posts
    const topPosts = posts
        .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
        .slice(0, 10)
        .map(post => ({
            id: post.id,
            type: post.type,
            platform: post.platform,
            engagement: post.engagement,
            reach: post.reach,
            postedAt: post.postedAt
        }));

    return {
        totalPosts: posts.length,
        avgEngagement: Math.round(posts.reduce((sum, p) => sum + (p.engagement || 0), 0) / posts.length),
        topPosts,
        contentTypes,
        bestTimes,
        consistency: calculatePostingConsistency(posts)
    };
};

/**
 * Growth projections
 */
export const projectGrowth = (historicalData, months = 6) => {
    const {
        earnings = [],
        followers = [],
        campaigns = []
    } = historicalData;

    if (earnings.length < 2) {
        return {
            projectedEarnings: [],
            projectedFollowers: [],
            projectedCampaigns: [],
            confidence: 0
        };
    }

    // Calculate growth rates
    const earningsGrowthRate = calculateGrowthRate(earnings);
    const followersGrowthRate = calculateGrowthRate(followers);
    const campaignsGrowthRate = calculateGrowthRate(campaigns);

    const projectedEarnings = [];
    const projectedFollowers = [];
    const projectedCampaigns = [];

    let lastEarnings = earnings[earnings.length - 1];
    let lastFollowers = followers[followers.length - 1];
    let lastCampaigns = campaigns[campaigns.length - 1];

    for (let i = 1; i <= months; i++) {
        lastEarnings = lastEarnings * (1 + earningsGrowthRate);
        lastFollowers = Math.round(lastFollowers * (1 + followersGrowthRate));
        lastCampaigns = Math.round(lastCampaigns * (1 + campaignsGrowthRate));

        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + i);

        projectedEarnings.push({
            month: futureDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
            value: Math.round(lastEarnings)
        });

        projectedFollowers.push({
            month: futureDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
            value: lastFollowers
        });

        projectedCampaigns.push({
            month: futureDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
            value: lastCampaigns
        });
    }

    return {
        projectedEarnings,
        projectedFollowers,
        projectedCampaigns,
        confidence: Math.min(95, historicalData.length * 15), // More data = higher confidence
        growthRates: {
            earnings: Math.round(earningsGrowthRate * 100),
            followers: Math.round(followersGrowthRate * 100),
            campaigns: Math.round(campaignsGrowthRate * 100)
        }
    };
};

/**
 * Competitor benchmarking
 */
export const benchmarkAgainstPeers = (creatorData, industryAverages) => {
    const {
        engagementRate = 0,
        followerCount = 0,
        avgEarnings = 0,
        responseTime = 24, // hours
        completionRate = 0
    } = creatorData;

    const industryAvg = industryAverages || {
        engagementRate: 3.5,
        avgEarnings: 5000,
        responseTime: 12,
        completionRate: 85
    };

    return {
        engagement: {
            yours: engagementRate,
            industry: industryAvg.engagementRate,
            percentile: calculatePercentile(engagementRate, industryAvg.engagementRate),
            status: engagementRate > industryAvg.engagementRate ? 'above' : 'below'
        },
        earnings: {
            yours: avgEarnings,
            industry: industryAvg.avgEarnings,
            percentile: calculatePercentile(avgEarnings, industryAvg.avgEarnings),
            status: avgEarnings > industryAvg.avgEarnings ? 'above' : 'below'
        },
        responseTime: {
            yours: responseTime,
            industry: industryAvg.responseTime,
            status: responseTime < industryAvg.responseTime ? 'better' : 'slower'
        },
        completionRate: {
            yours: completionRate,
            industry: industryAvg.completionRate,
            percentile: calculatePercentile(completionRate, industryAvg.completionRate),
            status: completionRate > industryAvg.completionRate ? 'above' : 'below'
        },
        overallRank: calculateOverallRank(creatorData, industryAvg)
    };
};

// Helper Functions

function calculateGrowth(current, previous) {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
}

function calculateResponseRate(received, replied) {
    if (received === 0) return 0;
    return Math.round((replied / received) * 100);
}

function calculateAverageEngagement(engagement) {
    const rates = Object.values(engagement);
    if (rates.length === 0) return 0;
    return Math.round((rates.reduce((sum, rate) => sum + rate, 0) / rates.length) * 10) / 10;
}

function calculateAudienceGrowth(historical) {
    if (historical.length < 2) return 0;
    const recent = historical[historical.length - 1];
    const previous = historical[historical.length - 2];
    return calculateGrowth(recent, previous);
}

function getTopPlatform(engagement) {
    const entries = Object.entries(engagement);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

function getBestContentType(campaigns) {
    const types = {};
    campaigns.forEach(c => {
        types[c.type] = (types[c.type] || 0) + 1;
    });
    const entries = Object.entries(types);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

function getPeakDays(activityLog) {
    const dayActivity = {};
    activityLog.forEach(log => {
        const day = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' });
        dayActivity[day] = (dayActivity[day] || 0) + (log.engagement || 0);
    });

    return Object.entries(dayActivity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([day]) => day);
}

function calculateTrendScore(data) {
    let score = 50;

    if (data.followerGrowth > 10) score += 20;
    if (data.engagementRate > 5) score += 15;
    if (data.completionRate > 90) score += 15;

    return Math.min(100, score);
}

function calculateDiversity(values) {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    return Math.min(100, Math.round(Math.sqrt(variance)));
}

function calculateAudienceQuality(data) {
    let score = 50;

    if (data.topLocations?.length > 5) score += 10;
    if (data.interests?.length > 10) score += 15;
    const genderBalance = data.genderSplit ? Math.abs(50 - (data.genderSplit.male || 0)) : 50;
    if (genderBalance < 20) score += 15;

    return Math.min(100, score);
}

function calculatePostingConsistency(posts) {
    if (posts.length < 7) return 0;

    const dates = posts.map(p => new Date(p.postedAt).getDate()).sort((a, b) => a - b);
    const gaps = [];

    for (let i = 1; i < dates.length; i++) {
        gaps.push(dates[i] - dates[i - 1]);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;

    return Math.max(0, 100 - Math.round(Math.sqrt(variance) * 10));
}

function calculateGrowthRate(data) {
    if (data.length < 2) return 0;

    const recent = data.slice(-3);
    const older = data.slice(-6, -3);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (olderAvg === 0) return 0;
    return (recentAvg - olderAvg) / olderAvg;
}

function calculatePercentile(value, average) {
    if (average === 0) return 50;
    const ratio = value / average;
    return Math.min(99, Math.max(1, Math.round(50 + (ratio - 1) * 50)));
}

function calculateOverallRank(creator, industry) {
    const scores = [
        calculatePercentile(creator.engagementRate, industry.engagementRate),
        calculatePercentile(creator.avgEarnings, industry.avgEarnings),
        calculatePercentile(creator.completionRate, industry.completionRate),
        creator.responseTime < industry.responseTime ? 75 : 25
    ];

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avgScore >= 75) return 'Top 25%';
    if (avgScore >= 50) return 'Above Average';
    if (avgScore >= 25) return 'Average';
    return 'Below Average';
}

export default {
    calculateCreatorMetrics,
    generateEarningsReport,
    analyzeAudienceDemographics,
    analyzeContentPerformance,
    projectGrowth,
    benchmarkAgainstPeers
};
