import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiTrendingUp, HiUserGroup } from 'react-icons/hi';
import { FaFire } from 'react-icons/fa';

/**
 * Social Proof Widget
 * Shows real-time activity and platform statistics
 */
const SocialProofWidget = () => {
    const [recentActivity, setRecentActivity] = useState([]);
    const [stats, setStats] = useState({
        totalCreators: 10000,
        totalBrands: 5000,
        activeCampaigns: 1234,
        successRate: 98
    });
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

    // Simulated recent activities (in production, fetch from API)
    const activities = [
        { type: 'signup', user: 'Priya S.', role: 'creator', location: 'Mumbai', time: '2 min ago' },
        { type: 'campaign', brand: 'TechStyle Co.', title: 'launched a new campaign', time: '5 min ago' },
        { type: 'match', creator: 'Rahul M.', brand: 'FitLife', time: '8 min ago' },
        { type: 'payment', amount: '₹25,000', creator: 'Sneha K.', time: '12 min ago' },
        { type: 'signup', user: 'Arjun B.', role: 'seller', location: 'Bangalore', time: '15 min ago' },
        { type: 'campaign', brand: 'BeautyHub', title: 'accepted 5 creators', time: '18 min ago' },
        { type: 'match', creator: 'Meera P.', brand: 'EcoStore', time: '22 min ago' },
        { type: 'payment', amount: '₹15,000', creator: 'Vikram S.', time: '25 min ago' }
    ];

    useEffect(() => {
        setRecentActivity(activities);

        // Rotate through activities
        const interval = setInterval(() => {
            setCurrentActivityIndex(prev => (prev + 1) % activities.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, []);

    // Increment stats animation
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                activeCampaigns: prev.activeCampaigns + Math.floor(Math.random() * 3)
            }));
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'signup':
                return <HiUserGroup className="text-blue-400" />;
            case 'campaign':
                return <HiSparkles className="text-purple-400" />;
            case 'match':
                return <FaFire className="text-orange-400" />;
            case 'payment':
                return <HiTrendingUp className="text-green-400" />;
            default:
                return <HiSparkles />;
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'signup':
                return (
                    <>
                        <strong>{activity.user}</strong> from {activity.location} joined as a {activity.role}
                    </>
                );
            case 'campaign':
                return (
                    <>
                        <strong>{activity.brand}</strong> {activity.title}
                    </>
                );
            case 'match':
                return (
                    <>
                        <strong>{activity.creator}</strong> matched with <strong>{activity.brand}</strong>
                    </>
                );
            case 'payment':
                return (
                    <>
                        <strong>{activity.creator}</strong> earned <strong className="text-green-400">{activity.amount}</strong>
                    </>
                );
            default:
                return '';
        }
    };

    const currentActivity = recentActivity[currentActivityIndex];

    return (
        <div className="space-y-4">
            {/* Recent Activity Ticker */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-900/50 border border-dark-800 rounded-2xl p-4 backdrop-blur-xl"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center flex-shrink-0">
                        <AnimatePresence mode="wait">
                            {currentActivity && (
                                <motion.div
                                    key={currentActivityIndex}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {getActivityIcon(currentActivity.type)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {currentActivity && (
                                <motion.div
                                    key={currentActivityIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-sm text-gray-700 dark:text-dark-200"
                                >
                                    {getActivityText(currentActivity)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <p className="text-xs text-gray-500 dark:text-dark-500 mt-1">
                            {currentActivity?.time}
                        </p>
                    </div>

                    <div className="flex items-center gap-1">
                        {activities.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentActivityIndex
                                        ? 'bg-primary-500'
                                        : 'bg-dark-700'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <HiUserGroup className="text-primary-400 text-xl" />
                        <span className="text-xs text-gray-600 dark:text-dark-500">Creators</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                        {stats.totalCreators.toLocaleString()}+
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <HiSparkles className="text-secondary-400 text-xl" />
                        <span className="text-xs text-gray-600 dark:text-dark-500">Brands</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                        {stats.totalBrands.toLocaleString()}+
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FaFire className="text-orange-400 text-xl" />
                        <span className="text-xs text-gray-600 dark:text-dark-500">Active</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                        {stats.activeCampaigns.toLocaleString()}
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <HiTrendingUp className="text-green-400 text-xl" />
                        <span className="text-xs text-gray-600 dark:text-dark-500">Success</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                        {stats.successRate}%
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SocialProofWidget;
