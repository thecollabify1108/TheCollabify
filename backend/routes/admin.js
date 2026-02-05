const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

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
            prisma.user.count({ where: { role: 'CREATOR', isActive: true } }),
            prisma.user.count({ where: { role: 'SELLER', isActive: true } }),
            prisma.promotionRequest.count(),
            prisma.promotionRequest.count({ where: { status: { in: ['OPEN', 'INTERESTED', 'ACCEPTED'] } } }),
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
            where.role = role.toUpperCase();
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
                    role: true,
                    activeRole: true,
                    isActive: true,
                    avatar: true,
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
                role: true,
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
        if (user.role === 'CREATOR') {
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
        if (user.role === 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin accounts'
            });
        }

        console.log(`Starting comprehensive deletion for user: ${user.email} (${user.role})`);

        // With Prisma and PostgreSQL CASCADE, many deletions might be handled by DB.
        // But for safety and explicit cleanup of linked relationships in different tables:

        await prisma.$transaction(async (tx) => {
            // 1. Role-specific cleanup
            if (user.role === 'CREATOR') {
                await tx.creatorProfile.deleteMany({ where: { userId: user.id } });
                // Applications are matchedCreator in our schema
                await tx.matchedCreator.deleteMany({ where: { creatorId: user.id } });
            } else if (user.role === 'SELLER') {
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
            await tx.message.deleteMany({
                where: { OR: [{ senderId: user.id }, { receiverId: user.id }] }
            });
            await tx.conversation.deleteMany({
                where: { OR: [{ sellerId: user.id }, { creatorUserId: user.id }] }
            });

            // 3. Delete user account
            await tx.user.delete({ where: { id: user.id } });
        });

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully',
            details: {
                userId: user.id,
                email: user.email,
                role: user.role
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

        const adminUsers = users.filter(u => u.role === 'ADMIN');
        if (adminUsers.length > 0) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin accounts',
                adminEmails: adminUsers.map(u => u.email)
            });
        }

        console.log(`Starting bulk deletion for ${users.length} users`);

        const deletedCount = await prisma.$transaction(async (tx) => {
            let count = 0;
            for (const user of users) {
                // Same logic as single delete but in loop or optimized queries
                if (user.role === 'CREATOR') {
                    await tx.creatorProfile.deleteMany({ where: { userId: user.id } });
                    await tx.matchedCreator.deleteMany({ where: { creatorId: user.id } });
                } else if (user.role === 'SELLER') {
                    const promptIds = (await tx.promotionRequest.findMany({
                        where: { sellerId: user.id },
                        select: { id: true }
                    })).map(p => p.id);

                    await tx.message.deleteMany({ where: { conversation: { promotionId: { in: promptIds } } } });
                    await tx.conversation.deleteMany({ where: { promotionId: { in: promptIds } } });
                    await tx.matchedCreator.deleteMany({ where: { promotionId: { in: promptIds } } });
                    await tx.promotionRequest.deleteMany({ where: { sellerId: user.id } });
                }

                await tx.notification.deleteMany({ where: { userId: user.id } });
                await tx.message.deleteMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] } });
                await tx.conversation.deleteMany({ where: { OR: [{ sellerId: user.id }, { creatorUserId: user.id }] } });
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
                role: 'ADMIN',
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
                    role: admin.role
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

module.exports = router;
