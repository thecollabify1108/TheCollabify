/**
 * Escrow Payment Routes
 *
 * Flow:
 *   1. Brand deposits (collaboration amount + platform fee) → status DEPOSITED
 *   2. Chat unlocks fully (isEscrowUnlocked = true on Conversation)
 *   3. Admin or auto-release sends funds to creator → status RELEASED
 *   4. Platform retains fee.
 *
 * Platform fee: 10% of collaboration amount (configurable via env)
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');

const PLATFORM_FEE_RATE = parseFloat(process.env.PLATFORM_FEE_RATE || '0.10'); // 10% default

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
};

/**
 * @route   POST /api/escrow/initiate
 * @desc    Brand initiates escrow deposit for a collaboration
 * @access  Private (Seller/Brand)
 */
router.post('/initiate', auth, [
    body('collaborationId').isUUID().withMessage('Valid collaboration ID is required'),
    body('agreedAmount').isFloat({ min: 1 }).withMessage('Agreed amount must be positive'),
    handleValidation
], async (req, res) => {
    try {
        const { collaborationId, agreedAmount } = req.body;

        // Fetch collaboration and verify brand ownership
        const collaboration = await prisma.collaboration.findUnique({
            where: { id: collaborationId },
            include: {
                matchedCreator: {
                    include: {
                        promotion: { select: { sellerId: true, title: true } },
                        creator: { select: { userId: true, user: { select: { email: true, name: true } } } }
                    }
                }
            }
        });

        if (!collaboration) {
            return res.status(404).json({ success: false, message: 'Collaboration not found.' });
        }

        const sellerId = collaboration.matchedCreator.promotion.sellerId;
        if (sellerId !== req.userId) {
            return res.status(403).json({ success: false, message: 'Only the brand can initiate escrow.' });
        }

        // Only allow escrow if status is AGREED or IN_PROGRESS
        if (!['AGREED', 'IN_PROGRESS', 'ACCEPTED', 'IN_DISCUSSION'].includes(collaboration.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot initiate escrow at status: ${collaboration.status}. Collaboration must be agreed upon first.`
            });
        }

        // Check if escrow already exists
        const existing = await prisma.escrowPayment.findUnique({ where: { collaborationId } });
        if (existing && existing.status !== 'PENDING_DEPOSIT') {
            return res.status(400).json({
                success: false,
                message: `Escrow already exists with status: ${existing.status}`
            });
        }

        const amount = parseFloat(agreedAmount);
        const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
        const total = Math.round((amount + platformFee) * 100) / 100;
        const creatorUserId = collaboration.matchedCreator.creator.userId;

        // Create or update escrow record
        const escrow = existing
            ? await prisma.escrowPayment.update({
                where: { collaborationId },
                data: { collaborationAmount: amount, platformFee, totalDeposited: total, status: 'PENDING_DEPOSIT' }
            })
            : await prisma.escrowPayment.create({
                data: {
                    collaborationId,
                    brandUserId: req.userId,
                    creatorUserId,
                    collaborationAmount: amount,
                    platformFee,
                    totalDeposited: total,
                    status: 'PENDING_DEPOSIT'
                }
            });

        res.status(201).json({
            success: true,
            message: 'Escrow initiated. Complete payment to unlock full collaboration features.',
            data: {
                escrow,
                breakdown: {
                    collaborationAmount: amount,
                    platformFee,
                    totalToPay: total,
                    feeRate: `${(PLATFORM_FEE_RATE * 100).toFixed(0)}%`
                }
            }
        });
    } catch (err) {
        console.error('Initiate escrow error:', err);
        res.status(500).json({ success: false, message: 'Failed to initiate escrow' });
    }
});

/**
 * @route   POST /api/escrow/:escrowId/confirm-deposit
 * @desc    Confirm escrow deposit (called after payment success; also accepts Stripe payment intent ID)
 * @access  Private (Seller/Brand)
 */
router.post('/:escrowId/confirm-deposit', auth, [
    body('stripePaymentIntentId').optional().isString(),
    handleValidation
], async (req, res) => {
    try {
        const escrow = await prisma.escrowPayment.findUnique({ where: { id: req.params.escrowId } });
        if (!escrow) return res.status(404).json({ success: false, message: 'Escrow not found.' });
        if (escrow.brandUserId !== req.userId) return res.status(403).json({ success: false, message: 'Not authorized.' });
        if (escrow.status !== 'PENDING_DEPOSIT') {
            return res.status(400).json({ success: false, message: `Escrow already in status: ${escrow.status}` });
        }

        // Update escrow to HELD
        const updated = await prisma.escrowPayment.update({
            where: { id: escrow.id },
            data: {
                status: 'HELD',
                depositedAt: new Date(),
                stripePaymentIntentId: req.body.stripePaymentIntentId || null
            }
        });

        // Unlock full chat on the conversation linked to this collaboration
        const collaboration = await prisma.collaboration.findUnique({
            where: { id: escrow.collaborationId },
            include: { matchedCreator: { include: { promotion: true } } }
        });
        if (collaboration) {
            await prisma.conversation.updateMany({
                where: {
                    promotionId: collaboration.matchedCreator.promotionId,
                    creatorUserId: escrow.creatorUserId,
                    sellerId: escrow.brandUserId
                },
                data: { isEscrowUnlocked: true }
            });
        }

        // Send notification to creator
        try {
            const { createNotification } = require('../services/notificationService');
            await createNotification({
                userId: escrow.creatorUserId,
                title: 'Escrow Payment Received',
                message: `A brand has deposited ₹${escrow.collaborationAmount} into escrow. Full chat is now unlocked.`,
                type: 'escrow_payment',
                link: `/collaborations/${escrow.collaborationId}`
            });
        } catch (notifErr) {
            console.warn('[Notification] Escrow deposit notify failed:', notifErr.message);
        }

        res.json({
            success: true,
            message: 'Escrow deposit confirmed. Full messaging is now unlocked.',
            data: { escrow: updated }
        });
    } catch (err) {
        console.error('Confirm escrow deposit error:', err);
        res.status(500).json({ success: false, message: 'Failed to confirm escrow deposit' });
    }
});

/**
 * @route   GET /api/escrow/:collaborationId
 * @desc    Get escrow status for a collaboration
 * @access  Private
 */
router.get('/:collaborationId', auth, async (req, res) => {
    try {
        const escrow = await prisma.escrowPayment.findUnique({
            where: { collaborationId: req.params.collaborationId }
        });
        if (!escrow) return res.status(404).json({ success: false, message: 'No escrow found for this collaboration.' });

        // Only brand or creator can view
        if (escrow.brandUserId !== req.userId && escrow.creatorUserId !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        res.json({ success: true, data: { escrow } });
    } catch (err) {
        console.error('Get escrow error:', err);
        res.status(500).json({ success: false, message: 'Failed to get escrow' });
    }
});

/**
 * @route   POST /api/escrow/:escrowId/release
 * @desc    Release escrow funds to creator (called after brand approves deliverables)
 * @access  Private (Seller/Brand)
 */
router.post('/:escrowId/release', auth, async (req, res) => {
    try {
        const escrow = await prisma.escrowPayment.findUnique({
            where: { id: req.params.escrowId },
            include: { collaboration: true }
        });
        if (!escrow) return res.status(404).json({ success: false, message: 'Escrow not found.' });
        if (escrow.brandUserId !== req.userId) return res.status(403).json({ success: false, message: 'Only the brand can release funds.' });
        if (escrow.status !== 'HELD' && escrow.status !== 'DEPOSITED') {
            return res.status(400).json({ success: false, message: `Cannot release from status: ${escrow.status}` });
        }

        const updated = await prisma.escrowPayment.update({
            where: { id: escrow.id },
            data: { status: 'RELEASED', releasedAt: new Date() }
        });

        // Update collaboration status to COMPLETED
        await prisma.collaboration.update({
            where: { id: escrow.collaborationId },
            data: { status: 'COMPLETED', completedAt: new Date() }
        });

        // Update creator earnings
        await prisma.creatorProfile.updateMany({
            where: { userId: escrow.creatorUserId },
            data: { totalEarnings: { increment: escrow.collaborationAmount } }
        });

        // Notify creator of payment release
        try {
            const { createNotification } = require('../services/notificationService');
            await createNotification({
                userId: escrow.creatorUserId,
                title: 'Payment Released!',
                message: `₹${escrow.collaborationAmount} has been released to you. Thank you for your collaboration!`,
                type: 'payment_release',
                link: `/collaborations/${escrow.collaborationId}`
            });
        } catch (notifErr) {
            console.warn('[Notification] Payment release notify failed:', notifErr.message);
        }

        res.json({
            success: true,
            message: `₹${escrow.collaborationAmount} released to creator. Platform fee ₹${escrow.platformFee} retained.`,
            data: { escrow: updated }
        });
    } catch (err) {
        console.error('Release escrow error:', err);
        res.status(500).json({ success: false, message: 'Failed to release escrow' });
    }
});

/**
 * @route   POST /api/escrow/:escrowId/refund
 * @desc    Refund escrow to brand (admin or if cancelled)
 * @access  Private (Admin)
 */
router.post('/:escrowId/refund', auth, async (req, res) => {
    try {
        // Only admins or in valid states
        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { activeRole: true } });
        if (user?.activeRole !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Admin access required to refund.' });
        }

        const escrow = await prisma.escrowPayment.findUnique({ where: { id: req.params.escrowId } });
        if (!escrow) return res.status(404).json({ success: false, message: 'Escrow not found.' });
        if (!['HELD', 'DEPOSITED', 'DISPUTED'].includes(escrow.status)) {
            return res.status(400).json({ success: false, message: `Cannot refund from status: ${escrow.status}` });
        }

        const updated = await prisma.escrowPayment.update({
            where: { id: escrow.id },
            data: { status: 'REFUNDED', refundedAt: new Date(), notes: req.body.notes || null }
        });

        // Notify both parties
        try {
            const { createNotification } = require('../services/notificationService');
            await Promise.allSettled([
                createNotification({ userId: escrow.brandUserId, title: 'Escrow Refunded', message: `₹${escrow.totalDeposited} has been refunded to you.`, type: 'escrow_refund', link: `/collaborations/${escrow.collaborationId}` }),
                createNotification({ userId: escrow.creatorUserId, title: 'Escrow Refunded', message: 'The escrow for this collaboration has been refunded to the brand.', type: 'escrow_refund', link: `/collaborations/${escrow.collaborationId}` })
            ]);
        } catch (_) { /* non-critical */ }

        res.json({ success: true, message: 'Escrow refunded.', data: { escrow: updated } });
    } catch (err) {
        console.error('Refund escrow error:', err);
        res.status(500).json({ success: false, message: 'Failed to refund escrow' });
    }
});

module.exports = router;
