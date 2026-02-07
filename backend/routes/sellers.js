const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
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
const { sendCreatorAcceptedEmail, sendNewMatchEmail } = require('../utils/brevoEmailService');

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
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { sellerId: req.userId };
        if (status) {
            where.status = status.toUpperCase();
        }

        const [requests, total] = await Promise.all([
            prisma.promotionRequest.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    minBudget: true,
                    maxBudget: true,
                    promotionType: true,
                    campaignGoal: true,
                    deadline: true,
                    status: true,
                    createdAt: true,
                    matchedCreators: {
                        select: {
                            id: true,
                            matchScore: true,
                            status: true,
                            creatorId: true,
                            creator: {
                                select: {
                                    id: true,
                                    followerCount: true,
                                    category: true,
                                    user: {
                                        select: { id: true, name: true, avatar: true }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.promotionRequest.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
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
        const request = await prisma.promotionRequest.create({
            data: {
                sellerId: req.userId,
                title,
                description,
                minBudget: budgetRange.min,
                maxBudget: budgetRange.max,
                promotionType: [promotionType.toUpperCase().replace(/\s+/g, '_')],
                targetCategory: targetCategory,
                minFollowers: followerRange.min,
                maxFollowers: followerRange.max,
                campaignGoal: campaignGoal.toUpperCase(),
                deadline: deadline ? new Date(deadline) : undefined,
                status: 'OPEN'
            }
        });

        // Find matching creators using AI matching service
        const matchedCreatorsResults = await findMatchingCreators(request);

        // Store matched creators in request
        const matchedCreators = await Promise.all(matchedCreatorsResults.map(match =>
            prisma.matchedCreator.create({
                data: {
                    promotionId: request.id,
                    creatorId: match.creatorId,
                    matchScore: match.matchScore,
                    matchReason: match.matchReason,
                    status: 'MATCHED'
                }
            })
        ));

        // Notify matched creators
        for (const match of matchedCreatorsResults.slice(0, 10)) {
            try {
                const creator = await prisma.creatorProfile.findUnique({
                    where: { id: match.creatorId },
                    include: { user: { select: { id: true, name: true, email: true } } }
                });
                if (creator && creator.user) {
                    await notifyCreatorNewMatch(creator.user.id, request, match.matchScore);
                    await sendNewMatchEmail(
                        creator.user.email,
                        creator.user.name,
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
                request: { ...request, matchedCreators },
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
        const request = await prisma.promotionRequest.findUnique({
            where: { id: req.params.id },
            include: {
                matchedCreators: {
                    include: {
                        creator: {
                            include: {
                                user: {
                                    select: { name: true, email: true, avatar: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!request || request.sellerId !== req.userId) {
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
        const request = await prisma.promotionRequest.findUnique({
            where: { id: req.params.id }
        });

        if (!request || request.sellerId !== req.userId) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        // Only allow updates if status is Open
        if (request.status !== 'OPEN') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update request after creators have shown interest'
            });
        }

        const updateData = {};
        const fields = ['title', 'description', 'targetCategory', 'deadline'];
        fields.forEach(f => {
            if (req.body[f] !== undefined) updateData[f] = req.body[f];
        });

        if (req.body.budgetRange) {
            if (req.body.budgetRange.min !== undefined) updateData.minBudget = req.body.budgetRange.min;
            if (req.body.budgetRange.max !== undefined) updateData.maxBudget = req.body.budgetRange.max;
        }

        if (req.body.promotionType) {
            updateData.promotionType = [req.body.promotionType.toUpperCase().replace(/\s+/g, '_')];
        }

        if (req.body.followerRange) {
            if (req.body.followerRange.min !== undefined) updateData.minFollowers = req.body.followerRange.min;
            if (req.body.followerRange.max !== undefined) updateData.maxFollowers = req.body.followerRange.max;
        }

        if (req.body.campaignGoal) {
            updateData.campaignGoal = req.body.campaignGoal.toUpperCase();
        }

        const updatedRequest = await prisma.promotionRequest.update({
            where: { id: req.params.id },
            data: updateData
        });

        // Re-run matching
        const matchedCreatorsResults = await findMatchingCreators(updatedRequest);

        // Update matched creators
        await prisma.matchedCreator.deleteMany({ where: { promotionId: updatedRequest.id, status: 'MATCHED' } });

        const matchedCreators = await Promise.all(matchedCreatorsResults.map(match =>
            prisma.matchedCreator.create({
                data: {
                    promotionId: updatedRequest.id,
                    creatorId: match.creatorId,
                    matchScore: match.matchScore,
                    matchReason: match.matchReason,
                    status: 'MATCHED'
                }
            })
        ));

        res.json({
            success: true,
            message: 'Promotion request updated successfully',
            data: { request: { ...updatedRequest, matchedCreators } }
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
        const request = await prisma.promotionRequest.findUnique({
            where: { id: req.params.id },
            include: { matchedCreators: true }
        });

        if (!request || request.sellerId !== req.userId) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        const matchedCreator = request.matchedCreators.find(
            mc => mc.creatorId === req.params.creatorId
        );

        if (!matchedCreator) {
            return res.status(404).json({
                success: false,
                message: 'Creator not found in matched creators'
            });
        }

        if (matchedCreator.status !== 'APPLIED') {
            return res.status(400).json({
                success: false,
                message: 'Can only accept creators who have applied'
            });
        }

        // Accept this creator
        await prisma.matchedCreator.update({
            where: { id: matchedCreator.id },
            data: { status: 'ACCEPTED', respondedAt: new Date() }
        });

        // Update request status
        await prisma.promotionRequest.update({
            where: { id: request.id },
            data: { status: 'ACCEPTED', acceptedCreatorId: req.params.creatorId }
        });

        // Get creator details
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { id: req.params.creatorId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });
        const seller = req.user;

        // Notify creator
        if (creatorProfile && creatorProfile.user) {
            try {
                await notifyCreatorAccepted(creatorProfile.user.id, request);
                await sendCreatorAcceptedEmail(
                    creatorProfile.user.email,
                    creatorProfile.user.name,
                    request.title,
                    seller?.name || 'A brand'
                );
            } catch (err) {
                console.error('Failed to notify creator:', err);
            }

            // Create a conversation for chat
            try {
                await prisma.conversation.upsert({
                    where: {
                        promotionId_creatorUserId: {
                            promotionId: request.id,
                            creatorUserId: creatorProfile.user.id
                        }
                    },
                    update: { status: 'ACTIVE' },
                    create: {
                        promotionId: request.id,
                        sellerId: req.userId,
                        creatorUserId: creatorProfile.user.id,
                        creatorProfileId: creatorProfile.id,
                        status: 'ACTIVE'
                    }
                });
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
        const request = await prisma.promotionRequest.findUnique({
            where: { id: req.params.id },
            include: { matchedCreators: true }
        });

        if (!request || request.sellerId !== req.userId) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        const matchedCreator = request.matchedCreators.find(
            mc => mc.creatorId === req.params.creatorId
        );

        if (!matchedCreator) {
            return res.status(404).json({
                success: false,
                message: 'Creator not found in matched creators'
            });
        }

        // Reject creator
        await prisma.matchedCreator.update({
            where: { id: matchedCreator.id },
            data: { status: 'REJECTED', respondedAt: new Date() }
        });

        // Notify creator
        const creatorProfile = await prisma.creatorProfile.findUnique({ where: { id: req.params.creatorId } });
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
        const request = await prisma.promotionRequest.findUnique({
            where: { id: req.params.id },
            include: { matchedCreators: true }
        });

        if (!request || request.sellerId !== req.userId) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        // Notify creators
        for (const match of request.matchedCreators) {
            if (['APPLIED', 'MATCHED'].includes(match.status)) {
                try {
                    const creatorProfile = await prisma.creatorProfile.findUnique({ where: { id: match.creatorId } });
                    if (creatorProfile) {
                        await notifyRequestDeleted(creatorProfile.userId, request);
                    }
                } catch (err) {
                    console.error('Failed to notify creator about deletion:', err);
                }
            }
        }

        // Delete conversations and request
        await prisma.conversation.deleteMany({ where: { promotionId: request.id } });
        await prisma.promotionRequest.delete({ where: { id: request.id } });

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
        const request = await prisma.promotionRequest.findUnique({
            where: { id: req.params.id }
        });

        if (!request || request.sellerId !== req.userId) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

        const { status } = req.body;
        const upperStatus = status.toUpperCase();

        if (upperStatus === 'COMPLETED' && request.status !== 'ACCEPTED') {
            return res.status(400).json({
                success: false,
                message: 'Can only complete an accepted campaign'
            });
        }

        const data = { status: upperStatus };
        if (upperStatus === 'COMPLETED') {
            data.completedAt = new Date();
        }

        const updatedRequest = await prisma.promotionRequest.update({
            where: { id: request.id },
            data
        });

        // Update creator's stats
        if (upperStatus === 'COMPLETED' && request.acceptedCreatorId) {
            await prisma.creatorProfile.update({
                where: { id: request.acceptedCreatorId },
                data: {
                    totalPromotions: { increment: 1 },
                    successfulPromotions: { increment: 1 }
                }
            });

            const creatorProfile = await prisma.creatorProfile.findUnique({ where: { id: request.acceptedCreatorId } });
            if (creatorProfile) {
                try {
                    await notifyRequestUpdate(creatorProfile.userId, updatedRequest, status);
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
        const request = await prisma.promotionRequest.findUnique({
            where: { id: req.params.id }
        });

        if (!request || request.sellerId !== req.userId) {
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

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { id: req.params.creatorId },
            include: { user: { select: { name: true, email: true, avatar: true } } }
        });

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
