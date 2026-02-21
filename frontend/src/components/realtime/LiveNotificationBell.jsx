import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import useWebSocket from '../../hooks/useWebSocket';
import Icon from '../common/Icon';

/**
 * LiveNotificationBell - Real-time notification center
 * Shows unread count and notification dropdown
 */
const LiveNotificationBell = ({ userId }) => {
    const { notifications = [], isConnected } = useWebSocket(userId);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Mark all as read
            setUnreadCount(0);
        }
    };

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
                    {notifications.length > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                                     text-white text-xs flex items-center justify-center font-bold"
                        >
                            {notifications.length > 9 ? '9+' : notifications.length}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-96 glass-card border border-dark-700 z-50 
                                     max-h-[500px] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
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
                            <div className="overflow-y-auto flex-1">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-dark-500">
                                        <Icon name="bell" size={48} className="mx-auto mb-2 opacity-30" />
                                        <p>No notifications yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-dark-700">
                                        {notifications.map((notif, index) => (
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
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-dark-700">
                                    <button
                                        onClick={() => {
                                            // Clear all notifications
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-center text-sm text-primary-400 hover:text-primary-300"
                                    >
                                        Mark all as read
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
