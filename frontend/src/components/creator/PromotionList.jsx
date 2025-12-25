import { motion } from 'framer-motion';
import { FaBriefcase, FaRupeeSign, FaUsers, FaCheck } from 'react-icons/fa';

const PromotionList = ({ promotions, onApply }) => {
    if (!promotions || promotions.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <FaBriefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark-300 mb-2">No matching promotions</h3>
                <p className="text-dark-400">
                    We'll notify you when new opportunities match your profile. Make sure your profile is complete and you're marked as available.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark-100">
                Matching Opportunities ({promotions.length})
            </h2>

            {promotions.map((promotion, index) => (
                <motion.div
                    key={promotion._id}
                    className="glass-card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-dark-100">{promotion.title}</h3>
                                <span className={`badge ${promotion.status === 'Open' ? 'badge-success' :
                                    promotion.status === 'Creator Interested' ? 'badge-warning' :
                                        'badge-neutral'
                                    }`}>
                                    {promotion.status}
                                </span>
                            </div>

                            <p className="text-dark-400 text-sm mb-4">
                                {promotion.description?.substring(0, 200)}...
                            </p>

                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="badge badge-info">{promotion.promotionType}</span>
                                <span className="badge badge-neutral">{promotion.targetCategory}</span>
                                <span className="badge badge-neutral">{promotion.campaignGoal}</span>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm text-dark-400">
                                <div className="flex items-center">
                                    <FaRupeeSign className="mr-1 text-emerald-400" />
                                    <span>₹{promotion.budgetRange?.min} - ₹{promotion.budgetRange?.max}</span>
                                </div>                        <div className="flex items-center">
                                    <FaUsers className="mr-1 text-primary-400" />
                                    <span>
                                        {promotion.followerRange?.min >= 1000
                                            ? `${(promotion.followerRange.min / 1000).toFixed(0)}K`
                                            : promotion.followerRange?.min} -
                                        {promotion.followerRange?.max >= 1000000
                                            ? `${(promotion.followerRange.max / 1000000).toFixed(1)}M`
                                            : promotion.followerRange?.max >= 1000
                                                ? `${(promotion.followerRange.max / 1000).toFixed(0)}K`
                                                : promotion.followerRange?.max} followers
                                    </span>
                                </div>
                            </div>

                            {/* Seller Info */}
                            {promotion.sellerId && (
                                <div className="mt-4 pt-4 border-t border-dark-700">
                                    <p className="text-sm text-dark-400">
                                        Posted by <span className="text-dark-200">{promotion.sellerId.name}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 md:mt-0 md:ml-6">
                            {promotion.hasApplied ? (
                                <button
                                    disabled
                                    className="btn-secondary flex items-center opacity-75 cursor-not-allowed"
                                >
                                    <FaCheck className="mr-2" />
                                    Applied
                                </button>
                            ) : (
                                <button
                                    onClick={() => onApply(promotion._id)}
                                    className="btn-3d flex items-center"
                                >
                                    Apply Now
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default PromotionList;
