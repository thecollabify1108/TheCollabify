const prisma = require('../config/prisma');

/**
 * Create a notification for a user
 */
const createNotification = async ({ userId, type, title, message, relatedRequest, relatedCreator }) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                relatedRequestId: relatedRequest,
                relatedCreatorId: relatedCreator
            }
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Notify creator about a new matching promotion request
 */
const notifyCreatorNewMatch = async (creatorUserId, promotionRequest, matchScore) => {
    const type = promotionRequest.promotionType?.[0] || 'Promotion';
    return createNotification({
        userId: creatorUserId,
        type: 'NEW_MATCH',
        title: 'New Promotion Opportunity!',
        message: `A new ${type} promotion in ${promotionRequest.targetCategory} matches your profile with a ${matchScore}% match score!`,
        relatedRequest: promotionRequest.id
    });
};

/**
 * Notify seller when a creator applies to their request
 */
const notifySellerCreatorApplied = async (sellerId, creatorName, promotionRequest) => {
    return createNotification({
        userId: sellerId,
        type: 'CREATOR_APPLIED',
        title: 'Creator Interested!',
        message: `${creatorName} has applied to your "${promotionRequest.title}" promotion request.`,
        relatedRequest: promotionRequest.id
    });
};

/**
 * Notify creator when seller accepts their application
 */
const notifyCreatorAccepted = async (creatorUserId, promotionRequest) => {
    return createNotification({
        userId: creatorUserId,
        type: 'CREATOR_ACCEPTED',
        title: 'Application Accepted!',
        message: `Your application for "${promotionRequest.title}" has been accepted. The campaign is ready to begin!`,
        relatedRequest: promotionRequest.id
    });
};

/**
 * Notify creator when seller rejects their application
 */
const notifyCreatorRejected = async (creatorUserId, promotionRequest) => {
    return createNotification({
        userId: creatorUserId,
        type: 'CREATOR_REJECTED',
        title: 'Application Update',
        message: `Your application for "${promotionRequest.title}" was not selected this time. Keep exploring new opportunities!`,
        relatedRequest: promotionRequest.id
    });
};

/**
 * Notify about campaign status update
 */
const notifyRequestUpdate = async (userId, promotionRequest, newStatus) => {
    const statusMessages = {
        'OPEN': 'Your promotion request is now open for creators.',
        'CREATOR_INTERESTED': 'A creator has shown interest in your promotion.',
        'ACCEPTED': 'The campaign has been accepted and is ready to start.',
        'COMPLETED': 'Congratulations! Your campaign has been completed.',
        'CANCELLED': 'The promotion request has been cancelled.'
    };

    const upperStatus = newStatus.toUpperCase();

    return createNotification({
        userId,
        type: 'REQUEST_UPDATE',
        title: 'Campaign Update',
        message: statusMessages[upperStatus] || `Your campaign "${promotionRequest.title}" status has been updated to ${newStatus}.`,
        relatedRequest: promotionRequest.id
    });
};

/**
 * Notify creator when a request they applied to is deleted
 */
const notifyRequestDeleted = async (creatorUserId, promotionRequest) => {
    return createNotification({
        userId: creatorUserId,
        type: 'REQUEST_UPDATE',
        title: 'Request Deleted',
        message: `The promotion request "${promotionRequest.title}" that you applied to has been deleted by the seller.`,
        relatedRequest: promotionRequest.id
    });
};

/**
 * Send welcome notification to new user
 */
const notifyWelcome = async (userId, role) => {
    const messages = {
        creator: 'Welcome to the Creator Marketplace! Complete your profile to start receiving promotion opportunities.',
        seller: 'Welcome to the Creator Marketplace! Create your first promotion request to find the perfect creator for your brand.'
    };

    return createNotification({
        userId,
        type: 'WELCOME',
        title: 'Welcome to Creator Marketplace!',
        message: messages[role.toLowerCase()] || 'Welcome! Start exploring the platform.'
    });
};

/**
 * Notify creator about new profile insights
 */
const notifyProfileInsights = async (creatorUserId, insights) => {
    return createNotification({
        userId: creatorUserId,
        type: 'PROFILE_INSIGHT',
        title: 'New Profile Insights Available',
        message: `Your profile score is ${insights.score}/100. Engagement quality: ${insights.engagementQuality}. ${insights.strengths[0] || 'Keep up the great work!'}`
    });
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, { limit = 20, skip = 0, unreadOnly = false } = {}) => {
    const where = { userId };
    if (unreadOnly) {
        where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { userId, isRead: false } })
    ]);

    return {
        notifications,
        total,
        unreadCount
    };
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
    const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() }
    });

    return notification;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() }
    });

    return { success: true };
};

module.exports = {
    createNotification,
    notifyCreatorNewMatch,
    notifySellerCreatorApplied,
    notifyCreatorAccepted,
    notifyCreatorRejected,
    notifyRequestUpdate,
    notifyRequestDeleted,
    notifyWelcome,
    notifyProfileInsights,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
