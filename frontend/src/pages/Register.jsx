import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaStore, FaCamera, FaGoogle } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Footer from '../components/common/Footer';
import Confetti from '../components/common/Confetti';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: searchParams.get('role') || ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

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
            const user = await register(formData.name, formData.email, formData.password, formData.role);
            setShowConfetti(true);
            toast.success('Registration successful!');

            // Wait a bit for confetti then redirect
            setTimeout(() => {
                // Redirect based on role
                if (user.role === 'creator') {
                    navigate('/creator/dashboard');
                } else if (user.role === 'seller') {
                    navigate('/seller/dashboard');
                }
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

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
                            <span className="text-2xl font-bold gradient-text">The Collabify.ai</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-dark-100 mb-2">Create Account</h1>
                        <p className="text-dark-400">Join the leading creator-brand marketplace</p>
                    </div>

                    {/* Register Form */}
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
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
