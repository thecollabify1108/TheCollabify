import { motion } from 'framer-motion';
import { FaCheck, FaCheckDouble, FaLock, FaReply, FaShieldAlt } from 'react-icons/fa';

const REPLY_HEADER_REGEX = /^\[\[reply:([^|\]]+)\|([^\]]*)\]\]\n/;

const parseMessageContent = (content = '') => {
    const match = content.match(REPLY_HEADER_REGEX);
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
        displayContent: content.replace(REPLY_HEADER_REGEX, ''),
        replyMeta: {
            replyToMessageId: match[1],
            replySnippet
        }
    };
};

const MessageBubble = ({ message, isOwn, showAvatar, senderName, avatarUrl, onReply }) => {
    const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const parsed = parseMessageContent(message.content);
    const deliveryLabel = isOwn ? (message.isRead ? 'Read' : 'Delivered') : null;

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
            <div className={`max-w-xs sm:max-w-sm md:max-w-md relative group`}>
                {parsed.replyMeta && (
                    <div className={`mb-1 px-3 py-2 rounded-xl border text-xs ${isOwn ? 'bg-primary-500/10 border-primary-500/30 text-primary-200' : 'bg-gray-100 dark:bg-dark-800/60 border-gray-200 dark:border-dark-700 text-gray-600 dark:text-dark-300'}`}>
                        <p className="font-bold uppercase tracking-wider text-[10px] mb-1">Replying to</p>
                        <p className="line-clamp-2">{parsed.replyMeta.replySnippet || 'Previous message'}</p>
                    </div>
                )}

                <div
                    className={`px-4 py-3 rounded-2xl shadow-md text-sm sm:text-base break-words overflow-hidden ${isOwn
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 border border-gray-200 dark:border-dark-700 rounded-bl-sm shadow-sm'
                        }`}
                >
                    {message.isDeleted && (
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                            <FaShieldAlt size={8} />
                            Privacy policy
                        </div>
                    )}
                    {parsed.displayContent}
                    {!message.isDeleted && onReply && (
                        <button
                            type="button"
                            onClick={() => onReply({ id: message.id, content: parsed.displayContent })}
                            className={`absolute top-2 ${isOwn ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-primary-500 hover:text-primary-400`}
                            title="Reply"
                        >
                            <FaReply size={11} />
                        </button>
                    )}
                </div>

                {/* Meta info */}
                <div className={`flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-dark-400 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span>{time}</span>
                    {message.isEncrypted && <span className="text-emerald-500 ml-1" title="End-to-end encrypted"><FaLock size={8} /></span>}
                    {isOwn && (
                        <span className={`ml-1 inline-flex items-center gap-1 ${message.isRead ? 'text-blue-400' : 'text-gray-400 dark:text-dark-400'}`} title={deliveryLabel}>
                            {message.isRead ? <FaCheckDouble size={10} /> : <FaCheck size={10} />}
                            <span>{deliveryLabel}</span>
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
