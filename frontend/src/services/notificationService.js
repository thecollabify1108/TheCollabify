// Notification service for managing PWA push notifications

const PUBLIC_VAPID_KEY = 'BH7j9WqF5pIL8QxK3mT2vN9rC1eA6wX4sY8oZ0pD5fG7hJ2kL9mQ3wE6rT1yU8iO4pA7sD6fG3hJ5kL2mN9qW0zX';

class NotificationService {
    constructor() {
        this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
        this.permission = this.isSupported ? Notification.permission : 'denied';
    }

    /**
     * Check if notifications are supported
     */
    isNotificationSupported() {
        return this.isSupported;
    }

    /**
     * Get current notification permission status
     */
    getPermissionStatus() {
        return Notification.permission;
    }

    /**
     * Request notification permission from user
     */
    async requestPermission() {
        if (!this.isSupported) {
            console.warn('Push notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('Notification permission denied');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    /**
     * Subscribe to push notifications
     */
    async subscribeToPush() {
        if (!this.isSupported) {
            throw new Error('Push notifications not supported');
        }

        if (Notification.permission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) {
                throw new Error('Notification permission not granted');
            }
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            let subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                return subscription;
            }

            // Create new subscription
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
            });

            return subscription;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            throw error;
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            throw error;
        }
    }

    /**
     * Get current push subscription
     */
    async getSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            return await registration.pushManager.getSubscription();
        } catch (error) {
            console.error('Failed to get subscription:', error);
            return null;
        }
    }

    /**
     * Show a local notification (for testing)
     */
    async showNotification(title, options = {}) {
        if (!this.isSupported || Notification.permission !== 'granted') {
            console.warn('Cannot show notification - permission not granted');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                icon: '/favicon.png',
                badge: '/favicon.png',
                vibrate: [200, 100, 200],
                tag: 'thecollabify-notification',
                requireInteraction: false,
                ...options
            });
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    /**
     * Helper: Convert VAPID key from base64 to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Export singleton instance
export default new NotificationService();
