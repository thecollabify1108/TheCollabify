const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const CreatorProfile = require('../models/CreatorProfile');
const PromotionRequest = require('../models/PromotionRequest');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { isCreator } = require('../middleware/roleCheck');
const { generateInsights } = require('../services/aiInsights');
const { notifyProfileInsights, notifySellerCreatorApplied } = require('../services/notificationService');
const { sendCreatorAppliedEmail } = require('../utils/emailService');

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
 * @route   GET /api/creators/profile
 * @desc    Get creator's own profile
 * @access  Private (Creator)
 */
router.get('/profile', auth, isCreator, async (req, res) => {
    try {
        const profile = await CreatorProfile.findOne({ userId: req.userId })
            .populate('userId', 'name email avatar');

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
    body('followerCount').isInt({ min: 0 }).withMessage('Follower count must be a positive number'),
    body('engagementRate').isFloat({ min: 0, max: 100 }).withMessage('Engagement rate must be between 0 and 100'),
    body('category').notEmpty().withMessage('Category is required'),
    body('promotionTypes').isArray({ min: 1 }).withMessage('At least one promotion type is required'),
    body('priceRange.min').isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
    body('priceRange.max').isFloat({ min: 0 }).withMessage('Maximum price must be positive'),
    handleValidation
], async (req, res) => {
    try {
        // Check if profile already exists
        const existingProfile = await CreatorProfile.findOne({ userId: req.userId });
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Profile already exists. Use PUT to update.'
            });
        }

        const {
            instagramUsername,
            followerCount,
            engagementRate,
            category,
            promotionTypes,
            priceRange,
            bio,
            isAvailable
        } = req.body;

        // Create profile data
        const profileData = {
            userId: req.userId,
            instagramUsername,
            followerCount,
            engagementRate,
            category,
            promotionTypes,
            priceRange,
            bio: bio || '',
            isAvailable: isAvailable !== false
        };

        // Generate AI insights
        const insights = generateInsights(profileData);
        profileData.insights = insights;

        // Create profile
        const profile = await CreatorProfile.create(profileData);

        // Notify about insights
        try {
            await notifyProfileInsights(req.userId, insights);
        } catch (err) {
            console.error('Failed to send insights notification:', err);
        }

        res.status(201).json({
            success: true,
            message: 'Profile created successfully',
            data: { profile }
        });
    } catch (error) {
        console.error('Create profile error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Instagram username already registered'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create profile'
        });
    }
});

/**
 * @route   PUT /api/creators/profile
 * @desc    Update creator profile
 * @access  Private (Creator)
 */
router.put('/profile', auth, isCreator, [
    body('followerCount').optional().isInt({ min: 0 }).withMessage('Follower count must be a positive number'),
    body('engagementRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Engagement rate must be between 0 and 100'),
    body('priceRange.min').optional().isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
    body('priceRange.max').optional().isFloat({ min: 0 }).withMessage('Maximum price must be positive'),
    handleValidation
], async (req, res) => {
    try {
        const profile = await CreatorProfile.findOne({ userId: req.userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please create your profile first.'
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            'instagramUsername',
            'followerCount',
            'engagementRate',
            'category',
            'promotionTypes',
            'priceRange',
            'bio',
            'isAvailable'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                profile[field] = req.body[field];
            }
        });

        // Regenerate AI insights
        const insights = generateInsights(profile);
        profile.insights = insights;

        await profile.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { profile }
        });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.code === 11000) {
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
router.get('/promotions', auth, isCreator, async (req, res) => {
    try {
        const profile = await CreatorProfile.findOne({ userId: req.userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Please create your profile first to see matching promotions'
            });
        }

        // Find matching promotion requests
        const promotions = await PromotionRequest.find({
            status: { $in: ['Open', 'Creator Interested'] },
            targetCategory: profile.category,
            promotionType: { $in: profile.promotionTypes },
            'followerRange.min': { $lte: profile.followerCount },
            'followerRange.max': { $gte: profile.followerCount },
            'budgetRange.min': { $lte: profile.priceRange.max }
        })
            .populate('sellerId', 'name email avatar')
            .sort({ createdAt: -1 });

        // Check which ones the creator has already applied to
        const promotionsWithStatus = promotions.map(promo => {
            const promoObj = promo.toObject();
            const applied = promo.matchedCreators.find(
                mc => mc.creatorId.toString() === profile._id.toString() && mc.status === 'Applied'
            );
            promoObj.hasApplied = !!applied;
            return promoObj;
        });

        res.json({
            success: true,
            data: {
                promotions: promotionsWithStatus,
                count: promotions.length
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

        const profile = await CreatorProfile.findOne({ userId: req.userId })
            .populate('userId', 'name');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Please create your profile first'
            });
        }

        const promotion = await PromotionRequest.findById(promotionId);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        if (!['Open', 'Creator Interested'].includes(promotion.status)) {
            return res.status(400).json({
                success: false,
                message: 'This promotion is no longer accepting applications'
            });
        }

        // Check if already applied
        const existingApplication = promotion.matchedCreators.find(
            mc => mc.creatorId.toString() === profile._id.toString()
        );

        if (existingApplication && existingApplication.status === 'Applied') {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this promotion'
            });
        }

        // Add or update creator application
        if (existingApplication) {
            existingApplication.status = 'Applied';
            existingApplication.appliedAt = new Date();
        } else {
            promotion.matchedCreators.push({
                creatorId: profile._id,
                matchScore: profile.insights?.score || 50,
                matchReason: `Applied by creator. ${profile.category} specialist with ${profile.followerCount} followers.`,
                status: 'Applied',
                appliedAt: new Date()
            });
        }

        // Update status if first applicant
        if (promotion.status === 'Open') {
            promotion.status = 'Creator Interested';
        }

        await promotion.save();

        // Notify seller (in-app + email)
        try {
            // Get seller details for email
            const seller = await User.findById(promotion.sellerId);

            // In-app notification
            await notifySellerCreatorApplied(
                promotion.sellerId,
                profile.userId.name,
                promotion
            );

            // Email notification
            if (seller) {
                await sendCreatorAppliedEmail(
                    seller.email,
                    seller.name,
                    profile.userId.name,
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
router.get('/applications', auth, isCreator, async (req, res) => {
    try {
        const profile = await CreatorProfile.findOne({ userId: req.userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Please create your profile first'
            });
        }

        // Find all promotions where creator has applied
        const applications = await PromotionRequest.find({
            'matchedCreators.creatorId': profile._id,
            'matchedCreators.status': { $in: ['Applied', 'Accepted', 'Rejected'] }
        })
            .populate('sellerId', 'name email')
            .sort({ 'matchedCreators.appliedAt': -1 });

        // Format response to include application status
        const formattedApplications = applications.map(promo => {
            const application = promo.matchedCreators.find(
                mc => mc.creatorId.toString() === profile._id.toString()
            );
            return {
                promotion: {
                    id: promo._id,
                    title: promo.title,
                    description: promo.description,
                    promotionType: promo.promotionType,
                    budgetRange: promo.budgetRange,
                    campaignGoal: promo.campaignGoal,
                    status: promo.status,
                    seller: promo.sellerId
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
                count: formattedApplications.length
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

module.exports = router;
