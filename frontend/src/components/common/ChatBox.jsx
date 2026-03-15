import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaComments, FaEllipsisV, FaEdit, FaTrash, FaLock, FaCircle } from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import useTypingIndicator from '../../hooks/useTypingIndicator';
import useWebSocket from '../../hooks/useWebSocket';
import webSocketService from '../../services/websocket';
import OnlineStatusIndicator from '../realtime/OnlineStatusIndicator';
import TypingIndicator from '../realtime/TypingIndicator';

const ChatBox = ({ conversationId, otherUserName, promotionTitle, onClose, conversation }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    // WebSocket hooks
    const { isConnected, isUserOnline } = useWebSocket(user);
    const { typingUsers, sendTyping, sendStopTyping } = useTypingIndicator(conversationId, isConnected);

    // Get other user ID for online status
    const otherUserId = conversation?.participants?.find(p => p.id !== user?.id)?.id;

    // Check if conversation is pending
    useEffect(() => {
        if (conversation) {
            setIsPending(conversation.acceptanceStatus?.byCreator === 'pending');
        }
    }, [conversation]);

    useEffect(() => {
        // Prevent strictly firing API requests for undefined or empty conversations
        if (!conversationId || conversationId === 'undefined') {
            setLoading(false);
            return;
        }

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
        if (!conversationId || conversationId === 'undefined') return;

        try {
            const res = await chatAPI.getMessages(conversationId);
            setMessages(res.data.data.messages || []);
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
        if (!newMessage.trim() || sending || !conversationId || conversationId === 'undefined') return;

        sendStopTyping();
        setSending(true);

        try {
            const res = await chatAPI.sendMessage(conversationId, newMessage.trim());
            const newMsg = res.data.data.message;
            setMessages(prev => [...prev, newMsg]);
            setNewMessage('');

            // Send via WebSocket for real-time delivery
            if (isConnected && otherUserId) {
                webSocketService.sendMessage(conversationId, newMsg, otherUserId);
            }
        } catch (error) {
            if (error.response?.data?.isPending) {
                setIsPending(true);
                toast.error('Creator hasn\'t accepted your message request yet');
            } else {
                toast.error('Failed to send message');
            }
        } finally {
            setSending(false);
        }
    };

    const handleMessageChange = (e) => {
        setNewMessage(e.target.value);
        if (e.target.value.trim() && isConnected && conversationId && conversationId !== 'undefined') {
            sendTyping();
        } else {
            sendStopTyping();
        }
    };

    const handleEditMessage = async (messageId) => {
        if (!editContent.trim()) return;
        try {
            await chatAPI.editMessage(messageId, editContent.trim());
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, content: editContent.trim(), isEdited: true } : m
            ));
            setEditingMessageId(null);
            setEditContent('');
            toast.success('Message edited');
        } catch (error) {
            toast.error('Failed to edit message');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await chatAPI.deleteMessage(messageId);
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, content: 'This message was deleted', isDeleted: true } : m
            ));
            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const handleDeleteConversation = async () => {
        if (!window.confirm('Delete this entire conversation?')) return;
        try {
            await chatAPI.deleteConversation(conversationId);
            toast.success('Conversation deleted');
            onClose();
        } catch (error) {
            toast.error('Failed to delete conversation');
        }
    };

    const startEdit = (message) => {
        setEditingMessageId(message.id);
        setEditContent(message.content);
        setActiveMessageMenu(null);
    };

    const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const formatDate = (date) => {
        const today = new Date();
        const messageDate = new Date(date);
        if (messageDate.toDateString() === today.toDateString()) return 'Today';
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const groupMessagesByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            const dateKey = new Date(msg.createdAt).toDateString();
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(msg);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate(messages);
    const myMessageCount = messages.filter(m => m.senderId === user?.id).length;
    const canSendMessage = !isPending || myMessageCount === 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="fixed inset-4 md:inset-auto md:bottom-4 md:right-4 md:w-96 md:h-[550px] bg-dark-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-[32px] flex flex-col overflow-hidden z-50 ring-1 ring-white/5"
            >
                {/* Header Profile - Premium Gradient Shadow */}
                <div className="px-5 py-4 bg-dark-900/60 backdrop-blur-md flex items-center justify-between border-b border-white/5 relative shadow-md">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(var(--color-primary-500),0.4)] border border-white/20"
                            >
                                {otherUserName?.[0]?.toUpperCase() || 'U'}
                            </motion.div>
                            {otherUserId && (
                                <OnlineStatusIndicator
                                    isOnline={isUserOnline(otherUserId)}
                                    size="sm"
                                    position="avatar"
                                />
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base leading-tight tracking-wide">{otherUserName || 'User'}</h3>
                            <p className="text-dark-300 text-xs font-medium truncate max-w-[170px] mt-0.5 flex items-center gap-1.5">
                                {otherUserId && isUserOnline(otherUserId) ? (
                                    <>
                                        <FaCircle className="text-green-500 text-[8px] animate-pulse" />
                                        <span className="text-green-400">Online</span>
                                    </>
                                ) : (
                                    <span className="text-dark-400 opacity-80">{promotionTitle || 'Direct Message'}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-dark-800/50 rounded-full p-1 border border-white/5">
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <FaEllipsisV size={14} />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="absolute right-0 top-10 bg-dark-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 w-48 z-50 overflow-hidden"
                                    >
                                        <button
                                            onClick={handleDeleteConversation}
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center font-medium"
                                        >
                                            <FaTrash className="mr-3" />
                                            Delete Conversation
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all bg-dark-800/80"
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>

                {/* Pending Status Guard */}
                <AnimatePresence>
                    {isPending && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className={`px-4 py-2.5 border-b flex items-center gap-2 text-xs font-semibold backdrop-blur-md ${canSendMessage ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-dark-800/50 border-white/5 text-dark-300'}`}
                        >
                            <FaLock size={10} className="mt-0.5" />
                            <span className="leading-snug">
                                {canSendMessage
                                    ? "1 pre-inquiry message available before acceptance."
                                    : "Pre-inquiry sent. Awaiting acceptance."}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Body / Messages View */}
                <div 
                    className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-gradient-to-b from-dark-950/20 to-dark-900/40 relative" 
                    onClick={() => { setActiveMessageMenu(null); setShowMenu(false); }}
                >
                    {/* Empty Conversation Welcome State */}
                    {!conversationId || conversationId === 'undefined' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <motion.div 
                                animate={{ y: [0, -10, 0] }} 
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="w-20 h-20 bg-gradient-to-tr from-primary-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-4 border border-indigo-500/30 shadow-[0_0_30px_rgba(var(--color-primary-500),0.1)]"
                            >
                                <FaComments className="text-3xl text-primary-400" />
                            </motion.div>
                            <h4 className="text-white font-bold text-lg mb-1">Select a Conversation</h4>
                            <p className="text-dark-300 text-sm max-w-[200px]">Choose a user from your messages to start chatting.</p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
                                <div className="absolute inset-2 rounded-full border-r-2 border-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center px-4"
                        >
                            <div className="w-20 h-20 bg-dark-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                                <FaPaperPlane className="text-2xl text-dark-400 ml-1" />
                            </div>
                            <h4 className="text-white font-semibold text-base mb-1">It's quiet in here</h4>
                            <p className="text-dark-400 text-sm max-w-[220px]">Send the very first message to kick off your collaboration!</p>
                        </motion.div>
                    ) : (
                        Object.entries(messageGroups).map(([dateKey, msgs]) => (
                            <div key={dateKey} className="space-y-4">
                                <div className="flex shadow-none items-center justify-center sticky top-0 z-10 py-1">
                                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider bg-dark-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 shadow-sm">
                                        {formatDate(msgs[0].createdAt)}
                                    </span>
                                </div>

                                {msgs.map((message, index) => {
                                    const isOwn = message.senderId === user?.id;
                                    const showTriangle = index === msgs.length - 1 || msgs[index + 1].senderId !== message.senderId;

                                    return (
                                        <motion.div
                                            key={message.id || index}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group relative`}
                                        >
                                            {editingMessageId === message.id ? (
                                                <div className="flex gap-2 items-center w-[85%] bg-dark-800 border border-primary-500/50 rounded-2xl p-2 shadow-lg">
                                                    <input
                                                        type="text"
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 px-2"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleEditMessage(message.id)}
                                                    />
                                                    <button onClick={() => handleEditMessage(message.id)} className="px-3 py-1.5 bg-primary-500/20 text-primary-300 rounded-lg text-xs font-bold hover:bg-primary-500/30 transition">Save</button>
                                                    <button onClick={() => setEditingMessageId(null)} className="px-3 py-1.5 bg-dark-700 text-dark-300 rounded-lg text-xs font-bold hover:bg-dark-600 transition">Drop</button>
                                                </div>
                                            ) : (
                                                <div className={`relative max-w-[80%] flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    
                                                    {!isOwn && showTriangle && (
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-dark-600 to-dark-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white/70 font-bold border border-white/10 shadow-sm shrink-0 -mb-1">
                                                            {otherUserName?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Chat Bubble Core */}
                                                    <div
                                                        className={`relative px-4 py-2.5 shadow-md backdrop-blur-sm
                                                            ${message.isDeleted 
                                                                ? 'bg-dark-800/80 border border-white/5 text-dark-400 italic rounded-2xl' 
                                                                : isOwn 
                                                                    ? `bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-2xl ${showTriangle ? 'rounded-br-sm' : ''}` 
                                                                    : `bg-dark-800/90 border border-white/5 text-dark-50 rounded-2xl ${showTriangle ? 'rounded-bl-sm' : ''}`
                                                            }
                                                        `}
                                                        style={isOwn && !message.isDeleted ? { boxShadow: '0 4px 15px rgba(var(--color-primary-500), 0.2)' } : {}}
                                                    >
                                                        {isOwn && !message.isDeleted && (
                                                            <div className="absolute top-1/2 -translate-y-1/2 -left-16 hidden group-hover:flex gap-1.5 bg-dark-800/80 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 shadow-lg">
                                                                <button onClick={(e) => { e.stopPropagation(); startEdit(message); }} className="text-dark-300 hover:text-white transition transform hover:scale-110"><FaEdit size={11} /></button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(message.id); }} className="text-dark-300 hover:text-red-400 transition transform hover:scale-110"><FaTrash size={11} /></button>
                                                            </div>
                                                        )}

                                                        <p className="text-[14px] leading-relaxed break-words tracking-wide">{message.content}</p>
                                                        
                                                        <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isOwn ? 'text-white/70' : 'text-dark-400'}`}>
                                                            {message.isEdited && <span className="text-[10px] font-medium italic opacity-70">Edited</span>}
                                                            <span className="text-[10px] font-medium tracking-wider">{formatTime(message.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))
                    )}

                    {typingUsers?.length > 0 && (
                        <div className="flex justify-start mb-2 pl-8">
                            <div className="bg-dark-800/80 backdrop-blur-md border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm inline-flex items-center gap-2">
                                <span className="text-xs text-dark-300 font-medium">Typing</span>
                                <TypingIndicator typingUsers={typingUsers} variant="custom" className="!h-2 !m-0" />
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Modern Floating Action Input */}
                <div className="p-4 bg-dark-900/80 backdrop-blur-xl border-t border-white/5 relative">
                    <form 
                        onSubmit={handleSendMessage} 
                        className={`flex items-end gap-3 bg-dark-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-1.5 pr-2 transition-all duration-300 focus-within:bg-dark-800 focus-within:border-primary-500/50 focus-within:shadow-[0_0_20px_rgba(var(--color-primary-500),0.15)] ${(!canSendMessage || !conversationId || conversationId === 'undefined') ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                    >
                        <div className="flex-1 max-h-[120px] overflow-y-auto custom-scrollbar min-h-[44px] flex items-center px-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={handleMessageChange}
                                onBlur={sendStopTyping}
                                placeholder={isPending ? (canSendMessage ? "Write a short pre-inquiry..." : "Locked until accepted") : "Type your message..."}
                                className="w-full bg-transparent border-none text-[15px] text-white placeholder-dark-400 focus:outline-none focus:ring-0 leading-tight"
                                maxLength={2000}
                                disabled={!canSendMessage || !conversationId || conversationId === 'undefined'}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!newMessage.trim() || sending || !canSendMessage || !conversationId}
                            className="w-10 h-10 shrink-0 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-full flex items-center justify-center text-white disabled:opacity-40 shadow-md transform transition-all"
                        >
                            {sending ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FaPaperPlane className="ml-[-2px] text-sm" />
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatBox;

