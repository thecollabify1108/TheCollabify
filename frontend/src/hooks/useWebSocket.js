import { useEffect, useState, useCallback, useRef } from 'react';
import webSocketService from '../services/websocket';
import { chatAPI } from '../services/api';

/**
 * Hook for managing WebSocket connection
 * Auto-connects when user is authenticated
 */
const useWebSocket = (user) => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [lastSeenMap, setLastSeenMap] = useState({});
    const hasConnected = useRef(false);

    useEffect(() => {
        if (!user || hasConnected.current) return;

        // Connect to WebSocket — only if we have an explicit token
        const token = localStorage.getItem('token');
        if (!token) return; // Cannot authenticate WebSocket without token
        webSocketService.connect(user.id, token);
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
            setLastSeenMap(prev => {
                const next = { ...prev };
                delete next[data.userId];
                return next;
            });
        });

        webSocketService.onUserOffline((data) => {
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
            if (data?.userId && data?.lastSeenAt) {
                setLastSeenMap(prev => ({ ...prev, [data.userId]: data.lastSeenAt }));
            }
        });

        // Request initial online users list
        webSocketService.getOnlineUsers();

    }, [user]);

    const refreshPresence = useCallback(async (userId) => {
        if (!userId) return null;
        try {
            const res = await chatAPI.getPresence(userId);
            const presence = res?.data?.data;
            if (!presence) return null;

            if (presence.isOnline) {
                setOnlineUsers(prev => [...new Set([...prev, userId])]);
                setLastSeenMap(prev => {
                    const next = { ...prev };
                    delete next[userId];
                    return next;
                });
            } else {
                setOnlineUsers(prev => prev.filter(id => id !== userId));
                if (presence.lastSeenAt) {
                    setLastSeenMap(prev => ({ ...prev, [userId]: presence.lastSeenAt }));
                }
            }

            return presence;
        } catch {
            return null;
        }
    }, []);

    const formatLastSeen = useCallback((lastSeenAt) => {
        if (!lastSeenAt) return 'Offline';
        const date = new Date(lastSeenAt);
        return `Last seen ${date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    }, []);

    const getPresenceLabel = useCallback((userId) => {
        if (!userId) return 'Offline';
        if (onlineUsers.includes(userId)) return 'Online';
        return formatLastSeen(lastSeenMap[userId]);
    }, [onlineUsers, lastSeenMap, formatLastSeen]);

    return {
        isConnected,
        onlineUsers,
        isUserOnline: useCallback((userId) => onlineUsers.includes(userId), [onlineUsers]),
        refreshPresence,
        getPresenceLabel
    };
};

export default useWebSocket;
