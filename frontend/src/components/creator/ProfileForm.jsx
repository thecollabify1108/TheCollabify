import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHashtag, FaRupeeSign } from 'react-icons/fa';
import { creatorAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { trackEvent } from '../../utils/analytics';

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
        location: {
            district: profile?.location?.district || '',
            city: profile?.location?.city || '',
            state: profile?.location?.state || ''
        },
        willingToTravel: profile?.willingToTravel || 'NO',
        collaborationTypes: profile?.collaborationTypes || ['REMOTE'],
        isAvailable: profile?.isAvailable !== false,
        availabilityStatus: profile?.availabilityStatus || 'AVAILABLE_NOW'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('priceRange.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, [key]: value }
            }));
        } else if (name.startsWith('location.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [key]: value }
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
            trackEvent('profile_completed');
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

                {/* Location & Travel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label">Primary Location</label>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input
                                type="text"
                                name="location.city"
                                value={formData.location?.city || ''}
                                onChange={handleChange}
                                placeholder="City"
                                className="input-field"
                            />
                            <input
                                type="text"
                                name="location.district"
                                value={formData.location?.district || ''}
                                onChange={handleChange}
                                placeholder="District"
                                className="input-field"
                            />
                        </div>
                        <input
                            type="text"
                            name="location.state"
                            value={formData.location?.state || ''}
                            onChange={handleChange}
                            placeholder="State"
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="input-label">Willing to Travel?</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['NO', 'LIMITED', 'YES'].map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, willingToTravel: option }))}
                                    className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${formData.willingToTravel === option
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                        : 'border-dark-600 text-dark-300 hover:border-dark-500'
                                        }`}
                                >
                                    {option === 'NO' ? 'No' : option === 'LIMITED' ? 'Limited' : 'Anywhere'}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-dark-400 mt-2">
                            {formData.willingToTravel === 'YES' ? 'I can travel for campaigns (travel costs may apply).' :
                                formData.willingToTravel === 'LIMITED' ? 'I can travel to nearby cities/states.' :
                                    'I prefer remote or strictly local work.'}
                        </p>
                    </div>
                </div>

                {/* Collaboration Types */}
                <div>
                    <label className="input-label">Supported Collaboration Types</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['REMOTE', 'ONSITE', 'HYBRID', 'EVENT'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    const current = formData.collaborationTypes || [];
                                    const newTypes = current.includes(type)
                                        ? current.filter(t => t !== type)
                                        : [...current, type];
                                    setFormData(prev => ({ ...prev, collaborationTypes: newTypes }));
                                }}
                                className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${formData.collaborationTypes?.includes(type)
                                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                                    : 'border-dark-600 text-dark-300 hover:border-dark-500'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-dark-400 mt-2">
                        Select all that apply. 'Event' implies appearances, hosting, or live coverage.
                    </p>
                </div>

                {/* Price Range */}
                <div>
                    <label className="input-label">Charge Range per Post (₹ INR)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-dark-400 mb-1 block">Minimum Charge</span>
                            <input
                                type="number"
                                name="priceRange.min"
                                value={formData.priceRange?.min || ''}
                                onChange={handleChange}
                                placeholder="Min"
                                className="input-field"
                                min="0"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-dark-400 mb-1 block">Maximum / Preferred</span>
                            <input
                                type="number"
                                name="priceRange.max"
                                value={formData.priceRange?.max || ''}
                                onChange={handleChange}
                                placeholder="Max"
                                className="input-field"
                                min="0"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-dark-500 mt-2">
                        Set a realistic range. Wide ranges improve match chances but may attract lower offers.
                    </p>
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

                {/* Availability Status */}
                <div>
                    <label className="input-label">Availability Status</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { id: 'AVAILABLE_NOW', label: 'Available Now', color: 'emerald', desc: 'Ready for campaigns' },
                            { id: 'LIMITED_AVAILABILITY', label: 'Limited', color: 'amber', desc: 'Slower response' },
                            { id: 'NOT_AVAILABLE', label: 'Not Available', color: 'rose', desc: 'Hidden from new brands' }
                        ].map(option => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setFormData(prev => ({
                                    ...prev,
                                    availabilityStatus: option.id,
                                    isAvailable: option.id !== 'NOT_AVAILABLE'
                                }))}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${formData.availabilityStatus === option.id
                                    ? `border-${option.color}-500 bg-${option.color}-500/10`
                                    : 'border-dark-600 hover:border-dark-500 bg-dark-800'
                                    }`}
                            >
                                <div className={`text-sm font-bold ${formData.availabilityStatus === option.id ? `text-${option.color}-400` : 'text-dark-100'}`}>
                                    {option.label}
                                </div>
                                <div className="text-xs text-dark-400 mt-1">{option.desc}</div>
                            </button>
                        ))}
                    </div>
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
