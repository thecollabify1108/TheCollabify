import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronUp, FaChevronDown, FaRocket, FaFire, FaCheck, FaUsers } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';

const QuickStatsBar = ({ stats }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const statItems = [
        { label: 'Campaigns', value: stats.total, icon: <FaRocket />, color: 'text-violet-400' },
        { label: 'Active', value: stats.active, icon: <HiLightningBolt />, color: 'text-amber-400' },
        { label: 'Pending', value: stats.pending, icon: <FaFire />, color: 'text-pink-400' },
        { label: 'Completed', value: stats.completed, icon: <FaCheck />, color: 'text-emerald-400' },
        { label: 'Matches', value: stats.totalMatches, icon: <FaUsers />, color: 'text-blue-400' }
    ];

    return (
        <motion.div
            className="bg-dark-800/60 backdrop-blur-xl border-b border-dark-700/50"
            layout
        >
            {/* Collapsed View - Single Row */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                    {statItems.slice(0, 3).map((stat) => (
                        <div key={stat.label} className="flex items-center gap-2 whitespace-nowrap">
                            <span className={stat.color}>{stat.icon}</span>
                            <span className="font-bold text-dark-100">{stat.value}</span>
                            <span className="text-xs text-dark-400">{stat.label}</span>
                        </div>
                    ))}
                </div>
                <motion.button
                    className="p-2 rounded-full bg-dark-700/50 text-dark-400 hover:text-dark-200"
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                >
                    <FaChevronDown className="text-sm" />
                </motion.button>
            </div>

            {/* Expanded View */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 grid grid-cols-5 gap-3">
                            {statItems.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-3 rounded-2xl bg-dark-900/60 border border-dark-700/50 text-center"
                                >
                                    <div className={`text-2xl mb-1 ${stat.color}`}>{stat.icon}</div>
                                    <div className="text-2xl font-black text-dark-100">{stat.value}</div>
                                    <div className="text-xs text-dark-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default QuickStatsBar;
