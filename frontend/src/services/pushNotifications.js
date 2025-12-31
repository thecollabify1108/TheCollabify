/**
 * Push Notification Service
 * Uses the native Browser Notification API for real-time alerts
 */

class PushNotificationService {
    constructor() {
        this.permission = 'default';
        this.init();
    }

    /**
     * Initialize notification service
     */
    async init() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }
        this.permission = Notification.permission;
    }

    /**
     * Request permission to show notifications
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    /**
     * Check if notifications are enabled
     */
    isEnabled() {
        return this.permission === 'granted';
    }

    /**
     * Show a push notification
     */
    show(title, options = {}) {
        if (!this.isEnabled()) {
            console.log('Notifications not enabled');
            return null;
        }

        const defaultOptions = {
            icon: '/favicon.png',
            badge: '/favicon.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);

            // Handle click
            notification.onclick = () => {
                window.focus();
                if (options.onClick) {
                    options.onClick();
                }
                if (options.url) {
                    window.location.href = options.url;
                }
                notification.close();
            };

            return notification;
        } catch (error) {
            console.error('Failed to show notification:', error);
            return null;
        }
    }

    /**
     * Show notification for new creator application
     */
    showCreatorApplied(creatorName, promotionTitle) {
        return this.show(`🎯 New Application!`, {
            body: `${creatorName} applied to "${promotionTitle}"`,
            tag: 'creator-applied',
            url: '/seller/dashboard'
        });
    }

    /**
     * Show notification for acceptance
     */
    showAccepted(promotionTitle) {
        return this.show(`🎉 Congratulations!`, {
            body: `Your application for "${promotionTitle}" was accepted!`,
            tag: 'accepted',
            url: '/creator/dashboard'
        });
    }

    /**
     * Show notification for new match
     */
    showNewMatch(promotionTitle, matchScore) {
        return this.show(`🔥 New ${matchScore}% Match!`, {
            body: `Check out "${promotionTitle}"`,
            tag: 'new-match',
            url: '/creator/dashboard'
        });
    }

    /**
     * Show notification for new message
     */
    showNewMessage(senderName) {
        return this.show(`💬 New Message`, {
            body: `${senderName} sent you a message`,
            tag: 'new-message',
            url: '/seller/dashboard'
        });
    }

    /**
     * Show generic notification
     */
    showGeneric(title, message, url = null) {
        return this.show(title, {
            body: message,
            url
        });
    }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
