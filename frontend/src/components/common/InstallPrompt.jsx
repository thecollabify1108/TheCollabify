import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes, FaShareAlt } from 'react-icons/fa';
import { IoIosArrowUp } from 'react-icons/io';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iOS = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(iOS);

        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');
        setIsStandalone(standalone);

        // Android/Desktop install prompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, show prompt after a delay if not installed
        if (iOS && !standalone) {
            const timer = setTimeout(() => {
                const hasSeenPrompt = localStorage.getItem('ios-install-prompt-dismissed');
                if (!hasSeenPrompt) {
                    setShowPrompt(true);
                }
            }, 3000); // Show after 3 seconds

            return () => clearTimeout(timer);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        if (isIOS) {
            localStorage.setItem('ios-install-prompt-dismissed', 'true');
        }
    };

    // Don't show if already installed
    if (isStandalone || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50"
            >
                <div className="glass-card p-4 border-l-4 border-primary-500 relative bg-dark-900/95 backdrop-blur-xl shadow-2xl">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-dark-400 hover:text-dark-200 transition"
                    >
                        <FaTimes />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                            <img src="/favicon.png" alt="" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-dark-100 mb-1">Install TheCollabify App</h4>
                            <p className="text-sm text-dark-300 mb-3">
                                After installing the app, you will be able to get real-time notifications for your campaigns and applications!
                            </p>

                            {/* Benefits List */}
                            <div className="space-y-1.5 mb-4">
                                <div className="flex items-center gap-2 text-xs text-dark-300">
                                    <span className="text-emerald-400">📬</span>
                                    <span>Real-time notifications for campaign updates</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-dark-300">
                                    <span className="text-blue-400">⚡</span>
                                    <span>Instant alerts when applications are accepted</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-dark-300">
                                    <span className="text-purple-400">📱</span>
                                    <span>Works offline with cached data</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-dark-300">
                                    <span className="text-pink-400">🚀</span>
                                    <span>Faster loading & app-like experience</span>
                                </div>
                            </div>

                            {/* iOS Instructions */}
                            {isIOS ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-amber-400 font-medium">📱 To install on iPhone/iPad:</p>
                                    <div className="bg-dark-800/50 p-3 rounded-lg space-y-2 text-xs text-dark-200">
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary-400 font-bold">1.</span>
                                            <div className="flex-1">
                                                Tap the <FaShareAlt className="inline text-blue-400 mx-1" /> Share button below
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary-400 font-bold">2.</span>
                                            <div className="flex-1">
                                                Scroll down and tap <span className="text-emerald-400 font-medium">"Add to Home Screen"</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary-400 font-bold">3.</span>
                                            <div className="flex-1">
                                                Tap <span className="text-primary-400 font-medium">"Add"</span> in the top right
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual indicator */}
                                    <div className="flex justify-center pt-2">
                                        <div className="flex items-center gap-2 text-primary-400 animate-bounce">
                                            <span className="text-sm">Tap Share button</span>
                                            <IoIosArrowUp className="text-xl" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Android/Desktop Install Button */
                                <button
                                    onClick={handleInstallClick}
                                    className="btn-3d w-full py-2.5 text-sm flex items-center justify-center gap-2"
                                >
                                    <FaDownload />
                                    Install App
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallPrompt;
