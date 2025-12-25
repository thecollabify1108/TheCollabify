import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaComments } from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ConversationList = ({ onSelectConversation }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data.data.conversations);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOtherUser = (conversation) => {
        if (user?.role === 'seller') {
            return conversation.creatorUserId;
        }
        return conversation.sellerId;
    };

    const getUnreadCount = (conversation) => {
        if (user?.role === 'seller') {
            return conversation.unreadCountSeller;
        }
        return conversation.unreadCountCreator;
    };

    const formatTime = (date) => {
        if (!date) return '';
        const now = new Date();
        const messageDate = new Date(date);
        const diffHours = (now - messageDate) / (1000 * 60 * 60);

        if (diffHours < 24) {
            return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="glass-card p-6 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 rounded-full border-t-transparent animate-spin" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <FaComments className="text-4xl text-dark-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark-300 mb-2">No conversations yet</h3>
                <p className="text-dark-400 text-sm">
                    Conversations will appear here after a promotion is accepted.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-700">
                <h3 className="text-lg font-semibold text-dark-100">Messages</h3>
            </div>
            <div className="divide-y divide-dark-700">
                {conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const unreadCount = getUnreadCount(conversation);

                    return (
                        <motion.div
                            key={conversation._id}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                            className="px-4 py-3 cursor-pointer transition"
                            onClick={() => onSelectConversation(conversation)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                        <h4 className="text-dark-100 font-medium truncate">
                                            {otherUser?.name || 'Unknown User'}
                                        </h4>
                                        {unreadCount > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-dark-400 text-sm truncate mt-1">
                                        {conversation.promotionId?.title || 'Promotion'}
                                    </p>
                                    {conversation.lastMessage && (
                                        <p className="text-dark-500 text-xs truncate mt-1">
                                            {conversation.lastMessage.content}
                                        </p>
                                    )}
                                </div>
                                <div className="text-xs text-dark-500 ml-2">
                                    {formatTime(conversation.lastMessage?.createdAt || conversation.createdAt)}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationList;
