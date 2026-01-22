/**
 * Automated Matching System
 * Smart creator-campaign matching with auto-recommendations
 */

/**
 * Calculate match score between creator and campaign
 */
export const calculateMatchScore = (creator, campaign) => {
    let score = 0;
    const weights = {
        niche: 30,
        followers: 25,
        engagement: 20,
        location: 10,
        budget: 10,
        availability: 5
    };

    // Niche/Category match (30 points)
    if (creator.category === campaign.targetNiche ||
        campaign.targetNiche?.includes(creator.category)) {
        score += weights.niche;
    } else if (creator.secondaryCategories?.some(cat => campaign.targetNiche?.includes(cat))) {
        score += weights.niche * 0.6; // 60% for secondary match
    }

    // Follower count match (25 points)
    const followerMatch = calculateFollowerMatch(
        creator.followerCount,
        campaign.minFollowers,
        campaign.maxFollowers
    );
    score += followerMatch * weights.followers;

    // Engagement rate match (20 points)
    const engagementMatch = calculateEngagementMatch(
        creator.engagementRate,
        campaign.minEngagement || 2.0
    );
    score += engagementMatch * weights.engagement;

    // Location match (10 points)
    if (campaign.targetLocation &&
        (creator.location === campaign.targetLocation || campaign.targetLocation === 'Any')) {
        score += weights.location;
    } else if (creator.location) {
        score += weights.location * 0.5; // 50% for any location specified
    }

    // Budget compatibility (10 points)
    const budgetMatch = calculateBudgetMatch(
        creator.pricing?.min || 0,
        creator.pricing?.max || 100000,
        campaign.budget
    );
    score += budgetMatch * weights.budget;

    // Availability (5 points)
    if (creator.isAvailable) {
        score += weights.availability;
    }

    return Math.round(score);
};

/**
 * Get automated creator recommendations for a campaign
 */
export const getAutomatedRecommendations = (campaign, allCreators, limit = 10) => {
    const scoredCreators = allCreators.map(creator => ({
        ...creator,
        matchScore: calculateMatchScore(creator, campaign),
        reasons: getMatchReasons(creator, campaign)
    }));

    // Sort by match score
    const sortedCreators = scoredCreators
        .filter(c => c.matchScore >= 50) // Minimum 50% match
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

    return sortedCreators;
};

/**
 * Bulk auto-invite creators
 */
export const bulkAutoInvite = (campaign, creators, options = {}) => {
    const {
        minMatchScore = 70,
        maxInvites = 20,
        prioritizeEngagement = false,
        prioritizeFollowers = false
    } = options;

    let eligibleCreators = creators.filter(c =>
        calculateMatchScore(c, campaign) >= minMatchScore
    );

    // Apply prioritization
    if (prioritizeEngagement) {
        eligibleCreators.sort((a, b) => b.engagementRate - a.engagementRate);
    } else if (prioritizeFollowers) {
        eligibleCreators.sort((a, b) => b.followerCount - a.followerCount);
    } else {
        eligibleCreators.sort((a, b) =>
            calculateMatchScore(b, campaign) - calculateMatchScore(a, campaign)
        );
    }

    const inviteList = eligibleCreators.slice(0, maxInvites);

    return {
        totalEligible: eligibleCreators.length,
        inviteCount: inviteList.length,
        creators: inviteList.map(c => ({
            id: c._id,
            name: c.name,
            matchScore: calculateMatchScore(c, campaign),
            estimatedReach: c.followerCount * 0.3,
            estimatedCost: c.pricing?.min || 0
        })),
        estimatedTotalReach: inviteList.reduce((sum, c) => sum + (c.followerCount * 0.3), 0),
        estimatedTotalCost: inviteList.reduce((sum, c) => sum + (c.pricing?.min || 0), 0)
    };
};

/**
 * Smart creator suggestions based on past success
 */
export const getSmartSuggestions = (brandHistory, allCreators) => {
    // Analyze past successful collaborations
    const successfulCollaborations = brandHistory.filter(h =>
        h.status === 'Completed' && h.rating >= 4
    );

    if (successfulCollaborations.length === 0) {
        // No history, return top-rated available creators
        return allCreators
            .filter(c => c.isAvailable && c.rating >= 4.0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10);
    }

    // Extract patterns from successful collaborations
    const successfulCategories = {};
    const successfulPriceRanges = [];

    successfulCollaborations.forEach(collab => {
        const category = collab.creator?.category;
        if (category) {
            successfulCategories[category] = (successfulCategories[category] || 0) + 1;
        }
        if (collab.budget) {
            successfulPriceRanges.push(collab.budget);
        }
    });

    // Find most successful category
    const topCategory = Object.keys(successfulCategories).reduce((a, b) =>
        successfulCategories[a] > successfulCategories[b] ? a : b
    );

    // Calculate average successful budget
    const avgBudget = successfulPriceRanges.length > 0
        ? successfulPriceRanges.reduce((a, b) => a + b, 0) / successfulPriceRanges.length
        : 5000;

    // Find similar creators
    const suggestions = allCreators
        .filter(c => {
            const categoryMatch = c.category === topCategory;
            const priceMatch = c.pricing?.min <= avgBudget * 1.2;
            const available = c.isAvailable;
            const goodRating = c.rating >= 4.0;

            return categoryMatch && priceMatch && available && goodRating;
        })
        .map(c => ({
            ...c,
            matchScore: calculateHistoricalMatch(c, successfulCollaborations),
            reason: 'Similar to your successful past collaborations'
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

    return suggestions;
};

/**
 * Auto-match creators to multiple campaigns
 */
export const batchMatchCreators = (campaigns, creators) => {
    const matches = {};

    campaigns.forEach(campaign => {
        const recommendations = getAutomatedRecommendations(campaign, creators, 5);
        matches[campaign._id] = recommendations;
    });

    return matches;
};

/**
 * Recommend optimal creator mix for campaign
 */
export const recommendCreatorMix = (campaign, allCreators, totalBudget) => {
    const { budget = totalBudget } = campaign;

    // Strategy: Mix of micro, mid, and macro influencers
    const microInfluencers = allCreators.filter(c =>
        c.followerCount >= 1000 && c.followerCount < 10000
    );
    const midInfluencers = allCreators.filter(c =>
        c.followerCount >= 10000 && c.followerCount < 100000
    );
    const macroInfluencers = allCreators.filter(c =>
        c.followerCount >= 100000
    );

    // Allocate budget: 30% micro, 50% mid, 20% macro
    const budgetAllocation = {
        micro: budget * 0.3,
        mid: budget * 0.5,
        macro: budget * 0.2
    };

    const selectedMicro = selectCreatorsByBudget(
        microInfluencers,
        campaign,
        budgetAllocation.micro
    );

    const selectedMid = selectCreatorsByBudget(
        midInfluencers,
        campaign,
        budgetAllocation.mid
    );

    const selectedMacro = selectCreatorsByBudget(
        macroInfluencers,
        campaign,
        budgetAllocation.macro
    );

    const allSelected = [...selectedMicro, ...selectedMid, ...selectedMacro];

    return {
        recommended: allSelected,
        breakdown: {
            micro: selectedMicro.length,
            mid: selectedMid.length,
            macro: selectedMacro.length
        },
        estimatedReach: allSelected.reduce((sum, c) => sum + (c.followerCount * 0.3), 0),
        totalCost: allSelected.reduce((sum, c) => sum + (c.pricing?.min || 0), 0),
        diversityScore: calculateDiversityScore(allSelected)
    };
};

// Helper Functions

function calculateFollowerMatch(creatorFollowers, minFollowers, maxFollowers) {
    if (!minFollowers && !maxFollowers) return 1;

    if (creatorFollowers >= minFollowers && creatorFollowers <= maxFollowers) {
        return 1.0;
    }

    // Partial match if close
    if (creatorFollowers >= minFollowers * 0.8 && creatorFollowers <= maxFollowers * 1.2) {
        return 0.7;
    }

    return 0;
}

function calculateEngagementMatch(creatorEngagement, minEngagement) {
    if (creatorEngagement >= minEngagement) {
        return 1.0;
    }

    if (creatorEngagement >= minEngagement * 0.8) {
        return 0.7;
    }

    return 0.3;
}

function calculateBudgetMatch(minPrice, maxPrice, campaignBudget) {
    if (campaignBudget >= minPrice && campaignBudget <= maxPrice) {
        return 1.0;
    }

    if (campaignBudget >= minPrice * 0.8 || campaignBudget <= maxPrice * 1.2) {
        return 0.6;
    }

    return 0;
}

function getMatchReasons(creator, campaign) {
    const reasons = [];

    if (creator.category === campaign.targetNiche) {
        reasons.push('Perfect niche match');
    }

    if (creator.followerCount >= campaign.minFollowers &&
        creator.followerCount <= campaign.maxFollowers) {
        reasons.push('Ideal follower count');
    }

    if (creator.engagementRate > 5.0) {
        reasons.push('High engagement rate');
    }

    if (creator.rating >= 4.5) {
        reasons.push('Top-rated creator');
    }

    if (creator.isAvailable) {
        reasons.push('Currently available');
    }

    return reasons;
}

function calculateHistoricalMatch(creator, successfulCollabs) {
    let score = 50; // Base score

    successfulCollabs.forEach(collab => {
        if (collab.creator?.category === creator.category) score += 10;
        if (Math.abs(collab.creator?.followerCount - creator.followerCount) < 10000) score += 5;
    });

    return Math.min(100, score);
}

function selectCreatorsByBudget(creators, campaign, budget) {
    const scored = creators
        .map(c => ({
            ...c,
            matchScore: calculateMatchScore(c, campaign)
        }))
        .filter(c => c.matchScore >= 60)
        .sort((a, b) => b.matchScore - a.matchScore);

    const selected = [];
    let remainingBudget = budget;

    for (const creator of scored) {
        const cost = creator.pricing?.min || 0;
        if (cost <= remainingBudget) {
            selected.push(creator);
            remainingBudget -= cost;
        }

        if (selected.length >= 5) break; // Max 5 per tier
    }

    return selected;
}

function calculateDiversityScore(creators) {
    const categories = new Set(creators.map(c => c.category));
    const locations = new Set(creators.map(c => c.location));

    const categoryDiversity = (categories.size / creators.length) * 50;
    const locationDiversity = (locations.size / creators.length) * 50;

    return Math.round(categoryDiversity + locationDiversity);
}

export default {
    calculateMatchScore,
    getAutomatedRecommendations,
    bulkAutoInvite,
    getSmartSuggestions,
    batchMatchCreators,
    recommendCreatorMix
};
