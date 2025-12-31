import { motion } from 'framer-motion';
import { FaCheck, FaChevronRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/**
 * Profile Completion Progress
 * Shows completion percentage and encourages users to complete their profile
 */
const ProfileProgress = ({ profile, onEditProfile }) => {
    if (!profile) return null;

    // Calculate completion percentage based on filled fields
    const fields = [
        { name: 'Category', filled: !!profile.category, weight: 15 },
        { name: 'Follower Count', filled: profile.followerCount > 0, weight: 15 },
        { name: 'Engagement Rate', filled: profile.engagementRate > 0, weight: 15 },
        { name: 'Bio', filled: profile.bio?.length > 20, weight: 10 },
        { name: 'Price Range', filled: profile.priceRange?.min > 0, weight: 15 },
        { name: 'Promotion Types', filled: profile.promotionTypes?.length > 0, weight: 15 },
        { name: 'Instagram Username', filled: !!profile.instagramUsername, weight: 15 }
    ];

    const completedWeight = fields
        .filter(f => f.filled)
        .reduce((sum, f) => sum + f.weight, 0);

    const percentage = Math.min(completedWeight, 100);
    const incompleteFields = fields.filter(f => !f.filled);

    // Don't show if profile is complete
    // Don't show if profile is complete
    if (percentage === 100) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 mb-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <HiSparkles className="text-primary-400" />
                    <span className="text-dark-200 font-medium">Complete Your Profile</span>
                </div>
                <span className="text-primary-400 font-bold">{percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-3">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                />
            </div>

            {/* Missing Fields */}
            {incompleteFields.length > 0 && (
                <div className="space-y-2">
                    <p className="text-dark-400 text-sm">Complete these to boost visibility:</p>
                    <div className="flex flex-wrap gap-2">
                        {incompleteFields.slice(0, 3).map((field) => (
                            <button
                                key={field.name}
                                onClick={onEditProfile}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-dark-100 transition-colors text-sm"
                            >
                                {field.name}
                                <FaChevronRight className="text-xs" />
                            </button>
                        ))}
                        {incompleteFields.length > 3 && (
                            <span className="text-dark-400 text-sm self-center">
                                +{incompleteFields.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ProfileProgress;
