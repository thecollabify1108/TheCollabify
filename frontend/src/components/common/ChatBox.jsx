import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaComments, FaEllipsisV, FaEdit, FaTrash, FaLock, FaReply } from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import useTypingIndicator from '../../hooks/useTypingIndicator';
import useWebSocket from '../../hooks/useWebSocket';
import webSocketService from '../../services/websocket';

const REPLY_HEADER_REGEX = /^\[\[reply:([^|\]]+)\|([^\]]*)\]\]\n/;

const parseMessageContent = (content = '') => {
    const match = content.match(REPLY_HEADER_REGEX);
    if (!match) {
        return { displayContent: content, replyMeta: null };
    }

    const replyToMessageId = match[1];
    const encodedSnippet = match[2] || '';
    let replySnippet = '';
    try {
        replySnippet = decodeURIComponent(encodedSnippet);
    } catch {
        replySnippet = encodedSnippet;
    }

    return {
        displayContent: content.replace(REPLY_HEADER_REGEX, ''),
        replyMeta: {
            replyToMessageId,
            replySnippet
        }
    };
};

const buildMessagePayload = (content, replyTo) => {
    if (!replyTo?.id) return content;

    const snippet = encodeURIComponent((replyTo.content || '').slice(0, 120));
    return `[[reply:${replyTo.id}|${snippet}]]\n${content}`;
};

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
    const [replyingTo, setReplyingTo] = useState(null);
    
    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {},
        title: '',
        message: '',
        variant: 'primary'
    });
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    // WebSocket hooks
    const { isConnected, isUserOnline } = useWebSocket(user);
    const { typingUsers, sendTyping, sendStopTyping } = useTypingIndicator(conversationId, isConnected);

    // Get other user ID for online status
    const otherUserId = conversation?.participants?.find(p => p.id !== user?.id)?.id;
    const otherUserDisplayName =
        otherUserName
        || conversation?.otherUser?.name
        || conversation?.creatorUser?.name
        || conversation?.seller?.name
        || 'Negotiation';

    // Check if conversation is pending
    useEffect(() => {
        if (conversation) {
            setIsPending(conversation.acceptanceStatus?.byCreator === 'pending');
        }
    }, [conversation]);

    useEffect(() => {
        if (!conversationId || conversationId === 'undefined') {
            setLoading(false);
            return;
        }

        fetchMessages();
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
        const outgoingContent = buildMessagePayload(newMessage.trim(), replyingTo);

        try {
            const res = await chatAPI.sendMessage(conversationId, outgoingContent);
            const newMsg = res.data.data.message;
            setMessages(prev => [...prev, newMsg]);
            setNewMessage('');
            setReplyingTo(null);

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
        setConfirmModal({
            isOpen: true,
            title: 'Delete Message?',
            message: 'Are you sure you want to delete this message?',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await chatAPI.deleteMessage(messageId);
                    setMessages(prev => prev.map(m =>
                        m.id === messageId ? { ...m, content: 'This message was deleted', isDeleted: true } : m
                    ));
                    toast.success('Message deleted');
                } catch (error) {
                    toast.error('Failed to delete message');
                }
            }
        });
    };

    const handleDeleteConversation = async () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Conversation?',
            message: 'Are you sure you want to delete this conversation?',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await chatAPI.deleteConversation(conversationId);
                    toast.success('Conversation deleted');
                    onClose();
                } catch (error) {
                    toast.error('Failed to delete conversation');
                }
            }
        });
    };

    const startEdit = (message) => {
        setEditingMessageId(message.id);
        setEditContent(parseMessageContent(message.content).displayContent);
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
                initial={{ opacity: 0, scale: 0.98, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: 20 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-dark-950/80 backdrop-blur-3xl border-l border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.8)] z-[100] flex flex-col overflow-hidden"
            >
                <ConfirmModal 
                    {...confirmModal}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                />
                
                {/* Premium Header */}
                <div className="relative px-6 py-6 border-b border-white/5 bg-dark-900/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="relative group">
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 p-[2px] shadow-lg shadow-primary-500/20"
                                >
                                    <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center text-white text-2xl font-black">
                                        {otherUserDisplayName?.[0]?.toUpperCase()}
                                    </div>
                                </motion.div>
                                {otherUserId && (
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-dark-950 ${isUserOnline(otherUserId) ? 'bg-emerald-500' : 'bg-dark-600'}`}>
                                        {isUserOnline(otherUserId) && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{otherUserDisplayName}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-primary-400 bg-primary-400/10 px-2 py-0.5 rounded-md uppercase tracking-wider border border-primary-500/20">
                                        {promotionTitle || 'Collaboration'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-dark-600" />
                                    <span className="text-xs font-medium text-dark-400">
                                        {isConnected ? <span className="text-emerald-400/80">Secured</span> : 'Establishing...'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-3 text-dark-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                            >
                                <FaEllipsisV size={16} />
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-3 text-dark-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                            >
                                <FaTimes size={18} />
                            </button>

                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="absolute right-6 top-24 bg-dark-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 w-56 z-50 overflow-hidden"
                                    >
                                        <button
                                            onClick={handleDeleteConversation}
                                            className="w-full px-4 py-3 text-left text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center font-bold"
                                        >
                                            <FaTrash className="mr-3" />
                                            Terminate Chat
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div 
                    className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-dark-950/40 relative"
                    onClick={() => { setActiveMessageMenu(null); setShowMenu(false); }}
                >
                    {isPending && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-lg shadow-amber-500/5 animate-pulse">
                            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                                <FaLock size={14} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider leading-none mb-1">Pending Approval</h4>
                                <p className="text-[11px] text-amber-400/80 font-medium leading-relaxed">
                                    {canSendMessage 
                                        ? "You can send one initial pitch before the creator accepts."
                                        : "Your pitch is sent. Conversation will unlock upon acceptance."}
                                </p>
                            </div>
                        </div>
                    )}

                    {!conversationId || conversationId === 'undefined' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-50">
                            <div className="w-32 h-32 bg-dark-800 rounded-full flex items-center justify-center mb-8 border border-white/5">
                                <FaComments size={48} className="text-dark-600" />
                            </div>
                            <h4 className="text-2xl font-black text-white mb-3">Silent Vault</h4>
                            <p className="text-sm text-dark-400 leading-relaxed">Initiate a collaboration from the marketplace to start negotiating here.</p>
                        </div>
                    ) : loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-12">
                            <div className="w-24 h-24 bg-primary-500/10 rounded-3xl flex items-center justify-center mb-8 border border-primary-500/20 rotate-12">
                                <FaPaperPlane size={32} className="text-primary-400 -rotate-12" />
                            </div>
                            <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tighter italic">Establish Connection</h4>
                            <p className="text-xs text-dark-500 font-bold leading-relaxed uppercase tracking-widest max-w-[200px]">Send the first move to start the collaboration journey</p>
                        </div>
                    ) : (
                        Object.entries(messageGroups).map(([dateKey, msgs]) => (
                            <div key={dateKey} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-white/5" />
                                    <span className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">{formatDate(msgs[0].createdAt)}</span>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>

                                {msgs.map((message, index) => {
                                    const isOwn = message.senderId === user?.id;
                                    return (
                                        <motion.div
                                            key={message.id || index}
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                                        >
                                            <div className={`relative max-w-[85%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                                                {parseMessageContent(message.content).replyMeta && (
                                                    <div className={`max-w-full px-3 py-2 rounded-xl border text-xs ${isOwn ? 'bg-primary-500/10 border-primary-500/30 text-primary-200' : 'bg-white/5 border-white/10 text-dark-300'}`}>
                                                        <p className="font-bold uppercase tracking-wider text-[10px] mb-1">Replying to</p>
                                                        <p className="line-clamp-2">{parseMessageContent(message.content).replyMeta.replySnippet || 'Previous message'}</p>
                                                    </div>
                                                )}
                                                <div
                                                    className={`px-5 py-3.5 rounded-3xl shadow-2xl relative
                                                        ${message.isDeleted 
                                                            ? 'bg-dark-800/40 border border-white/5 text-dark-600 italic text-xs' 
                                                            : isOwn 
                                                                ? 'bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-tr-none border border-white/10' 
                                                                : 'bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-tl-none'
                                                        }`}
                                                >
                                                    <p className="text-[14px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{parseMessageContent(message.content).displayContent}</p>
                                                    
                                                    {isOwn && !message.isDeleted && (
                                                        <div className="absolute top-0 -left-12 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2 p-1">
                                                            <button onClick={() => startEdit(message)} className="p-2 bg-dark-800 text-primary-400 rounded-xl border border-white/5 hover:bg-primary-500 hover:text-white transition-all"><FaEdit size={12} /></button>
                                                            <button onClick={() => handleDeleteMessage(message.id)} className="p-2 bg-dark-800 text-rose-400 rounded-xl border border-white/5 hover:bg-rose-500 hover:text-white transition-all"><FaTrash size={12} /></button>
                                                        </div>
                                                    )}

                                                    {!isOwn && !message.isDeleted && (
                                                        <div className="absolute top-0 -right-12 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2 p-1">
                                                            <button
                                                                onClick={() => setReplyingTo({ id: message.id, content: parseMessageContent(message.content).displayContent })}
                                                                className="p-2 bg-dark-800 text-primary-400 rounded-xl border border-white/5 hover:bg-primary-500 hover:text-white transition-all"
                                                                title="Reply"
                                                            >
                                                                <FaReply size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`flex items-center gap-2 px-1 text-[10px] font-black text-dark-500 uppercase tracking-widest ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                    <span>{formatTime(message.createdAt)}</span>
                                                    {message.isEdited && <span>• Edited</span>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                    
                    {typingUsers?.length > 0 && (
                        <div className="flex justify-start">
                             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                                </div>
                                <span className="text-[10px] font-black text-dark-500 uppercase">Typing</span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Premium Input */}
                <div className="p-6 bg-dark-900/60 backdrop-blur-2xl border-t border-white/5">
                    {replyingTo && (
                        <div className="mb-3 rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-primary-300 mb-1">Replying to message</p>
                                    <p className="text-xs text-primary-100 truncate">{replyingTo.content || 'Previous message'}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="text-primary-200 hover:text-white transition"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                    <form 
                        onSubmit={handleSendMessage}
                        className={`overflow-hidden rounded-[28px] border border-white/10 bg-dark-950/40 p-1.5 flex gap-3 focus-within:border-primary-500/50 focus-within:bg-dark-950 transition-all shadow-2xl ${(!canSendMessage || !conversationId) ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                    >
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleMessageChange}
                            onBlur={sendStopTyping}
                            placeholder={isPending ? (canSendMessage ? "Send your initial pitch..." : "Awaiting response...") : "Write a proposal..."}
                            className="flex-1 bg-transparent px-5 py-3 text-[15px] font-medium text-white placeholder-dark-500 focus:outline-none"
                            disabled={!canSendMessage || !conversationId}
                        />
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!newMessage.trim() || sending || !canSendMessage || !conversationId}
                            className="bg-primary-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 disabled:grayscale transition-all"
                        >
                            {sending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FaPaperPlane size={18} className="ml-[-2px]" />
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ChatBox;

