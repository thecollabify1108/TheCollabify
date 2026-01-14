import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaVideo,
    FaChartLine,
    FaLightbulb,
    FaInstagram,
    FaFire,
    FaUsers,
    FaCamera,
    FaClock,
    FaSync
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const ContentCreatorTips = () => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    // Curated tips for content creators
    const tips = [
        {
            category: 'Engagement Boost',
            icon: <FaChartLine className="w-6 h-6" />,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            title: 'Peak Posting Times',
            content: 'Posting between 6-9 PM gets 40% more engagement. Instagram users are most active during evening hours. Schedule your content when your audience is online.',
            stat: '6-9 PM Best Time'
        },
        {
            category: 'Content Strategy',
            icon: <FaVideo className="w-6 h-6" />,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            title: 'Reels Dominate 2026',
            content: 'Reels get 67% more engagement than static posts. Focus on creating 15-30 second videos with trending audio and quick hooks in the first 3 seconds.',
            stat: '67% More Engagement'
        },
        {
            category: 'Growth Hack',
            icon: <FaUsers className="w-6 h-6" />,
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            title: 'Consistency is Key',
            content: 'Creators who post 4-7 times per week grow 3x faster than those who post sporadically. Set a posting schedule and stick to it.',
            stat: '3x Faster Growth'
        },
        {
            category: 'Algorithm Insight',
            icon: <FaInstagram className="w-6 h-6" />,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            title: 'First Hour Matters',
            content: 'Instagram\'s algorithm heavily weighs engagement in the first 60 minutes. Engage with comments immediately after posting to boost visibility.',
            stat: 'First 60 Minutes Critical'
        },
        {
            category: 'Monetization Tip',
            icon: <FaFire className="w-6 h-6" />,
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            title: 'Brand Collaboration Value',
            content: 'Creators with 10K-50K followers earn ₹2,000-₹10,000 per sponsored post. Build authentic relationships with brands for long-term partnerships.',
            stat: '₹2K-₹10K Per Post'
        },
        {
            category: 'Content Quality',
            icon: <FaCamera className="w-6 h-6" />,
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/30',
            title: 'Quality Over Quantity',
            content: 'Well-produced content with good lighting and clear audio gets 2.5x more saves and shares. Invest in basic equipment for better production value.',
            stat: '2.5x More Shares'
        },
        {
            category: 'Audience Building',
            icon: <FaLightbulb className="w-6 h-6" />,
            color: 'from-teal-500 to-cyan-500',
            bgColor: 'bg-teal-500/10',
            borderColor: 'border-teal-500/30',
            title: 'Niche Down to Grow',
            content: 'Creators who focus on a specific niche grow 2x faster and have 50% higher engagement rates than generalist accounts.',
            stat: '50% Higher Engagement'
        },
        {
            category: 'Success Story',
            icon: <FaClock className="w-6 h-6" />,
            color: 'from-yellow-500 to-amber-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            title: 'Stories Drive Sales',
            content: 'Instagram Stories with swipe-up links (10K+ followers) convert 15-25% better than regular posts. Use Stories for time-sensitive promotions.',
            stat: '15-25% Better Conversion'
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
                    <HiSparkles className="text-primary-400" />
                    Creator Insights
                </h2>
                <button
                    onClick={handleRefresh}
                    className="p-2 rounded-lg bg-dark-800/50 hover:bg-dark-700 transition-colors text-dark-300 hover:text-dark-100"
                    title="Next tip"
                >
                    <FaSync className="w-5 h-5" />
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
                        500M+
                    </div>
                    <div className="text-xs text-dark-400">Daily Active Users</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-4 rounded-2xl ${currentTip.bgColor} border ${currentTip.borderColor}`}
                >
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text mb-1">
                        81%
                    </div>
                    <div className="text-xs text-dark-400">Discover Products on IG</div>
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
                        <FaLightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-dark-100 mb-1">Pro Tip</h4>
                        <p className="text-sm text-dark-400 leading-relaxed">
                            Check the "Browse" tab to discover brand collaboration opportunities tailored to your niche and follower count. Apply early for better chances!
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ContentCreatorTips;
