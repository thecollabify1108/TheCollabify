import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaEnvelope, FaArrowLeft, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import OTPInput from '../components/common/OTPInput';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [tempUserId, setTempUserId] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpTimer, setOtpTimer] = useState(600);
    const [canResend, setCanResend] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    // OTP Timer
    useEffect(() => {
        if (resetStep === 2 && otpTimer > 0) {
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
            if (otpTimer === 540) {
                setCanResend(true);
            }

            return () => clearInterval(timer);
        }
    }, [resetStep, otpTimer]);

    // Step 1: Send OTP to email
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/password-reset/send-otp', { email });

            if (response.data.success) {
                setTempUserId(response.data.data.tempUserId);
                setOtpTimer(response.data.data.expiresIn);
                setResetStep(2);
                setCanResend(false);
                toast.success('🎯 Reset code sent! Check your email');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Please enter complete OTP');
            return;
        }

        setOtpLoading(true);

        try {
            const response = await api.post('/auth/password-reset/verify-otp', {
                tempUserId,
                otp: otpCode
            });

            if (response.data.success) {
                setResetStep(3);
                toast.success('✅ OTP verified! Set your new password');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
        } finally {
            setOtpLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/password-reset/reset', {
                tempUserId,
                newPassword
            });

            if (response.data.success) {
                // Store token
                localStorage.setItem('token', response.data.data.token);

                toast.success('🎉 Password reset successful! Logging you in...');

                setTimeout(() => {
                    if (response.data.data.user.role === 'creator') {
                        navigate('/creator/dashboard');
                    } else {
                        navigate('/seller/dashboard');
                    }
                }, 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        try {
            const response = await api.post('/auth/password-reset/send-otp', { email });

            if (response.data.success) {
                setTempUserId(response.data.data.tempUserId);
                setOtpTimer(response.data.data.expiresIn);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                toast.success('📧 New code sent!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        }
    };

    const handleChangeEmail = () => {
        setResetStep(1);
        setTempUserId(null);
        setOtp(['', '', '', '', '', '']);
        setOtpTimer(600);
    };

    const getStepTitle = () => {
        switch (resetStep) {
            case 1: return 'Forgot Password?';
            case 2: return '📧 Verify Email';
            case 3: return '🔒 Set New Password';
            default: return 'Reset Password';
        }
    };

    const getStepDescription = () => {
        switch (resetStep) {
            case 1: return "No worries, we'll send you a reset code";
            case 2: return `We sent a 6-digit code to ${email}`;
            case 3: return 'Choose a strong password for your account';
            default: return '';
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
                            <img src="/favicon.png" alt="" className="w-10 h-10 object-contain" />
                            <span className="text-2xl font-bold gradient-text">TheCollabify</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-dark-100 mb-2">{getStepTitle()}</h1>
                        <p className="text-dark-400">{getStepDescription()}</p>
                    </div>

                    <div className="glass-card p-8">
                        {/* Step 1: Email Input */}
                        {resetStep === 1 && (
                            <form onSubmit={handleSendOTP} className="space-y-6">
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
                                    className="btn-3d w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending...' : 'Send Reset Code'}
                                </button>
                            </form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {resetStep === 2 && (
                            <div>
                                <button
                                    onClick={handleChangeEmail}
                                    className="flex items-center text-dark-400 hover:text-dark-200 transition-colors mb-6"
                                >
                                    <FaArrowLeft className="mr-2" />
                                    <span>Change Email</span>
                                </button>

                                <div className="mb-8">
                                    <OTPInput
                                        value={otp}
                                        onChange={setOtp}
                                        disabled={otpLoading || otpTimer === 0}
                                    />
                                </div>

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

                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={otpLoading || otpTimer === 0 || otp.some(digit => !digit)}
                                    className="btn-3d w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                >
                                    {otpLoading ? 'Verifying...' : '✓ Verify Code'}
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-dark-400 mb-2">Didn't receive the code?</p>
                                    <button
                                        onClick={handleResendOTP}
                                        disabled={!canResend}
                                        className={`text-sm ${canResend
                                            ? 'text-primary-400 hover:text-primary-300 cursor-pointer'
                                            : 'text-dark-600 cursor-not-allowed'
                                            } transition-colors`}
                                    >
                                        📧 Resend Code {!canResend && '(wait 60s)'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: New Password */}
                        {resetStep === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <label className="input-label">New Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="input-field pl-11 pr-11"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-200 transition"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Confirm Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="input-field pl-11"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-3d w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Resetting...' : '🔐 Reset Password'}
                                </button>
                            </form>
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
        </div>
    );
};

export default ForgotPassword;
