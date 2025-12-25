import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatBox = ({ conversationId, otherUserName, promotionTitle, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    useEffect(() => {
        fetchMessages();

        // Poll for new messages every 5 seconds
        pollInterval.current = setInterval(fetchMessages, 5000);

        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await chatAPI.getMessages(conversationId);
            setMessages(res.data.data.messages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await chatAPI.sendMessage(conversationId, newMessage.trim());
            setMessages(prev => [...prev, res.data.data.message]);
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        const today = new Date();
        const messageDate = new Date(date);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const groupMessagesByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            const dateKey = new Date(msg.createdAt).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 w-96 h-[500px] glass-card shadow-2xl flex flex-col overflow-hidden z-50"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-between">
                <div className="flex items-center">
                    <FaComments className="text-white text-lg mr-2" />
                    <div>
                        <h3 className="text-white font-semibold text-sm">{otherUserName}</h3>
                        <p className="text-white/70 text-xs truncate max-w-[200px]">{promotionTitle}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition p-1"
                >
                    <FaTimes />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-primary-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-dark-400">
                        <FaComments className="text-4xl mb-2 text-dark-600" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
                    </div>
                ) : (
                    Object.entries(messageGroups).map(([dateKey, msgs]) => (
                        <div key={dateKey}>
                            {/* Date separator */}
                            <div className="flex items-center justify-center my-4">
                                <span className="text-xs text-dark-400 bg-dark-800 px-3 py-1 rounded-full">
                                    {formatDate(msgs[0].createdAt)}
                                </span>
                            </div>

                            {/* Messages for this date */}
                            {msgs.map((message, index) => {
                                const isOwn = message.senderId._id === user?.id || message.senderId === user?.id;

                                return (
                                    <motion.div
                                        key={message._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                                    >
                                        <div
                                            className={`max-w-[75%] px-3 py-2 rounded-2xl ${isOwn
                                                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-br-md'
                                                    : 'bg-dark-700 text-dark-100 rounded-bl-md'
                                                }`}
                                        >
                                            <p className="text-sm break-words">{message.content}</p>
                                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-dark-400'}`}>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-dark-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-2 text-sm text-dark-100 placeholder-dark-400 focus:border-primary-500 focus:outline-none transition"
                        maxLength={2000}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-2 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition hover:opacity-90"
                    >
                        <FaPaperPlane className={sending ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ChatBox;
