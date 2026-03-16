const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');
const { userCacheMiddleware } = require('../middleware/cache');
const { isCreator } = require('../middleware/roleCheck');
const { generateInsights } = require('../services/aiInsights');
const { notifyProfileInsights, notifySellerCreatorApplied } = require('../services/notificationService');
const { sendCreatorAppliedEmail } = require('../utils/brevoEmailService');
const { upload } = require('../services/storageService');
const { updateReliabilityScore } = require('../services/reliabilityService');
const { updateRiskScoreByUserId } = require('../services/riskScoreService');
let EmbeddingService;
try {
    EmbeddingService = require('../services/ai').EmbeddingService;
} catch (e) {
    console.warn('[AI] Failed to load EmbeddingService in creators routes:', e.message);
    EmbeddingService = { embedCreatorProfile: () => Promise.resolve() };
}

/**
 * Validate and map follower range string to enum
 */
const FOLLOWER_RANGE_MAP = {
    '1k-5k': 'RANGE_1K_5K',
    '5k-10k': 'RANGE_5K_10K',
    '10k-50k': 'RANGE_10K_50K',
    '50k-100k': 'RANGE_50K_100K',
    '100k+': 'RANGE_100K_PLUS',
    // allow enum values directly
    'RANGE_1K_5K': 'RANGE_1K_5K',
    'RANGE_5K_10K': 'RANGE_5K_10K',
    'RANGE_10K_50K': 'RANGE_10K_50K',
    'RANGE_50K_100K': 'RANGE_50K_100K',
    'RANGE_100K_PLUS': 'RANGE_100K_PLUS'
};

const mapNumericToRangeEnum = (min) => {
    if (min < 5000) return 'RANGE_1K_5K';
    if (min < 10000) return 'RANGE_5K_10K';
    if (min < 50000) return 'RANGE_10K_50K';
    if (min < 100000) return 'RANGE_50K_100K';
    return 'RANGE_100K_PLUS';
};

const FOLLOWER_RANGE_MIDPOINT = {
    RANGE_1K_5K: 3000,
    RANGE_5K_10K: 7500,
    RANGE_10K_50K: 30000,
    RANGE_50K_100K: 75000,
    RANGE_100K_PLUS: 150000
};

/**
 * Recalculate follower verification mismatch
 * Called when creator updates followerCount or admin verifies
 */
function recalculateVerification(profile) {
    const result = {};
    const selfReported = profile.followerCount || profile.selfReportedFollowers || 0;
    const verifiedMin = profile.verifiedFollowerRangeMin;
    const verifiedMax = profile.verifiedFollowerRangeMax;

    if (verifiedMin == null || verifiedMax == null || selfReported === 0) {
        return result; // No verified range to compare against
    }

    const verifiedMid = (verifiedMin + verifiedMax) / 2;
    const mismatch = Math.abs(selfReported - verifiedMid) / verifiedMid * 100;
    result.followerMismatchPercentage = Math.round(mismatch * 100) / 100;
    result.selfReportedFollowers = selfReported;

    if (mismatch < 5) {
        result.followerRiskScore = 'none';
        result.verificationStatus = 'verified';
    } else if (mismatch <= 15) {
        result.followerRiskScore = 'medium';
        result.verificationStatus = 'verified';
    } else {
        result.followerRiskScore = 'high';
        result.verificationStatus = 'mismatch_flagged';
    }

    return result;
}

/**
 * Validation middleware
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Calculate profile completion percentage based on filled fields.
 * Phase 1 fields (required) = 60%, Phase 2 fields (optional) = 40%
 */
function calculateCompletion(profile) {
    let score = 0;
    const phase1Weight = 10; // 6 fields × 10 = 60%
    const phase2Weight = 8;  // 5 fields × 8 = 40%

    // Phase 1: Essential fields (10 pts each, total 60)
    if (profile.category) score += phase1Weight;
    if (profile.promotionTypes && profile.promotionTypes.length > 0) score += phase1Weight;
    if (profile.minPrice > 0 || profile.maxPrice > 0) score += phase1Weight;
    if (profile.availabilityStatus) score += phase1Weight;
    if (profile.collaborationTypes && profile.collaborationTypes.length > 0) score += phase1Weight;
    if (profile.location && (profile.location.district || profile.location.city)) score += phase1Weight;

    // Phase 2: Quality signal fields (8 pts each, total 40)
    if (profile.bio && profile.bio.trim().length > 10) score += phase2Weight;
    if (profile.followerCount > 0) score += phase2Weight;
    if (profile.engagementRate > 0) score += phase2Weight;
    if (profile.portfolioLinks && profile.portfolioLinks.length > 0) score += phase2Weight;
    if (profile.willingToTravel && profile.willingToTravel !== 'NO') score += phase2Weight;

    return Math.min(100, score);
}

/**
 * @route   GET /api/creators/profile
 * @desc    Get creator's own profile
 * @access  Private (Creator)
 */
router.get('/profile', auth, isCreator, userCacheMiddleware(30), async (req, res) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: req.userId },
            include: {
                user: {
                    select: { name: true, email: true, avatar: true }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please create your creator profile.'
            });
        }

        res.json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
});

/**
 * @route   POST /api/creators/profile
 * @desc    Create creator profile
 * @access  Private (Creator)
 */
router.post('/profile', auth, isCreator, [
    // Phase 1: Only essential fields required
    body('category').notEmpty().withMessage('Category is required'),
    body('promotionTypes').isArray({ min: 1 }).withMessage('At least one promotion type is required'),
    body('priceRange.min').isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
    body('priceRange.max').isFloat({ min: 0 }).withMessage('Maximum price must be positive'),
    body('instagramProfileUrl').notEmpty().withMessage('Instagram profile URL is required for verification'),
    body('instagramUrl').optional().isURL().withMessage('Invalid Instagram URL'),
    body('location.city').notEmpty().withMessage('City is required'),
    body('followerRange').notEmpty().withMessage('Follower range is required'),
    body('engagementRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Engagement rate must be between 0 and 100'),
    handleValidation
], async (req, res) => {
    try {
        // Check if profile already exists
        const existingProfile = await prisma.creatorProfile.findUnique({
            where: { userId: req.userId }
        });

        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Profile already exists. Use PUT to update.'
            });
        }

        const {
            instagramUsername,
            instagramProfileUrl,
            instagramUrl,
            followerRange: followerRangeInput,
            engagementRate = 0,
            category,
            promotionTypes,
            collaborationTypes: collabTypes,
            priceRange,
            bio,
            isAvailable,
            availabilityStatus,
            location,
            willingToTravel,
            portfolioLinks,
            pastExperience,
            contentTypes
        } = req.body;

        // Validate & map follower range
        let followerRangeEnum;
        let effectiveFollowerCount = 0;

        if (typeof followerRangeInput === 'string') {
            followerRangeEnum = FOLLOWER_RANGE_MAP[followerRangeInput];
            effectiveFollowerCount = FOLLOWER_RANGE_MIDPOINT[followerRangeEnum] || 0;
        } else if (typeof followerRangeInput === 'object' && followerRangeInput.min !== undefined) {
            const minNum = parseInt(followerRangeInput.min) || 0;
            followerRangeEnum = mapNumericToRangeEnum(minNum);
            effectiveFollowerCount = minNum;
        }

        if (!followerRangeEnum) {
            return res.status(400).json({
                success: false,
                message: 'Invalid follower range format'
            });
        }

        // Generate AI insights
        const insights = generateInsights({
            followerCount: effectiveFollowerCount,
            engagementRate,
            category,
            promotionTypes,
            priceRange
        });

        // Build create data
        const createData = {
            userId: req.userId,
            followerRange: followerRangeEnum,
            followerRangeChangedAt: new Date(),
            followerCount: effectiveFollowerCount,
            selfReportedFollowers: effectiveFollowerCount,
            verificationStatus: 'pending',
            engagementRate: parseFloat(engagementRate) || 0,
            engagementRateWarning: true,
            category: category,
            promotionTypes: Array.isArray(promotionTypes) ? promotionTypes.map(t => String(t).toUpperCase().replace(/\s+/g, '_')) : [],
            collaborationTypes: Array.isArray(collabTypes) ? collabTypes : [],
            minPrice: parseFloat(priceRange?.min) || 0,
            maxPrice: parseFloat(priceRange?.max) || 0,
            bio: bio || '',
            isAvailable: availabilityStatus === 'NOT_AVAILABLE' ? false : (isAvailable !== false),
            availabilityStatus: availabilityStatus || (isAvailable === false ? 'NOT_AVAILABLE' : 'AVAILABLE_NOW'),
            availabilityUpdatedAt: new Date(),
            engagementQuality: insights.engagementQuality || 'Medium',
            audienceAuthenticity: insights.audienceAuthenticity || 'Medium',
            strengths: Array.isArray(insights.strengths) ? insights.strengths : [],
            profileSummary: insights.profileSummary || '',
            aiScore: insights.score || 50,
            lastAnalyzed: new Date(),
            profileLastEditedAt: new Date()
        };

        // Instagram URL — support both field names
        const effectiveInstagramUrl = instagramProfileUrl || instagramUrl;
        if (instagramUsername) createData.instagramUsername = instagramUsername;
        if (effectiveInstagramUrl) createData.instagramProfileUrl = effectiveInstagramUrl;

        // Location (city required)
        if (location) createData.location = location;
        if (willingToTravel) createData.willingToTravel = willingToTravel;
        if (portfolioLinks && portfolioLinks.length > 0) createData.portfolioLinks = portfolioLinks;
        if (pastExperience) createData.pastExperience = pastExperience;

        // Calculate completion percentage
        createData.profileCompletionPercentage = calculateCompletion(createData);
        createData.onboardingCompleted = createData.profileCompletionPercentage >= 60;

        // Create profile
        const profile = await prisma.creatorProfile.create({ data: createData });

        // AI Engine: Generate embeddings for new creator (fire-and-forget)
        try {
            EmbeddingService.embedCreatorProfile(profile)
                .catch(err => console.warn('[AI Embedding] Non-critical error:', err.message));
        } catch (err) {
            console.warn('[AI Embedding] Setup error:', err.message);
        }

        // Notify about insights (fire-and-forget to avoid blocking response)
        notifyProfileInsights(req.userId, insights)
            .catch(err => console.error('Failed to send insights notification:', err));

        // Calculate initial risk score in background
        updateRiskScoreByUserId(req.userId).catch(err => console.error('[RiskScore] Initial calc error:', err));

        res.status(201).json({
            success: true,
            message: 'Profile created successfully',
            data: {
                profile,
                engagementWarning: 'Engagement rate is approximate and may be updated automatically during verification.'
            }
        });
    } catch (error) {
        console.error('Create profile error:', error.message || error);
        console.error('Create profile error details:', JSON.stringify(error.meta || {}, null, 2));

        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Instagram username already registered'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create profile',
            error: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/creators/profile
 * @desc    Update creator profile
 * @access  Private (Creator)
 */
router.put('/profile', auth, isCreator, [
    body('followerRange').optional().withMessage('Invalid follower range'),
    body('engagementRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Engagement rate must be between 0 and 100'),
    body('priceRange.min').optional().isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
    body('priceRange.max').optional().isFloat({ min: 0 }).withMessage('Maximum price must be positive'),
    handleValidation
], async (req, res) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please create your profile first.'
            });
        }

        // ── EDIT THROTTLE: only if profile is 100% complete ──────────────────────────
        // Limitation starts once profile is 100% complete, then twice a week (every 3 days).
        if (profile.profileCompletionPercentage >= 100 && profile.profileLastEditedAt) {
            const daysSinceEdit = (Date.now() - new Date(profile.profileLastEditedAt).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceEdit < 3) {
                const daysLeft = Math.ceil(3 - daysSinceEdit);
                return res.status(429).json({
                    success: false,
                    message: `Profile edits are allowed twice per week for completed profiles. You can edit again in ${daysLeft} day(s).`,
                    daysUntilNextEdit: daysLeft
                });
            }
        }

        // Update fields
        const updateData = { profileLastEditedAt: new Date() };
        const fields = ['instagramUsername', 'instagramProfileUrl', 'engagementRate', 'category', 'bio', 'isAvailable', 'availabilityStatus', 'willingToTravel', 'pastExperience'];
        fields.forEach(f => {
            if (req.body[f] !== undefined) updateData[f] = req.body[f];
        });
        if (req.body.engagementRate !== undefined) updateData.engagementRateWarning = true;

        // Handle array fields
        if (req.body.portfolioLinks !== undefined) updateData.portfolioLinks = req.body.portfolioLinks;
        if (req.body.collaborationTypes !== undefined) updateData.collaborationTypes = req.body.collaborationTypes;

        // Keep legacy isAvailable and availabilityUpdatedAt in sync
        if (req.body.availabilityStatus !== undefined) {
            updateData.availabilityUpdatedAt = new Date();
            if (req.body.isAvailable === undefined) {
                updateData.isAvailable = req.body.availabilityStatus !== 'NOT_AVAILABLE';
            }
        } else if (req.body.isAvailable !== undefined) {
            updateData.availabilityStatus = req.body.isAvailable ? 'AVAILABLE_NOW' : 'NOT_AVAILABLE';
            updateData.availabilityUpdatedAt = new Date();
        }

        if (req.body.promotionTypes) {
            updateData.promotionTypes = Array.isArray(req.body.promotionTypes)
                ? req.body.promotionTypes.map(t => String(t).toUpperCase().replace(/\s+/g, '_'))
                : [];
        }

        if (req.body.priceRange) {
            if (req.body.priceRange.min !== undefined) updateData.minPrice = parseFloat(req.body.priceRange.min) || 0;
            if (req.body.priceRange.max !== undefined) updateData.maxPrice = parseFloat(req.body.priceRange.max) || 0;
        }

        if (req.body.location !== undefined) updateData.location = req.body.location;

        // ── FOLLOWER RANGE THROTTLE ───────────────
        if (req.body.followerRange !== undefined) {
            // Only throttle follower range changes for completed profiles
            if (profile.profileCompletionPercentage >= 100 && profile.followerRangeChangedAt) {
                const daysSinceChange = (Date.now() - new Date(profile.followerRangeChangedAt).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceChange < 30) {
                    const daysLeft = Math.ceil(30 - daysSinceChange);
                    return res.status(429).json({
                        success: false,
                        message: `Follower range can only be changed once per month for completed profiles. You can change it again in ${daysLeft} day(s).`,
                        daysUntilNextChange: daysLeft
                    });
                }
            }
            
            let followerRangeEnum;
            let count = 0;
            const input = req.body.followerRange;
            
            if (typeof input === 'string') {
                followerRangeEnum = FOLLOWER_RANGE_MAP[input];
                count = FOLLOWER_RANGE_MIDPOINT[followerRangeEnum] || 0;
            } else if (typeof input === 'object' && input.min !== undefined) {
                const minNum = parseInt(input.min) || 0;
                followerRangeEnum = mapNumericToRangeEnum(minNum);
                count = minNum;
            }

            if (!followerRangeEnum) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid follower range format'
                });
            }
            updateData.followerRange = followerRangeEnum;
            updateData.followerRangeChangedAt = new Date();
            updateData.followerCount = count;
            updateData.selfReportedFollowers = count;
            updateData.verificationStatus = 'pending';
        }

        // Generate AI insights
        const insights = generateInsights({ ...profile, ...updateData });
        updateData.engagementQuality = insights.engagementQuality;
        updateData.audienceAuthenticity = insights.audienceAuthenticity;
        updateData.strengths = insights.strengths || [];
        updateData.profileSummary = insights.profileSummary || '';
        updateData.aiScore = insights.score || 50;
        updateData.lastAnalyzed = insights.lastAnalyzed || new Date();

        // Recalculate completion percentage
        const merged = { ...profile, ...updateData };
        updateData.profileCompletionPercentage = calculateCompletion(merged);
        updateData.onboardingCompleted = updateData.profileCompletionPercentage >= 60;

        const updatedProfile = await prisma.creatorProfile.update({
            where: { userId: req.userId },
            data: updateData
        });

        // AI Engine: Refresh embeddings on profile update (fire-and-forget)
        try {
            EmbeddingService.embedCreatorProfile(updatedProfile)
                .catch(err => console.warn('[AI Embedding] Non-critical error:', err.message));
        } catch (err) {
            console.warn('[AI Embedding] Setup error:', err.message);
        }

        // Recalculate risk score in background after profile update
        updateRiskScoreByUserId(req.userId).catch(err => console.error('[RiskScore] Update recalc error:', err));

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                profile: updatedProfile,
                engagementWarning: updatedProfile.engagementRateWarning
                    ? 'Engagement rate is approximate and may be updated automatically during verification.'
                    : undefined
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Instagram username already registered'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

/**
 * @route   GET /api/creators/promotions
 * @desc    Get promotion requests matching creator's profile
 * @access  Private (Creator)
 */
router.get('/promotions', auth, isCreator, userCacheMiddleware(30), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: req.userId },
            select: { category: true, promotionTypes: true, followerCount: true } // Select only needed fields
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Please create your profile first to see matching promotions'
            });
        }

        // Find matching promotion requests with pagination
        const [promotions, total] = await prisma.$transaction([
            prisma.promotionRequest.findMany({
                where: {
                    status: { in: ['OPEN', 'CREATOR_INTERESTED'] },
                    targetCategory: { has: profile.category },
                    promotionType: { hasSome: profile.promotionTypes },
                    minFollowers: { lte: profile.followerCount },
                    maxFollowers: { gte: profile.followerCount }
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    minBudget: true,
                    maxBudget: true,
                    promotionType: true,
                    campaignGoal: true,
                    deadline: true,
                    createdAt: true,
                    seller: {
                        select: { name: true, email: true, avatar: true }
                    },
                    // Optimize: Only fetch match status for THIS creator
                    matchedCreators: {
                        where: { creatorId: req.userId },
                        select: { status: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: skip,
                take: limit
            }),
            prisma.promotionRequest.count({
                where: {
                    status: { in: ['OPEN', 'CREATOR_INTERESTED'] },
                    targetCategory: { has: profile.category },
                    promotionType: { hasSome: profile.promotionTypes },
                    minFollowers: { lte: profile.followerCount },
                    maxFollowers: { gte: profile.followerCount }
                }
            })
        ]);

        // Map response
        const promotionsWithStatus = promotions.map(promo => ({
            ...promo,
            hasApplied: promo.matchedCreators.length > 0 && promo.matchedCreators[0].status === 'APPLIED'
        }));

        res.json({
            success: true,
            data: {
                promotions: promotionsWithStatus,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get promotions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get promotions'
        });
    }
});

/**
 * @route   POST /api/creators/promotions/:id/apply
 * @desc    Apply to a promotion request
 * @access  Private (Creator)
 */
router.post('/promotions/:id/apply', auth, isCreator, async (req, res) => {
    try {
        const promotionId = req.params.id;

        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Please create your profile first'
            });
        }

        const promotion = await prisma.promotionRequest.findUnique({
            where: { id: promotionId },
            include: { matchedCreators: true }
        });

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        if (!['OPEN', 'CREATOR_INTERESTED'].includes(promotion.status)) {
            return res.status(400).json({
                success: false,
                message: 'This promotion is no longer accepting applications'
            });
        }

        // Check if already applied
        const existingApplication = promotion.matchedCreators.find(
            mc => mc.creatorId === req.userId
        );

        if (existingApplication && existingApplication.status === 'APPLIED') {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this promotion'
            });
        }

        // Add or update creator application
        if (existingApplication) {
            await prisma.matchedCreator.update({
                where: { id: existingApplication.id },
                data: {
                    status: 'APPLIED',
                    appliedAt: new Date()
                }
            });
        } else {
            await prisma.matchedCreator.create({
                data: {
                    promotionId: promotion.id,
                    creatorId: req.userId,
                    matchScore: (profile.insights && profile.insights.score) || 50,
                    matchReason: `Applied by creator. ${profile.category} specialist with ${profile.followerCount} followers.`,
                    status: 'APPLIED',
                    appliedAt: new Date()
                }
            });
        }

        // Update status if first applicant
        if (promotion.status === 'OPEN') {
            await prisma.promotionRequest.update({
                where: { id: promotion.id },
                data: { status: 'CREATOR_INTERESTED' }
            });
        }

        // Notify seller (in-app + email)
        try {
            const seller = await prisma.user.findUnique({ where: { id: promotion.sellerId } });

            await notifySellerCreatorApplied(
                promotion.sellerId,
                req.user.name,
                promotion
            );

            if (seller) {
                await sendCreatorAppliedEmail(
                    seller.email,
                    seller.name,
                    req.user.name,
                    promotion.title
                );
            }
        } catch (err) {
            console.error('Failed to notify seller:', err);
        }

        res.json({
            success: true,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Apply to promotion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application'
        });
    }
});

/**
 * @route   GET /api/creators/applications
 * @desc    Get creator's application history
 * @access  Private (Creator)
 */
router.get('/applications', auth, isCreator, userCacheMiddleware(30), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const whereClause = {
            matchedCreators: {
                some: {
                    creatorId: req.userId,
                    status: { in: ['APPLIED', 'ACCEPTED', 'REJECTED', 'INVITED'] }
                }
            }
        };

        const [applications, total] = await prisma.$transaction([
            prisma.promotionRequest.findMany({
                where: whereClause,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    promotionType: true,
                    minBudget: true,
                    maxBudget: true,
                    campaignGoal: true,
                    status: true,
                    seller: {
                        select: { name: true, email: true, avatar: true }
                    },
                    matchedCreators: {
                        where: { creatorId: req.userId },
                        select: { status: true, appliedAt: true, respondedAt: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: skip,
                take: limit
            }),
            prisma.promotionRequest.count({ where: whereClause })
        ]);

        const formattedApplications = applications.map(promo => {
            const application = promo.matchedCreators[0];
            return {
                promotion: {
                    id: promo.id,
                    title: promo.title,
                    description: promo.description,
                    promotionType: promo.promotionType,
                    minBudget: promo.minBudget,
                    maxBudget: promo.maxBudget,
                    campaignGoal: promo.campaignGoal,
                    status: promo.status,
                    seller: promo.seller
                },
                applicationStatus: application?.status,
                appliedAt: application?.appliedAt,
                respondedAt: application?.respondedAt
            };
        });

        res.json({
            success: true,
            data: {
                applications: formattedApplications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get applications'
        });
    }
});

/**
 * @route   POST /api/creators/respond-request
 * @desc    Respond to a collaboration request (Accept/Decline)
 * @access  Private (Creator)
 */
router.post('/respond-request', auth, isCreator, [
    body('promotionId').notEmpty().withMessage('Promotion ID is required'),
    body('status').isIn(['ACCEPTED', 'REJECTED']).withMessage('Invalid status'),
    handleValidation
], async (req, res) => {
    try {
        const { promotionId, status } = req.body;

        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Find the invitation
        const matchedCreator = await prisma.matchedCreator.findUnique({
            where: {
                promotionId_creatorId: {
                    promotionId,
                    creatorId: profile.id
                }
            },
            include: { promotion: true }
        });

        if (!matchedCreator || matchedCreator.status !== 'INVITED') {
            return res.status(400).json({
                success: false,
                message: 'No pending invitation found for this promotion'
            });
        }

        // Update status
        await prisma.matchedCreator.update({
            where: { id: matchedCreator.id },
            data: {
                status: status,
                respondedAt: new Date()
            }
        });

        // --- RELIABILITY SCORE UPDATES ---
        if (status === 'REJECTED') {
            await updateReliabilityScore(req.userId, 'CREATOR', 'DECLINED_INVITE', promotionId);
        }

        if (status === 'ACCEPTED') {
            // Unlock/Create Conversation
            await prisma.conversation.upsert({
                where: {
                    promotionId_creatorUserId: {
                        promotionId,
                        creatorUserId: req.userId
                    }
                },
                update: { status: 'ACTIVE' },
                create: {
                    promotionId,
                    sellerId: matchedCreator.promotion.sellerId,
                    creatorUserId: req.userId,
                    creatorProfileId: profile.id,
                    status: 'ACTIVE'
                }
            });

            // Notify Seller
            // await notifySellerRequestAccepted(...)
        }

        res.json({
            success: true,
            message: `Request ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error('Respond request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to respond to request'
        });
    }
});

/**
 * @route   PUT /api/creators/profile/availability
 * @desc    Update creator's availability status
 * @access  Private (Creator)
 */
router.put('/profile/availability', auth, isCreator, [
    body('status').isIn(['AVAILABLE_NOW', 'LIMITED_AVAILABILITY', 'NOT_AVAILABLE']).withMessage('Invalid status'),
    handleValidation
], async (req, res) => {
    try {
        const { status } = req.body;

        const updatedProfile = await prisma.creatorProfile.update({
            where: { userId: req.userId },
            data: {
                availabilityStatus: status,
                availabilityUpdatedAt: new Date(),
                isAvailable: status !== 'NOT_AVAILABLE'
            }
        });

        res.json({
            success: true,
            message: 'Availability updated successfully',
            data: {
                availabilityStatus: updatedProfile.availabilityStatus,
                availabilityUpdatedAt: updatedProfile.availabilityUpdatedAt
            }
        });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update availability'
        });
    }
});

/**
 * @swagger
 * /creators/upload-portfolio:
 *   post:
 *     summary: Upload and add an image to creator portfolio
 *     tags: [Creators]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image added to portfolio successfully
 */
router.post('/upload-portfolio', auth, isCreator, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const imageUrl = req.file.path; // Cloudinary URL

        // Get current portfolio links
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: req.userId },
            select: { portfolioLinks: true }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Add to portfolio links (limit to 10 images)
        const updatedLinks = [...(profile.portfolioLinks || [])];
        if (updatedLinks.length >= 10) {
            return res.status(400).json({
                success: false,
                message: 'Portfolio limit reached (max 10 images)'
            });
        }
        updatedLinks.push(imageUrl);

        await prisma.creatorProfile.update({
            where: { userId: req.userId },
            data: {
                portfolioLinks: updatedLinks,
                profileCompletionPercentage: calculateCompletion({ ...profile, portfolioLinks: updatedLinks })
            }
        });

        res.json({
            success: true,
            message: 'Image added to portfolio successfully',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Portfolio upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
});

module.exports = router;
