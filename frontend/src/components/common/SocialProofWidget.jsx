import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiTrendingUp, HiUserGroup } from 'react-icons/hi';
import { FaFire } from 'react-icons/fa';
import api from '../../services/api';

/**
 * Social Proof Widget
 * Shows real-time activity and platform statistics.
 * Stat cards always show their values (no tap-to-expand).
 * Only shows Creators, Brands, and Success Rate.
 * Activity ticker filters out admin signups.
 */
const SocialProofWidget = () => {
    const [stats, setStats] = useState({
        totalCreators: 0,
        totalBrands: 0,
        successRate: 98
    });
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('public/stats', { timeout: 10000 });
                const result = response.data;
                if (result.success) {
                    setStats(prev => ({ ...prev, ...result.data }));
                    if (result.data.activities) {
                        // Filter out admin signups — only show creator/brand/campaign/match/payment activity
                        const filtered = result.data.activities.filter(a => {
                            if (a.type === 'signup' && a.role && a.role.toUpperCase() === 'ADMIN') return false;
                            return true;
                        });
                        setActivities(filtered);
                    }
                }
            } catch (error) {
                // Silently ignore — use default stats. This is non-critical UI.
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        if (activities.length === 0) return;
        const interval = setInterval(() => {
            setCurrentActivityIndex(prev => (prev + 1) % activities.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [activities.length]);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'signup': return <HiUserGroup className="text-blue-400" />;
            case 'campaign': return <HiSparkles className="text-purple-400" />;
            case 'match': return <FaFire className="text-orange-400" />;
            case 'payment': return <HiTrendingUp className="text-green-400" />;
            default: return <HiSparkles />;
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'signup': return <><strong>{activity.user}</strong> joined as a {activity.role}</>;
            case 'campaign': return <><strong>{activity.brand}</strong> {activity.title}</>;
            case 'match': return <><strong>{activity.creator}</strong> matched with <strong>{activity.brand}</strong></>;
            case 'payment': return <><strong>{activity.creator}</strong> earned <strong className="text-green-400">{activity.amount}</strong></>;
            default: return '';
        }
    };

    const currentActivity = activities[currentActivityIndex];

    const statCards = [
        {
            id: 'creators',
            icon: <HiUserGroup className="text-primary-400 text-lg" />,
            label: 'Creators',
            value: `${stats.totalCreators.toLocaleString()}+`,
            accent: 'border-primary-500/30 bg-primary-500/5'
        },
        {
            id: 'brands',
            icon: <HiSparkles className="text-secondary-400 text-lg" />,
            label: 'Brands',
            value: `${stats.totalBrands.toLocaleString()}+`,
            accent: 'border-secondary-500/30 bg-secondary-500/5'
        },
        {
            id: 'success',
            icon: <HiTrendingUp className="text-green-400 text-lg" />,
            label: 'Success',
            value: `${stats.successRate}%`,
            accent: 'border-green-500/30 bg-green-500/5'
        }
    ];

    return (
        <div className="space-y-3">
            {/* Recent Activity Ticker */}
            {currentActivity && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-lg"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentActivityIndex}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {getActivityIcon(currentActivity.type)}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentActivityIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-sm text-dark-100"
                                >
                                    {getActivityText(currentActivity)}
                                </motion.div>
                            </AnimatePresence>
                            <p className="text-xs text-dark-400 mt-1">{currentActivity?.time}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {activities.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentActivityIndex ? 'bg-primary-500' : 'bg-dark-700'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Platform Stats Grid — always shows values, no expandable cards */}
            <div className="grid grid-cols-3 gap-2">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`border rounded-xl p-3 ${card.accent}`}
                    >
                        <div className="flex items-center gap-1.5 mb-1.5">
                            {card.icon}
                            <span className="text-dark-400 font-medium text-xs truncate">{card.label}</span>
                        </div>
                        <p className="text-xl font-bold text-dark-100">{card.value}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SocialProofWidget;
