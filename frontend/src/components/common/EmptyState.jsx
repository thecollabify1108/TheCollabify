import { motion } from 'framer-motion';
import Icon from './Icon';
import LoadingButton from './LoadingButton';

/**
 * EmptyState - Reusable component for empty data scenarios
 * @param {string} title - Main heading
 * @param {string} description - Supporting text
 * @param {string} icon - Name of the icon from IconPaths
 * @param {string} actionLabel - Text for the CTA button
 * @param {function} onAction - Handler for the CTA button
 * @param {ReactNode} customAction - Optional custom action element
 * @param {string} variant - 'default' | 'premium'
 */
const EmptyState = ({
    title,
    description,
    icon = 'box-empty',
    actionLabel,
    onAction,
    customAction,
    variant = 'premium',
    className = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`flex flex-col items-center justify-center py-16 px-6 text-center select-none ${variant === 'premium'
                    ? 'rounded-[2rem] border border-dark-700/50 bg-dark-800/20 backdrop-blur-xl shadow-2xl shadow-black/20'
                    : 'rounded-3xl border border-dark-700/30'
                } ${className}`}
        >
            {/* Minimal Illustration / Icon */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full scale-150 transform -translate-y-2" />
                <div className="relative w-20 h-20 rounded-3xl bg-dark-800/80 border border-dark-700/50 flex items-center justify-center text-primary-400">
                    <Icon name={icon} size={40} strokeWidth={1.5} />
                </div>
            </div>

            {/* Encouraging Headline */}
            <h3 className="text-2xl font-black text-dark-100 mb-3 tracking-tight italic">
                {title}
            </h3>

            {/* Subtle Explanatory Sentence */}
            {description && (
                <p className="text-dark-400 max-w-sm mb-8 leading-relaxed text-sm md:text-base font-medium">
                    {description}
                </p>
            )}

            {/* CTA Button */}
            {(actionLabel || customAction) && (
                <div className="mt-2 animate-bounce-subtle">
                    {customAction ? customAction : (
                        <LoadingButton
                            onClick={onAction}
                            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 border-none"
                        >
                            {actionLabel}
                        </LoadingButton>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default EmptyState;
