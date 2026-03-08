import { useState } from 'react';
import { motion } from 'framer-motion';
import { collaborationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StarRating = ({ value, onChange, label }) => (
    <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 w-48 flex-shrink-0">{label}</span>
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className={`text-xl transition-colors ${star <= value ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'} hover:text-amber-400`}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >
                    ★
                </button>
            ))}
        </div>
        {value > 0 && (
            <span className="text-xs text-gray-500">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
            </span>
        )}
    </div>
);

const FeedbackForm = ({ collaborationId, userRole, onSubmitted, onClose }) => {
    const role = (userRole || '').toUpperCase() === 'CREATOR' ? 'CREATOR' : 'SELLER';

    const [overall, setOverall] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Role-specific ratings
    const [creatorProfessionalism, setCreatorProfessionalism] = useState(0);
    const [campaignQuality, setCampaignQuality] = useState(0);
    const [overallBrandExperience, setOverallBrandExperience] = useState(0);
    const [brandCommunication, setBrandCommunication] = useState(0);
    const [campaignClarity, setCampaignClarity] = useState(0);
    const [overallCreatorExperience, setOverallCreatorExperience] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (overall === 0) {
            toast.error('Please provide an overall rating');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                role,
                rating: overall,
                comment: comment.trim() || undefined,
                ...(role === 'SELLER'
                    ? {
                        creatorProfessionalism: creatorProfessionalism || undefined,
                        campaignQuality: campaignQuality || undefined,
                        overallBrandExperience: overallBrandExperience || undefined,
                    }
                    : {
                        brandCommunication: brandCommunication || undefined,
                        campaignClarity: campaignClarity || undefined,
                        overallCreatorExperience: overallCreatorExperience || undefined,
                    }),
            };
            await collaborationAPI.submitFeedback(collaborationId, payload);
            toast.success('Thank you for your feedback! 🎉');
            onSubmitted?.();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden max-w-lg w-full mx-auto"
        >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
                <h3 className="text-xl font-bold text-white">⭐ Rate This Collaboration</h3>
                <p className="text-white/80 text-sm mt-1">
                    {role === 'SELLER'
                        ? 'How was working with this creator?'
                        : 'How was working with this brand?'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Overall Rating */}
                <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Overall Rating *</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setOverall(star)}
                                className={`text-3xl transition-all ${star <= overall ? 'text-amber-400 scale-110' : 'text-gray-300 dark:text-gray-600'} hover:text-amber-400 hover:scale-110`}
                            >
                                ★
                            </button>
                        ))}
                        {overall > 0 && (
                            <span className="ml-2 self-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][overall]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Specific Ratings */}
                <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                        Detailed Ratings <span className="text-gray-400 font-normal">(optional)</span>
                    </p>
                    <div className="space-y-2">
                        {role === 'SELLER' ? (
                            <>
                                <StarRating label="Creator Professionalism" value={creatorProfessionalism} onChange={setCreatorProfessionalism} />
                                <StarRating label="Campaign Execution Quality" value={campaignQuality} onChange={setCampaignQuality} />
                                <StarRating label="Overall Brand Experience" value={overallBrandExperience} onChange={setOverallBrandExperience} />
                            </>
                        ) : (
                            <>
                                <StarRating label="Brand Communication" value={brandCommunication} onChange={setBrandCommunication} />
                                <StarRating label="Campaign Clarity" value={campaignClarity} onChange={setCampaignClarity} />
                                <StarRating label="Overall Creator Experience" value={overallCreatorExperience} onChange={setOverallCreatorExperience} />
                            </>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="text-sm font-semibold text-gray-800 dark:text-white mb-1 block">
                        Comments <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        maxLength={1000}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-right text-xs text-gray-400 mt-1">{comment.length}/1000</p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading || overall === 0}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
                        >
                            Skip
                        </button>
                    )}
                </div>
            </form>
        </motion.div>
    );
};

export default FeedbackForm;
