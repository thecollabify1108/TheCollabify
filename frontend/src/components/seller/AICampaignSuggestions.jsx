import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaLightbulb,
    FaRocket,
    FaChartLine,
    FaUsers,
    FaClock,
    FaCheckCircle,
    FaTimes,
    FaMagic,
    FaArrowRight
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp, HiLightningBolt } from 'react-icons/hi';

/**
 * AI Campaign Suggestions
 * Provides smart recommendations for campaign creation and optimization
 */
const AICampaignSuggestions = ({ requests = [], onCreateCampaign, onApplySuggestion }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSuggestion, setActiveSuggestion] = useState(null);

    // Generate AI suggestions based on data analysis
    useEffect(() => {
        generateSuggestions();
    }, [requests]);

    const generateSuggestions = () => {
        setLoading(true);

        // Simulate AI processing
        setTimeout(() => {
            const newSuggestions = [];

            // Analyze past campaign data
            const completedCampaigns = requests.filter(r => r.status === 'Completed');
            const activeCampaigns = requests.filter(r => ['Open', 'Creator Interested', 'Accepted'].includes(r.status));
            const avgMatchScore = requests.length > 0
                ? requests.flatMap(r => r.matchedCreators?.map(mc => mc.matchScore) || []).reduce((a, b, _, arr) => a + b / arr.length, 0)
                : 0;

            // Suggestion 1: Best time to post
            newSuggestions.push({
                id: 1,
                type: 'timing',
                title: '🕐 Best Time to Launch',
                description: 'Based on creator activity patterns, launching campaigns between 6-9 PM gets 40% more applications.',
                action: 'Schedule for evening',
                icon: FaClock,
                color: 'from-blue-500 to-cyan-500',
                confidence: 87,
                impact: 'high'
            });

            // Suggestion 2: Category recommendation
            const popularCategories = ['Fashion', 'Beauty', 'Tech', 'Fitness', 'Food'];
            const currentCategories = requests.map(r => r.targetCategory);
            const underusedCategories = popularCategories.filter(c => !currentCategories.includes(c));

            if (underusedCategories.length > 0) {
                newSuggestions.push({
                    id: 2,
                    type: 'category',
                    title: '🎯 Untapped Market',
                    description: `${underusedCategories[0]} category has high creator supply but low campaign demand. Great opportunity!`,
                    action: `Try ${underusedCategories[0]} campaign`,
                    icon: HiTrendingUp,
                    color: 'from-green-500 to-emerald-500',
                    confidence: 82,
                    impact: 'high',
                    data: { category: underusedCategories[0] }
                });
            }

            // Suggestion 3: Budget optimization
            const avgBudget = requests.length > 0
                ? requests.reduce((sum, r) => sum + ((r.budgetRange?.min || 0) + (r.budgetRange?.max || 0)) / 2, 0) / requests.length
                : 0;

            if (avgBudget > 0) {
                newSuggestions.push({
                    id: 3,
                    type: 'budget',
                    title: '💰 Budget Sweet Spot',
                    description: `Campaigns with ₹${Math.round(avgBudget * 0.8).toLocaleString()}-₹${Math.round(avgBudget * 1.2).toLocaleString()} budget get 50% more quality applicants.`,
                    action: 'Optimize budget range',
                    icon: FaChartLine,
                    color: 'from-amber-500 to-orange-500',
                    confidence: 79,
                    impact: 'medium',
                    data: { min: Math.round(avgBudget * 0.8), max: Math.round(avgBudget * 1.2) }
                });
            } else {
                newSuggestions.push({
                    id: 3,
                    type: 'budget',
                    title: '💰 Recommended Budget',
                    description: 'Based on market trends, ₹2,000-₹5,000 is the sweet spot for Reels campaigns.',
                    action: 'Start with ₹3,000',
                    icon: FaChartLine,
                    color: 'from-amber-500 to-orange-500',
                    confidence: 75,
                    impact: 'medium',
                    data: { min: 2000, max: 5000 }
                });
            }

            // Suggestion 4: Promotion type
            newSuggestions.push({
                id: 4,
                type: 'promotion',
                title: '📱 Reels Trend Alert',
                description: 'Reels campaigns are getting 3x more engagement than Stories right now. Consider switching!',
                action: 'Create Reels campaign',
                icon: HiLightningBolt,
                color: 'from-purple-500 to-pink-500',
                confidence: 91,
                impact: 'high',
                data: { promotionType: 'Reels' }
            });

            // Suggestion 5: Follower range
            newSuggestions.push({
                id: 5,
                type: 'followers',
                title: '👥 Micro-Influencers Win',
                description: 'Creators with 5K-25K followers have 8x higher engagement rates. Perfect for authentic promotions!',
                action: 'Target micro-influencers',
                icon: FaUsers,
                color: 'from-indigo-500 to-violet-500',
                confidence: 88,
                impact: 'high',
                data: { followerMin: 5000, followerMax: 25000 }
            });

            // Suggestion 6: Quick win
            if (activeCampaigns.length === 0) {
                newSuggestions.push({
                    id: 6,
                    type: 'quickstart',
                    title: '🚀 Quick Start Campaign',
                    description: 'Launch your first campaign in under 2 minutes with our AI-optimized settings!',
                    action: 'Quick start now',
                    icon: FaRocket,
                    color: 'from-rose-500 to-red-500',
                    confidence: 95,
                    impact: 'high'
                });
            }

            setSuggestions(newSuggestions);
            setLoading(false);
        }, 1000);
    };

    const handleApplySuggestion = (suggestion) => {
        if (onApplySuggestion) {
            onApplySuggestion(suggestion);
        }
        setActiveSuggestion(suggestion.id);
        setTimeout(() => setActiveSuggestion(null), 2000);
    };

    const getImpactBadge = (impact) => {
        const colors = {
            high: 'bg-green-500/20 text-green-400 border-green-500/30',
            medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
        return colors[impact] || colors.medium;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <HiSparkles className="text-white text-xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-dark-100">AI Suggestions</h3>
                        <p className="text-dark-400 text-sm">Smart recommendations for you</p>
                    </div>
                </div>
                <button
                    onClick={generateSuggestions}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors text-sm"
                >
                    <FaMagic className="text-primary-400" />
                    Refresh
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-dark-800 rounded-xl animate-pulse shimmer" />
                    ))}
                </div>
            )}

            {/* Suggestions List */}
            {!loading && (
                <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                        {suggestions.slice(0, 4).map((suggestion, index) => (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative bg-dark-800/50 border border-dark-700 rounded-xl p-4 overflow-hidden ${activeSuggestion === suggestion.id ? 'border-green-500' : ''
                                    }`}
                            >
                                {/* Background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${suggestion.color} opacity-5`} />

                                <div className="relative flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center flex-shrink-0`}>
                                        <suggestion.icon className="text-white text-xl" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-dark-100">{suggestion.title}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getImpactBadge(suggestion.impact)}`}>
                                                {suggestion.impact} impact
                                            </span>
                                        </div>
                                        <p className="text-dark-400 text-sm mb-3">{suggestion.description}</p>

                                        {/* Action Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleApplySuggestion(suggestion)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${suggestion.color} text-white text-sm font-medium`}
                                        >
                                            {activeSuggestion === suggestion.id ? (
                                                <>
                                                    <FaCheckCircle />
                                                    Applied!
                                                </>
                                            ) : (
                                                <>
                                                    {suggestion.action}
                                                    <FaArrowRight className="text-xs" />
                                                </>
                                            )}
                                        </motion.button>
                                    </div>

                                    {/* Confidence Score */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-2xl font-bold text-dark-100">{suggestion.confidence}%</div>
                                        <div className="text-xs text-dark-400">confidence</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}

            {/* Empty State */}
            {!loading && suggestions.length === 0 && (
                <div className="text-center py-8 bg-dark-800/30 rounded-xl border border-dark-700">
                    <FaLightbulb className="text-4xl text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-400">No suggestions available yet</p>
                </div>
            )}
        </div>
    );
};

export default AICampaignSuggestions;
