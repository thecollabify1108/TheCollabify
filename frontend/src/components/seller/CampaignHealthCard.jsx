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
            className="glass-card p-s4 rounded-premium-xl cursor-pointer transition-all hover:border-primary-500/30 relative overflow-hidden shadow-premium"
        >
            {/* Health Indicator Bar */}
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-${category.color}-500 shadow-glow`} />

            {/* Header */}
            <div className="flex items-start justify-between mb-s3 pl-s1">
                <div className="flex-1">
                    <h3 className="text-body font-black text-dark-100 mb-s1 line-clamp-1 uppercase tracking-tight">{campaign.title}</h3>
                    <div className="flex items-center gap-s2 text-xs">
                        <span className={`px-s2 py-0.5 rounded-premium-full bg-${category.color}-500/10 text-${category.color}-400 flex items-center gap-s1 border border-${category.color}-500/20 text-[10px] font-black uppercase tracking-wider`}>
                            {category.icon}
                            {category.label}
                        </span>
                        <span className="text-[10px] font-black text-dark-500 uppercase tracking-tighter">{health}% healthy</span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`px-s2 py-1 rounded-premium-lg text-[10px] font-black uppercase tracking-widest border ${campaign.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    campaign.status === 'Accepted' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                    {campaign.status}
                </div>
            </div>
            Broadway
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-s2 mb-s3">
                <div className="text-center p-s2 rounded-premium-lg bg-dark-800/40 border border-dark-700/30">
                    <div className="text-h3 font-black text-dark-100">{applicants}</div>
                    <div className="text-[10px] font-black text-dark-500 uppercase tracking-tighter">Applicants</div>
                </div>
                <div className="text-center p-s2 rounded-premium-lg bg-dark-800/40 border border-dark-700/30">
                    <div className="text-h3 font-black text-emerald-400">{accepted}</div>
                    <div className="text-[10px] font-black text-dark-500 uppercase tracking-tighter">Accepted</div>
                </div>
                <div className="text-center p-s2 rounded-premium-lg bg-dark-800/40 border border-dark-700/30">
                    <div className="text-h3 font-black text-primary-400">₹{(campaign.budget / 1000).toFixed(0)}K</div>
                    <div className="text-[10px] font-black text-dark-500 uppercase tracking-tighter">Budget</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-s1">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Progress</span>
                    <span className="text-xs-pure font-black text-dark-200">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 rounded-premium-full bg-dark-700/50 overflow-hidden border border-dark-800">
                    <motion.div
                        className={`h-full rounded-premium-full bg-gradient-to-r from-${category.color}-500 to-${category.color}-400 shadow-glow`}
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
