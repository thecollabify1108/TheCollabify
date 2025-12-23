/**
 * AI Profile Insights Service
 * 
 * Generates explainable, lightweight insights for creator profiles.
 * No deep learning required - uses rule-based analysis with weighted scoring.
 */

/**
 * Analyze engagement quality based on engagement rate
 * Industry benchmarks:
 * - Micro (10K-50K): 3-6% average
 * - Mid (50K-500K): 2-4% average
 * - Macro (500K-1M): 1.5-3% average
 * - Mega (1M+): 1-2% average
 */
const analyzeEngagementQuality = (engagementRate, followerCount) => {
    // Adjust thresholds based on follower count
    let highThreshold, mediumThreshold;

    if (followerCount < 50000) {
        // Micro-influencers have higher engagement rates
        highThreshold = 5;
        mediumThreshold = 2.5;
    } else if (followerCount < 500000) {
        // Mid-tier influencers
        highThreshold = 3.5;
        mediumThreshold = 1.5;
    } else if (followerCount < 1000000) {
        // Macro influencers
        highThreshold = 2.5;
        mediumThreshold = 1;
    } else {
        // Mega influencers
        highThreshold = 1.5;
        mediumThreshold = 0.5;
    }

    if (engagementRate >= highThreshold) {
        return 'High';
    } else if (engagementRate >= mediumThreshold) {
        return 'Medium';
    }
    return 'Low';
};

/**
 * Estimate audience authenticity
 * Based on engagement-to-follower ratio patterns
 */
const analyzeAudienceAuthenticity = (engagementRate, followerCount) => {
    // Suspicious patterns:
    // - Very high followers with very low engagement (might have fake followers)
    // - Unusually high engagement (might have engagement pods)

    const engagementToFollowerRatio = engagementRate / 100;

    // Calculate expected engagement range
    let expectedMin, expectedMax;

    if (followerCount < 10000) {
        expectedMin = 0.03;
        expectedMax = 0.15;
    } else if (followerCount < 100000) {
        expectedMin = 0.02;
        expectedMax = 0.10;
    } else if (followerCount < 1000000) {
        expectedMin = 0.01;
        expectedMax = 0.05;
    } else {
        expectedMin = 0.005;
        expectedMax = 0.03;
    }

    if (engagementToFollowerRatio >= expectedMin && engagementToFollowerRatio <= expectedMax) {
        return 'High';
    } else if (engagementToFollowerRatio >= expectedMin * 0.5 || engagementToFollowerRatio <= expectedMax * 1.5) {
        return 'Medium';
    }
    return 'Low';
};

/**
 * Identify creator strengths based on metrics
 */
const identifyStrengths = (profile) => {
    const strengths = [];

    // High reach potential
    if (profile.followerCount >= 100000) {
        strengths.push('High reach potential');
    } else if (profile.followerCount >= 50000) {
        strengths.push('Good reach potential');
    }

    // Strong engagement
    if (profile.engagementRate >= 5) {
        strengths.push('Exceptional engagement');
    } else if (profile.engagementRate >= 3) {
        strengths.push('Strong engagement');
    }

    // Versatility
    if (profile.promotionTypes && profile.promotionTypes.length >= 3) {
        strengths.push('Versatile content formats');
    }

    // Niche expertise
    if (profile.category) {
        strengths.push(`${profile.category} niche expert`);
    }

    // Affordable pricing
    if (profile.priceRange && profile.priceRange.min < 1000) {
        strengths.push('Budget-friendly rates');
    }

    // Premium tier
    if (profile.priceRange && profile.priceRange.min >= 5000) {
        strengths.push('Premium influencer tier');
    }

    // Availability
    if (profile.isAvailable) {
        strengths.push('Currently available');
    }

    // Good track record
    if (profile.successfulPromotions && profile.successfulPromotions >= 5) {
        strengths.push('Proven track record');
    }

    if (profile.averageRating && profile.averageRating >= 4.5) {
        strengths.push('Highly rated by brands');
    }

    return strengths.slice(0, 5); // Return top 5 strengths
};

/**
 * Generate a concise profile summary for sellers
 */
const generateProfileSummary = (profile, engagementQuality, audienceAuthenticity) => {
    const followerTier = profile.followerCount >= 1000000 ? 'mega' :
        profile.followerCount >= 500000 ? 'macro' :
            profile.followerCount >= 100000 ? 'mid-tier' :
                profile.followerCount >= 10000 ? 'micro' : 'nano';

    const formattedFollowers = profile.followerCount >= 1000000
        ? `${(profile.followerCount / 1000000).toFixed(1)}M`
        : profile.followerCount >= 1000
            ? `${(profile.followerCount / 1000).toFixed(1)}K`
            : profile.followerCount;

    let summary = `${followerTier.charAt(0).toUpperCase() + followerTier.slice(1)}-influencer in ${profile.category} with ${formattedFollowers} followers. `;

    if (engagementQuality === 'High') {
        summary += 'Exceptional engagement rates indicate a highly active audience. ';
    } else if (engagementQuality === 'Medium') {
        summary += 'Solid engagement metrics within industry standards. ';
    } else {
        summary += 'Engagement could be improved but offers wide reach. ';
    }

    if (audienceAuthenticity === 'High') {
        summary += 'Audience appears highly authentic and engaged.';
    } else if (audienceAuthenticity === 'Medium') {
        summary += 'Audience authenticity is within normal range.';
    } else {
        summary += 'Consider reviewing audience quality metrics.';
    }

    return summary;
};

/**
 * Calculate overall profile score (0-100)
 * Used for ranking creators in matching
 */
const calculateProfileScore = (profile, engagementQuality, audienceAuthenticity) => {
    let score = 50; // Base score

    // Engagement quality bonus (0-20)
    if (engagementQuality === 'High') score += 20;
    else if (engagementQuality === 'Medium') score += 10;

    // Audience authenticity bonus (0-15)
    if (audienceAuthenticity === 'High') score += 15;
    else if (audienceAuthenticity === 'Medium') score += 7;

    // Follower count bonus (0-10)
    if (profile.followerCount >= 500000) score += 10;
    else if (profile.followerCount >= 100000) score += 7;
    else if (profile.followerCount >= 50000) score += 5;
    else if (profile.followerCount >= 10000) score += 3;

    // Availability bonus (0-5)
    if (profile.isAvailable) score += 5;

    // Track record bonus (0-10)
    if (profile.successfulPromotions >= 10) score += 10;
    else if (profile.successfulPromotions >= 5) score += 6;
    else if (profile.successfulPromotions >= 1) score += 3;

    return Math.min(100, Math.max(0, score));
};

/**
 * Generate complete AI insights for a creator profile
 * @param {Object} profile - CreatorProfile document
 * @returns {Object} Complete insights object
 */
const generateInsights = (profile) => {
    const engagementQuality = analyzeEngagementQuality(
        profile.engagementRate,
        profile.followerCount
    );

    const audienceAuthenticity = analyzeAudienceAuthenticity(
        profile.engagementRate,
        profile.followerCount
    );

    const strengths = identifyStrengths(profile);

    const profileSummary = generateProfileSummary(
        profile,
        engagementQuality,
        audienceAuthenticity
    );

    const score = calculateProfileScore(
        profile,
        engagementQuality,
        audienceAuthenticity
    );

    return {
        engagementQuality,
        audienceAuthenticity,
        strengths,
        profileSummary,
        score,
        lastAnalyzed: new Date()
    };
};

module.exports = {
    generateInsights,
    analyzeEngagementQuality,
    analyzeAudienceAuthenticity,
    identifyStrengths,
    generateProfileSummary,
    calculateProfileScore
};
