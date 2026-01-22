import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiSparkles, HiMail } from 'react-icons/hi';

/**
 * ExitIntentModal - Capture users before they leave the landing page
 * @param {Function} onClose - Callback when modal is closed
 */
const ExitIntentModal = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Check if already shown in this session
        const hasShown = sessionStorage.getItem('exit-intent-shown');
        if (hasShown) return;

        const handleMouseLeave = (e) => {
            // Only trigger if mouse leaves from top of page (genuine exit intent)
            if (e.clientY <= 10 && !isVisible) {
                setIsVisible(true);
                sessionStorage.setItem('exit-intent-shown', 'true');
            }
        };

        // Add delay before activating exit intent (prevent false positives)
        const timer = setTimeout(() => {
            document.addEventListener('mouseleave', handleMouseLeave);
        }, 5000); // Wait 5 seconds before activating

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isVisible]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // For now, just simulate submission
        // In production, integrate with email service (Mailchimp, SendGrid, etc.)
        // Submit email to backend
        // API call would go here

        setSubmitted(true);

        // Close after showing success message
        setTimeout(() => {
            handleClose();
        }, 2000);
    };

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass-card max-w-md w-full p-8 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-dark-700 flex items-center justify-center transition text-dark-400 hover:text-dark-200"
                    >
                        <HiX className="w-5 h-5" />
                    </button>

                    {!submitted ? (
                        <>
                            {/* Icon */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                                <HiSparkles className="w-8 h-8 text-primary-400" />
                            </div>

                            {/* Heading */}
                            <h2 className="text-2xl font-bold text-dark-100 text-center mb-2">
                                Wait! Don't Miss Out 🚀
                            </h2>

                            <p className="text-dark-400 text-center mb-6">
                                Join <span className="text-primary-400 font-semibold">2,500+ creators</span> and <span className="text-emerald-400 font-semibold">500+ brands</span> already collaborating on TheCollabify
                            </p>

                            {/* Email Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Get Started Free
                                </button>
                            </form>

                            {/* Trust Indicators */}
                            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-dark-500">
                                <span>✓ No credit card required</span>
                                <span>✓ 100% free signup</span>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-dark-100 mb-2">You're all set! 🎉</h3>
                            <p className="text-dark-400">We'll notify you about opportunities</p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ExitIntentModal;
