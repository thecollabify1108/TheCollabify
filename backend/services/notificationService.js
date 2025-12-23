/**
 * Notification Service
 * 
 * Handles creating and dispatching in-app notifications
 */

const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async ({ userId, type, title, message, relatedRequest, relatedCreator }) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            relatedRequest,
            relatedCreator
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
    return createNotification({
        userId: creatorUserId,
        type: 'NEW_MATCH',
        title: 'New Promotion Opportunity!',
        message: `A new ${promotionRequest.promotionType} promotion in ${promotionRequest.targetCategory} matches your profile with a ${matchScore}% match score!`,
        relatedRequest: promotionRequest._id
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
        relatedRequest: promotionRequest._id
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
        relatedRequest: promotionRequest._id
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
        relatedRequest: promotionRequest._id
    });
};

/**
 * Notify about campaign status update
 */
const notifyRequestUpdate = async (userId, promotionRequest, newStatus) => {
    const statusMessages = {
        'Open': 'Your promotion request is now open for creators.',
        'Creator Interested': 'A creator has shown interest in your promotion.',
        'Accepted': 'The campaign has been accepted and is ready to start.',
        'Completed': 'Congratulations! Your campaign has been completed.',
        'Cancelled': 'The promotion request has been cancelled.'
    };

    return createNotification({
        userId,
        type: 'REQUEST_UPDATE',
        title: 'Campaign Update',
        message: statusMessages[newStatus] || `Your campaign "${promotionRequest.title}" status has been updated to ${newStatus}.`,
        relatedRequest: promotionRequest._id
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
        message: messages[role] || 'Welcome! Start exploring the platform.'
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
    const query = { userId };

    if (unreadOnly) {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

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
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
    );

    return notification;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
    await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );

    return { success: true };
};

module.exports = {
    createNotification,
    notifyCreatorNewMatch,
    notifySellerCreatorApplied,
    notifyCreatorAccepted,
    notifyCreatorRejected,
    notifyRequestUpdate,
    notifyWelcome,
    notifyProfileInsights,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
