import { motion } from 'framer-motion';
import {
    FaBriefcase,
    FaRocket,
    FaCheckCircle,
    FaUsers,
    FaTrophy
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp, HiLightningBolt } from 'react-icons/hi';

const QuickStatsWidget = ({ stats }) => {
    const statCards = [
        {
            label: 'Total Campaigns',
            value: stats.total,
            icon: <FaBriefcase />,
            gradient: 'from-violet-600 via-purple-600 to-indigo-600',
            bgGlow: 'bg-violet-500/20',
            shadowColor: 'shadow-violet-500/20'
        },
        {
            label: 'Active',
            value: stats.active,
            icon: <HiLightningBolt />,
            gradient: 'from-amber-500 via-orange-500 to-red-500',
            bgGlow: 'bg-amber-500/20',
            shadowColor: 'shadow-amber-500/20',
            pulse: true
        },
        {
            label: 'Completed',
            value: stats.completed,
            icon: <FaTrophy />,
            gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
            bgGlow: 'bg-emerald-500/20',
            shadowColor: 'shadow-emerald-500/20'
        },
        {
            label: 'Creator Matches',
            value: stats.totalMatches,
            icon: <HiSparkles />,
            gradient: 'from-pink-500 via-rose-500 to-red-500',
            bgGlow: 'bg-pink-500/20',
            shadowColor: 'shadow-pink-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-s4">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`relative overflow-hidden rounded-premium-2xl bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 p-s6 cursor-pointer group shadow-premium`}
                >
                    {/* Background glow */}
                    <div className={`absolute -top-12 -right-12 w-32 h-32 ${stat.bgGlow} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-s4">
                            <div className={`p-s3 rounded-premium-xl bg-gradient-to-br ${stat.gradient} shadow-glow`}>
                                <span className="text-white text-lg">{stat.icon}</span>
                            </div>
                            {stat.pulse && stat.value > 0 && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-3 h-3 rounded-full bg-emerald-500"
                                />
                            )}
                        </div>

                        <motion.div
                            className="text-h1 font-black text-dark-100 mb-s1 group-hover:scale-110 transition-transform origin-left"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            {stat.value}
                        </motion.div>
                        <div className="text-xs-pure font-black text-dark-500 uppercase tracking-widest">{stat.label}</div>
                    </div>

                    {/* Hover shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </motion.div>
            ))}
        </div>
    );
};

export default QuickStatsWidget;
