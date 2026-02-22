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
            className="bg-dark-800/60 backdrop-blur-xl border-b border-dark-700/50 shadow-premium"
            layout
        >
            {/* Collapsed View - Single Row */}
            <div
                className="flex items-center justify-between px-s4 py-s3 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-s6 overflow-x-auto scrollbar-hide">
                    {statItems.slice(0, 3).map((stat) => (
                        <div key={stat.label} className="flex items-center gap-s2 whitespace-nowrap">
                            <span className={stat.color}>{stat.icon}</span>
                            <span className="text-body font-bold text-dark-100">{stat.value}</span>
                            <span className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>
                <motion.button
                    className="p-s2 rounded-full bg-dark-700/50 text-dark-400 hover:text-dark-200 shadow-sm"
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
                        <div className="px-s4 pb-s4 grid grid-cols-5 gap-s3">
                            {statItems.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-s3 rounded-premium-2xl bg-dark-900/60 border border-dark-700/50 text-center shadow-md hover:bg-dark-900/80 transition-all hover:border-primary-500/20 group"
                                >
                                    <div className={`text-h2 mb-s1 group-hover:scale-110 transition-transform ${stat.color}`}>{stat.icon}</div>
                                    <div className="text-h3 font-black text-dark-100">{stat.value}</div>
                                    <div className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">{stat.label}</div>
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
