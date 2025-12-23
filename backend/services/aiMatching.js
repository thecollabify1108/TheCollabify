/**
 * AI-Powered Creator Matching Service
 * 
 * Two-layer matching system:
 * 1. Rule-based filtering (hard constraints)
 * 2. AI ranking layer (soft scoring with explanations)
 */

const CreatorProfile = require('../models/CreatorProfile');

/**
 * Scoring weights for different factors
 * These can be tuned based on business requirements
 */
const SCORING_WEIGHTS = {
    engagementRate: 0.30,      // 30% weight
    nicheSimilarity: 0.25,     // 25% weight
    priceCompatibility: 0.20,  // 20% weight
    insightScore: 0.15,        // 15% weight
    availability: 0.05,        // 5% weight
    trackRecord: 0.05          // 5% weight
};

/**
 * Step 1: Rule-based filtering
 * Applies hard constraints to filter eligible creators
 */
const filterCreators = async (request) => {
    const query = {
        isAvailable: true,

        // Follower range match
        followerCount: {
            $gte: request.followerRange.min,
            $lte: request.followerRange.max
        },

        // Category match
        category: request.targetCategory,

        // Promotion type match
        promotionTypes: request.promotionType,

        // Price compatibility (creator's min should be <= request's max budget)
        'priceRange.min': { $lte: request.budgetRange.max }
    };

    // Find matching creators
    const creators = await CreatorProfile.find(query)
        .populate('userId', 'name email avatar')
        .lean();

    return creators;
};

/**
 * Calculate engagement score (normalized 0-100)
 */
const calculateEngagementScore = (engagementRate, followerCount) => {
    // Higher engagement rates are better, normalized by follower tier
    let benchmark;

    if (followerCount < 50000) {
        benchmark = 4; // Micro-influencers expected to have ~4%
    } else if (followerCount < 500000) {
        benchmark = 2.5; // Mid-tier ~2.5%
    } else {
        benchmark = 1.5; // Larger accounts ~1.5%
    }

    // Score based on how much they exceed the benchmark
    const ratio = engagementRate / benchmark;
    return Math.min(100, ratio * 50);
};

/**
 * Calculate niche similarity score
 * For now, exact match = 100, otherwise 0
 * Could be extended with semantic similarity
 */
const calculateNicheSimilarity = (creatorCategory, targetCategory) => {
    if (creatorCategory === targetCategory) {
        return 100;
    }

    // Related categories could score partial points
    const relatedCategories = {
        'Fashion': ['Beauty', 'Lifestyle'],
        'Beauty': ['Fashion', 'Lifestyle', 'Health'],
        'Fitness': ['Health', 'Lifestyle', 'Sports'],
        'Health': ['Fitness', 'Lifestyle', 'Beauty'],
        'Food': ['Lifestyle', 'Travel', 'Health'],
        'Travel': ['Lifestyle', 'Food'],
        'Tech': ['Gaming', 'Education', 'Business'],
        'Gaming': ['Tech', 'Entertainment'],
        'Education': ['Tech', 'Business'],
        'Entertainment': ['Gaming', 'Lifestyle', 'Music'],
        'Business': ['Tech', 'Education'],
        'Art': ['Music', 'Entertainment'],
        'Music': ['Art', 'Entertainment'],
        'Sports': ['Fitness', 'Health'],
        'Lifestyle': ['Fashion', 'Beauty', 'Food', 'Travel', 'Health']
    };

    if (relatedCategories[targetCategory]?.includes(creatorCategory)) {
        return 50; // 50% score for related categories
    }

    return 0;
};

/**
 * Calculate price compatibility score
 * Higher score when creator's price aligns with budget
 */
const calculatePriceCompatibility = (creatorPriceRange, budgetRange) => {
    const creatorMid = (creatorPriceRange.min + creatorPriceRange.max) / 2;
    const budgetMid = (budgetRange.min + budgetRange.max) / 2;

    // If creator is cheaper than budget, great score
    if (creatorMid <= budgetMid) {
        return 100;
    }

    // Calculate how much over budget
    const overBudgetPercent = ((creatorMid - budgetMid) / budgetMid) * 100;

    // Score decreases as they go over budget
    return Math.max(0, 100 - overBudgetPercent);
};

/**
 * Calculate track record score
 */
const calculateTrackRecordScore = (profile) => {
    let score = 50; // Base score

    // Successful promotions bonus
    if (profile.successfulPromotions >= 10) score += 30;
    else if (profile.successfulPromotions >= 5) score += 20;
    else if (profile.successfulPromotions >= 1) score += 10;

    // Rating bonus
    if (profile.averageRating >= 4.5) score += 20;
    else if (profile.averageRating >= 4) score += 15;
    else if (profile.averageRating >= 3.5) score += 10;

    return Math.min(100, score);
};

/**
 * Generate human-readable match explanation
 */
const generateMatchReason = (creator, request, scores) => {
    const reasons = [];

    // High engagement
    if (scores.engagement >= 70) {
        reasons.push(`Strong engagement (${creator.engagementRate.toFixed(1)}%)`);
    }

    // Perfect niche match
    if (scores.niche === 100) {
        reasons.push(`Exact niche fit (${creator.category})`);
    } else if (scores.niche >= 50) {
        reasons.push(`Related niche (${creator.category})`);
    }

    // Good price fit
    if (scores.price >= 80) {
        reasons.push('Within budget');
    } else if (scores.price >= 50) {
        reasons.push('Slightly above budget');
    }

    // High insight score
    if (creator.insights && creator.insights.score >= 70) {
        reasons.push('High-quality profile');
    }

    // Track record
    if (creator.successfulPromotions >= 5) {
        reasons.push(`${creator.successfulPromotions} successful campaigns`);
    }

    // Follower count
    const formattedFollowers = creator.followerCount >= 1000000
        ? `${(creator.followerCount / 1000000).toFixed(1)}M`
        : creator.followerCount >= 1000
            ? `${(creator.followerCount / 1000).toFixed(0)}K`
            : creator.followerCount;
    reasons.push(`${formattedFollowers} followers`);

    return reasons.join(' • ');
};

/**
 * Step 2: AI-powered ranking layer
 * Scores and ranks filtered creators
 */
const rankCreators = (creators, request) => {
    const rankedCreators = creators.map(creator => {
        // Calculate individual scores
        const scores = {
            engagement: calculateEngagementScore(
                creator.engagementRate,
                creator.followerCount
            ),
            niche: calculateNicheSimilarity(
                creator.category,
                request.targetCategory
            ),
            price: calculatePriceCompatibility(
                creator.priceRange,
                request.budgetRange
            ),
            insight: creator.insights?.score || 50,
            availability: creator.isAvailable ? 100 : 0,
            trackRecord: calculateTrackRecordScore(creator)
        };

        // Calculate weighted total score
        const matchScore = Math.round(
            (scores.engagement * SCORING_WEIGHTS.engagementRate) +
            (scores.niche * SCORING_WEIGHTS.nicheSimilarity) +
            (scores.price * SCORING_WEIGHTS.priceCompatibility) +
            (scores.insight * SCORING_WEIGHTS.insightScore) +
            (scores.availability * SCORING_WEIGHTS.availability) +
            (scores.trackRecord * SCORING_WEIGHTS.trackRecord)
        );

        // Generate explanation
        const matchReason = generateMatchReason(creator, request, scores);

        return {
            creatorId: creator._id,
            creator: creator,
            matchScore: Math.min(100, Math.max(0, matchScore)),
            matchReason,
            scores // Include detailed scores for transparency
        };
    });

    // Sort by match score (descending)
    rankedCreators.sort((a, b) => b.matchScore - a.matchScore);

    return rankedCreators;
};

/**
 * Main matching function
 * Combines filtering and ranking
 */
const findMatchingCreators = async (promotionRequest) => {
    // Step 1: Filter
    const filteredCreators = await filterCreators(promotionRequest);

    if (filteredCreators.length === 0) {
        return [];
    }

    // Step 2: Rank
    const rankedCreators = rankCreators(filteredCreators, promotionRequest);

    // Return top matches (limit to 20 for performance)
    return rankedCreators.slice(0, 20);
};

/**
 * Get match explanation for a specific creator-request pair
 */
const explainMatch = async (creatorId, promotionRequest) => {
    const creator = await CreatorProfile.findById(creatorId).lean();

    if (!creator) {
        return null;
    }

    const scores = {
        engagement: calculateEngagementScore(
            creator.engagementRate,
            creator.followerCount
        ),
        niche: calculateNicheSimilarity(
            creator.category,
            promotionRequest.targetCategory
        ),
        price: calculatePriceCompatibility(
            creator.priceRange,
            promotionRequest.budgetRange
        ),
        insight: creator.insights?.score || 50,
        availability: creator.isAvailable ? 100 : 0,
        trackRecord: calculateTrackRecordScore(creator)
    };

    const matchScore = Math.round(
        (scores.engagement * SCORING_WEIGHTS.engagementRate) +
        (scores.niche * SCORING_WEIGHTS.nicheSimilarity) +
        (scores.price * SCORING_WEIGHTS.priceCompatibility) +
        (scores.insight * SCORING_WEIGHTS.insightScore) +
        (scores.availability * SCORING_WEIGHTS.availability) +
        (scores.trackRecord * SCORING_WEIGHTS.trackRecord)
    );

    return {
        matchScore,
        breakdown: {
            engagement: {
                score: scores.engagement,
                weight: SCORING_WEIGHTS.engagementRate,
                contribution: scores.engagement * SCORING_WEIGHTS.engagementRate
            },
            nicheSimilarity: {
                score: scores.niche,
                weight: SCORING_WEIGHTS.nicheSimilarity,
                contribution: scores.niche * SCORING_WEIGHTS.nicheSimilarity
            },
            priceCompatibility: {
                score: scores.price,
                weight: SCORING_WEIGHTS.priceCompatibility,
                contribution: scores.price * SCORING_WEIGHTS.priceCompatibility
            },
            profileQuality: {
                score: scores.insight,
                weight: SCORING_WEIGHTS.insightScore,
                contribution: scores.insight * SCORING_WEIGHTS.insightScore
            },
            availability: {
                score: scores.availability,
                weight: SCORING_WEIGHTS.availability,
                contribution: scores.availability * SCORING_WEIGHTS.availability
            },
            trackRecord: {
                score: scores.trackRecord,
                weight: SCORING_WEIGHTS.trackRecord,
                contribution: scores.trackRecord * SCORING_WEIGHTS.trackRecord
            }
        }
    };
};

module.exports = {
    findMatchingCreators,
    filterCreators,
    rankCreators,
    explainMatch,
    SCORING_WEIGHTS
};
