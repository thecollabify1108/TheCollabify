import { useEffect, useState } from 'react';
import webSocketService from '../services/websocket';
import toast from 'react-hot-toast';

/**
 * useWebSocket - Custom hook for WebSocket connection
 * Wrapper around singleton WebSocketService
 */
const useWebSocket = (userId) => {
    const [isConnected, setIsConnected] = useState(webSocketService.isConnected);
    const [notifications, setNotifications] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        if (!userId) {
            webSocketService.disconnect();
            setIsConnected(false);
            setNotifications([]);
            setOnlineUsers(new Set());
            return;
        }

        const token = localStorage.getItem('token');
        webSocketService.connect(userId, token);

        // Update local state when connection status changes
        setIsConnected(webSocketService.isConnected);

        // Event listeners
        const handleConnect = () => {
            if (import.meta.env.DEV) {
                console.log('✅ WebSocket connected');
            }
            setIsConnected(true);
        };
        const handleDisconnect = () => {
            if (import.meta.env.DEV) {
                console.log('❌ WebSocket disconnected');
            }
            setIsConnected(false);
        };

        const handleNotification = (data) => {
            if (import.meta.env.DEV) {
                console.log('📬 New notification:', data);
            }
            setNotifications(prev => [data, ...prev]);

            // Show toast notification
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
                                glass-card p-4 flex items-start gap-3 max-w-md`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                    ${data.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                            data.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-primary-500/20 text-primary-400'}`}>
                        {data.icon || '🔔'}
                    </div>

                    <div className="flex-1">
                        <h4 className="font-semibold text-dark-100">{data.title}</h4>
                        <p className="text-sm text-dark-400">{data.message}</p>
                    </div>

                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="text-dark-500 hover:text-dark-300"
                    >
                        ✕
                    </button>
                </div>
            ), { duration: 5000 });

            playNotificationSound();
        };

        const handleOnlineUsersList = (data) => {
            setOnlineUsers(new Set(data.users));
        };

        const handleUserOnline = (data) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.add(data.userId);
                return newSet;
            });
        };

        const handleUserOffline = (data) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        };

        // Campaign update handler
        const handleCampaignUpdate = (data) => {
            if (import.meta.env.DEV) {
                console.log('📊 Campaign update:', data);
            }
            window.dispatchEvent(new CustomEvent('campaign_update', { detail: data }));
        };

        // New message handler
        const handleNewMessage = (data) => {
            if (import.meta.env.DEV) {
                console.log('💬 New message:', data);
            }
            window.dispatchEvent(new CustomEvent('new_message', { detail: data }));
        };

        // Attach listeners
        webSocketService.socket.on('connect', handleConnect);
        webSocketService.socket.on('disconnect', handleDisconnect);
        webSocketService.socket.on('notification', handleNotification);
        webSocketService.socket.on('online_users_list', handleOnlineUsersList);
        webSocketService.socket.on('user_online', handleUserOnline);
        webSocketService.socket.on('user_offline', handleUserOffline);
        webSocketService.socket.on('campaign_update', handleCampaignUpdate);
        webSocketService.socket.on('new_message', handleNewMessage);


        // Initial fetch
        if (webSocketService.isConnected) {
            webSocketService.getOnlineUsers();
        }

        return () => {
            // We do NOT disconnect here to maintain persistent connection across nav
            // webSocketService.disconnect(); 

            // Clean up listeners
            if (webSocketService.socket) {
                webSocketService.socket.off('connect', handleConnect);
                webSocketService.socket.off('disconnect', handleDisconnect);
                webSocketService.socket.off('notification', handleNotification);
                webSocketService.socket.off('online_users_list', handleOnlineUsersList);
                webSocketService.socket.off('user_online', handleUserOnline);
                webSocketService.socket.off('user_offline', handleUserOffline);
                webSocketService.socket.off('campaign_update', handleCampaignUpdate);
                webSocketService.socket.off('new_message', handleNewMessage);
            }
        };
    }, [userId]);

    // Helper functions
    const isUserOnline = (targetUserId) => onlineUsers.has(targetUserId);

    return {
        socket: webSocketService.socket,
        isConnected,
        notifications,
        onlineUsers: Array.from(onlineUsers),
        isUserOnline,
        emit: (event, data) => webSocketService.emit(event, data),
        joinRoom: (roomId) => webSocketService.joinRoom(roomId),
        leaveRoom: (roomId) => webSocketService.leaveRoom(roomId)
    };
};

// Notification sound player
const playNotificationSound = () => {
    try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Ignore if audio fails (user hasn't interacted yet)
        });
    } catch (error) {
        // Silently fail if no audio file
    }
};

export default useWebSocket;
