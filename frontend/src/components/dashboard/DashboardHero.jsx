import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ReliabilityBadge from '../creator/ReliabilityBadge';

const CREATOR_TIPS = [
    "Creators posting 3+/week receive 58% more brand inquiries.",
    "Profiles with portfolio links generate 2x more collaboration offers.",
    "Responding within 24h improves your reliability score.",
    "Diversified content categories attract cross-vertical brand interest.",
    "Strategic engagement increases collaboration visibility.",
    "High-quality portfolio assets increase match rate by 40%.",
    "Consistent posting schedules improve algorithmic ranking.",
    "Focused niche expertise correlates with 3x higher deal value.",
    "Regular bio updates improve relevance in matching algorithms.",
    "Active availability status increases inbound campaign volume.",
    "Complete profiles earn 70% more matches.",
    "Documented success stories build social proof for future campaigns.",
    "Competitive rate positioning improves conversion on inbound offers.",
    "Micro-influencer demand (1K-50K) is at a market high.",
    "Video creators see 2.5x higher engagement than photo-only profiles.",
];

const SELLER_TIPS = [
    "Campaigns with clear deliverables receive 45% faster responses.",
    "Transparent compensation increases creator acceptance rate.",
    "Matching algorithms improve with specificity in campaign parameters.",
    "Micro-influencers often deliver higher ROI than macro-tier creators.",
    "2-3 week lead time yields optimal creator availability.",
    "Creative freedom produces higher-performing content.",
    "Multi-platform campaigns reach 3x more unique audiences.",
    "Product sample inclusion improves offer acceptance rate.",
    "Fast response to applications secures top-tier talent.",
    "Campaign analytics refinement compounds performance over time.",
    "Long-term partnerships outperform one-off collaborations by 4x.",
    "Precise audience targeting improves match accuracy.",
    "Complete brand profiles attract 60% more creator applications.",
    "A/B testing with 2-3 creators identifies optimal fit before scaling.",
    "Collaboration-generated content can be repurposed across owned channels.",
];

const DashboardHero = ({ userName, role, dailyInsight, availabilityStatus, onToggleAvailability, reliability }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const smartInsight = useMemo(() => {
        if (dailyInsight && !dailyInsight.toLowerCase().includes('complete your profile')) {
            return dailyInsight;
        }
        const tips = role?.toLowerCase() === 'seller' ? SELLER_TIPS : CREATOR_TIPS;
        return tips[Math.floor(Math.random() * tips.length)];
    }, []);

    const getAvailabilityInfo = (status) => {
        switch (status) {
            case 'AVAILABLE_NOW':
                return { label: 'Available', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
            case 'LIMITED_AVAILABILITY':
                return { label: 'Limited', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
            case 'NOT_AVAILABLE':
                return { label: 'Unavailable', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
            default:
                return { label: 'Online', color: 'bg-white/20 text-white border-white/10' };
        }
    };

    const availInfo = getAvailabilityInfo(availabilityStatus);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 bg-gradient-to-r from-indigo-950 to-slate-900 relative overflow-hidden border border-indigo-900/40"
        >
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 sm:gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-semibold text-indigo-200 uppercase tracking-widest border border-white/5">
                                {role} Dashboard
                            </span>

                            {onToggleAvailability && (
                                <button
                                    onClick={onToggleAvailability}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all flex items-center gap-1 ${availInfo.color}`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {availInfo.label}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight truncate">
                                {getGreeting()}, {userName}
                            </h1>
                            {reliability && (
                                <ReliabilityBadge
                                    level={reliability.level}
                                    score={reliability.score}
                                    size="sm"
                                />
                            )}
                        </div>
                        <p className="text-indigo-300/70 text-xs">
                            Performance snapshot and collaboration activity.
                        </p>
                    </div>

                    {/* Insight Card */}
                    <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2 sm:gap-3 w-full md:max-w-sm">
                        <div className="bg-indigo-800/60 p-1.5 rounded text-indigo-300 shrink-0">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 002 0V3zm4.657 2.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zm3 6v-1h4v1a2 2 0 11-4 0zm4-2c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-indigo-200 text-[10px] uppercase tracking-widest mb-0.5">
                                Daily Insight
                            </h4>
                            <p className="text-indigo-100/70 text-xs leading-relaxed">
                                {smartInsight}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardHero;
