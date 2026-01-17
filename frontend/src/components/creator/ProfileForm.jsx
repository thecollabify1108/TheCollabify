import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHashtag, FaRupeeSign } from 'react-icons/fa';
import { creatorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle',
    'Beauty', 'Gaming', 'Education', 'Entertainment', 'Health',
    'Business', 'Art', 'Music', 'Sports', 'Other'
];

const PROMOTION_TYPES = ['Reels', 'Stories', 'Posts', 'Website Visit'];

const ProfileForm = ({ profile, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        followerCount: profile?.followerCount || '',
        engagementRate: profile?.engagementRate || '',
        category: profile?.category || '',
        promotionTypes: profile?.promotionTypes || [],
        priceRange: {
            min: profile?.priceRange?.min || '',
            max: profile?.priceRange?.max || ''
        },
        bio: profile?.bio || '',
        instagramProfileUrl: profile?.instagramProfileUrl || '',
        isAvailable: profile?.isAvailable !== false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('priceRange.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, [key]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePromotionTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            promotionTypes: prev.promotionTypes.includes(type)
                ? prev.promotionTypes.filter(t => t !== type)
                : [...prev.promotionTypes, type]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all required fields
        if (!formData.followerCount || parseInt(formData.followerCount) <= 0) {
            toast.error('Please enter your follower count');
            return;
        }

        if (!formData.engagementRate || parseFloat(formData.engagementRate) <= 0) {
            toast.error('Please enter your engagement rate');
            return;
        }

        if (!formData.category) {
            toast.error('Please select your content category/niche');
            return;
        }

        if (formData.promotionTypes.length === 0) {
            toast.error('Please select at least one promotion type');
            return;
        }

        if (!formData.priceRange.min || !formData.priceRange.max) {
            toast.error('Please enter your price range');
            return;
        }

        if (parseFloat(formData.priceRange.min) > parseFloat(formData.priceRange.max)) {
            toast.error('Maximum price must be greater than minimum price');
            return;
        }

        // Warn about match changes if updating existing profile
        if (profile) {
            const confirmed = window.confirm(
                '⚠️ Updating your profile will change your matches.\n\n' +
                'Sellers who previously matched with you may no longer see you, ' +
                'and new sellers matching your updated profile will see you.\n\n' +
                'Continue with update?'
            );
            if (!confirmed) return;
        }

        setLoading(true);
        try {
            const data = {
                ...formData,
                followerCount: parseInt(formData.followerCount),
                engagementRate: parseFloat(formData.engagementRate),
                priceRange: {
                    min: parseFloat(formData.priceRange.min),
                    max: parseFloat(formData.priceRange.max)
                }
            };

            let res;
            if (profile) {
                res = await creatorAPI.updateProfile(data);
            } else {
                res = await creatorAPI.createProfile(data);
            }

            toast.success(profile ? 'Profile updated!' : 'Profile created!');
            onSave(res.data.data.profile);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8"
        >
            <h2 className="text-2xl font-bold text-dark-100 mb-6">
                {profile ? 'Edit Your Profile' : 'Create Your Creator Profile'}
            </h2>


            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Follower Count & Engagement Rate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label">Follower Count</label>
                        <input
                            type="number"
                            name="followerCount"
                            value={formData.followerCount}
                            onChange={handleChange}
                            placeholder="e.g., 50000"
                            className="input-field"
                            min="0"
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Engagement Rate (%)</label>
                        <input
                            type="number"
                            name="engagementRate"
                            value={formData.engagementRate}
                            onChange={handleChange}
                            placeholder="e.g., 4.5"
                            className="input-field"
                            min="0"
                            max="100"
                            step="0.1"
                            required
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="input-label">Content Category / Niche</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="select-field"
                        required
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Promotion Types */}
                <div>
                    <label className="input-label">Promotion Types Offered</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PROMOTION_TYPES.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handlePromotionTypeToggle(type)}
                                className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${formData.promotionTypes.includes(type)
                                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                    : 'border-dark-600 text-dark-300 hover:border-dark-500'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <label className="input-label">Price Range (₹ INR)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <FaRupeeSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                            <input
                                type="number"
                                name="priceRange.min"
                                value={formData.priceRange.min}
                                onChange={handleChange}
                                placeholder="Min"
                                className="input-field pl-10"
                                min="0"
                                required
                            />
                        </div>
                        <div className="relative">
                            <FaRupeeSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                            <input
                                type="number"
                                name="priceRange.max"
                                value={formData.priceRange.max}
                                onChange={handleChange}
                                placeholder="Max"
                                className="input-field pl-10"
                                min="0"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <label className="input-label">Bio (Optional)</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell brands about yourself..."
                        className="input-field h-24 resize-none"
                        maxLength={500}
                    />
                    <p className="text-xs text-dark-400 mt-1">{formData.bio.length}/500 characters</p>
                </div>

                {/* Instagram Profile URL */}
                <div>
                    <label className="input-label">Instagram Profile URL (Optional)</label>
                    <input
                        type="text"
                        name="instagramProfileUrl"
                        value={formData.instagramProfileUrl}
                        onChange={handleChange}
                        placeholder="https://instagram.com/your_username"
                        className="input-field"
                    />
                    <p className="text-xs text-dark-400 mt-1">
                        Paste your Instagram profile URL (query parameters like ?utm_source are okay)
                    </p>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
                    <div>
                        <p className="text-dark-100 font-medium">Available for Work</p>
                        <p className="text-dark-400 text-sm">Show your profile to brands</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                        className={`w-14 h-8 rounded-full transition-all ${formData.isAvailable ? 'bg-emerald-500' : 'bg-dark-600'
                            }`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-all ${formData.isAvailable ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-3d w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        profile ? 'Update Profile' : 'Create Profile'
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default ProfileForm;
