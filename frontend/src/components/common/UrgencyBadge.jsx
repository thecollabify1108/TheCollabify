import { motion } from 'framer-motion';

/**
 * UrgencyBadge - Component to display urgency indicators for time-sensitive items
 * @param {number} daysLeft - Days remaining until deadline
 * @param {number} applicants - Number of applicants (optional)
 * @param {boolean} isHot - Whether to show "Hot" indicator
 */
const UrgencyBadge = ({ daysLeft, applicants, isHot }) => {
    if (!daysLeft && !applicants && !isHot) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            {/* Deadline Urgency */}
            {daysLeft !== undefined && daysLeft <= 5 && (
                <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${daysLeft <= 2
                            ? 'bg-red-500/20 text-red-400 animate-pulse'
                            : daysLeft <= 3
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-orange-500/20 text-orange-400'
                        }`}
                >
                    {daysLeft <= 1 ? (
                        <>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            URGENT - {daysLeft === 0 ? 'Last Day!' : `${daysLeft} day left`}
                        </>
                    ) : (
                        <>
                            🔥 Ending in {daysLeft} days
                        </>
                    )}
                </motion.span>
            )}

            {/* High Demand Indicator */}
            {applicants !== undefined && applicants > 50 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                    ⚡ {applicants}+ applications
                </span>
            )}

            {/* Hot Opportunity */}
            {isHot && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs font-medium animate-pulse">
                    🔥 Hot
                </span>
            )}
        </div>
    );
};

export default UrgencyBadge;
