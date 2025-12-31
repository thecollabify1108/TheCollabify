import { useState, useEffect, useCallback } from 'react';
import pushNotificationService from '../services/pushNotifications';

/**
 * Hook for managing push notifications
 */
const usePushNotifications = () => {
    const [permission, setPermission] = useState('default');
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            setIsSupported(false);
            return;
        }

        setPermission(Notification.permission);
    }, []);

    /**
     * Request notification permission
     */
    const requestPermission = useCallback(async () => {
        const granted = await pushNotificationService.requestPermission();
        setPermission(granted ? 'granted' : 'denied');
        return granted;
    }, []);

    /**
     * Show a notification
     */
    const showNotification = useCallback((title, options) => {
        return pushNotificationService.show(title, options);
    }, []);

    /**
     * Pre-built notification types
     */
    const notify = {
        creatorApplied: (creatorName, promotionTitle) =>
            pushNotificationService.showCreatorApplied(creatorName, promotionTitle),

        accepted: (promotionTitle) =>
            pushNotificationService.showAccepted(promotionTitle),

        newMatch: (promotionTitle, matchScore) =>
            pushNotificationService.showNewMatch(promotionTitle, matchScore),

        newMessage: (senderName) =>
            pushNotificationService.showNewMessage(senderName),

        generic: (title, message, url) =>
            pushNotificationService.showGeneric(title, message, url)
    };

    return {
        permission,
        isSupported,
        isEnabled: permission === 'granted',
        isDenied: permission === 'denied',
        requestPermission,
        showNotification,
        notify
    };
};

export default usePushNotifications;
