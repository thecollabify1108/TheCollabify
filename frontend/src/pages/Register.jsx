import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import Confetti from '../components/common/Confetti';
import OTPInput from '../components/common/OTPInput';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import AuthLayout from '../components/auth/AuthLayout';
import Icon from '../components/common/Icon';

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

        setLoading(true);
        try {
            const response = await api.post('/auth/register/send-otp', {
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

    // Google Auth Logic
    const loginWithGoogle = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                const user = await googleLogin({
                    accessToken: tokenResponse.access_token,
                    role: formData.role || undefined
                });

                toast.success('Welcome to TheCollabify!');
                if (user.role === 'creator') {
                    navigate('/creator/dashboard');
                } else if (user.role === 'seller') {
                    navigate('/seller/dashboard');
                } else if (user.role === 'admin') {
                    navigate('/admin');
                }
            } catch (error) {
                const message = error.response?.data?.message || 'Google registration failed';
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

    const googleLoginHandler = () => {
        loginWithGoogle();
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
                                <div className={`p-3 rounded-xl w-fit mb-4 transition-colors ${formData.role === 'seller' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 group-hover:bg-dark-700'
                                    }`}>
                                    <Icon name="store" size={20} />
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
                                <div className={`p-3 rounded-xl w-fit mb-4 transition-colors ${formData.role === 'creator' ? 'bg-secondary-500 text-white' : 'bg-dark-800 text-dark-300 group-hover:bg-dark-700'
                                    }`}>
                                    <Icon name="camera" size={20} />
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

                                    <button
                                        type="button"
                                        onClick={googleLoginHandler}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white/10 dark:bg-black/10 backdrop-blur-md border border-dark-200 dark:border-dark-700 hover:bg-white/20 dark:hover:bg-black/20 text-dark-900 dark:text-dark-100 font-medium rounded-xl transition-all shadow-lg"
                                    >
                                        <Icon name="google" size={20} />
                                        <span>Signup with Google</span>
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
