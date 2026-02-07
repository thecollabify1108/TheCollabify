const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
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
 * @route   PUT /api/chat/pgp-key
 * @desc    Update user's PGP public key
 * @access  Private
 */
router.put('/pgp-key', auth, [
    body('publicKey').trim().notEmpty().withMessage('Public key is required')
        .contains('-----BEGIN PGP PUBLIC KEY BLOCK-----').withMessage('Invalid PGP key format'),
    handleValidation
], async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.userId },
            data: { pgpPublicKey: req.body.publicKey }
        });

        res.json({
            success: true,
            message: 'PGP public key updated successfully'
        });
    } catch (error) {
        console.error('Update PGP key error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update PGP key'
        });
    }
});

/**
 * @route   GET /api/chat/pgp-key/:userId
 * @desc    Get a user's PGP public key
 * @access  Private
 */
router.get('/pgp-key/:userId', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.userId },
            select: { pgpPublicKey: true, name: true }
        });

        if (!user || !user.pgpPublicKey) {
            return res.status(404).json({
                success: false,
                message: 'PGP key not found for this user'
            });
        }

        res.json({
            success: true,
            data: { publicKey: user.pgpPublicKey, name: user.name }
        });
    } catch (error) {
        console.error('Get PGP key error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get PGP key'
        });
    }
});

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
// Get all conversations for a user
router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.user.activeRole;

        const where = userRole === 'SELLER'
            ? { sellerId: userId }
            : { creatorUserId: userId };

        // We only show conversations that are NOT deleted by this user
        // Using Prisma's JSON filtering for deletedBy array
        // However, since deletedBy is likely an array of objects, we might need a better way.
        // For simplicity, let's assume we filter them in memory or use a direct check if possible.
        // Actually, let's just fetch all and filter for now, or use JSON path if supported.

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [conversations, total] = await Promise.all([
            prisma.conversation.findMany({
                where: {
                    ...where,
                    NOT: {
                        deletedBy: {
                            path: ['$[*]'],
                            array_contains: { userId: userId }
                        }
                    }
                },
                select: {
                    id: true,
                    status: true,
                    lastMessage: true,
                    lastMessageAt: true,
                    unreadCountSeller: true,
                    unreadCountCreator: true,
                    updatedAt: true,
                    acceptanceStatus: true,
                    sellerId: true,
                    creatorUserId: true,
                    seller: {
                        select: { id: true, name: true, email: true, avatar: true }
                    },
                    creatorUser: {
                        select: { id: true, name: true, email: true, avatar: true }
                    },
                    promotion: {
                        select: { id: true, title: true, status: true }
                    }
                },
                orderBy: { updatedAt: 'desc' },
                skip: skip,
                take: limit
            }),
            prisma.conversation.count({
                where: {
                    ...where,
                    NOT: {
                        deletedBy: {
                            path: ['$[*]'],
                            array_contains: { userId: userId }
                        }
                    }
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                conversations,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations'
        });
    }
});

// Send message request (seller to creator)
router.post('/message-request', auth, async (req, res) => {
    try {
        const sellerId = req.userId;
        const { creatorId } = req.body;

        if (req.user.activeRole !== 'SELLER') {
            return res.status(403).json({
                success: false,
                message: 'Only sellers can send message requests'
            });
        }

        // Check if conversation already exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                sellerId: sellerId,
                creatorUserId: creatorId
            },
            include: {
                seller: { select: { id: true, name: true, email: true } },
                creatorUser: { select: { id: true, name: true, email: true } }
            }
        });

        if (conversation) {
            return res.json({
                success: true,
                data: { conversation },
                message: conversation.status === 'PENDING'
                    ? 'Message request already sent'
                    : 'Conversation already exists'
            });
        }

        // Find creator profile to get profileId
        const creatorProfile = await prisma.creatorProfile.findFirst({
            where: { userId: creatorId }
        });

        if (!creatorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Creator profile not found'
            });
        }

        // Create new conversation with pending status
        conversation = await prisma.conversation.create({
            data: {
                sellerId: sellerId,
                creatorUserId: creatorId,
                creatorProfileId: creatorProfile.id,
                status: 'PENDING',
                lastMessage: 'Message request sent'
            },
            include: {
                seller: { select: { id: true, name: true, email: true } },
                creatorUser: { select: { id: true, name: true, email: true } }
            }
        });

        res.json({
            success: true,
            data: { conversation },
            message: 'Message request sent successfully'
        });
    } catch (error) {
        console.error('Send message request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message request'
        });
    }
});

// Accept message request (creator only)
router.post('/message-request/:conversationId/accept', auth, async (req, res) => {
    try {
        const creatorId = req.userId;
        const { conversationId } = req.params;

        if (req.user.activeRole !== 'CREATOR') {
            return res.status(403).json({
                success: false,
                message: 'Only creators can accept message requests'
            });
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                creatorUserId: creatorId,
                status: 'PENDING'
            }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Message request not found'
            });
        }

        const updatedConversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                status: 'ACTIVE',
                lastMessage: 'Request accepted',
                acceptanceStatus: { byCreator: 'accepted' }
            },
            include: {
                seller: { select: { id: true, name: true, email: true } },
                creatorUser: { select: { id: true, name: true, email: true } }
            }
        });

        res.json({
            success: true,
            data: { conversation: updatedConversation },
            message: 'Message request accepted'
        });
    } catch (error) {
        console.error('Accept message request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept message request'
        });
    }
});

// Reject message request (creator only)
router.post('/message-request/:conversationId/reject', auth, async (req, res) => {
    try {
        const creatorId = req.userId;
        const { conversationId } = req.params;

        if (req.user.activeRole !== 'CREATOR') {
            return res.status(403).json({
                success: false,
                message: 'Only creators can reject message requests'
            });
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                creatorUserId: creatorId,
                status: 'PENDING'
            }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Message request not found'
            });
        }

        // Delete the conversation
        await prisma.conversation.delete({
            where: { id: conversationId }
        });

        res.json({
            success: true,
            message: 'Message request rejected'
        });
    } catch (error) {
        console.error('Reject message request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject message request'
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

        // Find conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                promotionId: promotionId,
                creatorUserId: creatorId
            },
            include: {
                seller: { select: { id: true, name: true, email: true, avatar: true } },
                creatorUser: { select: { id: true, name: true, email: true, avatar: true } },
                promotion: { select: { id: true, title: true, status: true } }
            }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found. The creator may not have been accepted yet.'
            });
        }

        // Verify user is part of conversation
        if (conversation.sellerId !== userId && conversation.creatorUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this conversation'
            });
        }

        // Restore logic: remove user from deletedBy if present
        const deletedByList = conversation.deletedBy || [];
        const wasDeleted = deletedByList.some(d => d.userId === userId);

        if (wasDeleted) {
            const updatedDeletedBy = deletedByList.filter(d => d.userId !== userId);
            conversation = await prisma.conversation.update({
                where: { id: conversation.id },
                data: { deletedBy: updatedDeletedBy },
                include: {
                    seller: { select: { id: true, name: true, email: true, avatar: true } },
                    creatorUser: { select: { id: true, name: true, email: true, avatar: true } },
                    promotion: { select: { id: true, title: true, status: true } }
                }
            });
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
        const conversation = await prisma.conversation.findUnique({
            where: { id: req.params.id },
            include: {
                seller: { select: { id: true, name: true, email: true, avatar: true } },
                creatorUser: { select: { id: true, name: true, email: true, avatar: true } },
                promotion: { select: { id: true, title: true, description: true, status: true } }
            }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is part of conversation
        const userId = req.userId;
        if (conversation.sellerId !== userId && conversation.creatorUserId !== userId) {
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
        const conversationId = req.params.id;
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is part of conversation
        const userId = req.userId;
        if (conversation.sellerId !== userId && conversation.creatorUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this conversation'
            });
        }

        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await prisma.message.findMany({
            where: { conversationId: conversationId },
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: 'asc' },
            skip: skip,
            take: parseInt(limit)
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId: conversationId,
                senderId: { not: userId },
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        // Reset unread count
        const isSeller = conversation.sellerId === userId;
        const updateData = isSeller ? { unreadCountSeller: 0 } : { unreadCountCreator: 0 };

        await prisma.conversation.update({
            where: { id: conversationId },
            data: updateData
        });

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
        const conversationId = req.params.id;
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is part of conversation
        const userId = req.userId;
        const isSeller = conversation.sellerId === userId;
        const isCreator = conversation.creatorUserId === userId;

        if (!isSeller && !isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this conversation'
            });
        }

        // Check if conversation is accepted by creator
        if (conversation.acceptanceStatus?.byCreator !== 'accepted' && conversation.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Creator has not accepted this conversation yet',
                isPending: true
            });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId: conversationId,
                senderId: userId,
                receiverId: isSeller ? conversation.creatorUserId : conversation.sellerId,
                content: req.body.content,
                messageType: req.body.messageType || 'TEXT',
                isEncrypted: req.body.isEncrypted || false,
                encryptionVersion: req.body.encryptionVersion || '1.0'
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            }
        });

        // Update conversation with last message and unread count
        const unreadUpdate = isSeller
            ? { unreadCountCreator: { increment: 1 } }
            : { unreadCountSeller: { increment: 1 } };

        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: req.body.content.substring(0, 100),
                lastMessageAt: new Date(),
                ...unreadUpdate
            }
        });

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

        const sellerUnread = await prisma.conversation.aggregate({
            where: { sellerId: userId },
            _sum: { unreadCountSeller: true }
        });

        const creatorUnread = await prisma.conversation.aggregate({
            where: { creatorUserId: userId },
            _sum: { unreadCountCreator: true }
        });

        const totalUnread = (sellerUnread._sum.unreadCountSeller || 0) + (creatorUnread._sum.unreadCountCreator || 0);

        res.json({
            success: true,
            data: { unreadCount: totalUnread }
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
        const message = await prisma.message.findUnique({
            where: { id: req.params.messageId }
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can edit
        if (message.senderId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own messages'
            });
        }

        // Can't edit deleted messages (our soft delete uses messageType or content check)
        if (message.content === 'This message was deleted') {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit a deleted message'
            });
        }

        const updatedMessage = await prisma.message.update({
            where: { id: req.params.messageId },
            data: {
                content: req.body.content,
                // In Prisma we don't have isEdited field in schema but we can use metadata or just content
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            }
        });

        res.json({
            success: true,
            data: { message: updatedMessage }
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
        const message = await prisma.message.findUnique({
            where: { id: req.params.messageId }
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can delete
        if (message.senderId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        await prisma.message.update({
            where: { id: req.params.messageId },
            data: {
                content: 'This message was deleted',
            }
        });

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
        const conversationId = req.params.id;
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is part of conversation
        const userId = req.userId;
        if (conversation.sellerId !== userId && conversation.creatorUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this conversation'
            });
        }

        // Add user to deletedBy array (one-sided delete)
        const deletedByList = conversation.deletedBy || [];
        const alreadyDeleted = deletedByList.some(d => d.userId === userId);

        if (!alreadyDeleted) {
            const updatedDeletedBy = [...deletedByList, { userId: userId, deletedAt: new Date() }];
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { deletedBy: updatedDeletedBy }
            });
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

/**
 * @route   POST /api/chat/conversations/:id/accept
 * @desc    Accept a message request (Creator only)
 * @access  Private
 */
router.post('/conversations/:id/accept', auth, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is the creator
        const userId = req.userId;
        if (conversation.creatorUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only creators can accept message requests'
            });
        }

        // Check if already accepted
        if (conversation.acceptanceStatus?.byCreator === 'accepted' || conversation.status === 'ACTIVE') {
            return res.json({
                success: true,
                message: 'Request already accepted'
            });
        }

        // Accept the request
        const updatedConversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                status: 'ACTIVE',
                acceptanceStatus: { byCreator: 'accepted' }
            },
            include: {
                seller: { select: { id: true, name: true, email: true, avatar: true } },
                creatorUser: { select: { id: true, name: true, email: true, avatar: true } },
                promotion: { select: { id: true, title: true, status: true } }
            }
        });

        res.json({
            success: true,
            message: 'Message request accepted',
            data: { conversation: updatedConversation }
        });
    } catch (error) {
        console.error('Accept message request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept message request'
        });
    }
});

/**
 * @route   POST /api/chat/conversations/:id/reject
 * @desc    Reject a message request and delete conversation (Creator only)
 * @access  Private
 */
router.post('/conversations/:id/reject', auth, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify user is the creator
        const userId = req.userId;
        if (conversation.creatorUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only creators can reject message requests'
            });
        }

        // Delete the conversation entirely
        await prisma.conversation.delete({
            where: { id: conversationId }
        });

        // Prisma normally deletes messages via cascade if configured, but let's be explicit if needed
        await prisma.message.deleteMany({
            where: { conversationId: conversationId }
        });

        res.json({
            success: true,
            message: 'Message request rejected and conversation deleted'
        });
    } catch (error) {
        console.error('Reject message request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject message request'
        });
    }
});

/**
 * @route   GET /api/chat/requests
 * @desc    Get pending message requests (Creator only)
 * @access  Private
 */
router.get('/requests', auth, async (req, res) => {
    try {
        const userId = req.userId;

        // Find conversations where user is creator and status is pending
        const requests = await prisma.conversation.findMany({
            where: {
                creatorUserId: userId,
                status: 'PENDING',
                // Filter out if user deleted it
                NOT: {
                    deletedBy: {
                        path: ['$[*]'],
                        array_contains: { userId: userId }
                    }
                }
            },
            include: {
                seller: { select: { id: true, name: true, email: true, avatar: true } },
                creatorUser: { select: { id: true, name: true, email: true, avatar: true } },
                promotion: { select: { id: true, title: true, status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: { requests }
        });
    } catch (error) {
        console.error('Get message requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get message requests'
        });
    }
});

module.exports = router;
