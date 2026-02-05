const prisma = require('../config/prisma');
const PredictiveService = require('./predictiveService');

/**
 * Scoring weights for different factors
 */
const SCORING_WEIGHTS = {
    engagementRate: 0.25,      // 25% weight
    nicheSimilarity: 0.20,     // 20% weight
    priceCompatibility: 0.15,  // 15% weight
    predictedROI: 0.20,        // 20% weight (NEW)
    insightScore: 0.10,        // 10% weight
    trackRecord: 0.10          // 10% weight
};

/**
 * Step 1: Rule-based filtering
 */
const filterCreators = async (request) => {
    // Note: request could be a Prisma object or raw body. 
    // Field names: minFollowers, maxFollowers, targetCategory, promotionType, maxBudget
    const creators = await prisma.creatorProfile.findMany({
        where: {
            isAvailable: true,
            followerCount: {
                gte: request.minFollowers,
                lte: request.maxFollowers
            },
            category: request.targetCategory,
            promotionTypes: {
                hasSome: request.promotionType
            },
            minPrice: {
                lte: request.maxBudget
            }
        },
        include: {
            user: {
                select: { name: true, email: true, avatar: true }
            }
        }
    });

    return creators;
};

/**
 * Calculate engagement score (normalized 0-100)
 */
const calculateEngagementScore = (engagementRate, followerCount) => {
    let benchmark = 1.5;
    if (followerCount < 50000) benchmark = 4;
    else if (followerCount < 500000) benchmark = 2.5;

    const ratio = engagementRate / benchmark;
    return Math.min(100, ratio * 50);
};

/**
 * Calculate niche similarity score
 */
const calculateNicheSimilarity = (creatorCategory, targetCategory) => {
    if (creatorCategory === targetCategory) return 100;

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
        return 50;
    }

    return 0;
};

/**
 * Calculate price compatibility score
 */
const calculatePriceCompatibility = (minPrice, maxPrice, minBudget, maxBudget) => {
    const creatorMid = (minPrice + maxPrice) / 2;
    const budgetMid = (minBudget + maxBudget) / 2;

    if (creatorMid <= budgetMid) return 100;

    const overBudgetPercent = ((creatorMid - budgetMid) / budgetMid) * 100;
    return Math.max(0, 100 - overBudgetPercent);
};

/**
 * Calculate track record score
 */
const calculateTrackRecordScore = (profile) => {
    let score = 50;
    if (profile.successfulPromotions >= 10) score += 30;
    else if (profile.successfulPromotions >= 5) score += 20;
    else if (profile.successfulPromotions >= 1) score += 10;

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

    if (scores.engagement >= 70) {
        reasons.push(`Strong engagement (${creator.engagementRate.toFixed(1)}%)`);
    }

    if (scores.niche === 100) {
        reasons.push(`Exact niche fit (${creator.category})`);
    } else if (scores.niche >= 50) {
        reasons.push(`Related niche (${creator.category})`);
    }

    if (scores.price >= 80) {
        reasons.push('Within budget');
    } else if (scores.price >= 50) {
        reasons.push('Slightly above budget');
    }

    if (creator.insights?.score >= 70) {
        reasons.push('High-quality profile');
    }

    if (creator.successfulPromotions >= 5) {
        reasons.push(`${creator.successfulPromotions} successful campaigns`);
    }

    if (scores.roi >= 100) {
        reasons.push(`High ROI Potential (${scores.roi}%)`);
    }

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
 */
const rankCreators = async (creators, request) => {
    const rankedCreators = await Promise.all(creators.map(async (creator) => {
        const roiPrediction = await PredictiveService.predictROI(creator.id, request);

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
                creator.minPrice,
                creator.maxPrice,
                request.minBudget,
                request.maxBudget
            ),
            roi: roiPrediction?.roi || 0,
            insight: creator.aiScore || 50,
            trackRecord: calculateTrackRecordScore(creator)
        };

        const matchScore = Math.round(
            (scores.engagement * SCORING_WEIGHTS.engagementRate) +
            (scores.niche * SCORING_WEIGHTS.nicheSimilarity) +
            (scores.price * SCORING_WEIGHTS.priceCompatibility) +
            (scores.roi * SCORING_WEIGHTS.predictedROI) +
            (scores.insight * SCORING_WEIGHTS.insightScore) +
            (scores.trackRecord * SCORING_WEIGHTS.trackRecord)
        );

        const matchReason = generateMatchReason(creator, request, scores);

        return {
            creatorId: creator.id,
            creator: creator,
            matchScore: Math.min(100, Math.max(0, matchScore)),
            matchReason,
            scores,
            prediction: roiPrediction
        };
    }));

    rankedCreators.sort((a, b) => b.matchScore - a.matchScore);
    return rankedCreators;
};

/**
 * Main matching function
 */
const findMatchingCreators = async (promotionRequest) => {
    const filteredCreators = await filterCreators(promotionRequest);
    if (filteredCreators.length === 0) return [];

    const rankedCreators = await rankCreators(filteredCreators, promotionRequest);
    return rankedCreators.slice(0, 20);
};

/**
 * Get match explanation for a specific creator-request pair
 */
const explainMatch = async (creatorId, promotionRequest) => {
    const creator = await prisma.creatorProfile.findUnique({
        where: { id: creatorId }
    });

    if (!creator) return null;

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
            creator.minPrice,
            creator.maxPrice,
            promotionRequest.minBudget,
            promotionRequest.maxBudget
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
