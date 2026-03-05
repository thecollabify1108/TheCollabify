import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Confetti from '../components/common/Confetti';
import AuthLayout from '../components/auth/AuthLayout';
import Icon from '../components/common/Icon';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Multi-step state
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Dynamic focus
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        if (step === 1 && emailRef.current) emailRef.current.focus();
        if (step === 2 && passwordRef.current) passwordRef.current.focus();
    }, [step]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (step === 1) {
            if (!formData.email || !formData.email.includes('@')) {
                toast.error('Please enter a valid email');
                return;
            }
            setDirection(1);
            setStep(2);
        } else {
            handleSubmit(e);
        }
    };

    const handleBack = () => {
        setDirection(-1);
        setStep(1);
    };

    const handleGoogleLogin = () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            toast.error('Google sign-in is not configured.');
            return;
        }
        const redirectUri = `${window.location.origin}/auth/callback`;
        const scope = 'openid email profile';
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
        window.location.href = url;
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
            const message = !error.response && error.message?.includes('Network')
                ? 'Unable to reach the server. Please try again later.'
                : error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <AuthLayout
            title={step === 1 ? "Welcome Back" : `Hello, ${formData.email.split('@')[0]}`}
            subtitle={step === 1 ? "Sign in to your account" : "Enter your password to continue"}
        >
            <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

            {/* Progress Indicator */}
            <div className="flex gap-2 mb-8 justify-center">
                <motion.div
                    animate={{ width: step === 1 ? '2rem' : '0.5rem', opacity: step === 1 ? 1 : 0.5 }}
                    className="h-1.5 rounded-full bg-primary-500"
                />
                <motion.div
                    animate={{ width: step === 2 ? '2rem' : '0.5rem', opacity: step === 2 ? 1 : 0.5 }}
                    className="h-1.5 rounded-full bg-primary-500"
                />
            </div>

            <form onSubmit={handleNextStep} className="space-y-6 relative min-h-[160px]">
                <AnimatePresence custom={direction} mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="space-y-4"
                        >
                            <div className="space-y-1 group">
                                <label htmlFor="login-email" className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        ref={emailRef}
                                        id="login-email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full py-3 px-4 bg-dark-50/50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-dark-100 focus:border-primary-500 outline-none transition-all placeholder-dark-300/50 pl-10"
                                        placeholder="name@company.com"
                                        required
                                        autoFocus
                                    />
                                    <Icon name="mail" className="absolute left-3.5 top-3.5 text-dark-400" size={18} />
                                </div>
                                <p className="text-xs text-dark-400 pl-1 flex items-center gap-1">
                                    <Icon name="lock" size={12} /> We'll keep this private.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="space-y-4"
                        >
                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={handleBack}
                                className="absolute -top-12 left-0 text-sm text-dark-400 hover:text-dark-200 flex items-center gap-1 transition-colors"
                            >
                                <Icon name="arrow-left" size={12} /> Back
                            </button>

                            <div className="space-y-1 group">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="login-password" className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">Password</label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                                    >
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        ref={passwordRef}
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full py-3 px-4 bg-dark-50/50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-dark-100 focus:border-primary-500 outline-none transition-all placeholder-dark-300/50 pl-10 pr-10"
                                        required
                                        autoFocus
                                    />
                                    <Icon name="lock" className="absolute left-3.5 top-3.5 text-dark-400" size={18} />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 top-0 px-3 flex items-center text-dark-400 hover:text-dark-600"
                                    >
                                        {showPassword ? <Icon name="eye-off" size={20} /> : <Icon name="eye" size={20} />}
                                    </button>
                                </div>
                                <p className="text-xs text-emerald-500/80 pl-1 flex items-center gap-1">
                                    <Icon name="lock" size={12} /> Encrypted before leaving your device.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                    layout
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        step === 1 ? (
                            <>Type Password <Icon name="arrow-right" size={16} /></>
                        ) : (
                            'Sign In'
                        )
                    )}
                </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-6">
                <div className="flex-1 h-px bg-dark-700" />
                <span className="text-xs text-dark-500">or</span>
                <div className="flex-1 h-px bg-dark-700" />
            </div>

            {/* Google Login Button */}
            <button
                onClick={handleGoogleLogin}
                className="mt-4 w-full py-3 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-dark-700 hover:border-dark-500 rounded-xl text-dark-200 text-sm font-medium transition-all"
            >
                <Icon name="google" size={18} />
                Continue with Google
            </button>

            <div className="mt-6 text-center text-sm text-dark-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                    Create account
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Login;
