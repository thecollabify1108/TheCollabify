import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, formData.password);
            setSuccess(true);
            toast.success('Password reset successful!');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background orbs */}
            <div className="floating-orb w-96 h-96 -top-48 -right-48 from-secondary-500 to-pink-500" />
            <div className="floating-orb w-72 h-72 bottom-1/4 -left-36" style={{ animationDelay: '-2s' }} />

            <div className="max-w-md w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                            <img src="/star-logo.png" alt="" className="w-10 h-10 object-contain" />
                            <span className="text-2xl font-bold gradient-text">The Collabify.ai</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-dark-100 mb-2">Reset Password</h1>
                        <p className="text-dark-400">
                            {success ? 'Your password has been reset!' : 'Enter your new password below'}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="glass-card p-8">
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* New Password */}
                                <div>
                                    <label className="input-label">New Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="input-field pl-11 pr-11"
                                            minLength={6}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-300"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="input-label">Confirm New Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="input-field pl-11"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
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
                                            Resetting...
                                        </span>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaCheck className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-dark-300 mb-6">
                                    Your password has been successfully reset. Redirecting you to login...
                                </p>
                            </div>
                        )}

                        {!success && (
                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="text-primary-400 hover:text-primary-300 transition"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
