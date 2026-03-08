import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EarlyBirdModal = ({ collaborationId, onProceed, onClose }) => {
    const [loading, setLoading] = useState(false);

    const handleProceed = async () => {
        setLoading(true);
        try {
            await onProceed();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header gradient */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 pt-8 pb-12 text-center">
                        <div className="text-5xl mb-3">🎉</div>
                        <h2 className="text-2xl font-bold text-white">Early Bird Collaboration!</h2>
                        <p className="text-white/90 text-sm mt-1">You're among the first on Collabify</p>
                    </div>

                    {/* Content card overlapping header */}
                    <div className="relative bg-white dark:bg-gray-900 mx-4 -mt-6 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="text-2xl">🐣</span>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">Early Bird Program — No Payment Required</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                    Congratulations! You are among the early users of Collabify. During this phase, all collaborations are <strong>completely free</strong> — no escrow, no payment required.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-5">
                            {[
                                { icon: '💬', text: 'Full chat and collaboration access is now unlocked' },
                                { icon: '📋', text: 'Complete your deliverables and track progress together' },
                                { icon: '⭐', text: 'Share feedback after completion to help us improve' },
                                { icon: '🔒', text: 'Payment integration coming soon — your spot is secured' },
                            ].map(({ icon, text }) => (
                                <div key={text} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="mt-0.5">{icon}</span>
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                            <strong>Note:</strong> We recommend both parties follow the Collabify collaboration guidelines and communicate respectfully. Your trust makes this platform better.
                        </p>

                        <button
                            onClick={handleProceed}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Opening Chat...
                                </span>
                            ) : '🚀 Proceed to Collaboration Chat'}
                        </button>
                    </div>

                    <div className="px-6 pb-4 text-center">
                        <button
                            onClick={onClose}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            Remind me later
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EarlyBirdModal;
