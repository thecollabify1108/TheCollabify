import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * useOnlineStatus - Track user online/offline status
 * Shows green dot when online
 */
const useOnlineStatus = (socket, userId) => {
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        if (!socket) return;

        // Listen for online status updates
        socket.on('user_online', (data) => {
            setOnlineUsers(prev => new Set([...prev, data.userId]));
        });

        socket.on('user_offline', (data) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        });

        socket.on('online_users_list', (data) => {
            setOnlineUsers(new Set(data.users));
        });

        // Request initial online users list
        socket.emit('get_online_users');

        // Update your own status
        window.addEventListener('beforeunload', () => {
            socket.emit('going_offline');
        });

        return () => {
            socket.off('user_online');
            socket.off('user_offline');
            socket.off('online_users_list');
        };
    }, [socket, userId]);

    const isUserOnline = (checkUserId) => {
        return onlineUsers.has(checkUserId);
    };

    return {
        onlineUsers,
        isUserOnline
    };
};

/**
 * OnlineStatusBadge - Visual online/offline indicator
 */
export const OnlineStatusBadge = ({ isOnline, size = 'sm', className = '' }) => {
    const sizeClasses = {
        xs: 'w-2 h-2',
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className={`relative ${className}`}>
            <motion.div
                className={`${sizeClasses[size]} rounded-full 
                           ${isOnline ? 'bg-emerald-500' : 'bg-dark-600'}
                           border-2 border-dark-900`}
                animate={isOnline ? {
                    boxShadow: [
                        '0 0 0 0 rgba(16, 185, 129, 0.7)',
                        '0 0 0 8px rgba(16, 185, 129, 0)',
                    ]
                } : {}}
                transition={{
                    duration: 1.5,
                    repeat: isOnline ? Infinity : 0,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};

/**
 * UserAvatar - Avatar with online status
 */
export const UserAvatarWithStatus = ({ user, isOnline, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    return (
        <div className="relative inline-block">
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 
                           flex items-center justify-center text-white font-semibold`}>
                {user.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="absolute bottom-0 right-0">
                <OnlineStatusBadge isOnline={isOnline} size="sm" />
            </div>
        </div>
    );
};

export default useOnlineStatus;
