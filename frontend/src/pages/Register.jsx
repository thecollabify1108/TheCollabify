import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaStore, FaCamera, FaGoogle, FaArrowLeft } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import Footer from '../components/common/Footer';
import Confetti from '../components/common/Confetti';
import OTPInput from '../components/common/OTPInput';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { googleLogin } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: searchParams.get('role') || ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // OTP verification state
    const [registrationStep, setRegistrationStep] = useState(1); // 1: Form, 2: OTP
    const [tempUserId, setTempUserId] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        const roleFromUrl = searchParams.get('role');
        if (roleFromUrl && ['creator', 'seller'].includes(roleFromUrl)) {
            setFormData(prev => ({ ...prev, role: roleFromUrl }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    // OTP Timer
    useEffect(() => {
        if (registrationStep === 2 && otpTimer > 0) {
            const timer = setInterval(() => {
                setOtpTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Enable resend after 60 seconds
            if (otpTimer === 540) { // 9 minutes
                setCanResend(true);
            }

            return () => clearInterval(timer);
        }
    }, [registrationStep, otpTimer]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!formData.role) {
            toast.error('Please select a role');
            return;
        }

        setLoading(true);

        try {
            // Send OTP to email
            const response = await axios.post('/api/auth/register/send-otp', {
                email: formData.email,
                name: formData.name,
                password: formData.password,
                role: formData.role
            });

            if (response.data.success) {
                setTempUserId(response.data.data.tempUserId);
                setOtpTimer(response.data.data.expiresIn);
                setRegistrationStep(2);
                setCanResend(false);
                toast.success('🎯 OTP sent! Please check your email');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Please enter complete OTP');
            return;
        }

        setOtpLoading(true);

        try {
            const response = await axios.post('/api/auth/register/verify-otp', {
                tempUserId,
                otp: otpCode
            });

            if (response.data.success) {
                setShowConfetti(true);
                toast.success('✅ Email verified! Welcome to TheCollabify!');

                // Store token
                localStorage.setItem('token', response.data.data.token);

                setTimeout(() => {
                    if (response.data.data.user.role === 'creator') {
                        navigate('/creator/dashboard');
                    } else {
                        navigate('/seller/dashboard');
                    }
                }, 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        try {
            const response = await axios.post('/api/auth/register/resend-otp', {
                tempUserId
            });

            if (response.data.success) {
                setOtpTimer(response.data.data.expiresIn);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                toast.success('📧 New OTP sent!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        }
    };

    const handleChangeEmail = () => {
        setRegistrationStep(1);
        setTempUserId(null);
        setOtp(['', '', '', '', '', '']);
        setOtpTimer(600);
    };

    // Google Sign Up handler
    const handleGoogleSuccess = async (tokenResponse) => {
        if (!formData.role) {
            toast.error('Please select your role first (Brand/Seller or Creator)');
            return;
        }

        setGoogleLoading(true);
        try {
            // Get user info from Google
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const googleUser = await response.json();

            // Register with Google
            const user = await googleLogin({
                email: googleUser.email,
                name: googleUser.name,
                googleId: googleUser.sub,
                avatar: googleUser.picture,
                role: formData.role
            });

            setShowConfetti(true);
            toast.success('Registration successful!');

            setTimeout(() => {
                if (user.role === 'creator') {
                    navigate('/creator/dashboard');
                } else if (user.role === 'seller') {
                    navigate('/seller/dashboard');
                }
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google registration failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    const googleSignupHook = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => toast.error('Google signup failed')
    });

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Confetti celebration on success */}
            <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

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
                            <img src="/favicon.png" alt="" className="w-10 h-10 object-contain" />
                            <span className="text-2xl font-bold gradient-text">TheCollabify</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-dark-100 mb-2">
                            {registrationStep === 1 ? 'Create Account' : '📧 Verify Your Email'}
                        </h1>
                        <p className="text-dark-400">
                            {registrationStep === 1
                                ? 'Join the leading creator-brand marketplace'
                                : `We sent a 6-digit code to ${formData.email}`
                            }
                        </p>
                    </div>

                    {/* Step 1: Registration Form */}
                    {registrationStep === 1 && (
                        <div className="glass-card p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Role Selection */}
                                <div>
                                    <label className="input-label">I am a...</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('seller')}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${formData.role === 'seller'
                                                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                                : 'border-dark-600 hover:border-dark-500 text-dark-300'
                                                }`}
                                        >
                                            <FaStore className="w-8 h-8 mb-2" />
                                            <span className="font-medium">Brand / Seller</span>
                                            <span className="text-xs text-dark-400 mt-1">Find creators</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('creator')}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${formData.role === 'creator'
                                                ? 'border-secondary-500 bg-secondary-500/10 text-secondary-400'
                                                : 'border-dark-600 hover:border-dark-500 text-dark-300'
                                                }`}
                                        >
                                            <FaCamera className="w-8 h-8 mb-2" />
                                            <span className="font-medium">Creator</span>
                                            <span className="text-xs text-dark-400 mt-1">Get promotions</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="input-label">Full Name</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="input-field pl-11"
                                            required
                                        />
                                    </div>
                                </div>

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
                                    {/* Password Strength Indicator */}
                                    <PasswordStrengthIndicator password={formData.password} showFeedback={true} />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="input-label">Confirm Password</label>
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
                                    disabled={loading || !formData.role}
                                    className="btn-3d w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-dark-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-dark-800 text-dark-400">or continue with</span>
                                </div>
                            </div>

                            {/* Google Sign-Up Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => googleSignupHook()}
                                disabled={googleLoading || !formData.role}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {googleLoading ? (
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FaGoogle className="text-lg" style={{ color: '#4285F4' }} />
                                        <span>Sign up with Google</span>
                                    </>
                                )}
                            </motion.button>

                            {!formData.role && (
                                <p className="text-xs text-center text-dark-400 mt-2">
                                    Please select your role first to sign up with Google
                                </p>
                            )}

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-dark-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-dark-800 text-dark-400">Already have an account?</span>
                                </div>
                            </div>

                            {/* Login Link */}
                            <Link
                                to="/login"
                                className="btn-secondary w-full py-4 text-center block"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}

                    {/* Step 2: OTP Verification */}
                    {registrationStep === 2 && (
                        <div className="glass-card p-8">
                            {/* Back Button */}
                            <button
                                onClick={handleChangeEmail}
                                className="flex items-center text-dark-400 hover:text-dark-200 transition-colors mb-6"
                            >
                                <FaArrowLeft className="mr-2" />
                                <span>Change Email</span>
                            </button>

                            {/* OTP Input */}
                            <div className="mb-8">
                                <OTPInput
                                    value={otp}
                                    onChange={setOtp}
                                    disabled={otpLoading || otpTimer === 0}
                                />
                            </div>

                            {/* Timer */}
                            <div className="text-center mb-6">
                                {otpTimer > 0 ? (
                                    <p className="text-dark-300">
                                        ⏱️ Code expires in:{' '}
                                        <span className="text-primary-400 font-mono font-medium">
                                            {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-red-400">⚠️ Code expired. Please request a new one.</p>
                                )}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerifyOTP}
                                disabled={otpLoading || otpTimer === 0 || otp.some(digit => !digit)}
                                className="btn-3d w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            >
                                {otpLoading ? 'Verifying...' : '✓ Verify & Continue'}
                            </button>

                            {/* Resend Section */}
                            <div className="text-center">
                                <p className="text-sm text-dark-400 mb-2">
                                    Didn't receive the code?
                                </p>
                                <button
                                    onClick={handleResendOTP}
                                    disabled={!canResend}
                                    className={`text-sm ${canResend
                                        ? 'text-primary-400 hover:text-primary-300 cursor-pointer'
                                        : 'text-dark-600 cursor-not-allowed'
                                        } transition-colors`}
                                >
                                    📧 Resend OTP {!canResend && '(wait 60s)'}
                                </button>
                            </div>

                            {/* Security Note */}
                            <div className="mt-6 p-4 bg-dark-900/50 rounded-xl border border-dark-700">
                                <p className="text-xs text-dark-400 flex items-start gap-2">
                                    <span className="text-amber-400">🔒</span>
                                    <span>
                                        We'll never ask for your OTP via phone or chat.
                                        Keep it confidential for your security.
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div >
        </div >
    );
};

export default Register;
