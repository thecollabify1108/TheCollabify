import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import Confetti from '../components/common/Confetti';
import AuthLayout from '../components/auth/AuthLayout';
import Icon from '../components/common/Icon';

const Login = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [googleLoading, setGoogleLoading] = useState(false);

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

    // Google Auth — full-page redirect (no popup/GSI = no TrustedScriptURL issues)
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
        || '223460533138-nkmmomsvj3nvjd8geg77gdp2rqho3o22.apps.googleusercontent.com';

    const handleGoogleLogin = () => {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: 'token',
            scope: 'openid email profile',
            prompt: 'select_account'
        });
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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
                                <label className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        ref={emailRef}
                                        type="email"
                                        name="email"
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
                                    <label className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">Password</label>
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
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
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

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className={`px-4 ${isDark ? 'bg-dark-950' : 'bg-[#FDFBF7]'} text-dark-400`}>or continue with</span>
                </div>
            </div>

            <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-dark-600 bg-dark-800/60 hover:bg-dark-700 hover:border-dark-500 text-dark-100 font-medium text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

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
