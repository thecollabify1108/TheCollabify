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
import { aiAPI } from '../../services/api';

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

    const generateSuggestions = async () => {
        setLoading(true);
        try {
            const res = await aiAPI.getMarketInsights();
            if (res.data.success) {
                const formattedSuggestions = res.data.data.map(s => ({
                    ...s,
                    icon: getIconForType(s.type),
                    color: getColorForType(s.type)
                }));
                setSuggestions(formattedSuggestions);
            }
        } catch (err) {
            console.error('Failed to load market insights:', err);
        } finally {
            setLoading(false);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'timing': return FaClock;
            case 'category': return HiTrendingUp;
            case 'promotion': return HiLightningBolt;
            case 'budget': return FaChartLine;
            default: return FaLightbulb;
        }
    };

    const getColorForType = (type) => {
        switch (type) {
            case 'timing': return 'from-blue-500 to-cyan-500';
            case 'category': return 'from-green-500 to-emerald-500';
            case 'promotion': return 'from-purple-500 to-pink-500';
            case 'budget': return 'from-amber-500 to-orange-500';
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
        <div className="space-y-s6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-s3">
                    <div className="w-12 h-12 rounded-premium-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow border border-white/20">
                        <HiSparkles className="text-white text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-h3 font-black text-dark-100 uppercase tracking-tight">AI Insights</h3>
                        <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-widest">Smart recommendations for you</p>
                    </div>
                </div>
                <button
                    onClick={generateSuggestions}
                    className="flex items-center gap-s2 px-s4 py-s2 rounded-premium-xl bg-dark-800/80 text-dark-300 hover:text-dark-100 border border-dark-700/50 transition-all text-xs-pure font-black uppercase tracking-widest shadow-sm hover:shadow-premium"
                >
                    <FaMagic className="text-primary-400" />
                    Refresh
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="space-y-s4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 bg-dark-800/40 rounded-premium-2xl animate-pulse shimmer border border-dark-700/30" />
                    ))}
                </div>
            )}

            {/* Suggestions List */}
            {!loading && (
                <AnimatePresence mode="popLayout">
                    <div className="space-y-s4">
                        {suggestions.slice(0, 4).map((suggestion, index) => (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative bg-dark-800/40 backdrop-blur-sm border-2 rounded-premium-2xl p-s5 overflow-hidden transition-all hover:shadow-premium ${activeSuggestion === suggestion.id ? 'border-emerald-500 bg-emerald-500/5 shadow-glow' : 'border-dark-700/50 hover:border-dark-600'
                                    }`}
                            >
                                {/* Background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${suggestion.color} opacity-5`} />

                                <div className="relative flex items-start gap-s5">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-premium-2xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10`}>
                                        <suggestion.icon className="text-white text-2xl" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-s3 mb-s2">
                                            <h4 className="text-body font-black text-dark-100 uppercase tracking-tight">{suggestion.title}</h4>
                                            <span className={`text-[10px] px-s2.5 py-1 rounded-premium-full border font-black uppercase tracking-widest shadow-sm ${getImpactBadge(suggestion.impact)}`}>
                                                {suggestion.impact} impact
                                            </span>
                                        </div>
                                        <p className="text-small text-dark-400 mb-s4 leading-relaxed">{suggestion.description}</p>

                                        {/* Action Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleApplySuggestion(suggestion)}
                                            className={`flex items-center gap-s2 px-s5 py-s2.5 rounded-premium-xl bg-gradient-to-r ${suggestion.color} text-white text-xs-pure font-black uppercase tracking-widest shadow-glow hover:shadow-glow-lg transition-all`}
                                        >
                                            {activeSuggestion === suggestion.id ? (
                                                <>
                                                    <FaCheckCircle className="text-sm" />
                                                    Applied Successfully
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
                                    <div className="text-right flex-shrink-0 hidden sm:block">
                                        <div className="text-h2 font-black text-dark-100 tracking-tighter">{suggestion.confidence}%</div>
                                        <div className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Confidence</div>
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
