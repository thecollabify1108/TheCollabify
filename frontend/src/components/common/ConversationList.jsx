import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import EmptyState from './EmptyState';
import ConfirmModal from './ConfirmModal';
import Icon from './Icon';

const ConversationList = ({ onSelectConversation }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {},
        title: '',
        message: ''
    });

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

    const handleDeleteConversation = (conversationId, e) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Delete Conversation?',
            message: 'This will remove the conversation from your inbox. This action is private and only affects your view.',
            onConfirm: () => performDelete(conversationId)
        });
    };

    const performDelete = async (conversationId) => {
        try {
            await chatAPI.deleteConversation(conversationId);
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            toast.success('Conversation removed');
        } catch (error) {
            toast.error('Failed to remove conversation');
        }
    };

    const getOtherUser = (conversation) => {
        if (user?.role === 'seller') {
            return conversation.creatorUser || conversation.creatorProfile?.user || conversation.otherUser || null;
        }
        return conversation.seller || conversation.otherUser || null;
    };

    const getDisplayName = (conversation) => {
        const otherUser = getOtherUser(conversation);
        return otherUser?.name
            || conversation.creatorUser?.name
            || conversation.creatorProfile?.user?.name
            || conversation.seller?.name
            || conversation.promotionId?.title
            || 'Creator';
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
            <div className="glass-card p-12 flex flex-col items-center justify-center space-y-4 border border-white/5">
                <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-xs font-black text-dark-500 uppercase tracking-widest">Loading Chats...</p>
            </div>
        );
    }

    if (!loading && conversations.length === 0) {
        return (
            <EmptyState
                icon="mail-open"
                title="Your Inbox is Empty"
                description="Conversations will appear here once you start a collaboration."
                className="mx-4 my-6"
            />
        );
    }

    return (
        <div className="glass-card overflow-hidden border border-white/5 rounded-premium-2xl">
            <ConfirmModal 
                {...confirmModal}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                variant="danger"
                confirmText="Delete"
            />

            <div className="px-s6 py-s5 border-b border-dark-700/50 bg-dark-800/20">
                <div className="flex items-center gap-2">
                    <Icon name="chat" className="text-primary-400" size={18} />
                    <h3 className="text-body font-black text-dark-100 uppercase tracking-wider">Messages</h3>
                </div>
            </div>
            
            <div className="divide-y divide-dark-700/50 max-h-[600px] overflow-y-auto premium-scrollbar">
                <AnimatePresence>
                    {conversations.map((conversation, index) => {
                        const otherUser = getOtherUser(conversation);
                        const unreadCount = getUnreadCount(conversation);
                        const displayName = getDisplayName(conversation);

                        return (
                            <motion.div
                                key={conversation.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                className="px-s5 py-s4 cursor-pointer transition-all group relative"
                                onClick={() => onSelectConversation(conversation)}
                            >
                                <div className="flex items-center gap-s4">
                                    {/* Avatar Placeholder */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600/20 to-primary-600/20 border border-white/10 flex items-center justify-center text-primary-400 font-black text-lg shadow-inner">
                                            {(displayName || 'U').charAt(0)}
                                        </div>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-dark-900">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className={`text-small font-black truncate ${unreadCount > 0 ? 'text-white' : 'text-dark-100'}`}>
                                                {displayName}
                                            </h4>
                                            <span className="text-[10px] font-bold text-dark-500 uppercase whitespace-nowrap">
                                                {formatTime(conversation.lastMessage?.createdAt || conversation.createdAt)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <p className={`text-xs truncate flex-1 ${unreadCount > 0 ? 'text-dark-200 font-bold' : 'text-dark-400 font-medium'}`}>
                                                {conversation.lastMessage?.content || `Started a chat about ${conversation.promotionId?.title || 'a promotion'}`}
                                            </p>
                                        </div>

                                        {conversation.promotionId && (
                                            <div className="mt-1 flex items-center gap-1.5 opacity-50">
                                                <div className="w-1 h-1 rounded-full bg-dark-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-dark-400 truncate">
                                                    {conversation.promotionId.title}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                        className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2"
                                        title="Delete conversation"
                                    >
                                        <Icon name="trash" size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ConversationList;


