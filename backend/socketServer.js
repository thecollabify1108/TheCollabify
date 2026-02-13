/**
 * BACKEND - Socket.IO Server Setup
 * File: backend/socketServer.js
 * 
 * Setup Instructions:
 * 1. npm install socket.io express cors
 * 2. Create this file in backend/socketServer.js
 * 3. Import and initialize in your main server.js
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// In-memory storage for online users (use Redis in production!)
const onlineUsers = new Map();
const userSockets = new Map();

function initializeSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Middleware for authentication
    io.use(async (socket, next) => {
        try {
            const userId = socket.handshake.auth.userId;
            const token = socket.handshake.auth.token;

            if (!userId || !token) {
                return next(new Error('Authentication error: Missing credentials'));
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verify that the userId matches the token
            if (decoded.userId !== userId) {
                return next(new Error('Authentication error: User ID mismatch'));
            }

            socket.userId = userId;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId}`);

        // Store user socket
        userSockets.set(socket.userId, socket.id);
        onlineUsers.set(socket.userId, {
            socketId: socket.id,
            connectedAt: new Date()
        });

        // Join user's personal room
        socket.join(`user_${socket.userId}`);

        // Broadcast user is online
        socket.broadcast.emit('user_online', {
            userId: socket.userId
        });

        // Send online users list to new connection
        socket.emit('online_users_list', {
            users: Array.from(onlineUsers.keys())
        });

        // ===== TYPING INDICATORS =====
        socket.on('typing', (data) => {
            const { conversationId } = data;
            // Broadcast to others in the conversation
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: socket.userId,
                conversationId,
                user: { id: socket.userId } // TODO: Get full user data
            });
        });

        socket.on('stop_typing', (data) => {
            const { conversationId } = data;
            socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
                userId: socket.userId,
                conversationId
            });
        });

        // ===== ROOM MANAGEMENT =====
        socket.on('join_room', (data) => {
            const { roomId } = data;
            socket.join(`conversation_${roomId}`);
            console.log(`User ${socket.userId} joined room: ${roomId}`);
        });

        socket.on('leave_room', (data) => {
            const { roomId } = data;
            socket.leave(`conversation_${roomId}`);
            console.log(`User ${socket.userId} left room: ${roomId}`);
        });

        // ... inside io.on('connection') ...

        // ===== MESSAGING =====
        // Note: Actual saving happens in REST API (routes/chat.js)
        // This event is now only for broadcasting to the specific recipient via socket
        socket.on('send_message', (data) => {
            const { conversationId, message, recipientId } = data;

            // Broadcast to recipient
            io.to(`user_${recipientId}`).emit('new_message', {
                conversationId,
                message,
                sender: socket.userId
            });

            // Confirm sent to sender (optional, can be handled by REST response)
            socket.emit('message_sent', {
                conversationId,
                message,
                tempId: data.tempId
            });
        });

        // ===== ONLINE STATUS =====
        socket.on('get_online_users', () => {
            socket.emit('online_users_list', {
                users: Array.from(onlineUsers.keys())
            });
        });

        socket.on('going_offline', () => {
            handleDisconnect();
        });

        // ===== DISCONNECT =====
        const handleDisconnect = () => {
            console.log(`❌ User disconnected: ${socket.userId}`);

            userSockets.delete(socket.userId);
            onlineUsers.delete(socket.userId);

            // Broadcast user is offline
            io.emit('user_offline', {
                userId: socket.userId
            });
        };

        socket.on('disconnect', handleDisconnect);
    });

    // ===== HELPER FUNCTIONS (call from REST API) =====

    /**
     * Send notification to specific user
     */
    const sendNotification = (userId, notification) => {
        io.to(`user_${userId}`).emit('notification', notification);
    };

    /**
     * Broadcast campaign update to all interested users
     */
    const broadcastCampaignUpdate = (campaignId, update) => {
        io.emit('campaign_update', {
            campaignId,
            ...update
        });
    };

    /**
     * Send notification to multiple users
     */
    const sendBulkNotification = (userIds, notification) => {
        userIds.forEach(userId => {
            sendNotification(userId, notification);
        });
    };

    return {
        io,
        sendNotification,
        broadcastCampaignUpdate,
        sendBulkNotification
    };
}

module.exports = initializeSocketServer;

/**
 * INTEGRATION IN server.js:
 * 
 * const express = require('express');
 * const http = require('http');
 * const initializeSocketServer = require('./socketServer');
 * 
 * const app = express();
 * const server = http.createServer(app);
 * const { io, sendNotification, broadcastCampaignUpdate } = initializeSocketServer(server);
 * 
 * // Make socket functions available to routes
 * app.locals.sendNotification = sendNotification;
 * app.locals.broadcastCampaignUpdate = broadcastCampaignUpdate;
 * 
 * server.listen(5000, () => {
 *     console.log('Server running on port 5000');
 * });
 */
