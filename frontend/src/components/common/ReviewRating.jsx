import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaTimes } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { sellerAPI } from '../../services/api';

/**
 * Review & Rating Component
 * Allows sellers to rate and review creators after campaign completion
 */
const ReviewRating = ({ campaignId, creatorId, creatorName, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [categories, setCategories] = useState({
        communication: 0,
        quality: 0,
        professionalism: 0,
        timeliness: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitReview = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (review.trim().length < 10) {
            toast.error('Please write a detailed review (min 10 characters)');
            return;
        }

        setIsSubmitting(true);

        try {
            const reviewData = {
                campaignId,
                creatorId,
                rating,
                review: review.trim(),
                categories,
                timestamp: new Date().toISOString()
            };

            // API call to submit review
            await sellerAPI.submitReview(reviewData);

            toast.success('Thank you for your review!');
            onSubmit?.(reviewData);
            onClose?.();
        } catch (error) {
            toast.error('Failed to submit review. Please try again.');
            console.error('Review submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({ value, onChange, size = 'large' }) => {
        const starSize = size === 'large' ? 'text-4xl' : 'text-xl';

        return (
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`${starSize} transition-colors ${(hoverRating || value) >= star
                                ? 'text-yellow-400'
                                : 'text-dark-700'
                            }`}
                    >
                        <FaStar />
                    </motion.button>
                ))}
            </div>
        );
    };

    const categoryLabels = {
        communication: 'Communication',
        quality: 'Content Quality',
        professionalism: 'Professionalism',
        timeliness: 'Timeliness'
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl m-4">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <FaTimes className="text-white" />
                        </button>
                        <div className="flex items-center gap-3">
                            <HiSparkles className="text-3xl text-white" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Rate Your Experience</h2>
                                <p className="text-white/80 mt-1">How was working with {creatorName}?</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Overall Rating */}
                        <div className="text-center">
                            <label className="block text-lg font-semibold text-dark-100 mb-4">
                                Overall Rating
                            </label>
                            <StarRating value={rating} onChange={setRating} size="large" />
                            {rating > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 text-dark-400"
                                >
                                    {rating === 5 && '🌟 Exceptional!'}
                                    {rating === 4 && '😊 Great work!'}
                                    {rating === 3 && '👍 Good'}
                                    {rating === 2 && '😐 Fair'}
                                    {rating === 1 && '😞 Needs improvement'}
                                </motion.p>
                            )}
                        </div>

                        {/* Category Ratings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-dark-100">Rate by Category</h3>
                            {Object.entries(categories).map(([key, value]) => (
                                <div key={key} className="bg-dark-800/50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-dark-200 font-medium">
                                            {categoryLabels[key]}
                                        </label>
                                        <StarRating
                                            value={value}
                                            onChange={(rating) => setCategories({ ...categories, [key]: rating })}
                                            size="small"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Written Review */}
                        <div>
                            <label className="block text-lg font-semibold text-dark-100 mb-3">
                                Share Your Experience
                            </label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Tell us about your experience working with this creator. What did they do well? Any areas for improvement?"
                                rows={5}
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:outline-none resize-none transition-colors"
                            />
                            <p className="text-xs text-dark-500 mt-2">
                                {review.length} characters (minimum 10)
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-dark-800 hover:bg-dark-700 disabled:opacity-50 text-dark-300 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmitting || rating === 0 || review.trim().length < 10}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-opacity"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default ReviewRating;
