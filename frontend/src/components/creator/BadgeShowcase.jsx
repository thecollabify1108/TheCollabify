import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { creatorAPI } from '../../services/api';
import { HiSparkles, HiTrendingUp, HiHeart, HiVideoCamera, HiCheckCircle } from 'react-icons/hi';
import { FaCrown, FaLock, FaTrophy } from 'react-icons/fa';

const BadgeShowcase = () => {
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);
    const [stats, setStats] = useState({ totalEarned: 0, totalBadges: 0, completionPercentage: 0 });

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            // First run a check update to ensure latest badges are awarded
            await creatorAPI.checkAchievements();

            const res = await creatorAPI.getAchievements();
            if (res.data.success) {
                setAchievements(res.data.data.achievements);
                setStats(res.data.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch achievements', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => {
        const props = { className: "w-8 h-8 text-white" };
        switch (iconName) {
            case 'stars': return <HiSparkles {...props} />;
            case 'trending_up': return <HiTrendingUp {...props} />;
            case 'trophy': return <FaTrophy {...props} />;
            case 'crown': return <FaCrown {...props} />;
            case 'heart': return <HiHeart {...props} />;
            case 'video_camera': return <HiVideoCamera {...props} />;
            default: return <FaTrophy {...props} />;
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-40 bg-dark-800 rounded-2xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Progress Header */}
            <div className="glass-card p-6 border-l-4 border-primary-500">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-dark-100">Your Achievements</h3>
                        <p className="text-dark-400">Keep growing to unlock more rewards!</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
                            {stats.completionPercentage}%
                        </span>
                        <div className="text-xs text-dark-400">Completed</div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.completionPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    />
                </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((badge, index) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-6 rounded-2xl border transition-all duration-300 group overflow-hidden ${badge.earned
                            ? 'bg-dark-800/50 border-dark-700 hover:border-primary-500/30'
                            : 'bg-dark-900/30 border-dark-800 opacity-70 hover:opacity-100'
                            }`}
                    >
                        {/* Background Glow for Earned */}
                        {badge.earned && (
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${badge.color} opacity-10 blur-2xl -mr-10 -mt-10 rounded-full transition-opacity group-hover:opacity-20`}></div>
                        )}

                        <div className="relative flex items-start gap-4">
                            {/* Icon Box */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300 ${badge.earned
                                ? `bg-gradient-to-br ${badge.color}`
                                : 'bg-dark-700'
                                }`}>
                                {badge.earned ? getIcon(badge.icon) : <FaLock className="w-6 h-6 text-dark-500" />}
                            </div>

                            <div className="flex-1">
                                <h4 className={`font-bold mb-1 ${badge.earned ? 'text-dark-100' : 'text-dark-300'}`}>
                                    {badge.name}
                                </h4>
                                <p className="text-sm text-dark-400 leading-relaxed mb-3">
                                    {badge.description}
                                </p>

                                {badge.earned ? (
                                    <div className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                        <HiCheckCircle className="mr-1" />
                                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-xs text-dark-500 uppercase tracking-wider font-semibold mb-1">
                                            Criteria
                                        </div>
                                        <div className="text-xs text-dark-300 bg-dark-700/50 px-2 py-1 rounded inline-block">
                                            {badge.criteria}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default BadgeShowcase;
