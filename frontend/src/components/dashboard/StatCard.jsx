import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon, trend, trendLabel, color = 'primary', delay = 0, onClick }) => {
    const bgColors = {
        primary: 'bg-indigo-500/8 border-indigo-500/15',
        emerald: 'bg-emerald-500/8 border-emerald-500/15',
        amber: 'bg-amber-500/8 border-amber-500/15',
        purple: 'bg-violet-500/8 border-violet-500/15',
        blue: 'bg-blue-500/8 border-blue-500/15'
    };

    const textColors = {
        primary: 'text-indigo-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        purple: 'text-violet-400',
        blue: 'text-blue-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`p-2.5 sm:p-3 md:p-4 rounded-lg border ${bgColors[color] || bgColors.primary} ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-transform' : ''}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                <div className={`p-1.5 sm:p-2 rounded bg-dark-900/50 ${textColors[color] || textColors.primary}`}>
                    {icon}
                </div>
                {trend !== undefined && trend !== null && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded bg-dark-900/50 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-0.5">
                {value}
            </h3>
            <p className="text-dark-400 text-[11px] font-medium uppercase tracking-wider">{label}</p>
            {trendLabel && <p className="text-[10px] text-dark-500 mt-0.5">{trendLabel}</p>}
        </motion.div>
    );
};

export default StatCard;
