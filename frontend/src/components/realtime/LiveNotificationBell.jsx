import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import useWebSocket from '../../hooks/useWebSocket';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';

/**
 * LiveNotificationBell - Real-time notification center
 * Shows unread count and notification dropdown
 */
const LiveNotificationBell = ({ userId }) => {
    // We handle the local clearing via a state to override the websocket if needed, 
    // but typically useWebSocket should expose a clear function.
    const { notifications = [], isConnected } = useWebSocket(userId);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [localCleared, setLocalCleared] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Mark all as read when opening
            setUnreadCount(0);
        } else {
            // Reset showAll when closing
            setShowAll(false);
        }
    };

    const handleClearAll = () => {
        setLocalCleared(true);
        setIsOpen(false);
        setShowAll(false);
    };

    const activeNotifications = localCleared ? [] : notifications;
    const displayedNotifications = showAll ? activeNotifications : activeNotifications.slice(0, 3);

    return (
        <div className="relative">
            {/* Bell Icon */}
            <motion.button
                onClick={handleToggle}
                className="relative p-2 rounded-lg hover:bg-dark-700 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Icon name="bell" size={24} className="text-dark-300" />

                {/* Online Indicator */}
                {isConnected && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                )}

                {/* Unread Badge */}
                <AnimatePresence>
                    {activeNotifications.length > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                                     text-white text-xs flex items-center justify-center font-bold"
                        >
                            {activeNotifications.length > 9 ? '9+' : activeNotifications.length}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop - closes on any outside click */}
                        <div
                            className="fixed inset-0 z-[55] bg-transparent"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        />

                        {/* Dropdown - Adjusted w-[90vw] for mobile to prevent overflow, and right align fix */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-[-2rem] sm:right-0 mt-2 w-[85vw] sm:w-96 bg-dark-950 border border-dark-700 z-[60] 
                                     max-h-[60vh] sm:max-h-[70vh] flex flex-col rounded-premium-xl shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-dark-700 flex items-center justify-between shrink-0">
                                <h3 className="font-semibold text-dark-100">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {!isConnected && (
                                        <span className="text-xs text-amber-400">Offline</span>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-dark-500 hover:text-dark-300"
                                    >
                                        <Icon name="close" size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                {activeNotifications.length === 0 ? (
                                    <div className="p-4">
                                        <EmptyState
                                            icon="bell-off"
                                            title="All Caught Up!"
                                            description="No new notifications at the moment."
                                            className="py-10 border-none bg-transparent"
                                        />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-dark-700">
                                        {displayedNotifications.map((notif, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="p-4 hover:bg-dark-800/50 cursor-pointer transition"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Icon */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                                                    ${notif.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            notif.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                                                notif.type === 'error' ? 'bg-red-500/20 text-red-400' :
                                                                    'bg-primary-500/20 text-primary-400'}`}>
                                                        {notif.icon || <Icon name="bell" size={16} />}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-dark-100 text-sm">
                                                            {notif.title}
                                                        </h4>
                                                        <p className="text-xs text-dark-400 mt-1">
                                                            {notif.message}
                                                        </p>
                                                        {notif.timestamp && (
                                                            <p className="text-xs text-dark-600 mt-1">
                                                                {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Show More toggle inline below the limit */}
                                        {activeNotifications.length > 3 && !showAll && (
                                            <div 
                                                className="p-3 text-center cursor-pointer hover:bg-dark-800/50 transition border-t border-dark-700"
                                                onClick={() => setShowAll(true)}
                                            >
                                                <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                                                    Show {activeNotifications.length - 3} More
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            {activeNotifications.length > 0 && (
                                <div className="p-3 border-t border-dark-700 flex items-center justify-between shrink-0 bg-dark-900 rounded-b-premium-xl">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-xs font-semibold text-dark-400 hover:text-dark-200 uppercase tracking-widest transition"
                                    >
                                        Mark Read
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        className="text-xs font-semibold text-red-400 hover:text-red-300 uppercase tracking-widest transition"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveNotificationBell;
