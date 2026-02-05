import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPhone, FaVideo, FaInfoCircle, FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import { chatAPI } from '../../services/api';
import useTypingIndicator from '../../hooks/useTypingIndicator';
import TypingIndicator from '../realtime/TypingIndicator';
import encryptionService from '../../services/encryptionService';
import { FaLock, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ChatWindow = ({ conversation, currentUser, socketService, onlineUsers, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [isSecure, setIsSecure] = useState(false);
    const [otherUserPublicKey, setOtherUserPublicKey] = useState(null);
    const messagesEndRef = useRef(null);

    const otherUser = conversation.otherUser;
    const isOnline = onlineUsers.includes(otherUser._id);

    const { typingUsers, sendTyping, sendStopTyping } = useTypingIndicator(conversation._id, true);

    useEffect(() => {
        if (conversation._id) {
            setupEncryption();
            fetchMessages();
        }
    }, [conversation._id]);

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
            const res = await chatAPI.getPGPKey(otherUser._id);
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
            if (data.conversationId === conversation._id) {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
            }
        };

        socketService.onNewMessage(handleNewMessage);
        return () => socketService.off('new_message', handleNewMessage);
    }, [conversation._id, socketService]);

    const fetchMessages = async () => {
        try {
            const res = await chatAPI.getMessages(conversation._id);
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
            let contentToSend = newMessage;
            let isEncrypted = false;

            // Apply E2EE if recipient key is available
            if (isSecure && otherUserPublicKey) {
                contentToSend = await encryptionService.encryptMessage(newMessage, otherUserPublicKey);
                isEncrypted = true;
            }

            // Save via REST API
            const res = await chatAPI.sendMessage(conversation._id, {
                content: contentToSend,
                isEncrypted,
                encryptionVersion: '1.0'
            });
            const savedMsg = res.data.data.message;

            // For local UI, show the decrypted version
            const displayMsg = { ...savedMsg, content: newMessage };

            setMessages(prev => [...prev, displayMsg]);
            setNewMessage('');
            scrollToBottom();

            // Broadcast via Socket
            socketService.sendMessage(conversation._id, displayMsg, otherUser._id);

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
                            {otherUser.name.charAt(0)}
                        </div>
                        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-900" />}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 dark:text-dark-100">{otherUser.name}</h3>
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
                        <div className="text-6xl mb-4">👋</div>
                        <p>Say hello to start the conversation!</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    // Check if previous message was from same sender to group them (hide avatar)
                    const isOwn = msg.senderId._id === currentUser.id || msg.senderId === currentUser.id;
                    const prevMsg = messages[i - 1];
                    const showAvatar = !prevMsg || prevMsg.senderId._id !== msg.senderId._id && prevMsg.senderId !== msg.senderId;

                    return (
                        <MessageBubble
                            key={msg._id || i}
                            message={msg}
                            isOwn={isOwn}
                            showAvatar={showAvatar}
                            senderName={otherUser.name}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800">
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
