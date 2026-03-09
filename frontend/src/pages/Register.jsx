import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Confetti from '../components/common/Confetti';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import AuthLayout from '../components/auth/AuthLayout';
import Icon from '../components/common/Icon';
import { isValidForRegister } from '../utils/passwordValidator';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register } = useAuth();

    // Steps: 1=Role, 2=Details
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!isValidForRegister(formData.password)) {
            toast.error('Password must be 8+ characters with at least 1 uppercase letter, 1 lowercase letter, and 1 number.');
            return;
        }

        setLoading(true);

        try {
            const userData = await register(formData.email, formData.name, formData.password, formData.role);

            setShowConfetti(true);
            toast.success('Welcome to TheCollabify!');

            setTimeout(() => {
                navigate(userData.role === 'creator' ? '/creator/dashboard' : '/seller/dashboard');
            }, 1000);
        } catch (error) {
            const message = !error.response && error.message?.includes('Network')
                ? 'Unable to reach the server. Please try again later.'
                : error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // UI Helpers
    const getStepTitle = () => {
        if (step === 1) return "Choose your path";
        if (step === 2) return "Create your account";
        return "Register";
    };

    const getStepSubtitle = () => {
        if (step === 1) return "How do you want to use TheCollabify?";
        if (step === 2) return "Fill in your details to get started.";
        return "";
    };

    return (
        <AuthLayout title={getStepTitle()} subtitle={getStepSubtitle()}>
            <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

            {/* Back Button for Step 2 */}
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

                        {/* Continue with Details — only shown after role selected */}
                        <AnimatePresence>
                            {formData.role && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="pt-4"
                                >
                                    <button
                                        onClick={handleNextStep}
                                        className="btn-3d w-full py-4 flex items-center justify-center gap-2 group"
                                    >
                                        <span>Continue with Details</span>
                                        <Icon name="arrow-right" size={18} className="group-hover:translate-x-1 transition-transform" />
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
                        <form onSubmit={handleSubmit} className="space-y-8">
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
                                {loading ? 'Creating Account...' : `Join as a ${formData.role === 'seller' ? 'Brand' : 'Creator'}`}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};

export default Register;
