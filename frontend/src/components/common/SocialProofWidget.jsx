import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiTrendingUp, HiUserGroup } from 'react-icons/hi';
import { FaFire } from 'react-icons/fa';
import api from '../../services/api';

/**
 * Social Proof Widget
 * Shows real-time activity and platform statistics.
 * On mobile, the 4 stat cards are tap-to-expand (accordion style).
 * On desktop (md+) they always show their values.
 */
const SocialProofWidget = () => {
    const [recentActivity, setRecentActivity] = useState([]);
    const [stats, setStats] = useState({
        totalCreators: 0,
        totalBrands: 0,
        activeCampaigns: 0,
        successRate: 98
    });
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [expandedCard, setExpandedCard] = useState(null); // mobile expand state
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('public/stats');
                const result = response.data;
                if (result.success) {
                    setStats(prev => ({ ...prev, ...result.data }));
                    if (result.data.activities) {
                        setActivities(result.data.activities);
                        setRecentActivity(result.data.activities);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch public stats:', error);
            }
        };
        fetchStats();
        const interval = setInterval(() => {
            if (activities.length > 0) {
                setCurrentActivityIndex(prev => (prev + 1) % activities.length);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [activities.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                activeCampaigns: prev.activeCampaigns + Math.floor(Math.random() * 2)
            }));
        }, 15000);
        return () => clearInterval(interval);
    }, []);

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

    const currentActivity = recentActivity[currentActivityIndex];

    const statCards = [
        { id: 'creators', icon: <HiUserGroup className="text-primary-400 text-lg" />, label: 'Creators', value: `${stats.totalCreators.toLocaleString()}+`, accent: 'border-primary-500/50 bg-primary-500/5' },
        { id: 'brands', icon: <HiSparkles className="text-secondary-400 text-lg" />, label: 'Brands', value: `${stats.totalBrands.toLocaleString()}+`, accent: 'border-secondary-500/50 bg-secondary-500/5' },
        { id: 'active', icon: <FaFire className="text-orange-400 text-lg" />, label: 'Active', value: stats.activeCampaigns.toLocaleString(), accent: 'border-orange-500/50 bg-orange-500/5' },
        { id: 'success', icon: <HiTrendingUp className="text-green-400 text-lg" />, label: 'Success', value: `${stats.successRate}%`, accent: 'border-green-500/50 bg-green-500/5' }
    ];

    const handleCardClick = (id) => {
        setExpandedCard(prev => prev === id ? null : id);
    };

    return (
        <div className="space-y-3">
            {/* Recent Activity Ticker */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-lg"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
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
                                    className="text-sm text-dark-100"
                                >
                                    {getActivityText(currentActivity)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <p className="text-xs text-dark-400 mt-1">{currentActivity?.time}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        {activities.map((_, index) => (
                            <div key={index} className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentActivityIndex ? 'bg-primary-500' : 'bg-dark-700'}`} />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Platform Stats Grid — tap to expand on mobile */}
            <div className="flex gap-2">
                {statCards.map(card => {
                    const isExpanded = expandedCard === card.id;
                    const isShrunk = expandedCard !== null && !isExpanded;
                    return (
                        <motion.button
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            animate={{ flex: isExpanded ? 2.5 : isShrunk ? 0.55 : 1 }}
                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                            className={`overflow-hidden border rounded-xl p-2.5 text-left transition-colors md:flex-1 ${isExpanded ? card.accent : 'bg-dark-800 border-dark-700 hover:border-dark-600'}`}
                            style={{ minWidth: 0 }}
                        >
                            {/* Icon + label row */}
                            <div className="flex items-center gap-1 mb-1">
                                {card.icon}
                                <span className={`text-dark-400 font-medium leading-none transition-all duration-200 truncate ${isShrunk ? 'text-[8px]' : 'text-[11px]'}`}>
                                    {card.label}
                                </span>
                            </div>

                            {/* Value: animated in on mobile when expanded, always visible on desktop */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-lg font-bold text-dark-100 md:hidden"
                                    >
                                        {card.value}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            {/* Desktop always shows the value */}
                            <p className="hidden md:block text-2xl font-bold text-dark-100">{card.value}</p>
                        </motion.button>
                    );
                })}
            </div>
            {/* Mobile hint */}
            <p className="text-center text-dark-500 text-[10px] md:hidden">Tap a card to see the number</p>
        </div>
    );
};

export default SocialProofWidget;
