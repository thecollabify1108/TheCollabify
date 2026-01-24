import { useEffect, useState, useCallback, useRef } from 'react';
import webSocketService from '../services/websocket';

/**
 * Hook for managing typing indicators in a conversation
 */
const useTypingIndicator = (conversationId, isConnected) => {
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeout = useRef(null);
    const lastTypingEmit = useRef(0);

    useEffect(() => {
        // Run effect when conversationId changes OR when connection status changes
        if (!conversationId || (!webSocketService.connected && !isConnected)) return;

        // Join the conversation room if connected
        if (webSocketService.connected) {
            webSocketService.joinRoom(conversationId);
        }

        // Listen for typing events
        const handleUserTyping = (data) => {
            if (data.conversationId === conversationId) {
                setTypingUsers(prev => {
                    if (!prev.find(u => u.userId === data.userId)) {
                        return [...prev, { userId: data.userId, user: data.user }];
                    }
                    return prev;
                });
            }
        };

        const handleUserStopTyping = (data) => {
            if (data.conversationId === conversationId) {
                setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
            }
        };

        webSocketService.onUserTyping(handleUserTyping);
        webSocketService.onUserStopTyping(handleUserStopTyping);

        // Cleanup
        return () => {
            webSocketService.off('user_typing', handleUserTyping);
            webSocketService.off('user_stop_typing', handleUserStopTyping);

            // Only leave if still connected (optional, but good practice)
            if (webSocketService.connected) {
                webSocketService.leaveRoom(conversationId);
            }

            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }
        };
    }, [conversationId, isConnected]); // Added isConnected dependency

    /**
     * Notify others that current user is typing
     * Throttled to prevent excessive socket emissions
     */
    const sendTyping = useCallback(() => {
        // Check connection status properly
        if (!conversationId || !webSocketService.connected) return;

        const now = Date.now();
        // Throttle: only emit every 2 seconds
        if (now - lastTypingEmit.current < 2000) return;

        lastTypingEmit.current = now;
        webSocketService.sendTyping(conversationId);

        // Auto-stop typing after 3 seconds of inactivity
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            webSocketService.sendStopTyping(conversationId);
        }, 3000);
    }, [conversationId, isConnected]); // Added isConnected dependency

    /**
     * Notify others that current user stopped typing
     */
    const sendStopTyping = useCallback(() => {
        if (!conversationId || !webSocketService.connected) return;

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        webSocketService.sendStopTyping(conversationId);
        lastTypingEmit.current = 0;
    }, [conversationId, isConnected]); // Added isConnected dependency

    return {
        typingUsers,
        isTyping: typingUsers.length > 0,
        sendTyping,
        sendStopTyping
    };
};

export default useTypingIndicator;
