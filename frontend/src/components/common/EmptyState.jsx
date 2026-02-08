import { motion } from 'framer-motion';

/**
 * EmptyState - Reusable component for empty data scenarios
 * @param {ReactNode} icon - Icon component to display
 * @param {string} title - Main heading
 * @param {string} description - Supporting text
 * @param {ReactNode} action - Optional CTA button
 * @param {string} variant - 'default' | 'error' | 'success'
 */
const EmptyState = ({
    icon,
    title,
    description,
    action,
    variant = 'default',
    className = ''
}) => {
    const variants = {
        default: {
            iconBg: 'bg-dark-700/50',
            iconColor: 'text-dark-400',
            titleColor: 'text-dark-200'
        },
        error: {
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-400',
            titleColor: 'text-dark-100'
        },
        success: {
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            titleColor: 'text-dark-100'
        }
    };

    const style = variants[variant] || variants.default;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center justify-center py-12 px-6 text-center rounded-3xl border border-dark-700/30 bg-dark-800/20 backdrop-blur-sm ${className}`}
        >
            {/* Icon */}
            {icon && (
                <div className={`w-16 h-16 rounded-full ${style.iconBg} ${style.iconColor} flex items-center justify-center mb-6`}>
                    <div className="w-8 h-8">
                        {icon}
                    </div>
                </div>
            )}

            {/* Title */}
            <h3 className={`text-xl font-semibold ${style.titleColor} mb-2`}>
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-dark-400 max-w-md mb-6">
                    {description}
                </p>
            )}

            {/* Action Button */}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </motion.div>
    );
};

export default EmptyState;
