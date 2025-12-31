const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PromotionRequest = require('../models/PromotionRequest');
const CreatorProfile = require('../models/CreatorProfile');
const Conversation = require('../models/Conversation');
const { auth } = require('../middleware/auth');
const { isSeller } = require('../middleware/roleCheck');
const { findMatchingCreators, explainMatch } = require('../services/aiMatching');
const {
    notifyCreatorNewMatch,
    notifyCreatorAccepted,
    notifyCreatorRejected,
    notifyRequestUpdate,
    notifyRequestDeleted
} = require('../services/notificationService');
const { sendCreatorAcceptedEmail, sendNewMatchEmail } = require('../utils/emailService');
const User = require('../models/User');

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
 * @route   GET /api/sellers/requests
 * @desc    Get all promotion requests for current seller
 * @access  Private (Seller)
 */
router.get('/requests', auth, isSeller, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { sellerId: req.userId };

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [requests, total] = await Promise.all([
            PromotionRequest.find(query)
                .populate({
                    path: 'matchedCreators.creatorId',
                    populate: { path: 'userId', select: 'name email avatar' }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PromotionRequest.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get promotion requests'
        });
    }
});

/**
 * @route   POST /api/sellers/requests
 * @desc    Create a new promotion request
 * @access  Private (Seller)
 */
router.post('/requests', auth, isSeller, [
    body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
    body('budgetRange.min').isFloat({ min: 0 }).withMessage('Minimum budget must be positive'),
    body('budgetRange.max').isFloat({ min: 0 }).withMessage('Maximum budget must be positive'),
    body('promotionType').isIn(['Reels', 'Stories', 'Posts', 'Website Visit']).withMessage('Invalid promotion type'),
    body('targetCategory').notEmpty().withMessage('Target category is required'),
    body('followerRange.min').isInt({ min: 0 }).withMessage('Minimum follower count must be positive'),
    body('followerRange.max').isInt({ min: 0 }).withMessage('Maximum follower count must be positive'),
    body('campaignGoal').isIn(['Reach', 'Traffic', 'Sales']).withMessage('Invalid campaign goal'),
    handleValidation
], async (req, res) => {
    try {
        const {
            title,
            description,
            budgetRange,
            promotionType,
            targetCategory,
            followerRange,
            campaignGoal,
            deadline
        } = req.body;

        // Create promotion request
        const request = await PromotionRequest.create({
            sellerId: req.userId,
            title,
            description,
            budgetRange,
            promotionType,
            targetCategory,
            followerRange,
            campaignGoal,
            deadline: deadline ? new Date(deadline) : undefined,
            status: 'Open'
        });

        // Find matching creators using AI matching service
        const matchedCreators = await findMatchingCreators(request);

        // Store matched creators in request
        request.matchedCreators = matchedCreators.map(match => ({
            creatorId: match.creatorId,
            matchScore: match.matchScore,
            matchReason: match.matchReason,
            status: 'Matched'
        }));

        await request.save();

        // Notify matched creators
        for (const match of matchedCreators.slice(0, 10)) { // Notify top 10
            try {
                const creator = await CreatorProfile.findById(match.creatorId).populate('userId', 'name email');
                if (creator && creator.userId) {
                    // In-app notification
                    await notifyCreatorNewMatch(creator.userId._id, request, match.matchScore);

                    // Email notification
                    await sendNewMatchEmail(
                        creator.userId.email,
                        creator.userId.name,
                        request.title,
                        match.matchScore,
                        request.targetCategory
                    );
                }
            } catch (err) {
                console.error('Failed to notify creator:', err);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Promotion request created successfully',
            data: {
                request,
                matchedCreatorsCount: matchedCreators.length
            }
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create promotion request'
        });
    }
});

/**
 * @route   GET /api/sellers/requests/:id
 * @desc    Get single promotion request with matched creators
 * @access  Private (Seller)
 */
router.get('/requests/:id', auth, isSeller, async (req, res) => {
    try {
        const request = await PromotionRequest.findOne({
            _id: req.params.id,
            sellerId: req.userId
        }).populate({
            path: 'matchedCreators.creatorId',
            populate: { path: 'userId', select: 'name email avatar' }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        res.json({
            success: true,
            data: { request }
        });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get promotion request'
        });
    }
});

/**
 * @route   PUT /api/sellers/requests/:id
 * @desc    Update promotion request
 * @access  Private (Seller)
 */
router.put('/requests/:id', auth, isSeller, async (req, res) => {
    try {
        const request = await PromotionRequest.findOne({
            _id: req.params.id,
            sellerId: req.userId
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        // Only allow updates if status is Open
        if (request.status !== 'Open') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update request after creators have shown interest'
            });
        }

        const allowedUpdates = [
            'title',
            'description',
            'budgetRange',
            'promotionType',
            'targetCategory',
            'followerRange',
            'campaignGoal',
            'deadline'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                request[field] = req.body[field];
            }
        });

        await request.save();

        // Re-run matching if criteria changed
        const matchedCreators = await findMatchingCreators(request);
        request.matchedCreators = matchedCreators.map(match => ({
            creatorId: match.creatorId,
            matchScore: match.matchScore,
            matchReason: match.matchReason,
            status: 'Matched'
        }));

        await request.save();

        res.json({
            success: true,
            message: 'Promotion request updated successfully',
            data: { request }
        });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update promotion request'
        });
    }
});

/**
 * @route   POST /api/sellers/requests/:id/accept/:creatorId
 * @desc    Accept a creator's application
 * @access  Private (Seller)
 */
router.post('/requests/:id/accept/:creatorId', auth, isSeller, async (req, res) => {
    try {
        const request = await PromotionRequest.findOne({
            _id: req.params.id,
            sellerId: req.userId
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        const matchedCreator = request.matchedCreators.find(
            mc => mc.creatorId.toString() === req.params.creatorId
        );

        if (!matchedCreator) {
            return res.status(404).json({
                success: false,
                message: 'Creator not found in matched creators'
            });
        }

        if (matchedCreator.status !== 'Applied') {
            return res.status(400).json({
                success: false,
                message: 'Can only accept creators who have applied'
            });
        }

        // Accept this creator
        matchedCreator.status = 'Accepted';
        matchedCreator.respondedAt = new Date();

        // Update request status
        request.status = 'Accepted';
        request.acceptedCreator = req.params.creatorId;

        await request.save();

        // Get creator profile and seller info to find user details
        const creatorProfile = await CreatorProfile.findById(req.params.creatorId).populate('userId', 'name email');
        const seller = await User.findById(req.userId);

        // Notify creator (in-app + email)
        if (creatorProfile && creatorProfile.userId) {
            try {
                // In-app notification
                await notifyCreatorAccepted(creatorProfile.userId._id, request);

                // Email notification
                await sendCreatorAcceptedEmail(
                    creatorProfile.userId.email,
                    creatorProfile.userId.name,
                    request.title,
                    seller?.name || 'A brand'
                );
            } catch (err) {
                console.error('Failed to notify creator:', err);
            }

            // Create a conversation for chat
            try {
                await Conversation.findOneAndUpdate(
                    { promotionId: request._id, creatorUserId: creatorProfile.userId._id },
                    {
                        promotionId: request._id,
                        sellerId: req.userId,
                        creatorUserId: creatorProfile.userId._id,
                        creatorProfileId: creatorProfile._id,
                        status: 'active'
                    },
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error('Failed to create conversation:', err);
            }
        }

        res.json({
            success: true,
            message: 'Creator accepted successfully'
        });
    } catch (error) {
        console.error('Accept creator error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept creator'
        });
    }
});

/**
 * @route   POST /api/sellers/requests/:id/reject/:creatorId
 * @desc    Reject a creator's application
 * @access  Private (Seller)
 */
router.post('/requests/:id/reject/:creatorId', auth, isSeller, async (req, res) => {
    try {
        const request = await PromotionRequest.findOne({
            _id: req.params.id,
            sellerId: req.userId
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        const matchedCreator = request.matchedCreators.find(
            mc => mc.creatorId.toString() === req.params.creatorId
        );

        if (!matchedCreator) {
            return res.status(404).json({
                success: false,
                message: 'Creator not found in matched creators'
            });
        }

        // Reject creator
        matchedCreator.status = 'Rejected';
        matchedCreator.respondedAt = new Date();

        await request.save();

        // Get creator profile to find user ID
        const creatorProfile = await CreatorProfile.findById(req.params.creatorId);

        // Notify creator
        if (creatorProfile) {
            try {
                await notifyCreatorRejected(creatorProfile.userId, request);
            } catch (err) {
                console.error('Failed to notify creator:', err);
            }
        }

        res.json({
            success: true,
            message: 'Creator rejected'
        });
    } catch (error) {
        console.error('Reject creator error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject creator'
        });
    }
});

/**
 * @route   DELETE /api/sellers/requests/:id
 * @desc    Delete a promotion request
 * @access  Private (Seller)
 */
router.delete('/requests/:id', auth, isSeller, async (req, res) => {
    try {
        const request = await PromotionRequest.findOne({
            _id: req.params.id,
            sellerId: req.userId
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        // Notify all creators who applied to this request
        const appliedCreators = request.matchedCreators.filter(mc =>
            ['Applied', 'Matched'].includes(mc.status)
        );

        for (const match of appliedCreators) {
            try {
                const creatorProfile = await CreatorProfile.findById(match.creatorId);
                if (creatorProfile) {
                    await notifyRequestDeleted(creatorProfile.userId, request);
                }
            } catch (err) {
                console.error('Failed to notify creator about deletion:', err);
            }
        }

        // Also delete any conversations related to this request
        await Conversation.deleteMany({ promotionId: request._id });

        // Delete the request
        await PromotionRequest.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Promotion request deleted successfully'
        });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete promotion request'
        });
    }
});

/**
 * @route   PUT /api/sellers/requests/:id/status
 * @desc    Update campaign status
 * @access  Private (Seller)
 */
router.put('/requests/:id/status', auth, isSeller, [
    body('status').isIn(['Completed', 'Cancelled']).withMessage('Invalid status'),
    handleValidation
], async (req, res) => {
    try {
        const request = await PromotionRequest.findOne({
            _id: req.params.id,
            sellerId: req.userId
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        const { status } = req.body;

        // Validate status transition
        if (status === 'Completed' && request.status !== 'Accepted') {
            return res.status(400).json({
                success: false,
                message: 'Can only complete an accepted campaign'
            });
        }

        request.status = status;

        if (status === 'Completed') {
            request.completedAt = new Date();

            // Update creator's stats
            if (request.acceptedCreator) {
                await CreatorProfile.findByIdAndUpdate(request.acceptedCreator, {
                    $inc: { totalPromotions: 1, successfulPromotions: 1 }
                });
            }
        }

        await request.save();

        // Notify all relevant parties
        if (request.acceptedCreator) {
            const creatorProfile = await CreatorProfile.findById(request.acceptedCreator);
            if (creatorProfile) {
                try {
                    await notifyRequestUpdate(creatorProfile.userId, request, status);
                } catch (err) {
                    console.error('Failed to notify creator:', err);
                }
            }
        }

        res.json({
            success: true,
            message: `Campaign marked as ${status.toLowerCase()}`
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update campaign status'
        });
    }
});

/**
 * @route   GET /api/sellers/requests/:id/match-details/:creatorId
 * @desc    Get detailed match explanation for a creator
 * @access  Private (Seller)
 */
router.get('/requests/:id/match-details/:creatorId', auth, isSeller, async (req, res) => {
    try {
        const request = await PromotionRequest.findOne({
            _id: req.params.id,
            sellerId: req.userId
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        const matchDetails = await explainMatch(req.params.creatorId, request);

        if (!matchDetails) {
            return res.status(404).json({
                success: false,
                message: 'Creator not found'
            });
        }

        const creatorProfile = await CreatorProfile.findById(req.params.creatorId)
            .populate('userId', 'name email avatar');

        res.json({
            success: true,
            data: {
                creator: creatorProfile,
                matchDetails
            }
        });
    } catch (error) {
        console.error('Get match details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get match details'
        });
    }
});

module.exports = router;
