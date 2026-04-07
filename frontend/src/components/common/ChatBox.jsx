import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaComments, FaEllipsisV, FaEdit, FaTrash, FaLock, FaReply, FaShieldAlt, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import useTypingIndicator from '../../hooks/useTypingIndicator';
import useWebSocket from '../../hooks/useWebSocket';
import webSocketService from '../../services/websocket';
import encryptionService from '../../services/encryptionService';

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

const PRIVACY_POLICY_DELETED_MESSAGE = 'This message was deleted under privacy policy';
const DIGIT_WORDS = {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9'
};

const normalizeDigitWords = (content = '') => {
    return String(content || '')
        .toLowerCase()
        .replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine)\b/g, (word) => DIGIT_WORDS[word] || word);
};

const violatesPrivacyPolicy = (content = '') => {
    const normalized = normalizeDigitWords(content).replace(/[\s().-]/g, '').replace(/\+/g, '');
    const hasPhoneLikeSequence = (normalized.match(/\d/g) || []).length >= 10 || /(?:\+?\d[\d\s().-]{7,}\d)/.test(content);
    const hasEmailLikeSequence = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(content)
        || /[a-z0-9._%+-]+\s*(?:@|\[at\]|\bat\b)\s*[a-z0-9.-]+\s*(?:\.|\[dot\]|\bdot\b)\s*[a-z]{2,}/i.test(content);
    const lowered = content.toLowerCase();
    const hasInstagramIdentifier = /(^|\s)@[a-z0-9._]{2,30}\b/i.test(content)
        || /\b(instagram|insta|ig|insta\s*id|ig\s*id)\b/i.test(lowered) && /\b(?:instagram|insta|ig)\b.{0,24}\b[a-z0-9._]{3,}\b/i.test(lowered);
    return hasPhoneLikeSequence || hasEmailLikeSequence || hasInstagramIdentifier;
};

const ChatBox = ({ conversationId, otherUserName, promotionTitle, onClose, conversation }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isSecure, setIsSecure] = useState(false);
    const [otherUserPublicKey, setOtherUserPublicKey] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const sendLockRef = useRef(false);
    const touchStartRef = useRef(null);
    
    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {},
        title: '',
        message: '',
        variant: 'primary'
    });
    const pollInterval = useRef(null);

    // WebSocket hooks
    const { isConnected, isUserOnline, refreshPresence, getPresenceLabel } = useWebSocket(user);
    const { typingUsers, sendTyping, sendStopTyping } = useTypingIndicator(conversationId, isConnected);
    const [presenceLabel, setPresenceLabel] = useState('Offline');

    const otherUser = conversation?.otherUser || conversation?.creatorUser || conversation?.seller || conversation?.participants?.find(p => p.id !== user?.id) || {};
    const otherUserId = otherUser?.id;
    const otherUserDisplayName =
        otherUserName
        || otherUser?.name
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
        const setupEncryption = async () => {
            try {
                if (!user?.id || !user?.email || !user?.name) {
                    setIsSecure(false);
                    return;
                }

                if (!encryptionService.hasPrivateKey(user.id)) {
                    const { privateKey, publicKey } = await encryptionService.generateKeyPair(user.name, user.email);
                    encryptionService.savePrivateKey(user.id, privateKey);
                    await chatAPI.updatePGPKey(publicKey);
                }

                if (!otherUserId) {
                    setIsSecure(false);
                    return;
                }

                const res = await chatAPI.getPGPKey(otherUserId);
                if (res.data.success && res.data.data.publicKey) {
                    setOtherUserPublicKey(res.data.data.publicKey);
                    setIsSecure(true);
                }
            } catch (error) {
                setIsSecure(false);
            }
        };

        setupEncryption();
    }, [otherUserId, user?.id, user?.email, user?.name]);

    useEffect(() => {
        if (!otherUserId) return;
        refreshPresence?.(otherUserId);
    }, [otherUserId, refreshPresence]);

    useEffect(() => {
        if (!otherUserId) {
            setPresenceLabel('Offline');
            return;
        }
        setPresenceLabel(getPresenceLabel ? getPresenceLabel(otherUserId) : (isUserOnline(otherUserId) ? 'Online' : 'Offline'));
    }, [otherUserId, getPresenceLabel, isUserOnline, isConnected]);

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
        const handleNewMessage = (data) => {
            if (data.conversationId === conversationId && data.message?.id) {
                setMessages(prev => (prev.some((message) => message.id === data.message.id) ? prev : [...prev, data.message]));
            }
        };

        const handleMessagesRead = (data) => {
            if (data.conversationId !== conversationId || !data.messageIds?.length) return;
            setMessages(prev => prev.map((message) => (
                data.messageIds.includes(message.id) ? { ...message, isRead: true } : message
            )));
        };

        webSocketService.onNewMessage(handleNewMessage);
        webSocketService.onMessagesRead?.(handleMessagesRead);

        return () => {
            webSocketService.off('new_message', handleNewMessage);
            webSocketService.off('messages_read', handleMessagesRead);
        };
    }, [conversationId]);

    const fetchMessages = async () => {
        if (!conversationId || conversationId === 'undefined') return;
        try {
            const res = await chatAPI.getMessages(conversationId);
            const rawMessages = res.data.data.messages || [];
            const decryptedMessages = await Promise.all(rawMessages.map(async (message) => {
                if (message.isEncrypted && encryptionService.hasPrivateKey(user?.id)) {
                    const decryptedContent = await encryptionService.decryptMessage(
                        message.content,
                        encryptionService.getPrivateKey(user.id)
                    );
                    return { ...message, content: decryptedContent };
                }
                return message;
            }));

            setMessages(decryptedMessages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || sendLockRef.current || !conversationId || conversationId === 'undefined') return;

        sendLockRef.current = true;
        sendStopTyping();
        setSending(true);

        try {
            const plainContent = newMessage.trim();
            const moderatedContent = violatesPrivacyPolicy(plainContent) ? PRIVACY_POLICY_DELETED_MESSAGE : plainContent;
            const outgoingContent = buildMessagePayload(moderatedContent, replyingTo);

            let payloadContent = outgoingContent;
            let isEncrypted = false;

            if (isSecure && otherUserPublicKey) {
                payloadContent = await encryptionService.encryptMessage(outgoingContent, otherUserPublicKey);
                isEncrypted = true;
            }

            const res = await chatAPI.sendMessage(conversationId, {
                content: payloadContent,
                isEncrypted,
                encryptionVersion: '1.0'
            });
            const newMsg = res.data.data.message;

            setMessages(prev => (prev.some((message) => message.id === newMsg.id) ? prev : [...prev, {
                ...newMsg,
                content: moderatedContent,
                isDelivered: true,
                isDeleted: moderatedContent === PRIVACY_POLICY_DELETED_MESSAGE
            }]));
            setNewMessage('');
            setReplyingTo(null);

            if (isConnected && otherUserId) {
                webSocketService.sendMessage(conversationId, newMsg, otherUserId, newMsg.id);
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
            sendLockRef.current = false;
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
                        m.id === messageId ? { ...m, content: PRIVACY_POLICY_DELETED_MESSAGE, isDeleted: true, deletedAt: new Date().toISOString() } : m
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

    const handleMessageTouchStart = (event, messageId) => {
        if (typeof window === 'undefined' || window.innerWidth >= 768) return;
        const touch = event.touches?.[0];
        if (!touch) return;
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, messageId };
    };

    const handleMessageTouchEnd = (event, message) => {
        if (typeof window === 'undefined' || window.innerWidth >= 768) return;
        const start = touchStartRef.current;
        const touch = event.changedTouches?.[0];
        touchStartRef.current = null;
        if (!start || !touch || start.messageId !== message.id || message.isDeleted) return;

        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        if (deltaX < -60 && Math.abs(deltaY) < 40) {
            setReplyingTo({ id: message.id, content: parseMessageContent(message.content).displayContent });
        }
    };

    const lastOwnMessageId = [...messages].reverse().find((message) => message.senderId === user?.id)?.id;

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
                className="fixed inset-0 w-full h-[100dvh] bg-dark-950/90 backdrop-blur-3xl border-0 shadow-none z-[100] flex flex-col overflow-hidden"
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
                                        {isUserOnline(otherUserId)
                                            ? <span className="text-emerald-400/80">Online</span>
                                            : presenceLabel}
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
                                                    className={`px-5 py-3.5 rounded-3xl shadow-2xl relative group
                                                        ${message.isDeleted 
                                                            ? 'bg-dark-800/40 border border-white/5 text-dark-600 italic text-xs' 
                                                            : isOwn 
                                                                ? 'bg-gradient-to-br from-primary-600 via-indigo-600 to-fuchsia-600 text-white rounded-tr-none border border-white/10' 
                                                                : 'bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-tl-none'
                                                        }`}
                                                    onTouchStart={(event) => handleMessageTouchStart(event, message.id)}
                                                    onTouchEnd={(event) => handleMessageTouchEnd(event, message)}
                                                    style={{ touchAction: 'pan-y' }}
                                                >
                                                        {message.isDeleted && (
                                                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 not-italic">
                                                                <FaShieldAlt size={8} />
                                                                Privacy policy
                                                            </div>
                                                        )}
                                                    {editingMessageId === message.id ? (
                                                        <div className="space-y-3">
                                                            <textarea
                                                                value={editContent}
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                className="w-full min-h-[96px] resize-none rounded-2xl border border-white/10 bg-dark-950/50 px-4 py-3 text-sm text-white outline-none focus:border-primary-500/60"
                                                            />
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingMessageId(null);
                                                                        setEditContent('');
                                                                    }}
                                                                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-dark-300 hover:bg-white/5"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditMessage(message.id)}
                                                                    className="rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-400"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-[14px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{parseMessageContent(message.content).displayContent}</p>

                                                            {!message.isDeleted && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        setActiveMessageMenu(activeMessageMenu === message.id ? null : message.id);
                                                                    }}
                                                                    className="absolute top-2 right-2 p-2 bg-dark-900/70 text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                                                                    title="Message options"
                                                                >
                                                                    <FaEllipsisV size={12} />
                                                                </button>
                                                            )}

                                                            {activeMessageMenu === message.id && !message.isDeleted && (
                                                                <div className="absolute top-12 right-2 z-20 w-44 rounded-2xl border border-white/10 bg-dark-900/95 shadow-2xl overflow-hidden">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setReplyingTo({ id: message.id, content: parseMessageContent(message.content).displayContent });
                                                                            setActiveMessageMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-dark-100 hover:bg-white/5"
                                                                    >
                                                                        <FaReply size={12} /> Reply
                                                                    </button>
                                                                    {isOwn && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => startEdit(message)}
                                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-dark-100 hover:bg-white/5"
                                                                        >
                                                                            <FaEdit size={12} /> Edit
                                                                        </button>
                                                                    )}
                                                                    {isOwn && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                handleDeleteMessage(message.id);
                                                                                setActiveMessageMenu(null);
                                                                            }}
                                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
                                                                        >
                                                                            <FaTrash size={12} /> Delete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <div className={`flex items-center gap-2 px-1 text-[10px] font-black text-dark-500 uppercase tracking-widest ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                    <span>{formatTime(message.createdAt)}</span>
                                                    {message.isEdited && <span>• Edited</span>}
                                                    {isOwn && message.id === lastOwnMessageId && (
                                                        <span className={`inline-flex items-center gap-1 ${message.isRead ? 'text-sky-400' : 'text-dark-500'}`} title={message.isRead ? 'Read' : 'Delivered'}>
                                                            {message.isRead ? <FaCheckDouble size={10} /> : <FaCheck size={10} />}
                                                            <span>{message.isRead ? 'Read' : 'Delivered'}</span>
                                                        </span>
                                                    )}
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
                    <div className="h-4" />
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

