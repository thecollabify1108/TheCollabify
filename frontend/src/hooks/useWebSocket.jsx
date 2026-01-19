import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

/**
 * useWebSocket - Custom hook for WebSocket connection
 * Handles real-time bidirectional communication
 */
const useWebSocket = (userId) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        // Connect to WebSocket server
        const wsUrl = import.meta.env.VITE_WS_URL;
        if (!wsUrl) {
            console.error('❌ VITE_WS_URL not configured!');
            return;
        }
        const newSocket = io(wsUrl, {
            auth: {
                userId,
                token: localStorage.getItem('token')
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        // Connection events
        newSocket.on('connect', () => {
            console.log('✅ WebSocket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        // Real-time notification handler
        newSocket.on('notification', (data) => {
            console.log('📬 New notification:', data);
            setNotifications(prev => [data, ...prev]);

            // Show toast notification
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
                                glass-card p-4 flex items-start gap-3 max-w-md`}>
                    {/* Icon based on type */}
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

            // Play notification sound (optional)
            playNotificationSound();
        });

        // Campaign update handler
        newSocket.on('campaign_update', (data) => {
            console.log('📊 Campaign update:', data);
            // Trigger re-fetch or update local state
            window.dispatchEvent(new CustomEvent('campaign_update', { detail: data }));
        });

        // New message handler
        newSocket.on('new_message', (data) => {
            console.log('💬 New message:', data);
            // Update unread count
            window.dispatchEvent(new CustomEvent('new_message', { detail: data }));
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [userId]);

    // Helper function to emit events
    const emit = (event, data) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        }
    };

    // Helper to join a room
    const joinRoom = (roomId) => {
        emit('join_room', { roomId });
    };

    // Helper to leave a room
    const leaveRoom = (roomId) => {
        emit('leave_room', { roomId });
    };

    return {
        socket,
        isConnected,
        notifications,
        emit,
        joinRoom,
        leaveRoom
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
