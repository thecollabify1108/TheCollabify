import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag, FaClock, FaDollarSign, FaCheckCircle, FaChartLine, FaRupeeSign, FaUsers } from 'react-icons/fa';
import { HiBriefcase } from 'react-icons/hi';
import PredictiveAnalyticsWidget from '../analytics/PredictiveAnalyticsWidget';
import EmptyState from '../common/EmptyState';
import UrgencyBadge from '../common/UrgencyBadge';
import { trackMatchFeedback } from '../../services/feedback';

const PromotionList = ({ promotions, onApply, creatorProfile = null }) => {
    const [expandedId, setExpandedId] = useState(null);

    if (!promotions || promotions.length === 0) {
        return (
            <EmptyState
                icon={<HiBriefcase />}
                title="No matching opportunities yet"
                description="We'll notify you when new campaigns match your profile. Make sure your profile is complete and you're marked as available for work."
            />
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark-100">
                Matching Opportunities ({promotions.length})
            </h2>

            <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory md:grid md:grid-cols-1 md:gap-6 md:pb-0 md:overflow-visible scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {promotions.map((promotion, index) => (
                    <motion.div
                        key={promotion._id}
                        className="min-w-[85vw] md:min-w-0 snap-center glass-card p-6 h-full"
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

                                    {/* AI Confidence Badge */}
                                    {promotion.matchScore && (
                                        <span className={`badge ${promotion.confidenceLevel === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                promotion.confidenceLevel === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-purple-500/10 text-purple-400 border-purple-500/20' // Experimental
                                            } border`}>
                                            {promotion.confidenceLevel === 'High' ? 'High Match' :
                                                promotion.confidenceLevel === 'Medium' ? 'Good Match' : 'Experimental'}
                                        </span>
                                    )}
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

                                {/* Urgency Indicators */}
                                <div className="mt-3">
                                    <UrgencyBadge
                                        daysLeft={promotion.deadline ? Math.ceil((new Date(promotion.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : undefined}
                                        applicantCount={promotion.applications?.length}
                                    />
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

                            {/* Action Buttons */}
                            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        const isExpanding = expandedId !== promotion._id;
                                        setExpandedId(isExpanding ? promotion._id : null);
                                        if (isExpanding) {
                                            trackMatchFeedback({
                                                targetUserId: promotion.sellerId?._id || promotion.sellerId,
                                                action: 'CLICKED',
                                                source: 'promotion_list',
                                                matchId: promotion._id,
                                                meta: { type: 'ai_insights' }
                                            });
                                        }
                                    }}
                                    className="btn-outline flex items-center justify-center text-sm"
                                >
                                    <FaChartLine className="mr-2" />
                                    {expandedId === promotion._id ? 'Hide Insights' : 'AI Insights'}
                                </button>

                                {promotion.hasApplied ? (
                                    <button
                                        disabled
                                        className="btn-secondary flex items-center justify-center opacity-75 cursor-not-allowed"
                                    >
                                        <FaCheckCircle className="mr-2" />
                                        Applied
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onApply(promotion._id)}
                                        className="btn-3d flex items-center justify-center"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* AI Insights Expansion */}
                        <AnimatePresence>
                            {expandedId === promotion._id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-4 pt-4 border-t border-dark-700"
                                >
                                    <PredictiveAnalyticsWidget
                                        campaignData={{
                                            budget: promotion.budgetRange?.max || 5000,
                                            creatorFollowers: creatorProfile?.followerCount || promotion.followerRange?.max || 50000,
                                            creatorEngagementRate: creatorProfile?.engagementRate || 3.5,
                                            promotionType: promotion.promotionType,
                                            category: promotion.targetCategory,
                                            duration: 14
                                        }}
                                        creatorProfile={{
                                            followers: creatorProfile?.followerCount || 50000,
                                            avgEngagementRate: creatorProfile?.engagementRate || 3.5
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PromotionList;
