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
    FaSmile
} from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { format, isToday, isYesterday } from 'date-fns';

const MessagingPanel = ({ conversations, onSelectConversation, selectedConversation, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

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

    const filteredConversations = conversations?.filter(conv =>
        conv.creatorUserId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.promotionRequestId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="glass-card overflow-hidden h-[calc(100vh-200px)] md:h-[600px] flex flex-col md:flex-row w-full">
            {/* Conversation List */}
            <motion.div
                className={`w-full md:w-80 border-r border-dark-700 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'
                    }`}
            >
                {/* Search Header */}
                <div className="p-4 border-b border-dark-700">
                    <h3 className="text-lg font-semibold text-dark-100 mb-3">Messages</h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                </div>

                {/* Conversation Items */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-12">
                            <FaUser className="text-4xl text-dark-600 mx-auto mb-3" />
                            <p className="text-dark-400">No conversations yet</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <motion.div
                                key={conv._id}
                                onClick={() => onSelectConversation(conv)}
                                className={`p-4 border-b border-dark-800 cursor-pointer hover:bg-dark-800/50 transition-all ${selectedConversation?._id === conv._id ? 'bg-dark-800' : ''
                                    }`}
                                whileHover={{ x: 5 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">
                                            {conv.creatorUserId?.name?.charAt(0) || 'C'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-dark-100 truncate">
                                                {conv.creatorUserId?.name || 'Creator'}
                                            </p>
                                            <span className="text-xs text-dark-500">
                                                {formatMessageTime(conv.updatedAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-dark-400 truncate">
                                            {conv.promotionRequestId?.title || 'Campaign'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-dark-700 flex items-center gap-3">
                            <button
                                onClick={onBack}
                                className="md:hidden p-2 hover:bg-dark-800 rounded-lg text-dark-400"
                            >
                                <FaArrowLeft />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <span className="text-white font-bold">
                                    {selectedConversation.creatorUserId?.name?.charAt(0) || 'C'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-dark-100">
                                    {selectedConversation.creatorUserId?.name || 'Creator'}
                                </p>
                                <p className="text-xs text-dark-400">
                                    {selectedConversation.promotionRequestId?.title || 'Campaign'}
                                </p>
                            </div>
                            <button className="p-2 hover:bg-dark-800 rounded-lg text-dark-400">
                                <FaEllipsisV />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-900/50">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-dark-400">No messages yet. Start the conversation!</p>
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
                                            className={`max-w-[70%] p-3 rounded-2xl ${msg.senderRole === 'seller'
                                                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-br-md'
                                                : 'bg-dark-800 text-dark-200 rounded-bl-md'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            <div className={`flex items-center gap-1 mt-1 ${msg.senderRole === 'seller' ? 'justify-end' : ''
                                                }`}>
                                                <span className="text-xs opacity-70">
                                                    {formatMessageTime(msg.createdAt)}
                                                </span>
                                                {msg.senderRole === 'seller' && (
                                                    <FaCheckDouble className="text-xs opacity-70" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-dark-700 flex items-center gap-3">
                            <button type="button" className="p-2 hover:bg-dark-800 rounded-lg text-dark-400">
                                <FaSmile />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-full text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                            />
                            <motion.button
                                type="submit"
                                disabled={!newMessage.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane />
                            </motion.button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <FaComments className="text-6xl text-dark-600 mx-auto mb-4" />
                            <p className="text-dark-400">Select a conversation</p>
                            <p className="text-sm text-dark-500">Choose from your existing chats to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagingPanel;
