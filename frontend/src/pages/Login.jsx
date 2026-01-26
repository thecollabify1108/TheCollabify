import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Confetti from '../components/common/Confetti';
import AuthLayout from '../components/auth/AuthLayout';

const Login = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { login, googleLogin } = useAuth();
    const [googleLoading, setGoogleLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            setShowConfetti(true);
            toast.success('Login successful!');

            setTimeout(() => {
                if (user.role === 'creator') {
                    navigate('/creator/dashboard');
                } else if (user.role === 'seller') {
                    navigate('/seller/dashboard');
                } else if (user.role === 'admin') {
                    navigate('/admin');
                }
            }, 1000);
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                const user = await googleLogin({
                    accessToken: tokenResponse.access_token
                });
                toast.success('Login successful!');
                if (user.role === 'creator') {
                    navigate('/creator/dashboard');
                } else if (user.role === 'seller') {
                    navigate('/seller/dashboard');
                } else if (user.role === 'admin') {
                    navigate('/admin');
                }
            } catch (error) {
                const message = error.response?.data?.message || 'Google login failed';
                toast.error(message);
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
            toast.error('Google authentication failed');
            setGoogleLoading(false);
        }
    });

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your account"
        >
            <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email Input */}
                <div className="space-y-1 group">
                    <label className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">Email Address <span className="text-red-400">*</span></label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full py-2 bg-transparent border-b-2 border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 focus:border-primary-500 outline-none transition-all placeholder-dark-300/50"
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="space-y-1 group">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">Password <span className="text-red-400">*</span></label>
                        <Link
                            to="/forgot-password"
                            className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full py-2 bg-transparent border-b-2 border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 focus:border-primary-500 outline-none transition-all placeholder-dark-300/50"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 top-2 pr-0 flex items-start text-dark-400 hover:text-dark-600"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 font-bold uppercase tracking-wider text-sm hover:bg-white/20 dark:hover:bg-black/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Signing in...
                        </span>
                    ) : (
                        'Sign In'
                    )}
                </motion.button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className={`px-4 ${isDark ? 'bg-dark-950' : 'bg-[#FDFBF7]'} text-dark-400`}>or continue with</span>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-dark-200 dark:border-dark-700 hover:bg-white/20 dark:hover:bg-black/20 font-medium rounded-xl transition-all shadow-lg text-dark-900 dark:text-dark-100"
            >
                <FaGoogle className="text-lg" />
                <span>Google</span>
            </motion.button>

            <div className="mt-8 text-center text-sm text-dark-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                    Create account
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Login;
