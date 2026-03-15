import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collaborationAPI } from '../../services/api';

const EarlyBirdBanner = () => {
    const [isEarlyBird, setIsEarlyBird] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [dismissed, setDismissed] = useState(() =>
        sessionStorage.getItem('earlyBirdBannerDismissed') === 'true'
    );

    useEffect(() => {
        collaborationAPI.getPlatformMode()
            .then(res => setIsEarlyBird(res.data?.data?.earlyBirdMode === true))
            .catch(() => {});
    }, []);

    if (!isEarlyBird || dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-md mb-4"
            >
                <span className="text-base">🎉</span>
                <span>
                    <span className="font-bold">Early Bird Program</span>
                    {' '}— All collaborations are currently <span className="underline font-bold">free</span>. No payment required.
                </span>
                <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="ml-1 w-4 h-4 rounded-full border border-white/70 text-white/80 text-xs flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label="Early bird info"
                >
                    ?
                </button>
                <button
                    onClick={() => {
                        setDismissed(true);
                        sessionStorage.setItem('earlyBirdBannerDismissed', 'true');
                    }}
                    className="ml-auto text-white/80 hover:text-white text-lg leading-none"
                    aria-label="Dismiss"
                >
                    ×
                </button>

                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl z-50 border border-amber-500/40"
                        >
                            <p className="font-semibold text-amber-400 mb-1">🐣 Early Bird Program</p>
                            <p>You are among the first users of Collabify! During this phase, all collaborations are completely free. Payments and escrow will be enabled in a future release.</p>
                            <p className="mt-2 text-gray-400">Your trust and feedback help us build the best platform for creators and brands.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};

export default EarlyBirdBanner;
