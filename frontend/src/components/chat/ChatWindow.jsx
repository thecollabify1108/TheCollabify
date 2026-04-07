import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPhone, FaVideo, FaInfoCircle, FaArrowLeft, FaEllipsisV, FaTimes } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import { chatAPI } from '../../services/api';
import useTypingIndicator from '../../hooks/useTypingIndicator';
import TypingIndicator from '../realtime/TypingIndicator';
import encryptionService from '../../services/encryptionService';
import { FaLock, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const PRIVACY_POLICY_DELETED_MESSAGE = 'This message was deleted under privacy policy';
const DIGIT_WORDS = {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9'
};

const ChatWindow = ({ conversation, currentUser, socketService, onlineUsers, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [isSecure, setIsSecure] = useState(false);
    const [otherUserPublicKey, setOtherUserPublicKey] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);

    const otherUser = conversation.otherUser || conversation.creatorUser || conversation.seller || {};
    const otherUserId = otherUser?.id;
    const otherUserName = otherUser?.name || 'Unknown User';
    const isOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;

    const replyHeaderRegex = /^\[\[reply:([^|\]]+)\|([^\]]*)\]\]\n/;

    const parseMessageContent = (content = '') => {
        const match = content.match(replyHeaderRegex);
        if (!match) {
            return { displayContent: content, replyMeta: null };
        }

        let replySnippet = '';
        try {
            replySnippet = decodeURIComponent(match[2] || '');
        } catch {
            replySnippet = match[2] || '';
        }

        return {
            displayContent: content.replace(replyHeaderRegex, ''),
            replyMeta: { replyToMessageId: match[1], replySnippet }
        };
    };

    const buildMessagePayload = (content) => {
        if (!replyingTo?.id) return content;
        return `[[reply:${replyingTo.id}|${encodeURIComponent((replyingTo.content || '').slice(0, 120))}]]\n${content}`;
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
        const hasInstagramIdentifier = /(^|\s)@[a-z0-9._]{2,30}\b/i.test(content)
            || /\b(instagram|insta|ig|insta\s*id|ig\s*id)\b/i.test(content.toLowerCase()) && /\b(?:instagram|insta|ig)\b.{0,24}\b[a-z0-9._]{3,}\b/i.test(content.toLowerCase());
        return hasPhoneLikeSequence || hasEmailLikeSequence || hasInstagramIdentifier;
    };

    const { typingUsers, sendTyping, sendStopTyping } = useTypingIndicator(conversation.id, true);

    useEffect(() => {
        if (conversation.id) {
            setupEncryption();
            fetchMessages();
        }
    }, [conversation.id]);

    const setupEncryption = async () => {
        try {
            // 1. Ensure current user has a key pair
            if (!encryptionService.hasPrivateKey(currentUser.id)) {
                console.log('Generating new Guardian Elite PGP keys...');
                const { privateKey, publicKey } = await encryptionService.generateKeyPair(currentUser.name, currentUser.email);
                encryptionService.savePrivateKey(currentUser.id, privateKey);
                await chatAPI.updatePGPKey(publicKey);
            }

            // 2. Try to fetch other user's public key
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
            console.log('E2EE not available for this session yet');
            setIsSecure(false);
        }
    };

    // Real-time listener for THIS conversation
    useEffect(() => {
        const handleNewMessage = (data) => {
            if (data.conversationId === conversation.id) {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
            }
        };

        const handleMessagesRead = (data) => {
            if (data.conversationId !== conversation.id || !data.messageIds?.length) return;
            setMessages(prev => prev.map((message) => (
                data.messageIds.includes(message.id) ? { ...message, isRead: true } : message
            )));
        };

        socketService.onNewMessage(handleNewMessage);
        socketService.onMessagesRead?.(handleMessagesRead);
        return () => {
            socketService.off('new_message', handleNewMessage);
            socketService.off('messages_read', handleMessagesRead);
        };
    }, [conversation.id, socketService]);

    const fetchMessages = async () => {
        try {
            const res = await chatAPI.getMessages(conversation.id);
            const rawMessages = res.data.data.messages;

            // Decrypt messages if they are encrypted
            const decryptedMessages = await Promise.all(rawMessages.map(async (msg) => {
                if (msg.isEncrypted && encryptionService.hasPrivateKey(currentUser.id)) {
                    const decryptedContent = await encryptionService.decryptMessage(
                        msg.content,
                        encryptionService.getPrivateKey(currentUser.id)
                    );
                    return { ...msg, content: decryptedContent };
                }
                return msg;
            }));

            setMessages(decryptedMessages);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to load messages', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        sendStopTyping();

        try {
            const plainContent = newMessage.trim();
            const moderatedContent = violatesPrivacyPolicy(plainContent) ? PRIVACY_POLICY_DELETED_MESSAGE : plainContent;
            let contentToSend = buildMessagePayload(moderatedContent);
            let isEncrypted = false;

            // Apply E2EE if recipient key is available
            if (isSecure && otherUserPublicKey) {
                contentToSend = await encryptionService.encryptMessage(contentToSend, otherUserPublicKey);
                isEncrypted = true;
            }

            // Save via REST API
            const res = await chatAPI.sendMessage(conversation.id, {
                content: contentToSend,
                isEncrypted,
                encryptionVersion: '1.0'
            });
            const savedMsg = res.data.data.message;

            // For local UI, show the decrypted version
            const displayMsg = {
                ...savedMsg,
                content: moderatedContent,
                isDelivered: true,
                isDeleted: moderatedContent === PRIVACY_POLICY_DELETED_MESSAGE
            };

            setMessages(prev => [...prev, displayMsg]);
            setNewMessage('');
            setReplyingTo(null);
            scrollToBottom();

            // Broadcast via Socket
            if (otherUserId) {
                const tempId = savedMsg.id;
                socketService.sendMessage(conversation.id, displayMsg, otherUserId, tempId);
            }

        } catch (error) {
            console.error('Failed to send', error);
            toast.error('Failed to send encrypted message');
        } finally {
            setSending(false);
        }
    };

    const handleInput = (e) => {
        setNewMessage(e.target.value);
        if (e.target.value) sendTyping();
        else sendStopTyping();
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50/50 dark:bg-dark-950/50 backdrop-blur-sm relative">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-800 flex items-center justify-between bg-white/80 dark:bg-dark-900/80 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden text-gray-500 hover:text-gray-900 dark:text-dark-400 dark:hover:text-white mr-2">
                        <FaArrowLeft />
                    </button>

                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                            {otherUserName.charAt(0)}
                        </div>
                        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-900" />}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 dark:text-dark-100">{otherUserName}</h3>
                            {isSecure && <FaShieldAlt className="text-emerald-500 text-xs" title="Guardian Elite Encrypted Session" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-400">
                            {isOnline ? <span className="text-emerald-400">Online</span> : <span>Offline</span>}
                            {typingUsers.length > 0 && <span className="text-primary-400 animate-pulse">• typing...</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-gray-400 dark:text-dark-400">
                    <button className="hover:text-primary-400 transition"><FaPhone /></button>
                    <button className="hover:text-primary-400 transition"><FaVideo /></button>
                    <button className="hover:text-primary-400 transition"><FaInfoCircle /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-dark-400 opacity-50">
                        <div className="text-6xl mb-4">-</div>
                        <p>Start a conversation</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    // Check if previous message was from same sender to group them (hide avatar)
                    const isOwn = msg.senderId === currentUser.id;
                    const prevMsg = messages[i - 1];
                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                    return (
                        <MessageBubble
                            key={msg.id || i}
                            message={msg}
                            isOwn={isOwn}
                            showAvatar={showAvatar}
                            senderName={otherUserName}
                            onReply={(message) => setReplyingTo(message)}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800">
                {replyingTo && (
                    <div className="mb-3 rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-2">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-300 mb-1">Replying to message</p>
                                <p className="text-xs text-primary-700 dark:text-primary-100 truncate">{replyingTo.content || 'Previous message'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="text-primary-600 dark:text-primary-200 hover:text-primary-800 dark:hover:text-white transition"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <button type="button" className="p-2 text-gray-500 dark:text-dark-400 hover:text-primary-400 transition rounded-full hover:bg-gray-100 dark:hover:bg-dark-800">
                        <FaEllipsisV />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleInput}
                            placeholder="Type a message..."
                            className="w-full bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-full px-6 py-3 text-gray-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition placeholder-gray-500 dark:placeholder-dark-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full text-white shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
                    >
                        <FaPaperPlane className={sending ? 'animate-pulse' : ''} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;


