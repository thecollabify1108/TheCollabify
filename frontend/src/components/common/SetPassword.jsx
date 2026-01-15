import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const SetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/set-password', formData);

            if (response.data.success) {
                toast.success(response.data.message);
                setFormData({ password: '', confirmPassword: '' });
            }
        } catch (error) {
            console.error('Set password error:', error);
            toast.error(error.response?.data?.message || 'Failed to set password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <FaLock className="text-white text-xl" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-dark-100">Set Password</h3>
                    <p className="text-sm text-dark-400">
                        Set a password to login with email on any device
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 pr-12 bg-dark-700 border border-dark-600 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">Minimum 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 pr-12 bg-dark-700 border border-dark-600 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Setting Password...' : 'Set Password'}
                </button>
            </form>

            {/* Info Note */}
            <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                <p className="text-sm text-dark-300">
                    💡 <strong>Tip:</strong> After setting a password, you can login with either Google or email/password on any device.
                </p>
            </div>
        </motion.div>
    );
};

export default SetPassword;
