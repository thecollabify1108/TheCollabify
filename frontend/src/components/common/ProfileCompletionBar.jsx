import { motion } from 'framer-motion';

/**
 * ProfileCompletionBar - Show profile completion progress with action CTA
 * @param {number} completion - Completion percentage (0-100)
 * @param {Function} onComplete - Handler when user clicks "Complete now"
 */
const ProfileCompletionBar = ({ completion, onComplete }) => {
    // Don't show if profile is complete
    if (completion >= 100) return null;

    // Calculate missing items for better UX
    const missingItems = Math.ceil((100 - completion) / 20); // Rough estimate

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 mb-6 border-l-4 border-amber-500 shadow-lg"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-dark-200 font-semibold text-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Complete your profile
                    </h3>
                    <p className="text-dark-400 text-sm mt-0.5">
                        {missingItems} {missingItems === 1 ? 'item' : 'items'} remaining
                    </p>
                </div>
                <span className="text-2xl font-bold text-amber-400">{completion}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-dark-700 rounded-full overflow-hidden mb-3 relative">
                <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-primary-500 to-secondary-500 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Shine effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>
            </div>

            {/* Action Button */}
            <motion.button
                onClick={onComplete}
                className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
                whileHover={{ x: 3 }}
            >
                Complete now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </motion.button>
        </motion.div>
    );
};

export default ProfileCompletionBar;
