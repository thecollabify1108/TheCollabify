import { motion } from 'framer-motion';
import { FaLock, FaCrown } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/**
 * UpgradePrompt — shown when a FREE tier user tries to access gated features.
 * Props:
 *   feature    – name of the locked feature (e.g. "Campaign Strategy")
 *   tier       – required tier label (e.g. "Brand Pro")
 *   message    – optional custom message
 *   compact    – if true, renders inline instead of a full card
 *   onUpgrade  – callback when user clicks the upgrade button
 */
const UpgradePrompt = ({ feature, tier = 'Pro', message, compact = false, onUpgrade }) => {
    if (compact) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <FaLock className="text-purple-400 text-xs shrink-0" />
                <span className="text-xs text-purple-300">
                    {message || `Upgrade to ${tier} to unlock ${feature}`}
                </span>
                {onUpgrade && (
                    <button
                        onClick={onUpgrade}
                        className="ml-auto text-xs font-medium text-purple-400 hover:text-purple-300 whitespace-nowrap"
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
            className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-500/30 rounded-xl p-5 text-center space-y-3"
        >
            <div className="w-12 h-12 mx-auto bg-purple-600/20 rounded-full flex items-center justify-center">
                <FaCrown className="text-purple-400 text-xl" />
            </div>

            <div>
                <h4 className="text-sm font-semibold text-dark-100">{feature} is a {tier} feature</h4>
                <p className="text-xs text-dark-400 mt-1">
                    {message || `Upgrade to ${tier} to unlock full access to ${feature} and other premium intelligence features.`}
                </p>
            </div>

            {onUpgrade && (
                <button
                    onClick={onUpgrade}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-opacity"
                >
                    <HiSparkles className="text-sm" />
                    Upgrade to {tier}
                </button>
            )}

            <p className="text-[10px] text-dark-500">
                Plans start at ₹499/month
            </p>
        </motion.div>
    );
};

export default UpgradePrompt;
