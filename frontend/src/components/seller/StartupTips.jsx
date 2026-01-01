import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiLightningBolt,
    HiTrendingUp,
    HiLightBulb,
    HiSparkles,
    HiChartBar,
    HiRefresh
} from 'react-icons/hi';
import { FaRocket, FaChartLine, FaBullhorn, FaHandshake } from 'react-icons/fa';

const StartupTips = () => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    // Curated tips and content for entrepreneurs
    const tips = [
        {
            category: 'Marketing Tip',
            icon: <FaBullhorn className="w-6 h-6" />,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            title: 'Influencer Marketing ROI',
            content: 'Micro-influencers (10K-100K followers) generate 60% higher engagement rates than macro-influencers. Focus on authentic connections over follower count.',
            stat: '60% Higher Engagement'
        },
        {
            category: 'Growth Hack',
            icon: <FaRocket className="w-6 h-6" />,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            title: 'Launch Timing Matters',
            content: 'Posts between 6-9 PM get 40% more applications. Schedule your campaigns during peak creator activity hours for maximum visibility.',
            stat: '40% More Applications'
        },
        {
            category: 'Industry Insight',
            icon: <HiChartBar className="w-6 h-6" />,
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            title: 'Creator Economy Growth',
            content: 'The creator economy is expected to reach $480B by 2027. Investing in influencer partnerships now positions your brand for exponential growth.',
            stat: '$480B by 2027'
        },
        {
            category: 'Success Story',
            icon: <HiSparkles className="w-6 h-6" />,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            title: 'Authenticity Wins',
            content: '86% of consumers say authenticity is important when deciding which brands to support. Partner with creators who genuinely align with your values.',
            stat: '86% Value Authenticity'
        },
        {
            category: 'Budget Optimization',
            icon: <FaChartLine className="w-6 h-6" />,
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            title: 'Smart Investment Strategy',
            content: 'Brands see an average ROI of ₹5.20 for every ₹1 spent on influencer marketing. Start with smaller campaigns to test and optimize.',
            stat: '5.2x ROI Average'
        },
        {
            category: 'Trending Now',
            icon: <HiTrendingUp className="w-6 h-6" />,
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/30',
            title: 'Reels Dominate 2026',
            content: 'Instagram Reels campaigns are getting 3x more engagement than static posts. Prioritize video content in your collaboration brief.',
            stat: '3x More Engagement'
        },
        {
            category: 'Partnership Tip',
            icon: <FaHandshake className="w-6 h-6" />,
            color: 'from-teal-500 to-cyan-500',
            bgColor: 'bg-teal-500/10',
            borderColor: 'border-teal-500/30',
            title: 'Long-term Partnerships',
            content: 'Long-term creator partnerships (3+ campaigns) perform 2x better than one-off collaborations. Build relationships, not just transactions.',
            stat: '2x Better Performance'
        },
        {
            category: 'Market Fact',
            icon: <HiLightBulb className="w-6 h-6" />,
            color: 'from-yellow-500 to-amber-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            title: 'Fashion Category Leader',
            content: 'Fashion & lifestyle niches have the highest creator supply with the lowest campaign demand—a perfect opportunity for untapped market growth.',
            stat: 'High Supply, Low Demand'
        }
    ];

    const currentTip = tips[currentTipIndex];

    // Auto-rotate tips every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [tips.length]);

    const handleRefresh = () => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                    <HiLightningBolt className="text-primary-400" />
                    Daily Insights
                </h2>
                <button
                    onClick={handleRefresh}
                    className="p-2 rounded-lg bg-dark-800/50 hover:bg-dark-700 transition-colors text-dark-300 hover:text-dark-100"
                    title="Next tip"
                >
                    <HiRefresh className="w-5 h-5" />
                </button>
            </div>

            {/* Main Tip Card */}
            <motion.div
                key={currentTipIndex}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`relative p-6 rounded-3xl bg-gradient-to-br ${currentTip.color} overflow-hidden`}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-white/90">{currentTip.icon}</span>
                        <span className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                            {currentTip.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                        {currentTip.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 leading-relaxed mb-4">
                        {currentTip.content}
                    </p>

                    {/* Stat Highlight */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                        <HiSparkles className="text-white" />
                        <span className="font-bold text-white">{currentTip.stat}</span>
                    </div>
                </div>

                {/* Progress Dots */}
                <div className="relative z-10 flex items-center gap-2 mt-6">
                    {tips.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentTipIndex(index)}
                            className={`h-1.5 rounded-full transition-all ${index === currentTipIndex
                                    ? 'w-6 bg-white'
                                    : 'w-1.5 bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 rounded-2xl ${currentTip.bgColor} border ${currentTip.borderColor}`}
                >
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text mb-1">
                        92%
                    </div>
                    <div className="text-xs text-dark-400">Trust Influencers</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-4 rounded-2xl ${currentTip.bgColor} border ${currentTip.borderColor}`}
                >
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text mb-1">
                        49%
                    </div>
                    <div className="text-xs text-dark-400">Rely on Recommendations</div>
                </motion.div>
            </div>

            {/* Pro Tip */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                        <HiLightBulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-dark-100 mb-1">Pro Tip</h4>
                        <p className="text-sm text-dark-400 leading-relaxed">
                            Use TheCollabify's AI Suggestions tab to discover personalized campaign ideas based on current market trends and your niche.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StartupTips;
