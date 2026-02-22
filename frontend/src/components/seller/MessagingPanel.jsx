import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch,
    FaPaperPlane,
    FaArrowLeft,
    FaUser,
    FaCheck,
    FaCheckDouble,
    FaEllipsisV,
    FaImage,
    FaSmile,
    FaComments,
    FaLock
} from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { format, isToday, isYesterday } from 'date-fns';
import SwipeableConversationItem from './SwipeableConversationItem';
import { SkeletonMessage } from '../common/Skeleton';

const MessagingPanel = ({ conversations, onSelectConversation, selectedConversation, onBack, onDeleteConversation }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const messagesEndRef = useRef(null);

    // Onboarding Hint Logic
    useEffect(() => {
        const hasSeenHint = localStorage.getItem('hasSeenSwipeHint');
        if (!hasSeenHint && conversations?.length > 0) {
            // Delay slightly to let UI settle
            const timer = setTimeout(() => {
                setShowSwipeHint(true);
                // Mark as seen after animation plays
                setTimeout(() => {
                    localStorage.setItem('hasSeenSwipeHint', 'true');
                    setShowSwipeHint(false);
                }, 2000);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [conversations]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages();
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        if (!selectedConversation?._id) return;
        try {
            setLoading(true);
            const res = await chatAPI.getMessages(selectedConversation._id);
            setMessages(res.data.data.messages || []);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation?._id) return;

        try {
            const res = await chatAPI.sendMessage(selectedConversation._id, newMessage);
            setMessages([...messages, res.data.data.message]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatMessageTime = (date) => {
        const msgDate = new Date(date);
        if (isToday(msgDate)) {
            return format(msgDate, 'HH:mm');
        } else if (isYesterday(msgDate)) {
            return 'Yesterday ' + format(msgDate, 'HH:mm');
        }
        return format(msgDate, 'MMM d, HH:mm');
    };

    const isPending = selectedConversation?.status === 'PENDING';
    const myMessageCount = selectedConversation ? messages.filter(m => m.senderRole === 'seller').length : 0;
    const canSendMessage = !isPending || myMessageCount === 0;

    const filteredConversations = conversations?.filter(conv =>
        conv.creatorUserId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.promotionRequestId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="rounded-premium-2xl bg-dark-800/40 backdrop-blur-xl border border-dark-700/50 shadow-premium overflow-hidden h-[calc(100vh-200px)] md:h-[600px] flex flex-col md:flex-row w-full">
            {/* Conversation List */}
            <motion.div
                className={`w-full md:w-80 border-r border-dark-700/50 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'
                    }`}
            >
                {/* Search Header */}
                <div className="p-s4 border-b border-dark-700/50">
                    <h3 className="text-body font-black text-dark-100 mb-s3 uppercase tracking-wider">Messages</h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-dark-900/60 border border-dark-700/50 rounded-premium-lg text-dark-200 placeholder-dark-600 focus:outline-none focus:border-primary-500 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                {/* Conversation Items */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-s12">
                            <FaUser className="text-4xl text-dark-700 mx-auto mb-s3" />
                            <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-widest">No conversations yet</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv, index) => (
                            <SwipeableConversationItem
                                key={conv._id}
                                conversation={conv}
                                isSelected={selectedConversation?._id === conv._id}
                                onClick={onSelectConversation}
                                onDelete={onDeleteConversation}
                                formatTime={formatMessageTime}
                                peek={index === 0 && showSwipeHint}
                            />
                        ))
                    )}
                </div>
            </motion.div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-s4 border-b border-dark-700/50 flex items-center gap-s3 bg-dark-800/40">
                            <button
                                onClick={onBack}
                                className="md:hidden p-s2 hover:bg-dark-700 rounded-premium-lg text-dark-400"
                            >
                                <FaArrowLeft />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
                                <span className="text-white font-black">
                                    {selectedConversation.creatorUserId?.name?.charAt(0) || 'C'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-body font-bold text-dark-100">
                                    {selectedConversation.creatorUserId?.name || 'Creator'}
                                </p>
                                <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-wider">
                                    {selectedConversation.promotionRequestId?.title || 'Campaign'}
                                </p>
                            </div>
                            <button className="p-2 hover:bg-dark-800 rounded-lg text-dark-400">
                                <FaEllipsisV />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-s4 space-y-s4 bg-dark-900/30">
                            {loading ? (
                                <SkeletonMessage />
                            ) : messages.length === 0 ? (
                                <div className="text-center py-s8">
                                    <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-widest">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <motion.div
                                        key={msg._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.senderRole === 'seller' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] p-s3 rounded-premium-xl shadow-sm ${msg.senderRole === 'seller'
                                                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-br-none'
                                                : 'bg-dark-800 border border-dark-700/50 text-dark-200 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                            <div className={`flex items-center gap-1 mt-s1 ${msg.senderRole === 'seller' ? 'justify-end' : ''
                                                }`}>
                                                <span className="text-[10px] font-bold opacity-70 uppercase">
                                                    {formatMessageTime(msg.createdAt)}
                                                </span>
                                                {msg.senderRole === 'seller' && (
                                                    <FaCheckDouble className="text-[10px] opacity-70" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input - Always enabled but sanitized if pending */}
                        <div className="border-t border-dark-700/50 bg-dark-800/80 backdrop-blur-md">
                            {isPending && (
                                <div className={`px-s4 py-s2 border-b text-center transition-colors ${canSendMessage ? 'bg-amber-500/10 border-amber-500/20' : 'bg-dark-900/60 border-dark-700/30'}`}>
                                    <p className={`text-xs-pure font-bold flex items-center justify-center gap-2 uppercase tracking-wide ${canSendMessage ? 'text-amber-500' : 'text-dark-500'}`}>
                                        <FaLock className="text-[10px]" />
                                        <span>
                                            {canSendMessage
                                                ? "1 pre-inquiry message enabled. Full chat unlocks after acceptance."
                                                : "Pre-inquiry sent. Waiting for response."}
                                        </span>
                                    </p>
                                </div>
                            )}
                            <form onSubmit={sendMessage} className="p-s4 flex items-center gap-s3">
                                {canSendMessage && (
                                    <button type="button" className="p-s2 hover:bg-dark-700 rounded-premium-lg text-dark-500 transition-colors">
                                        <FaSmile />
                                    </button>
                                )}
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={isPending ? (canSendMessage ? "Send your pre-inquiry question..." : "Waiting for acceptance...") : "Type a message..."}
                                    className="flex-1 px-s4 py-2 bg-dark-900 border border-dark-700/50 rounded-full text-dark-200 placeholder-dark-600 focus:outline-none focus:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                    disabled={!canSendMessage}
                                />
                                <motion.button
                                    type="submit"
                                    disabled={!newMessage.trim() || !canSendMessage}
                                    whileHover={{ scale: canSendMessage ? 1.05 : 1 }}
                                    whileTap={{ scale: canSendMessage ? 0.95 : 1 }}
                                    className="p-s3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2"
                                >
                                    <FaPaperPlane />
                                    {isPending && canSendMessage && <span className="text-xs-pure font-black uppercase tracking-widest px-1">SEND</span>}
                                </motion.button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <FaComments className="text-6xl text-dark-800 mx-auto mb-s4" />
                            <p className="text-body font-black text-dark-400 uppercase tracking-widest">Select a conversation</p>
                            <p className="text-xs-pure font-bold text-dark-600 uppercase tracking-widest mt-2">Choose a chat to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagingPanel;
