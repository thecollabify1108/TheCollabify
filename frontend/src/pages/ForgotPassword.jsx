import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Footer from '../components/common/Footer';

const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await forgotPassword(email);
            setSent(true);
            toast.success('Password reset link sent!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background orbs */}
            <div className="floating-orb w-96 h-96 -top-48 -left-48" />
            <div className="floating-orb w-72 h-72 bottom-1/4 -right-36 from-secondary-500 to-pink-500" style={{ animationDelay: '-2s' }} />

            <div className="max-w-md w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                            <img src="/new-logo.png" alt="" className="w-10 h-10 object-contain" />
                            <span className="text-2xl font-bold gradient-text">The Collabify.ai</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-dark-100 mb-2">Forgot Password?</h1>
                        <p className="text-dark-400">
                            {sent
                                ? "Check your email for the reset link"
                                : "No worries, we'll send you reset instructions"
                            }
                        </p>
                    </div>

                    {/* Form */}
                    <div className="glass-card p-8">
                        {!sent ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="input-label">Email Address</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="input-field pl-11"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-3d w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaEnvelope className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-dark-300 mb-6">
                                    We've sent a password reset link to <strong>{email}</strong>.
                                    Please check your inbox and follow the instructions.
                                </p>
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-primary-400 hover:text-primary-300 transition"
                                >
                                    Didn't receive the email? Try again
                                </button>
                            </div>
                        )}

                        {/* Back to Login */}
                        <div className="mt-8">
                            <Link
                                to="/login"
                                className="flex items-center justify-center text-dark-400 hover:text-primary-400 transition"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ForgotPassword;
