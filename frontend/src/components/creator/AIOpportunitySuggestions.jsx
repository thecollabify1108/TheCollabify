import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaLightbulb,
    FaRocket,
    FaChartLine,
    FaUsers,
    FaClock,
    FaCheckCircle,
    FaMagic,
    FaArrowRight,
    FaInstagram,
    FaHashtag,
    FaStar
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp, HiLightningBolt, HiPhotograph } from 'react-icons/hi';

/**
 * AI Opportunity Suggestions for Creators
 * Provides smart recommendations for profile optimization and opportunities
 */
const AIOpportunitySuggestions = ({ profile, promotions = [], onApplySuggestion }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSuggestion, setActiveSuggestion] = useState(null);

    // Generate AI suggestions based on profile and opportunities
    useEffect(() => {
        generateSuggestions();
    }, [profile, promotions]);

    const generateSuggestions = () => {
        setLoading(true);

        // Simulate AI processing
        setTimeout(() => {
            const newSuggestions = [];

            if (!profile) {
                setSuggestions([]);
                setLoading(false);
                return;
            }

            // Suggestion 1: Profile optimization
            if (profile.engagementRate < 5) {
                newSuggestions.push({
                    id: 1,
                    type: 'engagement',
                    title: '📈 Boost Your Engagement',
                    description: 'Your engagement rate is below average. Post during peak hours (6-9 PM) and use more interactive stories!',
                    action: 'Learn tips',
                    icon: HiTrendingUp,
                    color: 'from-amber-500 to-orange-500',
                    confidence: 85,
                    impact: 'high'
                });
            } else {
                newSuggestions.push({
                    id: 1,
                    type: 'engagement',
                    title: '🔥 Great Engagement!',
                    description: `Your ${profile.engagementRate}% engagement is above average. You're more likely to get accepted for campaigns!`,
                    action: 'Keep it up',
                    icon: HiLightningBolt,
                    color: 'from-green-500 to-emerald-500',
                    confidence: 92,
                    impact: 'high'
                });
            }

            // Suggestion 2: Best matching promotions
            const matchingPromos = promotions.filter(p => !p.hasApplied).slice(0, 3);
            if (matchingPromos.length > 0) {
                newSuggestions.push({
                    id: 2,
                    type: 'opportunity',
                    title: '🎯 Hot Opportunities',
                    description: `${matchingPromos.length} new promotions match your profile perfectly. Don't miss out!`,
                    action: 'Apply now',
                    icon: FaRocket,
                    color: 'from-primary-500 to-secondary-500',
                    confidence: 88,
                    impact: 'high',
                    data: { promotions: matchingPromos }
                });
            }

            // Suggestion 3: Category expansion
            const popularCategories = ['Fashion', 'Beauty', 'Tech', 'Fitness', 'Food', 'Travel'];
            const otherCategories = popularCategories.filter(c => c !== profile.category);
            newSuggestions.push({
                id: 3,
                type: 'category',
                title: '🌟 Expand Your Niche',
                description: `Consider adding ${otherCategories[0]} to your skills. Cross-niche creators earn 30% more!`,
                action: 'Update profile',
                icon: FaHashtag,
                color: 'from-purple-500 to-pink-500',
                confidence: 76,
                impact: 'medium'
            });

            // Suggestion 4: Reels focus
            if (!profile.promotionTypes?.includes('Reels')) {
                newSuggestions.push({
                    id: 4,
                    type: 'content',
                    title: '📱 Add Reels to Your Skills',
                    description: 'Reels campaigns pay 40% more on average. Add Reels to attract higher-paying brands!',
                    action: 'Add Reels',
                    icon: HiPhotograph,
                    color: 'from-rose-500 to-red-500',
                    confidence: 91,
                    impact: 'high',
                    data: { promotionType: 'Reels' }
                });
            }

            // Suggestion 5: Pricing optimization
            const suggestedMin = Math.round(profile.followerCount * 0.0005);
            const suggestedMax = Math.round(profile.followerCount * 0.001);
            if (profile.priceRange?.max < suggestedMin) {
                newSuggestions.push({
                    id: 5,
                    type: 'pricing',
                    title: '💰 Increase Your Rates',
                    description: `Based on your followers, you could charge ₹${suggestedMin.toLocaleString()}-₹${suggestedMax.toLocaleString()} per post!`,
                    action: 'Update pricing',
                    icon: FaChartLine,
                    color: 'from-amber-500 to-yellow-500',
                    confidence: 83,
                    impact: 'high',
                    data: { min: suggestedMin, max: suggestedMax }
                });
            }

            // Suggestion 6: Apply faster
            newSuggestions.push({
                id: 6,
                type: 'timing',
                title: '⚡ Apply Within 24 Hours',
                description: 'Creators who apply within 24 hours are 3x more likely to get selected!',
                action: 'Check new opportunities',
                icon: FaClock,
                color: 'from-blue-500 to-cyan-500',
                confidence: 89,
                impact: 'medium'
            });

            setSuggestions(newSuggestions);
            setLoading(false);
        }, 800);
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
                        <h3 className="text-lg font-bold text-dark-100">AI Tips for You</h3>
                        <p className="text-dark-400 text-sm">Personalized recommendations</p>
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
                                                    Got it!
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

            {/* No Profile State */}
            {!loading && !profile && (
                <div className="text-center py-8 bg-dark-800/30 rounded-xl border border-dark-700">
                    <FaLightbulb className="text-4xl text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-400">Complete your profile to get AI tips!</p>
                </div>
            )}
        </div>
    );
};

export default AIOpportunitySuggestions;
