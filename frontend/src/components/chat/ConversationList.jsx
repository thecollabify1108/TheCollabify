import { useState } from 'react';
import { FaSearch, FaCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ConversationList = ({ conversations, activeId, onSelect, onlineUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = conversations.filter(c => {
        const otherUser = c.otherUser;
        return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800 flex flex-col h-full ${activeId ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-100 mb-4">Messages</h2>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-gray-900 dark:text-dark-100 focus:ring-1 focus:ring-primary-500 outline-none text-sm placeholder-gray-500 dark:placeholder-dark-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-dark-400 text-sm">
                        No conversations found
                    </div>
                ) : (
                    filteredConversations.map(convo => {
                        const isOnline = onlineUsers.includes(convo.otherUser._id);
                        const isActive = activeId === convo._id;

                        return (
                            <button
                                key={convo._id}
                                onClick={() => onSelect(convo._id)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors border-b border-gray-100 dark:border-dark-800/50 ${isActive ? 'bg-gray-100 dark:bg-dark-800 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold border border-gray-200 dark:border-dark-700">
                                        {convo.otherUser.name.charAt(0)}
                                    </div>
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-900"></div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`font-semibold truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-dark-100'}`}>
                                            {convo.otherUser.name}
                                        </h4>
                                        <span className="text-xs text-gray-500 dark:text-dark-400 flex-shrink-0 ml-2">
                                            {new Date(convo.lastMessageAt || convo.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-500 dark:text-dark-400 truncate pr-2">
                                            {convo.lastMessage?.content || 'Started a conversation'}
                                        </p>
                                        {convo.unreadCount > 0 && (
                                            <span className="flex-shrink-0 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {convo.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
