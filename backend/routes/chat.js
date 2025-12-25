const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

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
 * @route   GET /api/chat/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.userId;

        // Find conversations where user is either seller or creator
        // Exclude conversations deleted by this user
        const conversations = await Conversation.find({
            $or: [
                { sellerId: userId },
                { creatorUserId: userId }
            ],
            status: { $in: ['active', 'pending'] },
            'deletedBy.userId': { $ne: userId }  // Exclude deleted by this user
        })
            .populate('sellerId', 'name email avatar')
            .populate('creatorUserId', 'name email avatar')
            .populate('promotionId', 'title status')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: { conversations }
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversations'
        });
    }
});

/**
 * @route   POST /api/chat/find-or-restore
 * @desc    Find conversation and restore if deleted (for Message button)
 * @access  Private
 */
router.post('/find-or-restore', auth, async (req, res) => {
    try {
        const { promotionId, creatorId } = req.body;
        const userId = req.userId;

        // Find conversation regardless of deletedBy status
        let conversation = await Conversation.findOne({
            promotionId,
            creatorUserId: creatorId
        })
            .populate('sellerId', 'name email avatar')
            .populate('creatorUserId', 'name email avatar')
            .populate('promotionId', 'title status');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found. The creator may not have been accepted yet.'
            });
        }

        // Verify user is part of conversation
        if (conversation.sellerId._id.toString() !== userId.toString() &&
            conversation.creatorUserId._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this conversation'
            });
        }

        // Remove user from deletedBy array if present (restore conversation)
        const wasDeleted = conversation.deletedBy.some(
            d => d.userId.toString() === userId.toString()
        );

        if (wasDeleted) {
            conversation.deletedBy = conversation.deletedBy.filter(
                d => d.userId.toString() !== userId.toString()
            );
            await conversation.save();

            // Re-populate after save
            conversation = await Conversation.findById(conversation._id)
                .populate('sellerId', 'name email avatar')
                .populate('creatorUserId', 'name email avatar')
                .populate('promotionId', 'title status');
        }

        res.json({
            success: true,
            data: { conversation, wasRestored: wasDeleted }
        });
    } catch (error) {
        console.error('Find or restore conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to find conversation'
        });
    }
});

/**
 * @route   GET /api/chat/conversations/:id
 * @desc    Get a specific conversation
 * @access  Private
 */
router.get('/conversations/:id', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('sellerId', 'name email avatar')
            .populate('creatorUserId', 'name email avatar')
            .populate('promotionId', 'title description status');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is part of conversation
        const userId = req.userId.toString();
        if (conversation.sellerId._id.toString() !== userId &&
            conversation.creatorUserId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this conversation'
            });
        }

        res.json({
            success: true,
            data: { conversation }
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversation'
        });
    }
});

/**
 * @route   GET /api/chat/conversations/:id/messages
 * @desc    Get messages for a conversation
 * @access  Private
 */
router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is part of conversation
        const userId = req.userId.toString();
        if (conversation.sellerId.toString() !== userId &&
            conversation.creatorUserId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this conversation'
            });
        }

        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversationId: req.params.id })
            .populate('senderId', 'name avatar')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Mark messages as read
        const isSeller = conversation.sellerId.toString() === userId;
        await Message.updateMany(
            {
                conversationId: req.params.id,
                senderId: { $ne: req.userId },
                isRead: false
            },
            { isRead: true, readAt: new Date() }
        );

        // Reset unread count
        if (isSeller) {
            conversation.unreadCountSeller = 0;
        } else {
            conversation.unreadCountCreator = 0;
        }
        await conversation.save();

        res.json({
            success: true,
            data: { messages }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages'
        });
    }
});

/**
 * @route   POST /api/chat/conversations/:id/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/conversations/:id/messages', auth, [
    body('content').trim().notEmpty().withMessage('Message content is required')
        .isLength({ max: 2000 }).withMessage('Message too long'),
    handleValidation
], async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is part of conversation
        const userId = req.userId.toString();
        const isSeller = conversation.sellerId.toString() === userId;
        const isCreator = conversation.creatorUserId.toString() === userId;

        if (!isSeller && !isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this conversation'
            });
        }

        // Create message
        const message = await Message.create({
            conversationId: req.params.id,
            senderId: req.userId,
            content: req.body.content
        });

        // Update conversation with last message
        conversation.lastMessage = {
            content: req.body.content.substring(0, 100),
            senderId: req.userId,
            createdAt: new Date()
        };

        // Increment unread count for the other party
        if (isSeller) {
            conversation.unreadCountCreator += 1;
        } else {
            conversation.unreadCountSeller += 1;
        }

        await conversation.save();

        // Populate sender info for response
        await message.populate('senderId', 'name avatar');

        res.status(201).json({
            success: true,
            data: { message }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get total unread message count
 * @access  Private
 */
router.get('/unread-count', auth, async (req, res) => {
    try {
        const userId = req.userId;

        // Get conversations where user is seller
        const sellerConvos = await Conversation.find({ sellerId: userId });
        const sellerUnread = sellerConvos.reduce((acc, c) => acc + c.unreadCountSeller, 0);

        // Get conversations where user is creator
        const creatorConvos = await Conversation.find({ creatorUserId: userId });
        const creatorUnread = creatorConvos.reduce((acc, c) => acc + c.unreadCountCreator, 0);

        res.json({
            success: true,
            data: { unreadCount: sellerUnread + creatorUnread }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
});

/**
 * @route   PUT /api/chat/messages/:messageId
 * @desc    Edit a message
 * @access  Private
 */
router.put('/messages/:messageId', auth, [
    body('content').trim().notEmpty().withMessage('Message content is required')
        .isLength({ max: 2000 }).withMessage('Message too long'),
    handleValidation
], async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can edit
        if (message.senderId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own messages'
            });
        }

        // Can't edit deleted messages
        if (message.isDeleted) {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit a deleted message'
            });
        }

        message.content = req.body.content;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        await message.populate('senderId', 'name avatar');

        res.json({
            success: true,
            data: { message }
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to edit message'
        });
    }
});

/**
 * @route   DELETE /api/chat/messages/:messageId
 * @desc    Delete a message (soft delete)
 * @access  Private
 */
router.delete('/messages/:messageId', auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can delete
        if (message.senderId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = 'This message was deleted';
        await message.save();

        res.json({
            success: true,
            message: 'Message deleted'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
});

/**
 * @route   DELETE /api/chat/conversations/:id
 * @desc    Delete conversation (one-sided - only removes from user's view)
 * @access  Private
 */
router.delete('/conversations/:id', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is part of conversation
        const userId = req.userId.toString();
        if (conversation.sellerId.toString() !== userId &&
            conversation.creatorUserId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this conversation'
            });
        }

        // Add user to deletedBy array (one-sided delete)
        const alreadyDeleted = conversation.deletedBy.some(
            d => d.userId.toString() === userId
        );

        if (!alreadyDeleted) {
            conversation.deletedBy.push({
                userId: req.userId,
                deletedAt: new Date()
            });
            await conversation.save();
        }

        res.json({
            success: true,
            message: 'Conversation deleted from your view'
        });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete conversation'
        });
    }
});

module.exports = router;
