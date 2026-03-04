import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import Confetti from '../components/common/Confetti';
import OTPInput from '../components/common/OTPInput';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import AuthLayout from '../components/auth/AuthLayout';
import Icon from '../components/common/Icon';
import { isValidForRegister } from '../utils/passwordValidator';

const Register = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register, googleLogin, verifyOTP } = useAuth();

    // Steps: 1=Role, 2=Details, 3=OTP
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: searchParams.get('role') || ''
    });

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // OTP State
    const [tempUserId, setTempUserId] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpTimer, setOtpTimer] = useState(600);
    const [canResend, setCanResend] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        const roleFromUrl = searchParams.get('role');
        if (roleFromUrl && ['creator', 'seller'].includes(roleFromUrl)) {
            setFormData(prev => ({ ...prev, role: roleFromUrl }));
        }
    }, [searchParams]);

    // OTP Timer Logic
    useEffect(() => {
        if (step === 3 && otpTimer > 0) {
            const timer = setInterval(() => {
                setOtpTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            if (otpTimer === 540) setCanResend(true);
            return () => clearInterval(timer);
        }
    }, [step, otpTimer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = () => {
        if (step === 1 && !formData.role) {
            toast.error('Please select a role to continue');
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleRoleSelect = (role) => {
        setFormData(prev => ({ ...prev, role }));
    };

    const handleSubmitDetails = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Client-side validation matching backend exactly
        if (!isValidForRegister(formData.password)) {
            toast.error('Password must be 8+ characters with at least 1 uppercase letter, 1 lowercase letter, and 1 number.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('auth/register/send-otp', {
                email: formData.email,
                name: formData.name,
                password: formData.password,
                role: formData.role
            });

            if (response.data.success) {
                setTempUserId(response.data.data.tempUserId);
                setOtpTimer(response.data.data.expiresIn);
                setStep(3); // Move to OTP
                setCanResend(false);
                toast.success('Code sent! Check your email.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            toast.error('Enter complete code');
            return;
        }

        setOtpLoading(true);
        try {
            const userData = await verifyOTP(tempUserId, otpCode);

            setShowConfetti(true);
            toast.success('Welcome to TheCollabify!');

            setTimeout(() => {
                navigate(userData.role === 'creator' ? '/creator/dashboard' : '/seller/dashboard');
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid code');
            setOtp(['', '', '', '', '', '']);
        } finally {
            setOtpLoading(false);
        }
    };

    // Detect in-app browsers (Instagram, Facebook, etc.) — Google blocks OAuth in WebViews
    const isInAppBrowser = () => {
        const ua = navigator.userAgent || '';
        return /FBAN|FBAV|Instagram|Line\/|Twitter|MicroMessenger|Snapchat|Pinterest/i.test(ua);
    };
    const [showWebViewBanner, setShowWebViewBanner] = useState(false);

    // Google Auth — full-page redirect (no popup = no COOP issues)
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
        || '223460533138-nkmmomsvj3nvjd8geg77gdp2rqho3o22.apps.googleusercontent.com';

    const handleGoogleLogin = () => {
        if (isInAppBrowser()) {
            setShowWebViewBanner(true);
            return;
        }
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const state = formData.role ? `role:${formData.role}` : 'role:';
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: 'token',
            scope: 'openid email profile',
            state,
            prompt: 'select_account'
        });
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    };


    // UI Helpers
    const getStepTitle = () => {
        if (step === 1) return "Choose your path";
        if (step === 2) return "Create your account";
        if (step === 3) return "Verify your email";
        return "Register";
    };

    const getStepSubtitle = () => {
        if (step === 1) return "How do you want to use TheCollabify?";
        if (step === 2) return "Fill in your details to get started.";
        if (step === 3) return `We sent a code to ${formData.email}`;
        return "";
    };

    return (
        <AuthLayout title={getStepTitle()} subtitle={getStepSubtitle()}>
            <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

            {/* Back Button for Steps 2 & 3 */}
            {step > 1 && (
                <button
                    onClick={() => setStep(prev => prev - 1)}
                    className="flex items-center text-dark-400 hover:text-dark-200 mb-6 transition-colors text-sm"
                >
                    <Icon name="arrow-left" size={16} className="mr-2" /> Back
                </button>
            )}

            <AnimatePresence mode="wait">
                {/* STEP 1: ROLE SELECTION */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="grid gap-4">
                            {/* Seller Option */}
                            <button
                                onClick={() => handleRoleSelect('seller')}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group backdrop-blur-md ${formData.role === 'seller'
                                    ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                                    : 'border-dark-700 bg-dark-900/40 dark:bg-dark-800/40 hover:border-dark-500 hover:shadow-lg'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl w-fit mb-4 transition-all duration-300 ${formData.role === 'seller' ? 'bg-primary-500/20 shadow-lg scale-110' : 'bg-dark-800/60 group-hover:bg-dark-700'}`}>
                                    <img
                                        src="https://img.icons8.com/fluency/96/shopping-bag.png"
                                        alt="Brand / Seller"
                                        className="w-10 h-10 object-contain"
                                        onError={(e) => { e.target.outerHTML = '<span style="font-size:2rem">🛍️</span>'; }}
                                    />
                                </div>
                                <h3 className={`text-lg font-bold mb-1 ${formData.role === 'seller' ? 'text-primary-400' : 'text-dark-100'}`}>Brand / Seller</h3>
                                <p className="text-sm text-dark-400">hire creators to promote your products.</p>

                                {formData.role === 'seller' && (
                                    <div className="absolute top-6 right-6 text-primary-500">
                                        <Icon name="check" size={20} />
                                    </div>
                                )}
                            </button>

                            {/* Creator Option */}
                            <button
                                onClick={() => handleRoleSelect('creator')}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group backdrop-blur-md ${formData.role === 'creator'
                                    ? 'border-secondary-500 bg-secondary-500/10 shadow-lg shadow-secondary-500/10'
                                    : 'border-dark-700 bg-dark-900/40 dark:bg-dark-800/40 hover:border-dark-500 hover:shadow-lg'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl w-fit mb-4 transition-all duration-300 ${formData.role === 'creator' ? 'bg-secondary-500/20 shadow-lg scale-110' : 'bg-dark-800/60 group-hover:bg-dark-700'}`}>
                                    <img
                                        src="https://img.icons8.com/fluency/96/camera.png"
                                        alt="Content Creator"
                                        className="w-10 h-10 object-contain"
                                        onError={(e) => { e.target.outerHTML = '<span style="font-size:2rem">📷</span>'; }}
                                    />
                                </div>
                                <h3 className={`text-lg font-bold mb-1 ${formData.role === 'creator' ? 'text-secondary-400' : 'text-dark-100'}`}>Content Creator</h3>
                                <p className="text-sm text-dark-400">Find sponsorships and monetize content.</p>

                                {formData.role === 'creator' && (
                                    <div className="absolute top-6 right-6 text-secondary-500">
                                        <Icon name="check" size={20} />
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Google Signup & Next Button - Conditional on Role Selection */}
                        <AnimatePresence>
                            {formData.role && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="pt-6 space-y-6"
                                >
                                    <button
                                        onClick={handleNextStep}
                                        className="btn-3d w-full py-4 flex items-center justify-center gap-2 group"
                                    >
                                        <span>Continue with Details</span>
                                        <Icon name="arrow-right" size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-dark-800"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className={`px-4 ${isDark ? 'bg-dark-950' : 'bg-[#FDFBF7]'} text-dark-400`}>or sign up with</span>
                                        </div>
                                    </div>

                                    {/* WebView warning banner */}
                                    {showWebViewBanner && (
                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm space-y-2">
                                            <p className="font-semibold">Google Sign-In isn't available in this browser</p>
                                            <p className="text-amber-300/80 text-xs">You're using an in-app browser (Instagram, Facebook, etc.) which Google blocks for security. Please:</p>
                                            <ol className="text-xs text-amber-300/80 list-decimal list-inside space-y-1">
                                                <li>Tap the <strong>⋮</strong> or <strong>...</strong> menu above</li>
                                                <li>Select <strong>"Open in Chrome"</strong> or <strong>"Open in Browser"</strong></li>
                                                <li>Then try Google Sign-In again</li>
                                            </ol>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard?.writeText(window.location.href);
                                                    toast.success('Link copied! Paste it in Chrome or Safari.');
                                                }}
                                                className="mt-2 w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium transition-colors"
                                            >
                                                Copy Link to Clipboard
                                            </button>
                                        </div>
                                    )}

                                    {/* Custom Google Button */}
                                    <button
                                        onClick={() => handleGoogleLogin()}
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
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 text-center text-sm text-dark-400 border-t border-dark-800 pt-6">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                                Login here
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: DETAILS FORM */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handleSubmitDetails} className="space-y-8">
                            {/* Name */}
                            <div className="space-y-1 group">
                                <label className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">Full Name <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full py-2 bg-transparent border-b-2 border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 focus:border-primary-500 outline-none transition-all placeholder-dark-300/50"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1 group">
                                <label className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">Email Address <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full py-2 bg-transparent border-b-2 border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 focus:border-primary-500 outline-none transition-all placeholder-dark-300/50 pl-8"
                                        required
                                    />
                                    <Icon name="mail" className="absolute left-0 top-3 text-dark-400" size={18} />
                                </div>
                                <p className="text-xs text-dark-400 flex items-center gap-1 mt-1">
                                    <Icon name="lock" size={10} /> We'll keep this private.
                                </p>
                            </div>

                            {/* Password */}
                            <div className="space-y-1 group">
                                <label className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">Password <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full py-2 bg-transparent border-b-2 border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 focus:border-primary-500 outline-none transition-all placeholder-dark-300/50 pl-8"
                                        required
                                    />
                                    <Icon name="lock" className="absolute left-0 top-3 text-dark-400" size={18} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-2 text-dark-400 hover:text-dark-600 transition-colors">
                                        {showPassword ? <Icon name="eye-off" size={18} /> : <Icon name="eye" size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-emerald-500/80 flex items-center gap-1 mt-1">
                                    <Icon name="lock" size={10} /> Encrypted before leaving your device.
                                </p>
                                <PasswordStrengthIndicator password={formData.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1 group">
                                <label className="text-sm font-medium text-dark-500 group-focus-within:text-primary-500 transition-colors">Confirm Password <span className="text-red-400">*</span></label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full py-2 bg-transparent border-b-2 border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 focus:border-primary-500 outline-none transition-all placeholder-dark-300/50"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-4 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 font-bold uppercase tracking-wider text-sm hover:bg-white/20 dark:hover:bg-black/20 transition-all disabled:opacity-50 shadow-lg"
                            >
                                {loading ? 'Sending Code...' : `Join as a ${formData.role === 'seller' ? 'Brand' : 'Creator'} `}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* STEP 3: OTP */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <OTPInput value={otp} onChange={setOtp} disabled={otpLoading} />
                        </div>

                        <div className="text-center">
                            {otpTimer > 0 ? (
                                <p className="text-dark-400 text-sm">Resend in <span className="font-mono text-primary-500">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span></p>
                            ) : (
                                <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">Resend Code</button>
                            )}
                        </div>

                        <button
                            onClick={handleVerifyOTP}
                            disabled={otpLoading || otp.some(d => !d)}
                            className="w-full py-4 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-sm hover:bg-emerald-500/10 transition-all disabled:opacity-50 shadow-lg"
                        >
                            {otpLoading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};

export default Register;
