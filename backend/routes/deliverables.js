/**
 * Collaboration Deliverables API
 *
 * Workflow:
 *   1. Creator submits deliverables (links, screenshots, files)
 *   2. Brand reviews:  APPROVE → triggers escrow release
 *                      REQUEST REVISION (max 3 times)
 *                      OPEN DISPUTE → escalates to admin
 *   3. Revision counter enforced — max 3 revision requests.
 *   4. After approval: escrow autocollect + collaboration COMPLETED.
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');

const MAX_REVISIONS = 3;

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
};

// Helper: get collaboration with membership check
async function getCollaborationForUser(collaborationId, userId) {
    const collaboration = await prisma.collaboration.findUnique({
        where: { id: collaborationId },
        include: {
            matchedCreator: {
                include: {
                    promotion: { select: { sellerId: true } },
                    creator: { select: { userId: true } }
                }
            },
            escrowPayment: true
        }
    });
    if (!collaboration) return null;

    const sellerId = collaboration.matchedCreator.promotion.sellerId;
    const creatorId = collaboration.matchedCreator.creator.userId;
    if (sellerId !== userId && creatorId !== userId) return null;

    return { collaboration, sellerId, creatorId };
}

/**
 * @route   GET /api/deliverables/:collaborationId
 * @desc    Get all deliverables for a collaboration
 * @access  Private (seller or creator in the collaboration)
 */
router.get('/:collaborationId', auth, async (req, res) => {
    try {
        const result = await getCollaborationForUser(req.params.collaborationId, req.userId);
        if (!result) return res.status(403).json({ success: false, message: 'Not authorized or collaboration not found.' });

        const deliverables = await prisma.collaborationDeliverable.findMany({
            where: { collaborationId: req.params.collaborationId },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ success: true, data: { deliverables } });
    } catch (err) {
        console.error('Get deliverables error:', err);
        res.status(500).json({ success: false, message: 'Failed to get deliverables' });
    }
});

/**
 * @route   POST /api/deliverables/:collaborationId
 * @desc    Creator submits deliverables
 * @access  Private (Creator only)
 */
router.post('/:collaborationId', auth, [
    body('description').optional().isString().isLength({ max: 2000 }),
    body('contentLinks').optional().isArray(),
    body('screenshotUrls').optional().isArray(),
    body('fileUrls').optional().isArray(),
    handleValidation
], async (req, res) => {
    try {
        const result = await getCollaborationForUser(req.params.collaborationId, req.userId);
        if (!result) return res.status(403).json({ success: false, message: 'Not authorized or collaboration not found.' });

        const { collaboration, creatorId, sellerId } = result;

        if (req.userId !== creatorId) {
            return res.status(403).json({ success: false, message: 'Only the creator can submit deliverables.' });
        }

        // Must have escrow in HELD state
        if (!collaboration.escrowPayment || !['HELD', 'DEPOSITED'].includes(collaboration.escrowPayment.status)) {
            return res.status(400).json({
                success: false,
                message: 'Deliverables can only be submitted after escrow payment is confirmed.'
            });
        }

        // Check if there's an existing pending/revision_requested deliverable
        const existing = await prisma.collaborationDeliverable.findFirst({
            where: {
                collaborationId: req.params.collaborationId,
                status: { in: ['PENDING', 'SUBMITTED'] }
            }
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A deliverable is already under review. Wait for brand feedback before resubmitting.',
                existingDeliverableId: existing.id
            });
        }

        // If previous was REVISION_REQUESTED, check revision count
        const lastDeliverable = await prisma.collaborationDeliverable.findFirst({
            where: { collaborationId: req.params.collaborationId },
            orderBy: { createdAt: 'desc' }
        });
        const revisionCount = lastDeliverable ? lastDeliverable.revisionCount : 0;

        const { contentLinks = [], screenshotUrls = [], fileUrls = [], description } = req.body;

        if (!contentLinks.length && !screenshotUrls.length && !fileUrls.length) {
            return res.status(400).json({
                success: false,
                message: 'At least one content link, screenshot, or file is required.'
            });
        }

        const deliverable = await prisma.collaborationDeliverable.create({
            data: {
                collaborationId: req.params.collaborationId,
                submittedByUserId: req.userId,
                contentLinks,
                screenshotUrls,
                fileUrls,
                description: description || null,
                status: 'SUBMITTED',
                revisionCount,
                submittedAt: new Date()
            }
        });

        // Notify brand
        try {
            const { createNotification } = require('../services/notificationService');
            await createNotification({
                userId: sellerId,
                title: 'Deliverables Submitted',
                message: 'The creator has submitted deliverables for your review.',
                type: 'deliverable_submitted',
                link: `/collaborations/${req.params.collaborationId}`
            });
        } catch (_) { /* non-critical */ }

        res.status(201).json({ success: true, message: 'Deliverables submitted for review.', data: { deliverable } });
    } catch (err) {
        console.error('Submit deliverables error:', err);
        res.status(500).json({ success: false, message: 'Failed to submit deliverables' });
    }
});

/**
 * @route   POST /api/deliverables/:deliverableId/review
 * @desc    Brand reviews deliverables: approve, request_revision, or dispute
 * @access  Private (Seller/Brand only)
 */
router.post('/:deliverableId/review', auth, [
    body('action').isIn(['approve', 'request_revision', 'dispute']).withMessage('Action must be: approve, request_revision, or dispute'),
    body('revisionNotes').optional().isString().isLength({ max: 1000 }),
    body('disputeReason').optional().isString().isLength({ max: 2000 }),
    handleValidation
], async (req, res) => {
    try {
        const deliverable = await prisma.collaborationDeliverable.findUnique({
            where: { id: req.params.deliverableId },
            include: {
                collaboration: {
                    include: {
                        matchedCreator: {
                            include: {
                                promotion: { select: { sellerId: true } },
                                creator: { select: { userId: true } }
                            }
                        },
                        escrowPayment: true
                    }
                }
            }
        });

        if (!deliverable) return res.status(404).json({ success: false, message: 'Deliverable not found.' });

        const sellerId = deliverable.collaboration.matchedCreator.promotion.sellerId;
        const creatorId = deliverable.collaboration.matchedCreator.creator.userId;

        if (req.userId !== sellerId) {
            return res.status(403).json({ success: false, message: 'Only the brand can review deliverables.' });
        }

        if (!['SUBMITTED', 'PENDING'].includes(deliverable.status)) {
            return res.status(400).json({ success: false, message: `Deliverable is already in status: ${deliverable.status}` });
        }

        const { action, revisionNotes, disputeReason } = req.body;

        if (action === 'approve') {
            // Update deliverable
            await prisma.collaborationDeliverable.update({
                where: { id: deliverable.id },
                data: { status: 'APPROVED', reviewedAt: new Date(), approvedAt: new Date() }
            });

            // Auto-release escrow
            if (deliverable.collaboration.escrowPayment && ['HELD', 'DEPOSITED'].includes(deliverable.collaboration.escrowPayment.status)) {
                await prisma.escrowPayment.update({
                    where: { id: deliverable.collaboration.escrowPayment.id },
                    data: { status: 'RELEASED', releasedAt: new Date() }
                });

                // Update creator earnings
                await prisma.creatorProfile.updateMany({
                    where: { userId: creatorId },
                    data: { totalEarnings: { increment: deliverable.collaboration.escrowPayment.collaborationAmount } }
                });
            }

            // Mark collaboration COMPLETED
            await prisma.collaboration.update({
                where: { id: deliverable.collaborationId },
                data: { status: 'COMPLETED', completedAt: new Date() }
            });

            // Notify creator
            try {
                const { createNotification } = require('../services/notificationService');
                await createNotification({
                    userId: creatorId,
                    title: 'Deliverables Approved & Payment Released!',
                    message: `Your deliverables were approved. Payment has been released to you.`,
                    type: 'payment_release',
                    link: `/collaborations/${deliverable.collaborationId}`
                });
            } catch (_) { /* non-critical */ }

            return res.json({ success: true, message: 'Deliverables approved. Escrow funds released to creator.' });
        }

        if (action === 'request_revision') {
            const newRevisionCount = deliverable.revisionCount + 1;
            if (newRevisionCount > MAX_REVISIONS) {
                return res.status(400).json({
                    success: false,
                    message: `Maximum ${MAX_REVISIONS} revision requests reached. You must approve or dispute.`
                });
            }

            await prisma.collaborationDeliverable.update({
                where: { id: deliverable.id },
                data: {
                    status: 'REVISION_REQUESTED',
                    revisionCount: newRevisionCount,
                    revisionNotes: revisionNotes || null,
                    reviewedAt: new Date()
                }
            });

            // Notify creator
            try {
                const { createNotification } = require('../services/notificationService');
                await createNotification({
                    userId: creatorId,
                    title: 'Revision Requested',
                    message: `The brand has requested a revision (${newRevisionCount}/${MAX_REVISIONS}). Notes: ${revisionNotes || 'None'}`,
                    type: 'revision_requested',
                    link: `/collaborations/${deliverable.collaborationId}`
                });
            } catch (_) { /* non-critical */ }

            return res.json({
                success: true,
                message: `Revision requested (${newRevisionCount}/${MAX_REVISIONS}).`,
                data: { revisionsRemaining: MAX_REVISIONS - newRevisionCount }
            });
        }

        if (action === 'dispute') {
            if (!disputeReason) {
                return res.status(400).json({ success: false, message: 'Dispute reason is required.' });
            }

            await prisma.collaborationDeliverable.update({
                where: { id: deliverable.id },
                data: { status: 'REJECTED', reviewedAt: new Date() }
            });

            // Mark escrow as disputed
            if (deliverable.collaboration.escrowPayment) {
                await prisma.escrowPayment.update({
                    where: { id: deliverable.collaboration.escrowPayment.id },
                    data: { status: 'DISPUTED' }
                });
            }

            // Create dispute record
            await prisma.collaborationDispute.create({
                data: {
                    collaborationId: deliverable.collaborationId,
                    raisedByUserId: req.userId,
                    reason: disputeReason,
                    evidence: [],
                    status: 'OPEN'
                }
            });

            // Notify admin (broadcast)
            try {
                const { createNotification } = require('../services/notificationService');
                await createNotification({
                    userId: creatorId,
                    title: 'Dispute Opened',
                    message: 'The brand has opened a dispute for your deliverables. Admin will review.',
                    type: 'dispute_opened',
                    link: `/collaborations/${deliverable.collaborationId}`
                });
            } catch (_) { /* non-critical */ }

            return res.json({ success: true, message: 'Dispute opened. Admin will review and resolve.' });
        }
    } catch (err) {
        console.error('Review deliverable error:', err);
        res.status(500).json({ success: false, message: 'Failed to review deliverable' });
    }
});

module.exports = router;
