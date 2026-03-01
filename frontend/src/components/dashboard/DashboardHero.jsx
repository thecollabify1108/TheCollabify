import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi';
import ReliabilityBadge from '../creator/ReliabilityBadge';

const CREATOR_TIPS = [
    "Creators who post 3+ times/week get 58% more brand inquiries 📈",
    "Add your Instagram & YouTube links — profiles with portfolio links get 2x more collabs 🔗",
    "Respond to brand offers within 24h to boost your reliability score ⚡",
    "Diversify your content categories to attract brands from different niches 🎯",
    "Engage with other creators on the platform — networking leads to referral collabs 🤝",
    "High-quality portfolio photos increase your match rate by 40% 📸",
    "Brands love consistency — maintain a regular posting schedule 🗓️",
    "Niche down! Creators with focused expertise get 3x higher-paying deals 💎",
    "Update your bio monthly to stay relevant in AI matching algorithms 🤖",
    "Turn on availability status to let brands know you're open to new projects 🟢",
    "Creators who complete all profile fields earn 70% more matches ✅",
    "Share your collaboration success stories to build social proof 🏆",
    "Set competitive rates — check the leaderboard to see your market position 💰",
    "Micro-influencers (1K–50K) are in highest demand right now — own your niche! 🔥",
    "Video content creators see 2.5x more engagement than photo-only creators 🎬",
];

const SELLER_TIPS = [
    "Campaigns with clear deliverables get 45% faster creator responses 📋",
    "Set realistic budgets — creators prefer transparent compensation 💵",
    "Use AI matching to find creators who align with your brand values 🤖",
    "Micro-influencers often deliver higher ROI than mega-influencers 📊",
    "Launch campaigns 2-3 weeks before your target date for best results ⏰",
    "Provide creative freedom — creators know their audience best 🎨",
    "Multi-platform campaigns reach 3x more unique audiences 📱",
    "Include product samples in your offers to boost acceptance rates 📦",
    "Respond to creator applications quickly — top talent moves fast ⚡",
    "Track campaign analytics to refine your strategy for next time 📈",
    "Long-term partnerships outperform one-off collabs by 4x in engagement 🔁",
    "Define your target audience clearly — AI matching improves with specifics 🎯",
    "Brands with complete profiles attract 60% more creator applications ✅",
    "Test campaigns with 2-3 creators before scaling to find best fit 🧪",
    "User-generated content from collabs can be repurposed across your channels 🔄",
];

const DashboardHero = ({ userName, role, dailyInsight, availabilityStatus, onToggleAvailability, reliability, profileCompletion }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    // Pick a random tip on each render (changes every page refresh)
    const smartInsight = useMemo(() => {
        // If profile is incomplete and dailyInsight says so, still show a useful tip instead
        if (dailyInsight && !dailyInsight.toLowerCase().includes('complete your profile')) {
            return dailyInsight;
        }
        
        const tips = role?.toLowerCase() === 'seller' ? SELLER_TIPS : CREATOR_TIPS;
        const randomIndex = Math.floor(Math.random() * tips.length);
        return tips[randomIndex];
    }, []); // Empty deps = new random tip each mount/refresh

    const getAvailabilityInfo = (status) => {
        switch (status) {
            case 'AVAILABLE_NOW':
                return { label: 'Available Now', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
            case 'LIMITED_AVAILABILITY':
                return { label: 'Limited', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
            case 'NOT_AVAILABLE':
                return { label: 'Not Available', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
            default:
                return { label: 'Online', color: 'bg-white/20 text-white border-white/10' };
        }
    };

    const availInfo = getAvailabilityInfo(availabilityStatus);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-premium-2xl p-s5 md:p-s8 bg-gradient-to-r from-violet-600 to-indigo-600 relative overflow-hidden shadow-premium"
        >
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-s6">
                    <div>
                        <div className="flex items-center gap-s3 mb-s3">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="px-s3 py-1 bg-white/20 rounded-full text-xs-pure font-bold text-white backdrop-blur-sm border border-white/10 uppercase tracking-widest flex items-center gap-1">
                                    <HiSparkles className="text-yellow-300" />
                                    {role} Dashboard
                                </span>
                            </motion.div>

                            {onToggleAvailability && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onToggleAvailability}
                                    className={`px-s3 py-1 rounded-full text-xs-pure font-bold border backdrop-blur-sm transition-all flex items-center gap-1.5 ${availInfo.color}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                    {availInfo.label}
                                </motion.button>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mb-s3">
                            <h1 className="text-h2 md:text-h1 font-bold text-white leading-tight">
                                {getGreeting()}, {userName}! 👋
                            </h1>
                            {reliability && (
                                <ReliabilityBadge
                                    level={reliability.level}
                                    score={reliability.score}
                                    size="md"
                                />
                            )}
                        </div>
                        <p className="text-indigo-100 max-w-lg text-body">
                            Ready to make an impact? Here's your daily edge.
                        </p>
                    </div>

                    {/* AI Insight Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="p-s4 rounded-premium-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-start gap-s4 max-w-md hover:bg-white/15 transition-colors cursor-default group shadow-premium"
                    >
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2.5 rounded-premium-lg text-white shadow-glow group-hover:scale-110 transition-transform duration-300">
                            <HiSparkles className="text-h3" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-xs-pure flex items-center gap-s2 uppercase tracking-widest">
                                Today's AI Insight
                                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-bold tracking-widest">DAILY</span>
                            </h4>
                            <p className="text-indigo-50 text-small mt-s1 leading-relaxed">
                                "{smartInsight}"
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-3xl" />
        </motion.div>
    );
};

export default DashboardHero;
