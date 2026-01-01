const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const CreatorProfile = require('../models/CreatorProfile');
const PromotionRequest = require('../models/PromotionRequest');
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
            User.countDocuments({ isActive: true }),
            User.countDocuments({ role: 'creator', isActive: true }),
            User.countDocuments({ role: 'seller', isActive: true }),
            PromotionRequest.countDocuments(),
            PromotionRequest.countDocuments({ status: { $in: ['Open', 'Creator Interested', 'Accepted'] } }),
            PromotionRequest.countDocuments({ status: 'Completed' })
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

        const query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
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
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let profile = null;
        if (user.role === 'creator') {
            profile = await CreatorProfile.findOne({ userId: user._id });
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

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user with comprehensive data cleanup (production-ready)
 * @access  Private (Admin)
 */
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin accounts
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin accounts'
            });
        }

        console.log(`Starting comprehensive deletion for user: ${user.email} (${user.role})`);

        // Import required models
        const Notification = require('../models/Notification');
        const Conversation = require('../models/Conversation');
        const Message = require('../models/Message');

        // 1. Delete role-specific data
        if (user.role === 'creator') {
            // Delete creator profile
            await CreatorProfile.deleteOne({ userId: user._id });
            console.log('✓ Deleted creator profile');

            // Delete all applications by this creator
            const Application = require('../models/PromotionRequest');
            await Application.updateMany(
                { 'applications.creatorId': user._id },
                { $pull: { applications: { creatorId: user._id } } }
            );
            console.log('✓ Removed creator applications from promotions');

        } else if (user.role === 'seller') {
            // Delete all promotions created by this seller
            const deletedPromotions = await PromotionRequest.deleteMany({ sellerId: user._id });
            console.log(`✓ Deleted ${deletedPromotions.deletedCount} promotions`);
        }

        // 2. Delete all notifications for this user
        const deletedNotifications = await Notification.deleteMany({ userId: user._id });
        console.log(`✓ Deleted ${deletedNotifications.deletedCount} notifications`);

        // 3. Delete all conversations involving this user
        const conversations = await Conversation.find({
            $or: [
                { creatorId: user._id },
                { sellerId: user._id }
            ]
        });

        if (conversations.length > 0) {
            // Delete all messages in these conversations
            const conversationIds = conversations.map(c => c._id);
            const deletedMessages = await Message.deleteMany({ conversationId: { $in: conversationIds } });
            console.log(`✓ Deleted ${deletedMessages.deletedCount} messages`);

            // Delete the conversations
            const deletedConversations = await Conversation.deleteMany({
                $or: [
                    { creatorId: user._id },
                    { sellerId: user._id }
                ]
            });
            console.log(`✓ Deleted ${deletedConversations.deletedCount} conversations`);
        }

        // 4. Delete user account
        await User.deleteOne({ _id: user._id });
        console.log('✓ Deleted user account');

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully',
            details: {
                userId: user._id,
                email: user.email,
                role: user.role,
                deletedAt: new Date().toISOString()
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
    body('userIds.*').isMongoId().withMessage('Invalid user ID format'),
    handleValidation
], async (req, res) => {
    try {
        const { userIds } = req.body;

        // Fetch all users to be deleted
        const users = await User.find({ _id: { $in: userIds } });

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found for deletion'
            });
        }

        // Prevent deleting admin accounts
        const adminUsers = users.filter(u => u.role === 'admin');
        if (adminUsers.length > 0) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin accounts',
                adminEmails: adminUsers.map(u => u.email)
            });
        }

        console.log(`Starting bulk deletion for ${users.length} users`);

        // Import required models
        const Notification = require('../models/Notification');
        const Conversation = require('../models/Conversation');
        const Message = require('../models/Message');

        let deletedCount = {
            users: 0,
            creatorProfiles: 0,
            promotions: 0,
            notifications: 0,
            conversations: 0,
            messages: 0
        };

        // Process each user
        for (const user of users) {
            try {
                // 1. Delete role-specific data
                if (user.role === 'creator') {
                    const profileResult = await CreatorProfile.deleteOne({ userId: user._id });
                    deletedCount.creatorProfiles += profileResult.deletedCount || 0;

                    // Remove creator applications from promotions
                    await PromotionRequest.updateMany(
                        { 'applications.creatorId': user._id },
                        { $pull: { applications: { creatorId: user._id } } }
                    );

                } else if (user.role === 'seller') {
                    const promoResult = await PromotionRequest.deleteMany({ sellerId: user._id });
                    deletedCount.promotions += promoResult.deletedCount || 0;
                }

                // 2. Delete notifications
                const notifResult = await Notification.deleteMany({ userId: user._id });
                deletedCount.notifications += notifResult.deletedCount || 0;

                // 3. Delete conversations and messages
                const conversations = await Conversation.find({
                    $or: [
                        { creatorId: user._id },
                        { sellerId: user._id }
                    ]
                });

                if (conversations.length > 0) {
                    const conversationIds = conversations.map(c => c._id);
                    const msgResult = await Message.deleteMany({ conversationId: { $in: conversationIds } });
                    deletedCount.messages += msgResult.deletedCount || 0;

                    const convResult = await Conversation.deleteMany({
                        $or: [
                            { creatorId: user._id },
                            { sellerId: user._id }
                        ]
                    });
                    deletedCount.conversations += convResult.deletedCount || 0;
                }

                // 4. Delete user account
                await User.deleteOne({ _id: user._id });
                deletedCount.users++;

                console.log(`✓ Deleted user: ${user.email}`);
            } catch (userError) {
                console.error(`Error deleting user ${user.email}:`, userError);
            }
        }

        console.log('Bulk deletion completed:', deletedCount);

        res.json({
            success: true,
            message: `Successfully deleted ${deletedCount.users} user(s)`,
            details: deletedCount
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

        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const [requests, total] = await Promise.all([
            PromotionRequest.find(query)
                .populate('sellerId', 'name email')
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
 * @route   DELETE /api/admin/requests/:id
 * @desc    Delete promotion request (fake requests)
 * @access  Private (Admin)
 */
router.delete('/requests/:id', auth, isAdmin, async (req, res) => {
    try {
        const request = await PromotionRequest.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Promotion request not found'
            });
        }

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
 * @desc    Create admin account (use with caution)
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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const admin = await User.create({
            email,
            password,
            name,
            role: 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            data: {
                user: {
                    id: admin._id,
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
