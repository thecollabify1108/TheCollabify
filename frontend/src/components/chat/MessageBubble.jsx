import { motion } from 'framer-motion';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';

const MessageBubble = ({ message, isOwn, showAvatar, senderName, avatarUrl }) => {
    const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar (only for other user) */}
            {!isOwn && (
                <div className="w-8 h-8 flex-shrink-0">
                    {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={senderName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span>{senderName?.charAt(0)}</span>
                            )}
                        </div>
                    ) : (
                        <div className="w-8" />
                    )}
                </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[70%] sm:max-w-[60%] relative group`}>
                <div
                    className={`px-4 py-3 rounded-2xl shadow-md text-sm sm:text-base break-words ${isOwn
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 border border-gray-200 dark:border-dark-700 rounded-bl-sm shadow-sm'
                        }`}
                >
                    {message.content}
                </div>

                {/* Meta info */}
                <div className={`flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-dark-400 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span>{time}</span>
                    {message.isEncrypted && <span className="text-emerald-500 ml-1" title="End-to-end encrypted"><FaLock size={8} /></span>}
                    {isOwn && (
                        <span className={`ml-1 ${message.isRead ? 'text-blue-400' : 'text-gray-400 dark:text-dark-400'}`}>
                            {message.isRead ? <FaCheckDouble size={10} /> : <FaCheck size={10} />}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
