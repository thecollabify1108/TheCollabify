const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { updateRiskScore } = require('../services/riskScoreService');
const { getSetting, setSetting, isEarlyBirdMode } = require('../services/platformSettingsService');

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
 * @route   GET /api/admin/stats
 * @desc    Get platform statistics
 * @access  Private (Admin)
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
    try {
        const [
            totalUsers,
            totalCreators,
            totalSellers,
            totalRequests,
            activeRequests,
            completedRequests
        ] = await Promise.all([
            prisma.user.count({ where: { isActive: true } }),
            prisma.user.count({ where: { activeRole: 'CREATOR', isActive: true } }),
            prisma.user.count({ where: { activeRole: 'SELLER', isActive: true } }),
            prisma.promotionRequest.count(),
            prisma.promotionRequest.count({ where: { status: { in: ['OPEN', 'CREATOR_INTERESTED', 'ACCEPTED'] } } }),
            prisma.promotionRequest.count({ where: { status: 'COMPLETED' } })
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    creators: totalCreators,
                    sellers: totalSellers
                },
                requests: {
                    total: totalRequests,
                    active: activeRequests,
                    completed: completedRequests
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics'
        });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    List all users with pagination
 * @access  Private (Admin)
 */
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            role,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const where = {};

        if (role && role !== 'all') {
            where.activeRole = role.toUpperCase();
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const orderBy = { [sortBy]: sortOrder.toLowerCase() };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    activeRole: true,
                    isActive: true,
                    avatar: true,
                    subscriptionTier: true,
                    createdAt: true
                },
                orderBy,
                skip,
                take: parseInt(limit)
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users'
        });
    }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details
 * @access  Private (Admin)
 */
router.get('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                email: true,
                activeRole: true,
                isActive: true,
                avatar: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let profile = null;
        if (user.activeRole === 'CREATOR') {
            profile = await prisma.creatorProfile.findUnique({
                where: { userId: user.id }
            });
        }

        res.json({
            success: true,
            data: { user, profile }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user'
        });
    }
});

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Activate or deactivate user
 * @access  Private (Admin)
 */
router.put('/users/:id/status', auth, isAdmin, [
    body('isActive').isBoolean().withMessage('isActive must be a boolean'),
    handleValidation
], async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true
            }
        });

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user with comprehensive data cleanup
 * @access  Private (Admin)
 */
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin accounts
        if (user.activeRole === 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin accounts'
            });
        }



        // With Prisma and PostgreSQL CASCADE, many deletions might be handled by DB.
        // But for safety and explicit cleanup of linked relationships in different tables:

        await prisma.$transaction(async (tx) => {
            // 1. Role-specific cleanup
            if (user.activeRole === 'CREATOR') {
                await tx.creatorProfile.deleteMany({ where: { userId: user.id } });
                // Applications are matchedCreator in our schema
                await tx.matchedCreator.deleteMany({ where: { creatorId: user.id } });
            } else if (user.activeRole === 'SELLER') {
                // Delete conversations and messages linked to promotion requests
                const prompts = await tx.promotionRequest.findMany({ where: { sellerId: user.id } });
                const promptIds = prompts.map(p => p.id);

                await tx.message.deleteMany({
                    where: { conversation: { promotionId: { in: promptIds } } }
                });
                await tx.conversation.deleteMany({ where: { promotionId: { in: promptIds } } });
                await tx.matchedCreator.deleteMany({ where: { promotionId: { in: promptIds } } });
                await tx.promotionRequest.deleteMany({ where: { sellerId: user.id } });
            }

            // 2. Generic cleanup
            await tx.notification.deleteMany({ where: { userId: user.id } });
            
            const userConvos = await tx.conversation.findMany({
                where: { OR: [{ sellerId: user.id }, { creatorUserId: user.id }] },
                select: { id: true }
            });
            const userConvoIds = userConvos.map(c => c.id);
            if (userConvoIds.length > 0) {
                await tx.message.deleteMany({ where: { conversationId: { in: userConvoIds } } });
                await tx.conversationDeletion.deleteMany({ where: { conversationId: { in: userConvoIds } } });
            }
            await tx.message.deleteMany({ where: { senderId: user.id } });

            await tx.conversation.deleteMany({
                where: { OR: [{ sellerId: user.id }, { creatorUserId: user.id }] }
            });

            // 3. Delete user account and lingering isolated tables
            await tx.userRole.deleteMany({ where: { userId: user.id } });
            await tx.analytics.deleteMany({ where: { userId: user.id } });
            await tx.userIntent.deleteMany({ where: { userId: user.id } });
            await tx.apiKey.deleteMany({ where: { userId: user.id } });
            
            await tx.user.delete({ where: { id: user.id } });
        });

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully',
            details: {
                userId: user.id,
                email: user.email,
                role: user.activeRole
            }
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/admin/bulk-delete
 * @desc    Bulk delete users with comprehensive data cleanup
 * @access  Private (Admin)
 */
router.post('/bulk-delete', auth, isAdmin, [
    body('userIds').isArray({ min: 1 }).withMessage('userIds must be a non-empty array'),
    handleValidation
], async (req, res) => {
    try {
        const { userIds } = req.body;

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } }
        });

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found for deletion'
            });
        }

        const adminUsers = users.filter(u => u.activeRole === 'ADMIN');
        if (adminUsers.length > 0) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin accounts',
                adminEmails: adminUsers.map(u => u.email)
            });
        }



        const deletedCount = await prisma.$transaction(async (tx) => {
            let count = 0;
            for (const user of users) {
                // Same logic as single delete but in loop or optimized queries
                if (user.activeRole === 'CREATOR') {
                    await tx.creatorProfile.deleteMany({ where: { userId: user.id } });
                    await tx.matchedCreator.deleteMany({ where: { creatorId: user.id } });
                } else if (user.activeRole === 'SELLER') {
                    const promptIds = (await tx.promotionRequest.findMany({
                        where: { sellerId: user.id },
                        select: { id: true }
                    })).map(p => p.id);

                    // First get conversation IDs related to these promotion requests
                    const conversationIds = (await tx.conversation.findMany({
                        where: { promotionId: { in: promptIds } },
                        select: { id: true }
                    })).map(c => c.id);

                    // Then delete messages within those conversations
                    if (conversationIds.length > 0) {
                        await tx.message.deleteMany({
                            where: { conversationId: { in: conversationIds } }
                        });
                    }
                    await tx.conversation.deleteMany({ where: { promotionId: { in: promptIds } } });
                    await tx.matchedCreator.deleteMany({ where: { promotionId: { in: promptIds } } });
                    await tx.promotionRequest.deleteMany({ where: { sellerId: user.id } });
                }

                await tx.notification.deleteMany({ where: { userId: user.id } });
                
                const userConvos = await tx.conversation.findMany({
                    where: { OR: [{ sellerId: user.id }, { creatorUserId: user.id }] },
                    select: { id: true }
                });
                const userConvoIds = userConvos.map(c => c.id);
                if (userConvoIds.length > 0) {
                    await tx.message.deleteMany({ where: { conversationId: { in: userConvoIds } } });
                    await tx.conversationDeletion.deleteMany({ where: { conversationId: { in: userConvoIds } } });
                }
                await tx.message.deleteMany({ where: { senderId: user.id } });

                await tx.conversation.deleteMany({ where: { OR: [{ sellerId: user.id }, { creatorUserId: user.id }] } });
                
                await tx.userRole.deleteMany({ where: { userId: user.id } });
                await tx.analytics.deleteMany({ where: { userId: user.id } });
                await tx.userIntent.deleteMany({ where: { userId: user.id } });
                await tx.apiKey.deleteMany({ where: { userId: user.id } });

                await tx.user.delete({ where: { id: user.id } });
                count++;
            }
            return count;
        });

        res.json({
            success: true,
            message: `Successfully deleted ${deletedCount} user(s)`
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk delete users',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/admin/requests
 * @desc    List all promotion requests
 * @access  Private (Admin)
 */
router.get('/requests', auth, isAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search
        } = req.query;

        const where = {};

        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }

        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [requests, total] = await Promise.all([
            prisma.promotionRequest.findMany({
                where,
                include: {
                    seller: { select: { name: true, email: true } }
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
 * @route   DELETE /api/admin/requests/:id
 * @desc    Delete promotion request
 * @access  Private (Admin)
 */
router.delete('/requests/:id', auth, isAdmin, async (req, res) => {
    try {
        await prisma.promotionRequest.delete({
            where: { id: req.params.id }
        });

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
 * @route   POST /api/admin/create-admin
 * @desc    Create admin account
 * @access  Private (Admin)
 */
router.post('/create-admin', auth, isAdmin, [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    handleValidation
], async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const bcrypt = require('bcryptjs');

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                activeRole: 'ADMIN'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            data: {
                user: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.activeRole
                }
            }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin account'
        });
    }
});

/**
 * @route   GET /api/admin/insights
 * @desc    Get platform-wide collaboration analytics
 * @access  Private (Admin)
 */
router.get('/insights', auth, isAdmin, async (req, res) => {
    try {
        const AnalyticsService = require('../services/analyticsService');
        const insights = await AnalyticsService.getAdminInsights();

        res.json({
            success: true,
            data: { insights }
        });
    } catch (error) {
        console.error('Get admin insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get insights'
        });
    }
});

// ─── VERIFICATION SYSTEM ─────────────────────────────────────────

/**
 * @route   GET /api/admin/creators/pending-verification
 * @desc    Get creators pending verification (or all with verification data)
 * @access  Private (Admin)
 */
router.get('/creators/pending-verification', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.query; // optional filter: pending | verified | mismatch_flagged
        const where = {};
        if (status) where.verificationStatus = status;

        const creators = await prisma.creatorProfile.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: creators.map(c => ({
                id: c.id,
                userId: c.userId,
                name: c.user?.name || 'Unknown',
                email: c.user?.email || '',
                category: c.category,
                followerCount: c.followerCount,
                selfReportedFollowers: c.selfReportedFollowers,
                engagementRate: c.engagementRate,
                verificationStatus: c.verificationStatus,
                verifiedFollowerRangeMin: c.verifiedFollowerRangeMin,
                verifiedFollowerRangeMax: c.verifiedFollowerRangeMax,
                followerMismatchPercentage: c.followerMismatchPercentage,
                followerRiskScore: c.followerRiskScore,
                verificationLastUpdated: c.verificationLastUpdated,
                verifiedBy: c.verifiedBy,
                compositeRiskScore: c.compositeRiskScore,
                riskLevel: c.riskLevel,
                riskFollowerMismatch: c.riskFollowerMismatch,
                riskEngagementAnomaly: c.riskEngagementAnomaly,
                riskGrowthInstability: c.riskGrowthInstability,
                riskContentInactivity: c.riskContentInactivity,
                createdAt: c.createdAt
            }))
        });
    } catch (error) {
        console.error('Get pending verification error:', error);
        res.status(500).json({ success: false, message: 'Failed to get verification list' });
    }
});

/**
 * @route   POST /api/admin/creators/:id/verify
 * @desc    Admin submits verified follower range for a creator
 * @access  Private (Admin)
 */
router.post('/creators/:id/verify', auth, isAdmin, [
    body('verifiedFollowerRangeMin').isInt({ min: 0 }).withMessage('Min followers must be a non-negative integer'),
    body('verifiedFollowerRangeMax').isInt({ min: 0 }).withMessage('Max followers must be a non-negative integer'),
    handleValidation
], async (req, res) => {
    try {
        const { id } = req.params;
        const { verifiedFollowerRangeMin, verifiedFollowerRangeMax } = req.body;

        if (verifiedFollowerRangeMax < verifiedFollowerRangeMin) {
            return res.status(400).json({
                success: false,
                message: 'Max followers must be greater than or equal to min followers'
            });
        }

        const profile = await prisma.creatorProfile.findUnique({ where: { id } });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Creator profile not found' });
        }

        // Calculate mismatch
        const selfReported = profile.followerCount || profile.selfReportedFollowers || 0;
        const verifiedMid = (verifiedFollowerRangeMin + verifiedFollowerRangeMax) / 2;
        const mismatch = verifiedMid > 0
            ? (Math.abs(selfReported - verifiedMid) / verifiedMid * 100)
            : 0;
        const mismatchRounded = Math.round(mismatch * 100) / 100;

        let riskScore = 'none';
        let verificationStatus = 'verified';
        if (mismatch > 15) {
            riskScore = 'high';
            verificationStatus = 'mismatch_flagged';
        } else if (mismatch > 5) {
            riskScore = 'medium';
        }

        const updated = await prisma.creatorProfile.update({
            where: { id },
            data: {
                verifiedFollowerRangeMin: parseInt(verifiedFollowerRangeMin),
                verifiedFollowerRangeMax: parseInt(verifiedFollowerRangeMax),
                selfReportedFollowers: selfReported,
                followerMismatchPercentage: mismatchRounded,
                followerRiskScore: riskScore,
                verificationStatus,
                verificationLastUpdated: new Date(),
                verifiedBy: req.userId
            }
        });

        res.json({
            success: true,
            data: {
                id: updated.id,
                verificationStatus: updated.verificationStatus,
                followerMismatchPercentage: updated.followerMismatchPercentage,
                followerRiskScore: updated.followerRiskScore,
                verifiedFollowerRangeMin: updated.verifiedFollowerRangeMin,
                verifiedFollowerRangeMax: updated.verifiedFollowerRangeMax,
                verificationLastUpdated: updated.verificationLastUpdated
            }
        });

        // Recalculate composite risk score in background after verification
        updateRiskScore(id).catch(err => console.error('[RiskScore] Post-verification recalc error:', err));
    } catch (error) {
        console.error('Verify creator error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify creator' });
    }
});

// ─── RISK SCORE MANAGEMENT ──────────────────────────────────────

/**
 * @route   POST /api/admin/creators/:id/recalculate-risk
 * @desc    Recalculate composite risk score for a creator
 * @access  Private (Admin)
 */
router.post('/creators/:id/recalculate-risk', auth, isAdmin, async (req, res) => {
    try {
        const riskData = await updateRiskScore(req.params.id);
        if (!riskData) {
            return res.status(404).json({ success: false, message: 'Creator profile not found' });
        }
        res.json({ success: true, data: riskData });
    } catch (error) {
        console.error('Recalculate risk error:', error);
        res.status(500).json({ success: false, message: 'Failed to recalculate risk score' });
    }
});

/**
 * @route   GET /api/admin/creators/:id/risk
 * @desc    Get risk score breakdown for a creator
 * @access  Private (Admin)
 */
router.get('/creators/:id/risk', auth, isAdmin, async (req, res) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                compositeRiskScore: true,
                riskLevel: true,
                riskFollowerMismatch: true,
                riskEngagementAnomaly: true,
                riskGrowthInstability: true,
                riskContentInactivity: true,
                riskLastCalculated: true,
                followerCount: true,
                engagementRate: true,
                verificationStatus: true,
                followerMismatchPercentage: true,
                user: { select: { name: true, email: true } }
            }
        });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Creator profile not found' });
        }
        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Get risk data error:', error);
        res.status(500).json({ success: false, message: 'Failed to get risk data' });
    }
});

// Grant or revoke Pro subscription tier for a user
router.put('/users/:id/subscription', auth, isAdmin, [
    body('tier').isIn(['FREE', 'CREATOR_PRO', 'BRAND_PRO']).withMessage('Invalid subscription tier')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: { subscriptionTier: req.body.tier },
            select: { id: true, name: true, email: true, subscriptionTier: true, activeRole: true }
        });

        // Notify user of Pro upgrade
        if (req.body.tier !== 'FREE' && user.subscriptionTier !== req.body.tier) {
            const tierName = req.body.tier === 'CREATOR_PRO' ? 'Creator Pro' : 'Brand Pro';
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'SYSTEM',
                    title: 'Subscription Upgraded! 🎉',
                    message: `An admin has upgraded your account to ${tierName}. Enjoy your new premium features!`,
                    isRead: false
                }
            });
        }

        res.json({
            success: true,
            message: `Subscription updated to ${req.body.tier}`,
            data: updated
        });
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ success: false, message: 'Failed to update subscription' });
    }
});

// ─── FOLLOWER RANGE MANAGEMENT ───────────────────────────────────

/**
 * @route   PUT /api/admin/creators/:id/follower-range
 * @desc    Admin overrides a creator's follower range enum (bypasses monthly throttle)
 * @access  Private (Admin)
 */
router.put('/creators/:id/follower-range', auth, isAdmin, [
    body('followerRange')
        .isIn(['RANGE_1K_5K', 'RANGE_5K_10K', 'RANGE_10K_50K', 'RANGE_50K_100K', 'RANGE_100K_PLUS'])
        .withMessage('Invalid follower range value'),
    handleValidation
], async (req, res) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({ where: { id: req.params.id } });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Creator profile not found' });
        }

        const updated = await prisma.creatorProfile.update({
            where: { id: req.params.id },
            data: {
                followerRange: req.body.followerRange,
                // Clear the throttle timestamp so the creator can change it again immediately if needed
                followerRangeChangedAt: null
            },
            select: { id: true, followerRange: true, followerRangeChangedAt: true }
        });

        res.json({
            success: true,
            message: `Follower range updated to ${req.body.followerRange}. Throttle cleared.`,
            data: updated
        });
    } catch (error) {
        console.error('Admin follower range update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update follower range' });
    }
});

// ─── AVAILABILITY CAMPAIGN MANAGEMENT ────────────────────────────

/**
 * @route   GET /api/admin/availability-campaigns
 * @desc    List all availability campaigns (for moderation)
 * @access  Private (Admin)
 */
router.get('/availability-campaigns', auth, isAdmin, async (req, res) => {
    try {
        const { isActive, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const [campaigns, total] = await Promise.all([
            prisma.availabilityCampaign.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    creatorProfile: {
                        select: {
                            id: true,
                            user: { select: { id: true, name: true, email: true } }
                        }
                    }
                }
            }),
            prisma.availabilityCampaign.count({ where })
        ]);

        res.json({
            success: true,
            data: { campaigns, total, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        console.error('List availability campaigns error:', error);
        res.status(500).json({ success: false, message: 'Failed to list campaigns' });
    }
});

/**
 * @route   DELETE /api/admin/availability-campaigns/:id
 * @desc    Remove a spam/fake availability campaign
 * @access  Private (Admin)
 */
router.delete('/availability-campaigns/:id', auth, isAdmin, async (req, res) => {
    try {
        const campaign = await prisma.availabilityCampaign.findUnique({
            where: { id: req.params.id }
        });
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        await prisma.availabilityCampaign.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

        res.json({ success: true, message: 'Campaign deactivated successfully' });
    } catch (error) {
        console.error('Delete availability campaign error:', error);
        res.status(500).json({ success: false, message: 'Failed to deactivate campaign' });
    }
});

// ─── DISPUTE MANAGEMENT ──────────────────────────────────────────

/**
 * @route   GET /api/admin/disputes
 * @desc    List all collaboration disputes
 * @access  Private (Admin)
 */
router.get('/disputes', auth, isAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (status) where.status = status;

        const [disputes, total] = await Promise.all([
            prisma.collaborationDispute.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    collaboration: {
                        select: {
                            id: true,
                            status: true,
                            escrowPayment: {
                                select: { id: true, status: true, totalDeposited: true, collaborationAmount: true }
                            }
                        }
                    }
                }
            }),
            prisma.collaborationDispute.count({ where })
        ]);

        res.json({
            success: true,
            data: { disputes, total, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        console.error('List disputes error:', error);
        res.status(500).json({ success: false, message: 'Failed to list disputes' });
    }
});

/**
 * @route   POST /api/admin/disputes/:id/resolve
 * @desc    Resolve a dispute — award funds to creator or refund brand
 * @access  Private (Admin)
 */
router.post('/disputes/:id/resolve', auth, isAdmin, [
    body('resolution')
        .isIn(['RESOLVED_CREATOR', 'RESOLVED_BRAND'])
        .withMessage('resolution must be RESOLVED_CREATOR or RESOLVED_BRAND'),
    body('notes').optional().isString().trim().isLength({ max: 1000 }),
    handleValidation
], async (req, res) => {
    try {
        const { resolution, notes } = req.body;

        const dispute = await prisma.collaborationDispute.findUnique({
            where: { id: req.params.id },
            include: {
                collaboration: {
                    include: {
                        escrowPayment: true
                    }
                }
            }
        });

        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }
        if (dispute.status === 'RESOLVED_CREATOR' || dispute.status === 'RESOLVED_BRAND' || dispute.status === 'CLOSED') {
            return res.status(409).json({ success: false, message: 'Dispute is already resolved' });
        }

        const escrow = dispute.collaboration?.escrowPayment;
        const collaborationId = dispute.collaborationId;

        await prisma.$transaction(async (tx) => {
            // Update dispute status
            await tx.collaborationDispute.update({
                where: { id: req.params.id },
                data: {
                    status: resolution,
                    resolvedByAdminId: req.userId,
                    resolvedAt: new Date(),
                    resolutionNotes: notes || null
                }
            });

            if (escrow) {
                if (resolution === 'RESOLVED_CREATOR') {
                    // Release funds to creator
                    await tx.escrowPayment.update({
                        where: { id: escrow.id },
                        data: { status: 'RELEASED', releasedAt: new Date() }
                    });
                    // Credit creator earnings
                    await tx.creatorProfile.updateMany({
                        where: { userId: escrow.creatorUserId },
                        data: { totalEarnings: { increment: escrow.collaborationAmount } }
                    });
                    // Mark collaboration completed
                    await tx.collaboration.update({
                        where: { id: collaborationId },
                        data: { status: 'COMPLETED' }
                    });
                } else {
                    // Refund brand
                    await tx.escrowPayment.update({
                        where: { id: escrow.id },
                        data: { status: 'REFUNDED', refundedAt: new Date() }
                    });
                    await tx.collaboration.update({
                        where: { id: collaborationId },
                        data: { status: 'CANCELLED' }
                    });
                }
            }
        });

        // Notify both parties
        const { notifyPaymentReleased } = require('../services/notificationService');
        if (escrow && resolution === 'RESOLVED_CREATOR') {
            await notifyPaymentReleased(escrow.creatorUserId, escrow.collaborationAmount, collaborationId).catch(() => {});
        }

        res.json({
            success: true,
            message: `Dispute resolved: ${resolution}`,
            data: { disputeId: req.params.id, resolution, collaborationId }
        });
    } catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ success: false, message: 'Failed to resolve dispute' });
    }
});

// ─── MANUAL ESCROW MANAGEMENT ────────────────────────────────────

/**
 * @route   POST /api/admin/escrow/:id/release
 * @desc    Manually release a held escrow payment (admin override)
 * @access  Private (Admin)
 */
router.post('/escrow/:id/release', auth, isAdmin, async (req, res) => {
    try {
        const escrow = await prisma.escrowPayment.findUnique({
            where: { id: req.params.id },
            include: { collaboration: true }
        });

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow payment not found' });
        }
        if (escrow.status === 'RELEASED') {
            return res.status(409).json({ success: false, message: 'Escrow already released' });
        }
        if (!['HELD', 'DISPUTED'].includes(escrow.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot release escrow in status: ${escrow.status}`
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.escrowPayment.update({
                where: { id: req.params.id },
                data: { status: 'RELEASED', releasedAt: new Date() }
            });

            await tx.creatorProfile.updateMany({
                where: { userId: escrow.creatorUserId },
                data: { totalEarnings: { increment: escrow.collaborationAmount } }
            });

            await tx.collaboration.update({
                where: { id: escrow.collaborationId },
                data: { status: 'COMPLETED' }
            });
        });

        const { notifyPaymentReleased } = require('../services/notificationService');
        await notifyPaymentReleased(escrow.creatorUserId, escrow.collaborationAmount, escrow.collaborationId).catch(() => {});

        res.json({
            success: true,
            message: 'Escrow released by admin',
            data: {
                escrowId: escrow.id,
                collaborationId: escrow.collaborationId,
                amountReleased: escrow.collaborationAmount
            }
        });
    } catch (error) {
        console.error('Admin escrow release error:', error);
        res.status(500).json({ success: false, message: 'Failed to release escrow' });
    }
});

/**
 * @route   POST /api/admin/escrow/:id/refund
 * @desc    Force-refund an escrow payment to brand (admin override)
 * @access  Private (Admin)
 */
router.post('/escrow/:id/refund', auth, isAdmin, [
    body('reason').optional().isString().trim().isLength({ max: 500 }),
    handleValidation
], async (req, res) => {
    try {
        const escrow = await prisma.escrowPayment.findUnique({
            where: { id: req.params.id }
        });

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow payment not found' });
        }
        if (escrow.status === 'REFUNDED') {
            return res.status(409).json({ success: false, message: 'Escrow already refunded' });
        }
        if (!['HELD', 'DEPOSITED', 'DISPUTED'].includes(escrow.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot refund escrow in status: ${escrow.status}`
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.escrowPayment.update({
                where: { id: req.params.id },
                data: { status: 'REFUNDED', refundedAt: new Date() }
            });

            await tx.collaboration.update({
                where: { id: escrow.collaborationId },
                data: { status: 'CANCELLED' }
            });
        });

        res.json({
            success: true,
            message: 'Escrow refunded to brand by admin',
            data: {
                escrowId: escrow.id,
                collaborationId: escrow.collaborationId,
                amountRefunded: escrow.totalDeposited
            }
        });
    } catch (error) {
        console.error('Admin escrow refund error:', error);
        res.status(500).json({ success: false, message: 'Failed to refund escrow' });
    }
});


/**
 * @route   GET /api/admin/settings
 * @desc    Get all platform settings
 * @access  Private (Admin)
 */
router.get('/settings', auth, isAdmin, async (req, res) => {
    try {
        const settings = await prisma.platformSetting.findMany({
            orderBy: { key: 'asc' }
        });
        const earlyBird = await isEarlyBirdMode();
        res.json({
            success: true,
            data: {
                settings,
                earlyBirdMode: earlyBird
            }
        });
    } catch (err) {
        console.error('Get settings error:', err);
        res.status(500).json({ success: false, message: 'Failed to get settings' });
    }
});

/**
 * @route   PUT /api/admin/settings/early-bird
 * @desc    Toggle Early Bird Mode on/off
 * @access  Private (Admin)
 */
router.put('/settings/early-bird', auth, isAdmin, [
    body('enabled').isBoolean().withMessage('enabled must be a boolean')
], handleValidation, async (req, res) => {
    try {
        const { enabled } = req.body;
        await setSetting('EARLY_BIRD_MODE', String(enabled), req.userId);
        res.json({
            success: true,
            message: `Early Bird Mode ${enabled ? 'enabled' : 'disabled'} successfully.`,
            data: { earlyBirdMode: enabled }
        });
    } catch (err) {
        console.error('Toggle early bird error:', err);
        res.status(500).json({ success: false, message: 'Failed to update setting' });
    }
});
module.exports = router;