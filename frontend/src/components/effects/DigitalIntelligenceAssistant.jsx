import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ThreeScene from './ThreeScene';

export const DigitalIntelligenceAssistant = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isThinking, setIsThinking] = useState(false);

    if (!isVisible) return (
        <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-8 right-8 w-10 h-10 glass-card flex items-center justify-center text-[10px] uppercase tracking-widest text-text-muted hover:text-text-prime transition-all z-[200]"
        >
            IA
        </button>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed bottom-8 right-8 w-64 h-80 glass-card flex flex-col items-center justify-center p-6 z-[200] overflow-hidden"
            >
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-text-muted hover:text-text-prime transition-colors text-[10px] uppercase tracking-widest"
                >
                    Disable
                </button>

                <div className="w-full h-48 relative mb-4">
                    <ThreeScene type="assistant" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-24 h-24 rounded-full border border-white/5 animate-pulse flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full border border-white/10" />
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">System Integrity</span>
                    <p className="text-xs text-text-sec px-4">
                        Intelligence layer active.
                        Protocol monitoring in progress.
                    </p>
                </div>

                {isThinking && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="absolute bottom-0 left-0 h-[2px] bg-text-prime opacity-20"
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default DigitalIntelligenceAssistant;
