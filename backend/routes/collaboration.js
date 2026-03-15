let newrelic;
try {
    newrelic = require('newrelic');
} catch (e) {
    newrelic = {
        recordCustomEvent: () => {},
        startSegment: (name, record, fn) => fn ? fn() : null,
        addCustomParameters: () => {},
        recordMetric: () => {},
        noticeError: () => {}
    };
}

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');
let FeedbackLoop, EmbeddingService;
try {
    const ai = require('../services/ai');
    FeedbackLoop = ai.FeedbackLoop;
    EmbeddingService = ai.EmbeddingService;
} catch (e) {
    console.warn('[AI] Failed to load AI services in collaboration routes:', e.message);
    FeedbackLoop = { recordCampaignFeedback: () => Promise.resolve() };
    EmbeddingService = { embedCreatorProfile: () => Promise.resolve() };
}
const {
    validateTransition,
    buildHistoryEntry,
    isEditable,
    getValidNextStatuses,
    STAGE_ORDER,
    STAGE_LABELS
} = require('../services/collaborationStateMachine');
const { updateReliabilityScore } = require('../services/reliabilityService');
const { isEarlyBirdMode } = require('../services/platformSettingsService');

// Middleware to handle validation errors
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

/**
 * @route   POST /api/collaboration/initialize
 * @desc    Initialize collaboration after acceptance (starts at REQUESTED)
 * @access  Private
 */
router.post('/initialize', auth, [
    body('matchId').isUUID().withMessage('Valid match ID is required')
], handleValidation, async (req, res) => {
    try {
        const { matchId } = req.body;

        const match = await prisma.matchedCreator.findUnique({
            where: { id: matchId },
            include: { promotion: true }
        });

        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        // Enforce state-based gating: Cannot initialize if NOT ACCEPTED
        if (match.status !== 'ACCEPTED') {
            return res.status(400).json({
                success: false,
                message: 'Collaboration can only be initialized after a match has been ACCEPTED by the brand.'
            });
        }

        // Authorization: user must be seller or creator
        const profile = match.creatorId ? await prisma.creatorProfile.findUnique({ where: { id: match.creatorId } }) : null;
        const isAuthorized = match.promotion.sellerId === req.userId || (profile && profile.userId === req.userId);
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Return existing if already initialized
        let collaboration = await prisma.collaboration.findUnique({ where: { matchId } });
        if (collaboration) {
            return res.status(200).json({ success: true, data: collaboration });
        }

        // Create with initial state
        collaboration = await prisma.collaboration.create({
            data: {
                matchId,
                status: 'REQUESTED',
                statusHistory: [buildHistoryEntry(null, 'REQUESTED', req.userId)],
                deliverables: [],
                startDate: new Date(),
                milestones: []
            }
        });

        res.status(201).json({ success: true, data: collaboration });
    } catch (error) {
        console.error('Init collaboration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   GET /api/collaboration/platform-mode
 * @desc    Returns whether Early Bird Mode is active (public)
 * @access  Public
 */
router.get('/platform-mode', async (req, res) => {
    try {
        const earlyBird = await isEarlyBirdMode();
        res.json({
            success: true,
            data: {
                earlyBirdMode: earlyBird,
                message: earlyBird
                    ? 'Platform is in Early Bird mode. Collaborations are free.'
                    : 'Platform is in Marketplace mode. Escrow payments are required.'
            }
        });
    } catch (err) {
        console.error('Platform mode error:', err);
        res.json({ success: true, data: { earlyBirdMode: true } });
    }
});

/**
 * @route   GET /api/collaboration/:matchId
 * @desc    Get collaboration details with valid next actions
 * @access  Private
 */
router.get('/:matchId', auth, async (req, res) => {
    try {
        const { matchId } = req.params;

        const collaboration = await prisma.collaboration.findUnique({
            where: { matchId },
            include: {
                matchedCreator: {
                    include: {
                        promotion: {
                            select: {
                                title: true,
                                minBudget: true,
                                maxBudget: true,
                                location: true,
                                promotionType: true,
                                sellerId: true
                            }
                        },
                        creator: {
                            select: {
                                userId: true,
                                user: { select: { name: true, avatar: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!collaboration) {
            return res.status(404).json({ success: false, message: 'Collaboration not found' });
        }

        // IDOR PROTECTION: Verify ownership
        const sellerId = collaboration.matchedCreator.promotion.sellerId;
        const creatorId = collaboration.matchedCreator.creator.userId;
        if (sellerId !== req.userId && creatorId !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to collaboration details' });
        }

        // Enrich with state machine metadata
        const validNextStatuses = getValidNextStatuses(collaboration.status);
        const editable = isEditable(collaboration.status);

        res.json({
            success: true,
            data: {
                ...collaboration,
                _meta: {
                    validNextStatuses,
                    editable,
                    stageOrder: STAGE_ORDER,
                    stageLabels: STAGE_LABELS
                }
            }
        });
    } catch (error) {
        console.error('Get collaboration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   POST /api/collaboration/:id/transition
 * @desc    Transition collaboration to a new state (THE ONLY way to change status)
 * @access  Private
 */
router.post('/:id/transition', auth, [
    body('newStatus').isString().notEmpty().withMessage('New status is required')
], handleValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        // Fetch current collaboration
        const collaboration = await prisma.collaboration.findUnique({
            where: { id },
            include: {
                matchedCreator: {
                    include: {
                        promotion: { select: { sellerId: true } },
                        creator: { select: { userId: true } }
                    }
                }
            }
        });

        if (!collaboration) {
            return res.status(404).json({ success: false, message: 'Collaboration not found' });
        }

        // Authorization: only seller or creator can transition
        const isAuthorized =
            collaboration.matchedCreator.promotion.sellerId === req.userId ||
            collaboration.matchedCreator.creator.userId === req.userId;
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to change collaboration status' });
        }

        // Validate the transition via state machine
        const validation = validateTransition(collaboration.status, newStatus);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.error,
                currentStatus: collaboration.status,
                allowedTransitions: getValidNextStatuses(collaboration.status)
            });
        }

        // Build update data
        const historyEntry = buildHistoryEntry(collaboration.status, newStatus, req.userId);
        const existingHistory = Array.isArray(collaboration.statusHistory) ? collaboration.statusHistory : [];

        const updateData = {
            status: newStatus,
            statusUpdatedAt: new Date(),
            statusHistory: [...existingHistory, historyEntry]
        };

        // Special handling for terminal states
        if (newStatus === 'COMPLETED') {
            updateData.completedAt = new Date();
        }

        newrelic.addCustomParameters({
            collaborationId: id,
            oldStatus: collaboration.status,
            newStatus: newStatus
        });

        const updated = await prisma.collaboration.update({
            where: { id },
            data: updateData
        });

        // Record custom metric for status transitions
        newrelic.recordMetric('Custom/Collaboration/Transition/' + newStatus, 1);

        // --- RELIABILITY SCORE UPDATES ---
        const sellerId = collaboration.matchedCreator.promotion.sellerId;
        const creatorUserId = collaboration.matchedCreator.creator.userId;

        if (newStatus === 'COMPLETED') {
            // Both benefit from completion
            await Promise.all([
                updateReliabilityScore(creatorUserId, 'CREATOR', 'COLLABORATION_COMPLETED', id),
                updateReliabilityScore(sellerId, 'SELLER', 'COLLABORATION_COMPLETED', id)
            ]);

            // AI Engine: Record feedback for the learning loop (fire-and-forget)
            try {
                FeedbackLoop.recordCampaignFeedback({
                    campaignId: collaboration.matchedCreator.promotionId,
                    creatorId: collaboration.matchedCreator.creatorId
                }).catch(err => console.warn('[AI FeedbackLoop] Non-critical error:', err.message));
            } catch (err) {
                console.warn('[AI FeedbackLoop] Setup error:', err.message);
            }
        } else if (newStatus === 'CANCELLED') {
            // Unilateral cancellation? Or penalized both? 
            // The requirement says: "Decrease slightly for: cancelled collaborations" for both.
            // Let's penalize the whole collaboration if it fails.
            await Promise.all([
                updateReliabilityScore(creatorUserId, 'CREATOR', 'COLLABORATION_CANCELLED', id),
                updateReliabilityScore(sellerId, 'SELLER', 'COLLABORATION_CANCELLED', id)
            ]);
        }

        // Enrich response with next valid actions
        res.json({
            success: true,
            data: {
                ...updated,
                _meta: {
                    validNextStatuses: getValidNextStatuses(newStatus),
                    editable: isEditable(newStatus),
                    stageOrder: STAGE_ORDER,
                    stageLabels: STAGE_LABELS
                }
            }
        });
    } catch (error) {
        newrelic.noticeError(error);
        console.error('Transition collaboration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   PATCH /api/collaboration/:id
 * @desc    Update deliverables, timeline, milestones (only in editable states)
 * @access  Private
 */
router.patch('/:id', auth, [
    body('deliverableItems').optional().isArray().withMessage('Deliverables must be an array'),
    body('milestones').optional().isArray().withMessage('Milestones must be an array'),
    body('startDate').optional({ nullable: true }).isISO8601().withMessage('startDate must be a valid ISO date'),
    body('endDate').optional({ nullable: true }).isISO8601().withMessage('endDate must be a valid ISO date')
], handleValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { deliverableItems, startDate, endDate, milestones } = req.body;

        // Fetch current to check editability and ownership
        const existing = await prisma.collaboration.findUnique({
            where: { id },
            include: {
                matchedCreator: {
                    include: {
                        promotion: { select: { sellerId: true } },
                        creator: { select: { userId: true } }
                    }
                }
            }
        });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Collaboration not found' });
        }

        // IDOR PROTECTION: Verify ownership
        const isAuthorized =
            existing.matchedCreator.promotion.sellerId === req.userId ||
            existing.matchedCreator.creator.userId === req.userId;
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Unauthorized to modify this collaboration' });
        }

        if (!isEditable(existing.status)) {
            return res.status(403).json({
                success: false,
                message: `Cannot edit collaboration in ${existing.status} state. Only editable in: ACCEPTED, IN_DISCUSSION, AGREED, IN_PROGRESS`
            });
        }

        const updateData = {};
        if (deliverableItems !== undefined) updateData.deliverableItems = deliverableItems;
        if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
        if (milestones !== undefined) updateData.milestones = milestones;

        const collaboration = await prisma.collaboration.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, data: collaboration });
    } catch (error) {
        console.error('Update collaboration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


/**
 * @route   POST /api/collaboration/:id/feedback
 * @desc    Submit structured feedback (only after COMPLETED)
 * @access  Private
 */
router.post('/:id/feedback', auth, [
    body('role').isIn(['SELLER', 'CREATOR', 'BRAND']).withMessage('Role must be SELLER, BRAND, or CREATOR'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().isString().isLength({ max: 1000 }),
    body('creatorProfessionalism').optional().isInt({ min: 1, max: 5 }),
    body('campaignQuality').optional().isInt({ min: 1, max: 5 }),
    body('overallBrandExperience').optional().isInt({ min: 1, max: 5 }),
    body('brandCommunication').optional().isInt({ min: 1, max: 5 }),
    body('campaignClarity').optional().isInt({ min: 1, max: 5 }),
    body('overallCreatorExperience').optional().isInt({ min: 1, max: 5 }),
], handleValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, rating, comment, ...rest } = req.body;
        const normalizedRole = role === 'BRAND' ? 'SELLER' : role;

        const existing = await prisma.collaboration.findUnique({
            where: { id },
            include: {
                matchedCreator: {
                    include: {
                        promotion: { select: { sellerId: true } },
                        creator: { select: { userId: true } }
                    }
                }
            }
        });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Collaboration not found' });
        }
        if (existing.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Feedback can only be submitted for completed collaborations'
            });
        }

        const sellerId = existing.matchedCreator.promotion.sellerId;
        const creatorUserId = existing.matchedCreator.creator.userId;
        if (sellerId !== req.userId && creatorUserId !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const feedbackData = {
            collaborationId: id,
            submittedByUserId: req.userId,
            role: normalizedRole,
            rating: parseInt(rating),
            comment: comment || null,
        };
        if (normalizedRole === 'SELLER') {
            if (rest.creatorProfessionalism) feedbackData.creatorProfessionalism = parseInt(rest.creatorProfessionalism);
            if (rest.campaignQuality) feedbackData.campaignQuality = parseInt(rest.campaignQuality);
            if (rest.overallBrandExperience) feedbackData.overallBrandExperience = parseInt(rest.overallBrandExperience);
        } else {
            if (rest.brandCommunication) feedbackData.brandCommunication = parseInt(rest.brandCommunication);
            if (rest.campaignClarity) feedbackData.campaignClarity = parseInt(rest.campaignClarity);
            if (rest.overallCreatorExperience) feedbackData.overallCreatorExperience = parseInt(rest.overallCreatorExperience);
        }

        try {
            await prisma.collaborationFeedback.upsert({
                where: { collaborationId_role: { collaborationId: id, role: normalizedRole } },
                update: feedbackData,
                create: feedbackData
            });
        } catch (dbErr) {
            console.warn('[Feedback] CollaborationFeedback table not yet ready, using legacy storage:', dbErr.message);
        }

        // Legacy JSON storage on Collaboration
        const legacyObj = { rating, comment, ...rest };
        const legacyUpdate = normalizedRole === 'SELLER' ? { sellerFeedback: legacyObj } : { creatorFeedback: legacyObj };
        await prisma.collaboration.update({ where: { id }, data: legacyUpdate });

        if (parseInt(rating) >= 4) {
            const recipientId = normalizedRole === 'SELLER' ? creatorUserId : sellerId;
            const recipientRole = normalizedRole === 'SELLER' ? 'CREATOR' : 'SELLER';
            updateReliabilityScore(recipientId, recipientRole, 'POSITIVE_FEEDBACK', id).catch(() => {});
        }

        res.json({ success: true, message: 'Feedback submitted. Thank you!' });
    } catch (error) {
        console.error('Feedback collaboration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;