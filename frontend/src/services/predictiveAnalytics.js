/**
 * Predictive Analytics Service
 * Provides ROI forecasting, engagement predictions, and campaign insights
 */

/**
 * Calculate predicted ROI based on historical data and campaign parameters
 */
export const predictROI = (campaignData) => {
    const {
        budget = 5000,
        creatorFollowers = 50000,
        creatorEngagementRate = 3.5,
        promotionType = 'Post',
        category = 'Lifestyle',
        duration = 14
    } = campaignData;

    // Base conversion rates by promotion type
    const conversionRates = {
        Post: 0.8,
        Story: 0.5,
        Reel: 1.2,
        Video: 1.5,
        IGTV: 0.9,
        Live: 1.8
    };

    // Category multipliers
    const categoryMultipliers = {
        Fashion: 1.1,
        Beauty: 1.2,
        Tech: 0.9,
        Lifestyle: 1.0,
        Food: 0.95,
        Travel: 0.85,
        Fitness: 1.05,
        Gaming: 0.8
    };

    const baseConversionRate = conversionRates[promotionType] || 1.0;
    const categoryMultiplier = categoryMultipliers[category] || 1.0;

    // Calculate reach
    const estimatedReach = creatorFollowers * 0.3; // 30% of followers typically see content
    const expectedEngagement = estimatedReach * (creatorEngagementRate / 100);

    // Calculate conversions
    const estimatedConversions = (expectedEngagement * baseConversionRate * categoryMultiplier) / 100;

    // Calculate revenue (assuming average order value)
    const averageOrderValue = budget * 2; // Conservative estimate
    const estimatedRevenue = estimatedConversions * averageOrderValue;

    // Calculate ROI
    const roi = ((estimatedRevenue - budget) / budget) * 100;

    // Confidence score based on data quality
    let confidence = 70; // Base confidence
    if (creatorEngagementRate > 5) confidence += 10;
    if (creatorFollowers > 100000) confidence += 5;
    if (promotionType === 'Reel' || promotionType === 'Video') confidence += 10;
    confidence = Math.min(confidence, 95); // Cap at 95%

    return {
        roi: Math.round(roi * 10) / 10,
        estimatedRevenue: Math.round(estimatedRevenue),
        estimatedReach: Math.round(estimatedReach),
        estimatedEngagement: Math.round(expectedEngagement),
        estimatedConversions: Math.round(estimatedConversions),
        confidence: Math.round(confidence),
        breakdown: {
            reachRate: '30%',
            conversionRate: `${(baseConversionRate * categoryMultiplier).toFixed(2)}%`,
            engagementRate: `${creatorEngagementRate}%`
        }
    };
};

/**
 * Predict engagement for a campaign
 */
export const predictEngagement = (creatorProfile) => {
    const {
        followers = 50000,
        avgEngagementRate = 3.5,
        category = 'Lifestyle',
        postingFrequency = 'regular', // low, regular, high
        audienceQuality = 'good' // poor, average, good, excellent
    } = creatorProfile;

    // Base engagement calculation
    let baseEngagement = followers * (avgEngagementRate / 100);

    // Frequency multiplier
    const frequencyMultipliers = {
        low: 0.9,
        regular: 1.0,
        high: 1.1
    };

    // Quality multiplier
    const qualityMultipliers = {
        poor: 0.7,
        average: 0.9,
        good: 1.0,
        excellent: 1.2
    };

    const totalEngagement = baseEngagement *
        (frequencyMultipliers[postingFrequency] || 1.0) *
        (qualityMultipliers[audienceQuality] || 1.0);

    const likes = Math.round(totalEngagement * 0.7); // 70% likes
    const comments = Math.round(totalEngagement * 0.15); // 15% comments
    const shares = Math.round(totalEngagement * 0.10); // 10% shares
    const saves = Math.round(totalEngagement * 0.05); // 5% saves

    return {
        totalEngagement: Math.round(totalEngagement),
        breakdown: {
            likes,
            comments,
            shares,
            saves
        },
        engagementRate: avgEngagementRate,
        reach: Math.round(followers * 0.3) // 30% reach
    };
};

/**
 * Calculate campaign success probability
 */
export const calculateSuccessProbability = (campaignData) => {
    const {
        budget = 5000,
        creatorMatchScore = 75,
        creatorRating = 4.2,
        creatorSuccessRate = 85,
        categoryTrend = 'stable', // declining, stable, growing
        seasonality = 'neutral', // low, neutral, high
        urgency = 'normal' // low, normal, high
    } = campaignData;

    let probability = 50; // Base 50%

    // Match score impact (0-30 points)
    probability += (creatorMatchScore / 100) * 30;

    // Creator rating impact (0-15 points)
    probability += ((creatorRating - 1) / 4) * 15;

    // Success rate impact (0-20 points)
    probability += (creatorSuccessRate / 100) * 20;

    // Category trend impact
    const trendImpact = {
        declining: -10,
        stable: 0,
        growing: 10
    };
    probability += trendImpact[categoryTrend] || 0;

    // Seasonality impact
    const seasonalityImpact = {
        low: -5,
        neutral: 0,
        high: 10
    };
    probability += seasonalityImpact[seasonality] || 0;

    // Budget adequacy impact
    if (budget < 2000) probability -= 10;
    if (budget > 10000) probability += 5;

    // Urgency impact
    const urgencyImpact = {
        low: -5,
        normal: 0,
        high: 5
    };
    probability += urgencyImpact[urgency] || 0;

    // Cap between 10 and 95
    probability = Math.max(10, Math.min(95, probability));

    // Determine risk level
    let risk = 'medium';
    if (probability > 75) risk = 'low';
    if (probability < 50) risk = 'high';

    return {
        probability: Math.round(probability),
        risk,
        factors: {
            matchScore: creatorMatchScore,
            creatorRating,
            successRate: creatorSuccessRate,
            trend: categoryTrend,
            seasonality
        },
        recommendation: probability > 70
            ? 'Highly recommended - Strong success indicators'
            : probability > 50
                ? 'Recommended - Good potential with moderate risk'
                : 'Consider alternatives - High risk factors identified'
    };
};

/**
 * Analyze best time to launch campaign
 */
export const analyzeBestLaunchTime = (category, targetAudience = 'general') => {
    const recommendations = {
        Fashion: {
            bestDays: ['Friday', 'Saturday', 'Sunday'],
            bestHours: ['18:00', '19:00', '20:00'],
            reason: 'Weekend evening when users plan outfits',
            avoidDays: ['Monday'],
            seasonalTips: 'Launch fashion campaigns at season start'
        },
        Beauty: {
            bestDays: ['Tuesday', 'Thursday', 'Sunday'],
            bestHours: ['19:00', '20:00', '21:00'],
            reason: 'Evening skincare routine and weekend self-care',
            avoidDays: ['Monday'],
            seasonalTips: 'Beauty campaigns peak before festivals'
        },
        Tech: {
            bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
            bestHours: ['12:00', '18:00', '21:00'],
            reason: 'Weekday engagement with tech enthusiasts',
            avoidDays: ['Sunday'],
            seasonalTips: 'Tech launches best mid-week'
        },
        Food: {
            bestDays: ['Friday', 'Saturday', 'Sunday'],
            bestHours: ['12:00', '17:00', '19:00'],
            reason: 'Meal planning and weekend cooking',
            avoidDays: ['Monday'],
            seasonalTips: 'Food content peaks around meal times'
        },
        default: {
            bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
            bestHours: ['18:00', '19:00', '20:00'],
            reason: 'Peak engagement mid-week evenings',
            avoidDays: ['Monday'],
            seasonalTips: 'Mid-week launches generally perform best'
        }
    };

    const recommendation = recommendations[category] || recommendations.default;

    return {
        ...recommendation,
        expectedReach: 'High',
        competition: category === 'Fashion' || category === 'Beauty' ? 'High' : 'Medium'
    };
};

/**
 * Generate performance insights
 */
export const generatePerformanceInsights = (historicalData) => {
    const {
        pastCampaigns = [],
        averageROI = 0,
        totalInvestment = 0,
        totalRevenue = 0
    } = historicalData;

    const insights = [];

    // ROI insight
    if (averageROI > 150) {
        insights.push({
            type: 'success',
            title: 'Excellent ROI',
            message: `Your average ROI of ${averageROI}% is above industry standard (120%)`,
            action: 'Keep using similar strategies'
        });
    } else if (averageROI < 80) {
        insights.push({
            type: 'warning',
            title: 'Below Average ROI',
            message: `Your average ROI of ${averageROI}% is below expectations`,
            action: 'Consider revising creator selection or campaign strategy'
        });
    }

    // Budget efficiency
    const avgCampaignBudget = totalInvestment / (pastCampaigns.length || 1);
    if (avgCampaignBudget < 3000) {
        insights.push({
            type: 'info',
            title: 'Low Budget Campaigns',
            message: 'Consider increasing budget for better creator reach',
            action: 'Test campaigns with ₹5,000+ budget'
        });
    }

    // Campaign frequency
    if (pastCampaigns.length < 3) {
        insights.push({
            type: 'tip',
            title: 'Build Momentum',
            message: 'Consistent campaigns yield better long-term results',
            action: 'Aim for 2-3 campaigns per month'
        });
    }

    return insights;
};

/**
 * Predict optimal budget
 */
export const predictOptimalBudget = (params) => {
    const {
        targetReach = 100000,
        category = 'Lifestyle',
        promotionType = 'Post',
        expectedROI = 150
    } = params;

    // Base cost per thousand impressions (CPM) by category
    const cpmRates = {
        Fashion: 8,
        Beauty: 10,
        Tech: 12,
        Lifestyle: 7,
        Food: 6,
        Fitness: 9,
        default: 8
    };

    const cpm = cpmRates[category] || cpmRates.default;

    // Calculate base budget needed
    const baseBudget = (targetReach / 1000) * cpm;

    // Promotion type multiplier
    const typeMultipliers = {
        Post: 1.0,
        Story: 0.7,
        Reel: 1.3,
        Video: 1.5,
        IGTV: 1.2
    };

    const multiplier = typeMultipliers[promotionType] || 1.0;
    const recommendedBudget = Math.round(baseBudget * multiplier);

    // Calculate budget ranges
    const minBudget = Math.round(recommendedBudget * 0.7);
    const maxBudget = Math.round(recommendedBudget * 1.3);

    return {
        recommended: recommendedBudget,
        min: minBudget,
        max: maxBudget,
        breakdown: {
            cpm,
            targetReach,
            estimatedImpressions: targetReach,
            expectedEngagement: Math.round(targetReach * 0.035) // 3.5% engagement
        },
        tip: `For ${category} campaigns, budget between ₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()} for optimal results`
    };
};

export default {
    predictROI,
    predictEngagement,
    calculateSuccessProbability,
    analyzeBestLaunchTime,
    generatePerformanceInsights,
    predictOptimalBudget
};
