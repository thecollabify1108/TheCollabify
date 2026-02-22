import { motion } from 'framer-motion';
import { HiSparkles, HiCheckCircle, HiShieldCheck } from 'react-icons/hi';
import { FaCrown, FaClock } from 'react-icons/fa';

/**
 * ReliabilityBadge Component
 * Displays the creator's trust level based on their reliability score.
 * Helps drive platform trust and incentivizes high-quality work.
 */
const ReliabilityBadge = ({ level, score, size = 'md' }) => {
    if (!level) return null;

    const icons = {
        crown: <FaCrown />,
        check_circle: <HiCheckCircle />,
        stars: <HiSparkles />,
        clock: <FaClock />,
        shield: <HiShieldCheck />
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[9px] gap-1',
        md: 'px-3 py-1 text-[11px] gap-1.5',
        lg: 'px-4 py-2 text-sm gap-2'
    };

    const iconSizes = {
        sm: 'text-[10px]',
        md: 'text-sm',
        lg: 'text-lg'
    };

    return (
        <div className="flex flex-col items-start gap-1">
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border transition-all ${level.color.replace('text', 'bg').replace('400', '500/10')} ${level.color.replace('text', 'border').replace('400', '500/20')} ${level.color} ${sizeClasses[size]}`}
            >
                <span className={iconSizes[size]}>
                    {icons[level.icon] || icons.shield}
                </span>
                {level.label}
            </motion.div>

            {size === 'lg' && (
                <p className="text-[10px] text-dark-500 italic max-w-[200px] leading-tight mt-1">
                    Your Reliability Index is calculated based on collaboration completions and brand feedback.
                    {level.label === 'Elite' ? ' You are among the top 5% of most trusted creators.' : ''}
                </p>
            )}
        </div>
    );
};

export default ReliabilityBadge;
