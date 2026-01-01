const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} = require('../services/notificationService');
const Notification = require('../models/Notification');

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for current user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const { limit = 20, skip = 0, unreadOnly = false } = req.query;

        const result = await getUserNotifications(req.userId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            unreadOnly: unreadOnly === 'true'
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications'
        });
    }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.userId);

        res.json({
            success: true,
            data: { count }
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
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Private
 */
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await markAsRead(req.params.id, req.userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', auth, async (req, res) => {
    try {
        await markAllAsRead(req.userId);

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notifications as read'
        });
    }
});

/**
 * @route   DELETE /api/notifications/clear-all
 * @desc    Delete all notifications for current user
 * @access  Private
 */
router.delete('/clear-all', auth, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.userId });

        res.json({
            success: true,
            message: 'All notifications cleared'
        });
    } catch (error) {
        console.error('Clear all notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear notifications'
        });
    }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
});

/**
 * @route   POST /api/notifications/push/subscribe
 * @desc    Subscribe to push notifications
 * @access  Private
 */
router.post('/push/subscribe', auth, async (req, res) => {
    try {
        const { subscription } = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription data'
            });
        }

        // Update user with push subscription
        await require('../models/User').findByIdAndUpdate(req.userId, {
            pushSubscription: {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                }
            }
        });

        console.log(`✅ User ${req.userId} subscribed to push notifications`);

        res.json({
            success: true,
            message: 'Successfully subscribed to push notifications'
        });
    } catch (error) {
        console.error('Subscribe to push error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe to push notifications'
        });
    }
});

/**
 * @route   POST /api/notifications/push/unsubscribe
 * @desc    Unsubscribe from push notifications
 * @access  Private
 */
router.post('/push/unsubscribe', auth, async (req, res) => {
    try {
        await require('../models/User').findByIdAndUpdate(req.userId, {
            $unset: { pushSubscription: 1 }
        });

        console.log(`User ${req.userId} unsubscribed from push notifications`);

        res.json({
            success: true,
            message: 'Successfully unsubscribed from push notifications'
        });
    } catch (error) {
        console.error('Unsubscribe from push error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe from push notifications'
        });
    }
});

/**
 * @route   GET /api/notifications/push/subscription
 * @desc    Get current push subscription status
 * @access  Private
 */
router.get('/push/subscription', auth, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.userId).select('pushSubscription');

        res.json({
            success: true,
            data: {
                subscribed: !!(user && user.pushSubscription && user.pushSubscription.endpoint)
            }
        });
    } catch (error) {
        console.error('Get push subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get push subscription status'
        });
    }
});

module.exports = router;
