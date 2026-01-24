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
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

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
    io.use((socket, next) => {
        const userId = socket.handshake.auth.userId;
        const token = socket.handshake.auth.token;

        if (!userId) {
            return next(new Error('Authentication error'));
        }

        // TODO: Verify token here
        // const isValid = verifyToken(token);
        // if (!isValid) return next(new Error('Invalid token'));

        socket.userId = userId;
        next();
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

        const Message = require('./models/Message');
        const Conversation = require('./models/Conversation');

        // ... inside io.on('connection') ...

        // ===== MESSAGING =====
        socket.on('send_message', async (data) => {
            const { conversationId, message, recipientId } = data;

            try {
                // Save message to database
                const newMessage = new Message({
                    conversationId,
                    senderId: socket.userId,
                    content: message,
                    status: 'sent'
                });

                await newMessage.save();

                // Update conversation's last message
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: newMessage._id,
                    lastMessageAt: new Date(),
                    $inc: { unreadCount: 1 } // Increment unread count (simplified logic)
                });

                // Populate sender info for the recipient
                // In a real app, you might want to populate this more efficiently
                // or trust the frontend's existing knowledge of the user

                // Send to recipient
                io.to(`user_${recipientId}`).emit('new_message', {
                    conversationId,
                    message: {
                        ...newMessage.toObject(),
                        senderId: socket.userId // Send ID or populated object depending on frontend expectation
                    },
                    sender: socket.userId
                });

                // Send back to sender for confirmation
                socket.emit('message_sent', {
                    conversationId,
                    message: newMessage, // Return the full saved message
                    tempId: data.tempId
                });
            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('message_error', {
                    conversationId,
                    error: 'Failed to send message',
                    tempId: data.tempId
                });
            }
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
