import { motion } from 'framer-motion';
import { HiTrendingUp, HiTrendingDown, HiMinus, HiClock, HiCheckCircle, HiExclamation } from 'react-icons/hi';

/**
 * CampaignHealthCard - Visual health indicator for campaigns
 * @param {Object} campaign - Campaign object
 * @param {Function} onClick - Click handler
 */
const CampaignHealthCard = ({ campaign, onClick }) => {
    // Calculate campaign health score
    const calculateHealth = () => {
        let score = 100;
        const now = new Date();
        const created = new Date(campaign.createdAt);
        const daysOld = (now - created) / (1000 * 60 * 60 * 24);

        // Factors affecting health
        const applicants = campaign.matchedCreators?.length || 0;
        const accepted = campaign.matchedCreators?.filter(c => c.status === 'Accepted').length || 0;
        const deadline = campaign.deadline ? new Date(campaign.deadline) : null;
        const daysLeft = deadline ? (deadline - now) / (1000 * 60 * 60 * 24) : null;

        // Deduct points for various factors
        if (applicants === 0 && daysOld > 7) score -= 30; // No applicants after a week
        if (applicants > 0 && accepted === 0 && daysOld > 3) score -= 20; // Applicants but no acceptance
        if (daysLeft && daysLeft < 3 && accepted === 0) score -= 25; // Deadline approaching with no acceptance
        if (campaign.status === 'Cancelled') score = 0;
        if (campaign.status === 'Completed') score = 100;

        return Math.max(0, Math.min(100, score));
    };

    const health = calculateHealth();

    // Determine health category
    const getHealthCategory = () => {
        if (health >= 80) return { label: 'Excellent', color: 'emerald', icon: <HiTrendingUp /> };
        if (health >= 60) return { label: 'Good', color: 'blue', icon: <HiMinus /> };
        if (health >= 40) return { label: 'Needs Attention', color: 'amber', icon: <HiExclamation /> };
        return { label: 'Critical', color: 'red', icon: <HiTrendingDown /> };
    };

    const category = getHealthCategory();

    //Calculate progress
    const applicants = campaign.matchedCreators?.length || 0;
    const accepted = campaign.matchedCreators?.filter(c => c.status === 'Accepted').length || 0;
    const target = 5; // Assume target is 5 collaborations
    const progress = Math.min(100, (accepted / target) * 100);

    return (
        <motion.div
            whileHover={{ y: -2 }}
            onClick={onClick}
            className="glass-card p-4 cursor-pointer transition-all hover:border-primary-500/30 relative overflow-hidden"
        >
            {/* Health Indicator Bar */}
            <div className={`absolute top-0 left-0 w-1 h-full bg-${category.color}-500`} />

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-dark-100 mb-1 line-clamp-1">{campaign.title}</h3>
                    <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full bg-${category.color}-500/20 text-${category.color}-400 flex items-center gap-1`}>
                            {category.icon}
                            {category.label}
                        </span>
                        <span className="text-dark-500">{health}% healthy</span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${campaign.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        campaign.status === 'Accepted' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                    }`}>
                    {campaign.status}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-dark-800/40">
                    <div className="text-lg font-bold text-dark-100">{applicants}</div>
                    <div className="text-xs text-dark-500">Applicants</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-dark-800/40">
                    <div className="text-lg font-bold text-emerald-400">{accepted}</div>
                    <div className="text-xs text-dark-500">Accepted</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-dark-800/40">
                    <div className="text-lg font-bold text-primary-400">₹{(campaign.budget / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-dark-500">Budget</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-dark-400">Collaboration Progress</span>
                    <span className="text-dark-300 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full bg-gradient-to-r from-${category.color}-500 to-${category.color}-400`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Quick Actions (if health is critical) */}
            {health < 40 && (
                <div className="mt-3 pt-3 border-t border-dark-700">
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                        <HiExclamation className="w-4 h-4" />
                        Action needed: Review campaign settings or boost visibility
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default CampaignHealthCard;
