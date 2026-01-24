import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPhone, FaVideo, FaInfoCircle, FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import { chatAPI } from '../../services/api';
import useTypingIndicator from '../../hooks/useTypingIndicator';
import TypingIndicator from '../realtime/TypingIndicator';

const ChatWindow = ({ conversation, currentUser, socketService, onlineUsers, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const otherUser = conversation.otherUser;
    const isOnline = onlineUsers.includes(otherUser._id);

    const { typingUsers, sendTyping, sendStopTyping } = useTypingIndicator(conversation._id, true);

    useEffect(() => {
        if (conversation._id) {
            fetchMessages();
        }
    }, [conversation._id]);

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
            setMessages(res.data.data.messages);
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
            // Save via REST API
            const res = await chatAPI.sendMessage(conversation._id, newMessage);
            const savedMsg = res.data.data.message;

            setMessages(prev => [...prev, savedMsg]);
            setNewMessage('');
            scrollToBottom();

            // Broadcast via Socket (handled by REST controller -> Socket Server, or manual emit if REST doesn't default)
            // Ideally, our refactored backend sends to recipient automatically.
            // But we also emit here just in case we need immediate local echo if using optimistic UI
            socketService.sendMessage(conversation._id, newMessage, otherUser._id);

        } catch (error) {
            console.error('Failed to send', error);
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
        <div className="flex-1 flex flex-col h-full bg-dark-950/50 backdrop-blur-sm relative">
            {/* Header */}
            <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-900/80 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden text-dark-400 hover:text-white mr-2">
                        <FaArrowLeft />
                    </button>

                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                            {otherUser.name.charAt(0)}
                        </div>
                        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-900" />}
                    </div>

                    <div>
                        <h3 className="font-bold text-dark-100">{otherUser.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-dark-400">
                            {isOnline ? <span className="text-emerald-400">Online</span> : <span>Offline</span>}
                            {typingUsers.length > 0 && <span className="text-primary-400 animate-pulse">• typing...</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-dark-400">
                    <button className="hover:text-primary-400 transition"><FaPhone /></button>
                    <button className="hover:text-primary-400 transition"><FaVideo /></button>
                    <button className="hover:text-primary-400 transition"><FaInfoCircle /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-dark-400 opacity-50">
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
            <div className="p-4 bg-dark-900 border-t border-dark-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <button type="button" className="p-2 text-dark-400 hover:text-primary-400 transition rounded-full hover:bg-dark-800">
                        <FaEllipsisV />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleInput}
                            placeholder="Type a message..."
                            className="w-full bg-dark-800 border border-dark-700 rounded-full px-6 py-3 text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition placeholder-dark-500"
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
