const prisma = require('../config/prisma');
const PredictiveService = require('./predictiveService');

/**
 * Scoring weights for different factors
 */
const SCORING_WEIGHTS = {
    engagementRate: 0.20,      // 20% weight
    nicheSimilarity: 0.20,     // 20% weight
    priceCompatibility: 0.15,  // 15% weight
    predictedROI: 0.15,        // 15% weight
    insightScore: 0.10,        // 10% weight
    trackRecord: 0.10,         // 10% weight
    intentMatch: 0.05,         // 5% Short-term Intent
    personalization: 0.05      // 5% Long-term History
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
 * Calculate intent match score (Short-term)
 */
const calculateIntentScore = (creatorCategory, userIntent) => {
    if (!userIntent || !userIntent.recentCategories || userIntent.recentCategories.length === 0) {
        return 50; // Neutral
    }
    if (userIntent.recentCategories[0] === creatorCategory) return 100;
    if (userIntent.recentCategories.includes(creatorCategory)) return 75;
    return 0;
};

/**
 * Calculate personalization score (History-based)
 */
const calculatePersonalizationScore = (creatorId, userHistory) => {
    if (!userHistory || userHistory.length === 0) return 50; // Neutral

    let score = 50;
    const interactions = userHistory.filter(h => h.targetUserId === creatorId);

    interactions.forEach(interaction => {
        switch (interaction.action) {
            case 'ACCEPTED':
            case 'COMPLETED':
                score += 30;
                break;
            case 'SAVED':
            case 'CLICKED':
            case 'CONTACTED':
                score += 10;
                break;
            case 'REJECTED':
            case 'ABANDONED':
                score -= 20;
                break;
        }
    });

    return Math.min(100, Math.max(0, score));
};

/**
 * Calculate Confidence Level Bucket
 * @param {number} totalScore - The final match score (0-100)
 * @returns {string} - 'High', 'Medium', or 'Experimental'
 */
const calculateConfidenceLevel = (totalScore) => {
    if (totalScore >= 85) return 'High';
    if (totalScore >= 65) return 'Medium';
    return 'Experimental';
};

/**
 * Generate human-readable match explanation
 */
const generateMatchReasons = (creator, request, scores) => {
    const reasons = [];

    // 1. High-Level Confidence (The "Hook")
    const totalScore = Math.round(
        (scores.engagement * SCORING_WEIGHTS.engagementRate) +
        (scores.niche * SCORING_WEIGHTS.nicheSimilarity) +
        (scores.price * SCORING_WEIGHTS.priceCompatibility) +
        (scores.roi * SCORING_WEIGHTS.predictedROI) +
        (scores.insight * SCORING_WEIGHTS.insightScore) +
        (scores.trackRecord * SCORING_WEIGHTS.trackRecord) +
        (scores.intent * SCORING_WEIGHTS.intentMatch) +
        (scores.personalization * SCORING_WEIGHTS.personalization)
    );

    if (totalScore >= 85) {
        reasons.push("⚡ <strong class='text-emerald-400'>Highly Relevant:</strong> Matches your budget and niche perfectly.");
    } else if (scores.roi > 80) {
        reasons.push("📈 <strong class='text-blue-400'>High ROI Potential:</strong> Predicted to deliver strong engagement value.");
    }

    // 2. Specific Strengths (The "Why")
    if (scores.niche > 90) {
        reasons.push(`🎯 <strong>Niche Expert:</strong> Deeply aligned with ${creator.category}.`);
    }
    if (scores.engagement > 85) {
        reasons.push("🔥 <strong>Viral Potential:</strong> Higher engagement rate than peers.");
    }
    if (scores.price > 90) {
        reasons.push("💰 <strong>Budget Friendly:</strong> Well within your spending limit.");
    }
    if (scores.trackRecord > 80) {
        reasons.push("🏆 <strong>Proven Track Record:</strong> Consistently delivers for brands.");
    }

    // 3. AI Behavioral Signals (The "Smart" part)
    if (scores.intent > 70) {
        reasons.push("🧠 <strong>Smart Match:</strong> Aligns with your recent search intent.");
    }
    if (scores.personalization > 70) {
        reasons.push("✨ <strong>Tailored for You:</strong> Similar to creators you've liked before.");
    }

    // Fallback if we have too few
    if (reasons.length === 0) {
        reasons.push("✅ <strong>Solid Option:</strong> Meets your basic criteria.");
    }

    return reasons.slice(0, 3); // Return top 3 reasons
};

/**
 * Generate a learning narrative based on history and intent
 */
const generateLearningInsight = (creator, scores, userIntent, userHistory) => {
    // 1. New User / Low Data
    if (!userHistory || userHistory.length < 3) {
        return "🌱 <strong>Learning your style:</strong> Your feedback helps us refine future matches.";
    }

    // 2. Strong Intent Match (Recent Search)
    if (scores.intent > 80) {
        return `🔎 <strong>Adapted to intent:</strong> Based on your recent interest in ${creator.category}.`;
    }

    // 3. History Match (Personalization)
    if (scores.personalization > 70) {
        return "🔄 <strong>Consistent pattern:</strong> Similar to creators you've approved recently.";
    }

    // 4. Deviation / Discovery
    if (scores.niche < 60 && scores.engagement > 90) {
        return "💡 <strong>Discovery:</strong> High-performing creator outside your usual niche.";
    }

    // 5. Stable/High Consistency
    if (scores.personalization > 50 && scores.niche > 80) {
        return "🎯 <strong>Stable Match:</strong> Aligned with your established preferences.";
    }

    return null;
};

/**
 * Step 2: AI-powered ranking layer
 */
const rankCreators = async (creators, request, userId = null) => {
    // Fetch user context if userId is provided
    let userIntent = null;
    let userHistory = [];

    if (userId) {
        try {
            const [intent, feedback] = await Promise.all([
                prisma.userIntent.findUnique({ where: { userId } }),
                prisma.matchFeedback.findMany({
                    where: { userId },
                    select: { targetUserId: true, action: true },
                    take: 100,
                    orderBy: { createdAt: 'desc' }
                })
            ]);
            userIntent = intent;
            userHistory = feedback || [];
        } catch (err) {
            console.warn('Failed to fetch user context for ranking', err);
        }
    }

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
            roi: roiPrediction?.roi || 0,
            insight: creator.aiScore || 50,
            trackRecord: calculateTrackRecordScore(creator),
            intent: calculateIntentScore(creator.category, userIntent),
            personalization: calculatePersonalizationScore(creator.id, userHistory)
        };

        const matchScore = Math.round(
            (scores.engagement * SCORING_WEIGHTS.engagementRate) +
            (scores.niche * SCORING_WEIGHTS.nicheSimilarity) +
            (scores.price * SCORING_WEIGHTS.priceCompatibility) +
            (scores.roi * SCORING_WEIGHTS.predictedROI) +
            (scores.insight * SCORING_WEIGHTS.insightScore) +
            (scores.trackRecord * SCORING_WEIGHTS.trackRecord) +
            (scores.intent * SCORING_WEIGHTS.intentMatch) +
            (scores.personalization * SCORING_WEIGHTS.personalization)
        );

        const matchReasons = generateMatchReasons(creator, request, scores);
        const learningInsight = generateLearningInsight(creator, scores, userIntent, userHistory);

        return {
            creatorId: creator.id,
            roi: roiPrediction?.roi || 0,
            insight: creator.aiScore || 50,
            trackRecord: calculateTrackRecordScore(creator),
            intent: calculateIntentScore(creator.category, userIntent),
            personalization: calculatePersonalizationScore(creator.id, userHistory),
            matchScore: finalScore,
            confidenceLevel,
            matchReasons,
            learningInsight, // New field
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
