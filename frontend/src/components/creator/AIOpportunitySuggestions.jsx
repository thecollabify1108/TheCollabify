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
import { aiAPI } from '../../services/api';

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

    const generateSuggestions = async () => {
        if (!profile) return;
        setLoading(true);

        try {
            const res = await aiAPI.getProfileTips(profile);
            if (res.data.success) {
                const formattedTips = res.data.data.map(tip => ({
                    ...tip,
                    icon: getIconForType(tip.id),
                    color: getColorForType(tip.id)
                }));
                // Combine with basic opportunities logic if needed
                setSuggestions(formattedTips);
            }
        } catch (err) {
            console.error('Failed to load profile tips:', err);
        } finally {
            setLoading(false);
        }
    };

    const getIconForType = (id) => {
        switch (id) {
            case 'engagement': return HiTrendingUp;
            case 'niche': return FaHashtag;
            case 'pricing': return FaChartLine;
            case 'timing': return FaClock;
            default: return FaLightbulb;
        }
    };

    const getColorForType = (id) => {
        switch (id) {
            case 'engagement': return 'from-amber-500 to-orange-500';
            case 'niche': return 'from-purple-500 to-pink-500';
            case 'pricing': return 'from-amber-500 to-yellow-500';
            case 'timing': return 'from-blue-500 to-cyan-500';
            default: return 'from-primary-500 to-secondary-500';
        }
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
