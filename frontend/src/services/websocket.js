import { io } from 'socket.io-client';

/**
 * WebSocket Service for Real-Time Features
 * Manages connection to Socket.io server
 */
class WebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
    }

    /**
     * Connect to WebSocket server
     */
    connect(userId, token) {
        if (this.socket?.connected) {
            console.log('✅ Already connected to WebSocket');
            return this.socket;
        }

        const wsUrl = import.meta.env.VITE_WS_URL;

        if (!wsUrl) {
            console.error('❌ VITE_WS_URL environment variable is not configured!');
            throw new Error('WebSocket URL not configured. Set VITE_WS_URL in environment variables.');
        }

        console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

        this.socket = io(wsUrl, {
            auth: {
                userId,
                token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to WebSocket server');
            this.isConnected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from WebSocket:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error);
        });

        return this.socket;
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.emit('going_offline');
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.listeners.clear();
        }
    }

    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.socket) {
            console.warn('WebSocket not connected. Call connect() first.');
            return;
        }

        this.socket.on(event, callback);

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from listeners map
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event
     */
    emit(event, data) {
        if (!this.socket || !this.isConnected) {
            console.warn('WebSocket not connected. Cannot emit event:', event);
            return false;
        }

        this.socket.emit(event, data);
        return true;
    }

    // ===== TYPING INDICATORS =====

    /**
     * Send typing indicator
     */
    sendTyping(conversationId) {
        this.emit('typing', { conversationId });
    }

    /**
     * Send stop typing indicator
     */
    sendStopTyping(conversationId) {
        this.emit('stop_typing', { conversationId });
    }

    /**
     * Listen for typing indicators
     */
    onUserTyping(callback) {
        this.on('user_typing', callback);
    }

    /**
     * Listen for stop typing
     */
    onUserStopTyping(callback) {
        this.on('user_stop_typing', callback);
    }

    // ===== ROOM MANAGEMENT =====

    /**
     * Join a conversation room
     */
    joinRoom(roomId) {
        this.emit('join_room', { roomId });
    }

    /**
     * Leave a conversation room
     */
    leaveRoom(roomId) {
        this.emit('leave_room', { roomId });
    }

    // ===== MESSAGING =====

    /**
     * Send a message
     */
    sendMessage(conversationId, message, recipientId, tempId) {
        this.emit('send_message', {
            conversationId,
            message,
            recipientId,
            tempId
        });
    }

    /**
     * Listen for new messages
     */
    onNewMessage(callback) {
        this.on('new_message', callback);
    }

    /**
     * Listen for message sent confirmation
     */
    onMessageSent(callback) {
        this.on('message_sent', callback);
    }

    // ===== ONLINE STATUS =====

    /**
     * Get list of online users
     */
    getOnlineUsers() {
        this.emit('get_online_users');
    }

    /**
     * Listen for online users list
     */
    onOnlineUsersList(callback) {
        this.on('online_users_list', callback);
    }

    /**
     * Listen for user coming online
     */
    onUserOnline(callback) {
        this.on('user_online', callback);
    }

    /**
     * Listen for user going offline
     */
    onUserOffline(callback) {
        this.on('user_offline', callback);
    }

    // ===== NOTIFICATIONS =====

    /**
     * Listen for notifications
     */
    onNotification(callback) {
        this.on('notification', callback);
    }

    /**
     * Listen for campaign updates
     */
    onCampaignUpdate(callback) {
        this.on('campaign_update', callback);
    }

    // ===== UTILITY =====

    /**
     * Check if connected
     */
    get connected() {
        return this.isConnected && this.socket?.connected;
    }
}

// Export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
