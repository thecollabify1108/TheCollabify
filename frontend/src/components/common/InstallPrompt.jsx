import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes } from 'react-icons/fa';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-80 z-50"
            >
                <div className="glass-card p-4 border-l-4 border-primary-500 relative bg-dark-900/95 backdrop-blur-xl shadow-2xl">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-dark-400 hover:text-dark-200"
                    >
                        <FaTimes />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
                            <img src="/favicon.png" alt="" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h4 className="font-bold text-dark-100">Install App</h4>
                            <p className="text-sm text-dark-400 mb-3">
                                Install TheCollabify for a better experience and quick access.
                            </p>
                            <button
                                onClick={handleInstallClick}
                                className="btn-3d text-sm px-4 py-2 w-full flex items-center justify-center gap-2"
                            >
                                <FaDownload />
                                Install Now
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallPrompt;
