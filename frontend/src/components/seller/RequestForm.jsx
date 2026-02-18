import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRupeeSign, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { trackEvent } from '../../utils/analytics';

const CATEGORIES = [
    'Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle',
    'Beauty', 'Gaming', 'Education', 'Entertainment', 'Health',
    'Business', 'Art', 'Music', 'Sports', 'Other'
];

const PROMOTION_TYPES = ['Reels', 'Stories', 'Posts', 'Website Visit'];
const CAMPAIGN_GOALS = ['Reach', 'Traffic', 'Sales'];

const RequestForm = ({ onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budgetRange: { min: '', max: '' },
        promotionType: '',
        targetCategory: '',
        followerRange: { min: '', max: '' },
        campaignGoal: '',
        deadline: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Title validation
        if (formData.title.trim().length < 5) {
            toast.error('Campaign title must be at least 5 characters');
            return;
        }

        // Description validation
        if (formData.description.trim().length < 20) {
            toast.error('Description must be at least 20 characters');
            return;
        }

        if (parseInt(formData.budgetRange.min) > parseInt(formData.budgetRange.max)) {
            toast.error('Maximum budget must be greater than minimum');
            return;
        }

        if (parseInt(formData.followerRange.min) > parseInt(formData.followerRange.max)) {
            toast.error('Maximum follower count must be greater than minimum');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                budgetRange: {
                    min: parseFloat(formData.budgetRange.min),
                    max: parseFloat(formData.budgetRange.max)
                },
                followerRange: {
                    min: parseInt(formData.followerRange.min),
                    max: parseInt(formData.followerRange.max)
                }
            });
            trackEvent('collaboration_requested');
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
            <h2 className="text-2xl font-bold text-dark-100 mb-2">Create Promotion Request</h2>
            <p className="text-dark-400 mb-6">Describe your campaign and our AI will find the best matching creators.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="input-label">Campaign Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Summer Fashion Collection Launch"
                        className="input-field"
                        maxLength={100}
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="input-label">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your product, brand, and what you're looking for in a creator..."
                        className="input-field h-32 resize-none"
                        maxLength={1000}
                        required
                    />
                    <p className="text-xs text-dark-400 mt-1">{formData.description.length}/1000 characters</p>
                </div>

                {/* Promotion Type & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label">Promotion Type</label>
                        <select
                            name="promotionType"
                            value={formData.promotionType}
                            onChange={handleChange}
                            className="select-field"
                            required
                        >
                            <option value="">Select type</option>
                            {PROMOTION_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Target Category</label>
                        <select
                            name="targetCategory"
                            value={formData.targetCategory}
                            onChange={handleChange}
                            className="select-field"
                            required
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Budget Range */}
                <div>
                    <label className="input-label">Budget Range (₹ INR)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <FaRupeeSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                            <input
                                type="number"
                                name="budgetRange.min"
                                value={formData.budgetRange.min}
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
                                name="budgetRange.max"
                                value={formData.budgetRange.max}
                                onChange={handleChange}
                                placeholder="Max"
                                className="input-field pl-10"
                                min="0"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Follower Range */}
                <div>
                    <label className="input-label">Creator Follower Range</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <FaUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                            <input
                                type="number"
                                name="followerRange.min"
                                value={formData.followerRange.min}
                                onChange={handleChange}
                                placeholder="Min (e.g., 10000)"
                                className="input-field pl-11"
                                min="0"
                                required
                            />
                        </div>
                        <div className="relative">
                            <FaUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                            <input
                                type="number"
                                name="followerRange.max"
                                value={formData.followerRange.max}
                                onChange={handleChange}
                                placeholder="Max (e.g., 500000)"
                                className="input-field pl-11"
                                min="0"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Campaign Goal */}
                <div>
                    <label className="input-label">Campaign Goal</label>
                    <div className="grid grid-cols-3 gap-4">
                        {CAMPAIGN_GOALS.map(goal => (
                            <button
                                key={goal}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, campaignGoal: goal }))}
                                className={`p-4 rounded-xl border-2 transition-all text-center ${formData.campaignGoal === goal
                                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                    : 'border-dark-600 text-dark-300 hover:border-dark-500'
                                    }`}
                            >
                                <div className="font-medium">{goal}</div>
                                <div className="text-xs text-dark-400 mt-1">
                                    {goal === 'Reach' && 'Brand awareness'}
                                    {goal === 'Traffic' && 'Website visits'}
                                    {goal === 'Sales' && 'Direct conversions'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Deadline (Optional) */}
                <div>
                    <label className="input-label">Campaign Deadline (Optional)</label>
                    <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || !formData.campaignGoal}
                    className="btn-3d w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Finding Matches...
                        </span>
                    ) : (
                        'Create Request & Find Creators'
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default RequestForm;
