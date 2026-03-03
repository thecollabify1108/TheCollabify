import { motion } from 'framer-motion';
import { FaLock, FaCrown } from 'react-icons/fa';

/**
 * UpgradePrompt — shown when a FREE tier user tries to access gated features.
 */
const UpgradePrompt = ({ feature, tier = 'Pro', message, compact = false, onUpgrade }) => {
    if (compact) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <FaLock className="text-indigo-400 text-xs shrink-0" />
                <span className="text-xs text-indigo-300">
                    {message || `${tier} plan required for ${feature}.`}
                </span>
                {onUpgrade && (
                    <button
                        onClick={onUpgrade}
                        className="ml-auto text-xs font-medium text-indigo-400 hover:text-indigo-300 whitespace-nowrap"
                    >
                        Upgrade
                    </button>
                )}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-5 text-center space-y-3"
        >
            <div className="w-10 h-10 mx-auto bg-indigo-600/20 rounded-full flex items-center justify-center">
                <FaCrown className="text-indigo-400 text-base" />
            </div>

            <div>
                <h4 className="text-sm font-semibold text-dark-100">{feature} requires {tier}</h4>
                <p className="text-xs text-dark-400 mt-1">
                    {message || `Upgrade to ${tier} to access ${feature} and other advanced features.`}
                </p>
            </div>

            {onUpgrade && (
                <button
                    onClick={onUpgrade}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Upgrade to {tier}
                </button>
            )}

            <p className="text-[10px] text-dark-500">
                Plans start at $4.99/month
            </p>
        </motion.div>
    );
};

export default UpgradePrompt;
