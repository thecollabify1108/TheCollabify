import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * useTypingIndicator - Hook for real-time typing detection
 * Shows "User is typing..." in chat/messaging
 */
const useTypingIndicator = (socket, conversationId) => {
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeout = useRef(null);

    useEffect(() => {
        if (!socket || !conversationId) return;

        // Listen for typing events
        socket.on('user_typing', (data) => {
            if (data.conversationId === conversationId) {
                setIsTyping(true);
                setTypingUser(data.user);

                // Auto-hide after 3 seconds
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => {
                    setIsTyping(false);
                    setTypingUser(null);
                }, 3000);
            }
        });

        socket.on('user_stop_typing', (data) => {
            if (data.conversationId === conversationId) {
                setIsTyping(false);
                setTypingUser(null);
                clearTimeout(typingTimeout.current);
            }
        });

        return () => {
            socket.off('user_typing');
            socket.off('user_stop_typing');
            clearTimeout(typingTimeout.current);
        };
    }, [socket, conversationId]);

    // Function to notify others you're typing
    const startTyping = () => {
        if (socket && conversationId) {
            socket.emit('typing', { conversationId });

            // Auto-stop after 1 second of inactivity
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
                stopTyping();
            }, 1000);
        }
    };

    const stopTyping = () => {
        if (socket && conversationId) {
            socket.emit('stop_typing', { conversationId });
        }
    };

    return {
        isTyping,
        typingUser,
        startTyping,
        stopTyping
    };
};

/**
 * TypingIndicator - Visual component for typing animation
 */
export const TypingIndicator = ({ isTyping, userName = 'Someone' }) => {
    if (!isTyping) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-dark-400 text-sm px-4 py-2"
            >
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-primary-400 rounded-full"
                            animate={{
                                y: [0, -8, 0],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
                <span className="text-dark-400">
                    <span className="font-medium text-dark-300">{userName}</span> is typing...
                </span>
            </motion.div>
        </AnimatePresence>
    );
};

export default useTypingIndicator;
