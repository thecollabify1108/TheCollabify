import { motion } from 'framer-motion';
import {
    FaBriefcase,
    FaRocket,
    FaCheckCircle,
    FaUsers,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp } from 'react-icons/hi';

const QuickStatsWidget = ({ stats }) => {
    const statCards = [
        {
            label: 'Total Campaigns',
            value: stats.total,
            icon: <FaBriefcase />,
            color: 'from-primary-500 to-purple-500',
            bgColor: 'bg-primary-500/10',
            change: null
        },
        {
            label: 'Active',
            value: stats.active,
            icon: <FaRocket />,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-500/10',
            change: stats.active > 0 ? '+' + stats.active : null
        },
        {
            label: 'Completed',
            value: stats.completed,
            icon: <FaCheckCircle />,
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'bg-emerald-500/10',
            change: null
        },
        {
            label: 'Creator Matches',
            value: stats.totalMatches,
            icon: <HiSparkles />,
            color: 'from-pink-500 to-rose-500',
            bgColor: 'bg-pink-500/10',
            change: stats.totalMatches > 0 ? 'Active' : null
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-5 hover:border-primary-500/30 transition-all cursor-pointer group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                            <span className={`text-lg bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {stat.icon}
                            </span>
                        </div>
                        {stat.change && (
                            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                                {stat.change}
                            </span>
                        )}
                    </div>

                    <div className="text-2xl font-bold text-dark-100 mb-1 group-hover:scale-105 transition-transform">
                        {stat.value}
                    </div>
                    <div className="text-sm text-dark-400">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    );
};

export default QuickStatsWidget;
