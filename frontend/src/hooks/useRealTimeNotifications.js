import { useEffect, useState, useCallback } from 'react';
import webSocketService from '../services/websocket';

/**
 * Hook for managing real-time notifications
 */
const useRealTimeNotifications = (onNotification) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!webSocketService.connected) return;

        // Listen for notifications
        const handleNotification = (notification) => {
            console.log('📬 New notification:', notification);

            // Add to notifications list
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Call custom handler if provided
            if (onNotification) {
                onNotification(notification);
            }
        };

        webSocketService.onNotification(handleNotification);

        // Cleanup
        return () => {
            webSocketService.off('notification', handleNotification);
        };
    }, [onNotification]);

    /**
     * Mark notification as read
     */
    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    /**
     * Mark all as read
     */
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    /**
     * Clear notifications
     */
    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
    };
};

export default useRealTimeNotifications;
