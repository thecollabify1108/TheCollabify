const prisma = require('../config/prisma');
const PredictiveService = require('./predictiveService');
const { calculateResponseLikelihood } = require('./responseLogic');

/**
 * Scoring weights for different factors
 */
const SCORING_WEIGHTS = {
    engagementRate: 0.11,      // 11%
    nicheSimilarity: 0.11,     // 11%
    priceCompatibility: 0.11,  // 11%
    locationMatch: 0.08,       // 8%
    campaignTypeMatch: 0.08,   // 8%
    reliability: 0.08,         // 8% (NEW)
    availabilityMatch: 0.08,   // 8%
    predictedROI: 0.07,        // 7%
    trackRecord: 0.07,         // 7%
    insightScore: 0.07,        // 7%
    intentMatch: 0.07,         // 7%
    personalization: 0.07      // 7%
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
        },
        take: 100 // Performance Safety: Cap matching pool to top 100 candidates by DB order first
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
/**
 * Calculate price compatibility score with range overlap logic
 * Ranges: Creator (minPrice-maxPrice) vs Budget (minBudget-maxBudget)
 */
const calculatePriceCompatibility = (minPrice, maxPrice, minBudget, maxBudget) => {
    // Handle missing data
    if (!minPrice || !maxPrice || !minBudget || !maxBudget) return 50;

    // 1. Check for Overlap
    const overlapStart = Math.max(minPrice, minBudget);
    const overlapEnd = Math.min(maxPrice, maxBudget);
    const overlap = overlapEnd - overlapStart;

    if (overlap > 0) {
        // Strong Bonus for significant overlap
        // Calculate what % of the creator's range is covered by the budget
        const creatorRange = maxPrice - minPrice || 1; // Avoid divide by zero
        const coverage = overlap / creatorRange;

        // If coverage is high, perfect score. If low, still very good.
        return Math.min(100, 85 + (coverage * 15));
    }

    // 2. No Overlap - Determine distance
    // Case A: Creator is too expensive
    if (minPrice > maxBudget) {
        const diff = minPrice - maxBudget;
        const percentOver = (diff / maxBudget) * 100;

        if (percentOver <= 15) return 65; // "Experimental" / Stretch budget
        if (percentOver <= 30) return 40; // Penalty
        return 0; // Too expensive
    }

    // Case B: Creator is below budget (High ROI potential, but maybe quality concern?)
    if (maxPrice < minBudget) {
        return 90; // Excellent - under budget!
    }

    return 50; // Should be unreachable with the above logic, but safe fallback
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
 * Calculate Location Score
 */
const calculateLocationScore = (creatorLocation, requestLocation, locationType, willingnessToTravel) => {
    // 1. Remote Campaigns: Location doesn't matter much (or maybe time zone?)
    if (!locationType || locationType === 'REMOTE') {
        return 100;
    }

    // 2. If no location data on either side, neutral score
    if (!creatorLocation || !requestLocation) {
        return 50;
    }

    const { district: cDist, city: cCity, state: cState } = creatorLocation;
    const { district: rDist, city: rCity, state: rState } = requestLocation;

    // 3. Exact Match (District Level)
    if (cDist && rDist && cDist.toLowerCase() === rDist.toLowerCase()) {
        return 100;
    }

    // 4. City Match
    if (cCity && rCity && cCity.toLowerCase() === rCity.toLowerCase()) {
        return 90;
    }

    // 5. State Match
    if (cState && rState && cState.toLowerCase() === rState.toLowerCase()) {
        // Boost if willing to travel
        if (willingnessToTravel === 'YES') return 80;
        if (willingnessToTravel === 'LIMITED') return 60;
        return 40; // Penalty if not willing to travel but in same state
    }

    // 6. Cross-State / Long Distance
    if (willingnessToTravel === 'YES') {
        return 50; // Can travel anywhere
    }

    return 0; // Too far and not willing to travel
};

/**
 * Calculate Campaign Type Score
 * Rewords location logic based on campaign type
 */
const calculateCampaignTypeScore = (creatorTypes, requestType) => {
    // 1. If logic is missing or default, assume neutral
    if (!requestType || !creatorTypes || creatorTypes.length === 0) return 50;

    // 2. Exact Match
    if (creatorTypes.includes(requestType)) return 100;

    // 3. Partial Match logic (optional)
    // e.g. ONSITE creators might be okay for EVENTs
    if (requestType === 'EVENT' && creatorTypes.includes('ONSITE')) return 80;
    if (requestType === 'HYBRID' && creatorTypes.includes('ONSITE')) return 80;

    return 0; // Type not supported
};

/**
 * Calculate Availability Score
 */
const calculateAvailabilityScore = (status) => {
    switch (status) {
        case 'AVAILABLE_NOW':
            return 100;
        case 'LIMITED_AVAILABILITY':
            return 70;
        case 'NOT_AVAILABLE':
            return 40;
        default:
            return 100; // Default to available now for fallback
    }
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
        (scores.personalization * SCORING_WEIGHTS.personalization) +
        (scores.location * SCORING_WEIGHTS.locationMatch) +
        (scores.campaignType * SCORING_WEIGHTS.campaignTypeMatch) +
        (scores.availability * SCORING_WEIGHTS.availabilityMatch) +
        (scores.reliability * SCORING_WEIGHTS.reliability)
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

    if (scores.price >= 90) {
        reasons.push("💰 <strong>Under Budget:</strong> Great value for your money.");
    } else if (scores.price >= 80) {
        reasons.push("✅ <strong>In Budget:</strong> Matches your spending range.");
    } else if (scores.price >= 60 && scores.price < 70) {
        reasons.push("💎 <strong>Premium Choice:</strong> Slightly above budget, but high quality.");
    }
    if (scores.availability >= 100) {
        reasons.push("⚡ <strong class='text-amber-400'>Available Now:</strong> Ready to start collaborating immediately.");
    }
    if (scores.trackRecord > 80) {
        reasons.push("🏆 <strong>Proven Track Record:</strong> Consistently delivers for brands.");
    }
    if (scores.reliability >= 110) {
        reasons.push("🛡️ <strong class='text-blue-400'>Elite Reliability:</strong> Exceptional track record of completed collaborations.");
    }
    if (scores.reliability < 85) {
        reasons.push("⚠️ <strong>Developing History:</strong> Relatively new or has some cancelled projects.");
    }

    if (scores.location >= 100 && request.locationType !== 'REMOTE') {
        reasons.push(`📍 <strong>Local Expert:</strong> Located right in ${request.location?.district || "your area"}.`);
    } else if (scores.location >= 80 && request.locationType !== 'REMOTE') {
        reasons.push("🚗 <strong>Nearby & Willing:</strong> Just a short trip away.");
    }

    // 3. AI Behavioral Signals (The "Smart" part)
    if (scores.intent > 70) {
        reasons.push("🧠 <strong>Smart Match:</strong> Aligns with your recent search intent.");
    }

    // 4. Campaign Type Match
    if (scores.campaignType >= 100) {
        if (request.locationType === 'EVENT') reasons.push("🎉 <strong>Event Ready:</strong> Experienced in event collaborations.");
        if (request.locationType === 'ONSITE') reasons.push("🏢 <strong>On-Site Ready:</strong> Available for on-site work.");
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
 * Determine the location match status for grouping
 */
const determineLocationStatus = (creatorLocation, requestLocation, locationType, willingToTravel) => {
    if (!locationType || locationType === 'REMOTE') return 'REMOTE';
    // If request has no location, treat as remote/flexible
    if (!requestLocation?.district && !requestLocation?.state) return 'REMOTE';
    if (!creatorLocation) return 'OTHER';

    const { district: cDist, state: cState } = creatorLocation;
    const { district: rDist, state: rState } = requestLocation;

    if (cDist && rDist && cDist.toLowerCase() === rDist.toLowerCase()) {
        return 'EXACT';
    }
    if (cState && rState && cState.toLowerCase() === rState.toLowerCase()) {
        return 'NEARBY';
    }
    if (willingToTravel === 'YES') {
        return 'TRAVEL';
    }
    return 'OTHER';
};

/**
 * Determine the budget value status
 */
const determineBudgetValueStatus = (minPrice, maxPrice, maxBudget) => {
    if (!minPrice || !maxBudget) return null;

    // effectivePrice: use minPrice as the base for value comparison
    const effectivePrice = minPrice;

    // ratio < 1.0 means UNDER budget (Good Value)
    const ratio = effectivePrice / maxBudget;

    if (ratio <= 0.7) {
        return {
            status: 'GREAT_VALUE',
            label: 'Great Value',
            description: 'Significantly under your maximum budget.',
            color: 'emerald'
        };
    }
    if (ratio <= 0.95) {
        return {
            status: 'GOOD_VALUE',
            label: 'Good Value',
            description: 'Comfortably within your budget range.',
            color: 'blue'
        };
    }
    if (ratio <= 1.15) {
        return {
            status: 'SOLID_FIT',
            label: 'Solid Fit',
            description: 'Closely aligns with your budget.',
            color: 'indigo'
        };
    }
    if (ratio <= 1.4) {
        return {
            status: 'PREMIUM',
            label: 'Premium Option',
            description: 'Slightly above budget, but high quality.',
            color: 'purple'
        };
    }
    return {
        status: 'EXPERIMENTAL',
        label: 'Stretch Goal',
        description: 'Significantly above budget.',
        color: 'amber'
    };
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
        const responseLikelihood = await calculateResponseLikelihood(creator.id, creator.userId);
        const locationStatus = determineLocationStatus(
            creator.location,
            request.location,
            request.locationType,
            creator.willingToTravel
        );

        const budgetValue = determineBudgetValueStatus(
            creator.minPrice,
            creator.maxPrice,
            request.maxBudget
        );

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
            trackRecord: calculateTrackRecordScore(creator),
            intent: calculateIntentScore(creator.category, userIntent),
            personalization: calculatePersonalizationScore(creator.id, userHistory),
            location: calculateLocationScore(
                creator.location,
                request.location,
                request.locationType,
                creator.willingToTravel
            ),
            campaignType: calculateCampaignTypeScore(
                creator.collaborationTypes,
                request.locationType
            ),
            availability: calculateAvailabilityScore(creator.availabilityStatus),
            reliability: Math.min(150, (creator.reliabilityScore || 1.0) * 100) // Normalize 1.0 to 100, capped at 150
        };

        const matchScore = Math.round(
            (scores.engagement * SCORING_WEIGHTS.engagementRate) +
            (scores.niche * SCORING_WEIGHTS.nicheSimilarity) +
            (scores.price * SCORING_WEIGHTS.priceCompatibility) +
            (scores.roi * SCORING_WEIGHTS.predictedROI) +
            (scores.insight * SCORING_WEIGHTS.insightScore) +
            (scores.trackRecord * SCORING_WEIGHTS.trackRecord) +
            (scores.intent * SCORING_WEIGHTS.intentMatch) +
            (scores.personalization * SCORING_WEIGHTS.personalization) +
            (scores.location * SCORING_WEIGHTS.locationMatch) +
            (scores.campaignType * SCORING_WEIGHTS.campaignTypeMatch) +
            (scores.availability * SCORING_WEIGHTS.availabilityMatch) +
            (scores.reliability * SCORING_WEIGHTS.reliability)
        );

        // --- INTERNAL LOGGING (Safe, not exposed to client) ---
        if (process.env.NODE_ENV !== 'production' || matchScore > 80) {
            console.log(`[Matching] Creator: ${creator.user.name} | Total: ${matchScore} | Reliability: ${scores.reliability.toFixed(1)} | ROI: ${scores.roi.toFixed(1)}`);
        }

        const matchReasons = generateMatchReasons(creator, request, scores);
        const learningInsight = generateLearningInsight(creator, scores, userIntent, userHistory);

        const confidenceLevel = calculateConfidenceLevel(matchScore);

        return {
            ...creator, // Return full creator details (name, photo, prices, etc.)
            roi: roiPrediction?.roi || 0,
            insight: creator.aiScore || 50,
            trackRecord: calculateTrackRecordScore(creator),
            intent: calculateIntentScore(creator.category, userIntent),
            personalization: calculatePersonalizationScore(creator.id, userHistory),
            matchScore,
            confidenceLevel,
            matchReasons,
            learningInsight,
            scores,
            prediction: roiPrediction,
            responseLikelihood,
            locationStatus, // Added for frontend grouping
            budgetValue
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
        (scores.trackRecord * SCORING_WEIGHTS.trackRecord) +
        ((creator.reliabilityScore || 1.0) * 100 * (SCORING_WEIGHTS.reliability || 0.08))
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
                score: scores.price, // Frontend should mask this if needed
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
