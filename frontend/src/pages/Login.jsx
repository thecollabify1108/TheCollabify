import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            toast.success('Login successful!');

            // Redirect based on role
            if (user.role === 'creator') {
                navigate('/creator/dashboard');
            } else if (user.role === 'seller') {
                navigate('/seller/dashboard');
            } else if (user.role === 'admin') {
                navigate('/admin');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
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
                            <img src="/star-logo.png" alt="" className="w-10 h-10 object-contain" />
                            <span className="text-2xl font-bold gradient-text">The Collabify.ai</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-dark-100 mb-2">Welcome Back</h1>
                        <p className="text-dark-400">Sign in to continue to your dashboard</p>
                    </div>

                    {/* Login Form */}
                    <div className="glass-card p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="input-label">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="input-field pl-11"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="input-label">Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="input-field pl-11 pr-11"
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

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary-400 hover:text-primary-300 transition"
                                >
                                    Forgot Password?
                                </Link>
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
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-dark-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-dark-800 text-dark-400">New to The Collabify.ai?</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <Link
                            to="/register"
                            className="btn-secondary w-full py-4 text-center block"
                        >
                            Create an Account
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
