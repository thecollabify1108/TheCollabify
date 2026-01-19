import { useEffect, useState, useCallback, useRef } from 'react';
import webSocketService from '../services/websocket';

/**
 * Hook for managing WebSocket connection
 * Auto-connects when user is authenticated
 */
const useWebSocket = (user) => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const hasConnected = useRef(false);

    useEffect(() => {
        if (!user || hasConnected.current) return;

        // Connect to WebSocket
        const token = localStorage.getItem('token');
        webSocketService.connect(user._id, token);
        hasConnected.current = true;

        // Update connection status
        const updateConnectionStatus = () => {
            setIsConnected(webSocketService.connected);
        };

        // Listen for connection events
        webSocketService.on('connect', updateConnectionStatus);
        webSocketService.on('disconnect', updateConnectionStatus);

        // Listen for online users
        webSocketService.onOnlineUsersList((data) => {
            setOnlineUsers(data.users);
        });

        webSocketService.onUserOnline((data) => {
            setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
        });

        webSocketService.onUserOffline((data) => {
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        });

        // Request initial online users list
        webSocketService.getOnlineUsers();

        // Cleanup on unmount
        return () => {
            if (hasConnected.current) {
                webSocketService.disconnect();
                hasConnected.current = false;
            }
        };
    }, [user]);

    return {
        isConnected,
        onlineUsers,
        isUserOnline: useCallback((userId) => onlineUsers.includes(userId), [onlineUsers])
    };
};

export default useWebSocket;
