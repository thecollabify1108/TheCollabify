import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import usePushNotifications from '../../hooks/usePushNotifications';

/**
 * Notification Permission Prompt
 * Shows a beautiful prompt asking users to enable push notifications
 */
const NotificationPrompt = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const { permission, isSupported, requestPermission } = usePushNotifications();

    useEffect(() => {
        // Check if we should show the prompt
        const hasSeenPrompt = localStorage.getItem('notificationPromptSeen');

        // Show prompt if:
        // 1. Browser supports notifications
        // 2. Permission is not yet granted or denied
        // 3. User hasn't dismissed it before
        if (isSupported && permission === 'default' && !hasSeenPrompt) {
            // Delay showing the prompt for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000); // Show after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [isSupported, permission]);

    const handleEnable = async () => {
        const result = await requestPermission();

        if (result === 'granted') {
            toast.success('🔔 Notifications enabled! You\'ll be notified about campaign updates, messages, and more.', {
                duration: 5000,
                icon: '✅'
            });
        } else if (result === 'denied') {
            toast.error('Please enable notifications in your browser settings to receive updates.', {
                duration: 6000
            });
        }

        setIsVisible(false);
        localStorage.setItem('notificationPromptSeen', 'true');
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('notificationPromptSeen', 'true');
    };

    if (isDismissed || !isSupported || permission !== 'default') {
        return null;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="fixed bottom-4 right-4 z-[9999] max-w-sm"
                >
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-2xl">
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1 text-dark-400 hover:text-dark-200 transition-colors"
                        >
                            <FaTimes size={14} />
                        </button>

                        {/* Icon */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                                <FaBell className="text-white text-xl" />
                            </div>
                            <div>
                                <h4 className="text-dark-100 font-semibold flex items-center gap-2">
                                    Stay Updated!
                                    <HiSparkles className="text-yellow-400" />
                                </h4>
                                <p className="text-dark-400 text-sm">
                                    Never miss important updates
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-dark-300 text-sm mb-2">
                            Get instant notifications when creators apply, campaigns are accepted, or you receive new messages.
                        </p>
                        <p className="text-dark-400 text-xs mb-4 flex items-center gap-1">
                            <span>💡</span>
                            <span>Make sure browser notifications are enabled in your device settings</span>
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleEnable}
                                className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                            >
                                Enable Notifications
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="py-2 px-4 rounded-xl bg-dark-700 text-dark-300 font-medium text-sm hover:bg-dark-600 transition-colors"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationPrompt;
