import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NewsletterSignup = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [consent, setConsent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) return;
        if (!consent) {
            toast.error('Please accept the privacy policy');
            return;
        }

        setStatus('loading');
        try {
            const res = await authAPI.subscribeNewsletter(email);
            if (res.data.success) {
                setStatus('success');
                toast.success(res.data.message);
                setEmail('');
            }
        } catch (error) {
            setStatus('error');
            toast.error(error.response?.data?.message || 'Failed to subscribe');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="w-full max-w-md">
            <h4 className="text-lg font-bold text-dark-100 mb-2">Subscribe to our newsletter</h4>
            <p className="text-sm text-dark-400 mb-4">
                Get the latest insights, creator tips, and platform updates delivered to your inbox.
            </p>

            <AnimatePresence mode="wait">
                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <FaCheck />
                        </div>
                        <div>
                            <p className="font-semibold text-emerald-400">Subscribed!</p>
                            <p className="text-xs text-emerald-300/80">Thank you for joining our community.</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-3"
                    >
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-dark-800 border border-dark-700 text-dark-100 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder:text-dark-500"
                                required
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="absolute right-2 top-2 w-9 h-9 rounded-lg bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <FaPaperPlane className="text-sm" />
                                )}
                            </button>
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer group">
                            <div className="relative flex items-center pt-0.5">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    className="peer h-4 w-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500/40"
                                />
                            </div>
                            <span className="text-xs text-dark-400 group-hover:text-dark-300 transition-colors">
                                I agree to receive newsletters and accept the <a href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</a>.
                            </span>
                        </label>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NewsletterSignup;
