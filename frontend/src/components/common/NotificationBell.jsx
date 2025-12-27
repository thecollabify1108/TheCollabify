import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { HiSparkles, HiBriefcase, HiUserAdd, HiCheckCircle } from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'NEW_MATCH':
                return <HiSparkles className="text-primary-400" />;
            case 'CREATOR_APPLIED':
                return <HiUserAdd className="text-amber-400" />;
            case 'CREATOR_ACCEPTED':
                return <HiCheckCircle className="text-emerald-400" />;
            case 'CREATOR_REJECTED':
                return <FaTimes className="text-red-400" />;
            case 'REQUEST_UPDATE':
                return <HiBriefcase className="text-secondary-400" />;
            default:
                return <FaBell className="text-dark-400" />;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        setIsOpen(false);

        // Navigate based on notification type and user role
        const requestId = notification.relatedRequest?._id || notification.relatedRequest;

        switch (notification.type) {
            case 'CREATOR_APPLIED':
                // Seller clicked - go to seller dashboard with the specific request
                if (requestId) {
                    navigate(`/seller-dashboard?tab=requests&request=${requestId}`);
                } else {
                    navigate('/seller-dashboard?tab=requests');
                }
                break;
            case 'NEW_MATCH':
                // Creator clicked - go to promotions tab
                navigate('/creator-dashboard?tab=promotions');
                break;
            case 'CREATOR_ACCEPTED':
            case 'CREATOR_REJECTED':
                // Creator clicked - go to applications tab
                navigate('/creator-dashboard?tab=applications');
                break;
            case 'REQUEST_UPDATE':
                // Go to appropriate dashboard based on role
                if (user?.role === 'seller') {
                    navigate('/seller-dashboard?tab=requests');
                } else {
                    navigate('/creator-dashboard?tab=applications');
                }
                break;
            default:
                // Go to main dashboard
                if (user?.role === 'seller') {
                    navigate('/seller-dashboard');
                } else {
                    navigate('/creator-dashboard');
                }
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-dark-800 transition text-dark-300 hover:text-dark-100"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 glass-card shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
                            <h3 className="font-semibold text-dark-100">Notifications</h3>
                            <div className="flex items-center gap-3">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAllNotifications}
                                        className="text-xs text-red-400 hover:text-red-300 transition"
                                    >
                                        Clear All
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary-400 hover:text-primary-300 transition"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FaBell className="text-4xl text-dark-600 mx-auto mb-3" />
                                    <p className="text-dark-400">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map((notification) => (
                                    <motion.div
                                        key={notification._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`px-4 py-3 border-b border-dark-700/50 hover:bg-dark-800/50 transition cursor-pointer ${!notification.isRead ? 'bg-primary-500/5' : ''
                                            }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start">
                                            <div className="mt-1 mr-3 text-lg">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-dark-100' : 'text-dark-300'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-dark-400 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-dark-500 mt-1">
                                                    {getTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-dark-700 text-center">
                                <button className="text-xs text-primary-400 hover:text-primary-300 transition">
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
