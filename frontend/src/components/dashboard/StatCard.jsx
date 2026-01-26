import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon, trend, trendLabel, color = 'primary', delay = 0 }) => {
    const colors = {
        primary: 'from-primary-600 to-secondary-600',
        emerald: 'from-emerald-500 to-teal-500',
        amber: 'from-amber-500 to-orange-500',
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500'
    };

    const bgColors = {
        primary: 'bg-primary-500/10 border-primary-500/20',
        emerald: 'bg-emerald-500/10 border-emerald-500/20',
        amber: 'bg-amber-500/10 border-amber-500/20',
        purple: 'bg-purple-500/10 border-purple-500/20',
        blue: 'bg-blue-500/10 border-blue-500/20'
    };

    const textColors = {
        primary: 'text-primary-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        purple: 'text-purple-400',
        blue: 'text-blue-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`p-4 md:p-5 rounded-2xl border backdrop-blur-sm relative overflow-hidden group ${bgColors[color] || bgColors.primary}`}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-dark-900/50 ${textColors[color] || textColors.primary}`}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-dark-900/50 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">
                    {value}
                </h3>
                <p className="text-dark-400 text-sm">{label}</p>
                {trendLabel && <p className="text-xs text-dark-500 mt-1">{trendLabel}</p>}
            </div>

            {/* Decorative Gradient Blob */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${colors[color] || colors.primary} group-hover:opacity-30 transition-opacity`} />
        </motion.div>
    );
};

export default StatCard;
