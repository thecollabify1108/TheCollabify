import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaStar, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * Smart Recommendations Panel
 * AI-powered creator recommendations for campaigns
 */
const SmartRecommendationsPanel = ({ campaign, onInvite }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCreators, setSelectedCreators] = useState([]);
    const [showExplanation, setShowExplanation] = useState(null);

    useEffect(() => {
        if (campaign?.id) {
            loadRecommendations();
        }
    }, [campaign?.id]);

    const loadRecommendations = async () => {
        setLoading(true);
        try {
            const res = await aiAPI.getRecommendations(campaign.id);
            if (res.data.success) {
                // Map backend creator data to format used by panel
                const formattedRecs = res.data.data.map(creator => ({
                    ...creator,
                    _id: creator.id,
                    matchScore: creator.matchScore,
                    reasons: creator.matchReasons || [],
                    locationStatus: creator.locationStatus || 'OTHER'
                }));
                setRecommendations(formattedRecs);
            }
        } catch (err) {
            console.error('Failed to load AI recommendations:', err);
            toast.error('Could not fetch AI recommendations');
        } finally {
            setLoading(false);
        }
    };

    const groupRecommendations = () => {
        const groups = {
            EXACT: { label: 'Creators in your preferred location', items: [] },
            NEARBY: { label: 'Nearby creators', items: [] },
            TRAVEL: { label: 'Willing to travel', items: [] },
            REMOTE: { label: 'Available for Remote Work', items: [] },
            OTHER: { label: 'Other strong matches', items: [] }
        };

        recommendations.forEach(rec => {
            const status = rec.locationStatus || 'OTHER';
            if (groups[status]) {
                groups[status].items.push(rec);
            } else {
                groups.OTHER.items.push(rec);
            }
        });

        return groups;
    };

    const toggleCreator = (creatorId) => {
        setSelectedCreators(prev =>
            prev.includes(creatorId)
                ? prev.filter(id => id !== creatorId)
                : [...prev, creatorId]
        );
    };

    const handleBulkInvite = () => {
        if (selectedCreators.length === 0) {
            toast.error('Please select at least one creator');
            return;
        }

        const selectedRecs = recommendations.filter(r => selectedCreators.includes(r._id));
        onInvite?.(selectedRecs);
        toast.success(`Invited ${selectedCreators.length} creators!`);
        setSelectedCreators([]);
    };

    if (loading) {
        return (
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-dark-400">AI is finding perfect matches...</p>
            </div>
        );
    }

    const groupedRecs = groupRecommendations();
    const hasRecommendations = recommendations.length > 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <FaRobot className="text-2xl text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                            AI Recommendations
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">BETA</span>
                        </h3>
                        <p className="text-sm text-dark-500">
                            {recommendations.length} perfect matches found
                        </p>
                    </div>
                </div>

                {selectedCreators.length > 0 && (
                    <button
                        onClick={handleBulkInvite}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity flex items-center gap-2"
                    >
                        <FaEnvelope />
                        Invite {selectedCreators.length}
                    </button>
                )}
            </div>

            {/* Recommendations List */}
            <div className="space-y-6">
                {Object.entries(groupedRecs).map(([key, group]) => (
                    group.items.length > 0 && (
                        <div key={key} className="space-y-3">
                            <h4 className="flex items-center gap-2 text-xs font-semibold text-dark-400 uppercase tracking-wider px-1">
                                {group.label}
                                <span className="text-[10px] bg-dark-800 px-1.5 py-0.5 rounded-full">{group.items.length}</span>
                            </h4>
                            {group.items.map((creator, index) => (
                                <motion.div
                                    key={creator._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => toggleCreator(creator._id)}
                                    className={`bg-dark-900 border-2 ${selectedCreators.includes(creator._id)
                                        ? 'border-purple-500 bg-purple-500/5'
                                        : 'border-dark-800 hover:border-dark-700'
                                        } rounded-xl p-4 cursor-pointer transition-all`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xl font-bold">
                                                {creator.name?.charAt(0) || 'C'}
                                            </div>
                                            {selectedCreators.includes(creator._id) && (
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                                    <FaCheckCircle className="text-white text-sm" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-dark-100 truncate">
                                                    {creator.name || 'Creator'}
                                                </h4>
                                                {creator.isVerified && (
                                                    <span className="text-blue-400">✓</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-dark-400 mb-2">
                                                <span>{creator.category || 'Lifestyle'}</span>
                                                <span>•</span>
                                                <span>{(creator.followerCount || 50000).toLocaleString()} followers</span>
                                                <span>•</span>
                                                <span>{(creator.engagementRate || 3.5).toFixed(1)}% ER</span>
                                                {creator.responseLikelihood && (
                                                    <>
                                                        <span>•</span>
                                                        <div className="group relative inline-block">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${creator.responseLikelihood.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                creator.responseLikelihood.color === 'amber' || creator.responseLikelihood.color === 'orange' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                    creator.responseLikelihood.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                        'bg-gray-500/10 text-dark-400 border-dark-700'
                                                                }`}>
                                                                {creator.responseLikelihood.label}
                                                            </span>
                                                            {/* Tooltip */}
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-800 border border-dark-700 rounded shadow-lg text-[10px] text-dark-300 w-max max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                                {creator.responseLikelihood.description}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-dark-700"></div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Match Score */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-dark-500">Match Score</span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowExplanation(showExplanation === creator._id ? null : creator._id);
                                                                }}
                                                                className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 flex items-center gap-1 transition-colors relative z-10"
                                                            >
                                                                <HiSparkles className="text-[10px]" />
                                                                Why?
                                                            </button>
                                                            <span className="font-semibold text-purple-400">
                                                                {creator.matchScore}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                            style={{ width: `${creator.matchScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Explainability Panel */}
                                            <AnimatePresence>
                                                {showExplanation === creator._id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="overflow-hidden cursor-default w-full"
                                                    >
                                                        <div className="bg-dark-800 rounded-xl p-3 border border-purple-500/20 relative">
                                                            <div className="flex gap-2 mb-2">
                                                                <FaRobot className="text-purple-400 mt-0.5" />
                                                                <div>
                                                                    <h5 className="text-xs font-bold text-dark-200">AI Logic</h5>
                                                                    <p className="text-[10px] text-dark-400">Why {creator.name} is a match:</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {creator.reasons?.map((reason, i) => (
                                                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-dark-300 bg-dark-900/50 p-1.5 rounded">
                                                                        <FaCheckCircle className="text-emerald-500/50 mt-0.5 flex-shrink-0" />
                                                                        <span dangerouslySetInnerHTML={{ __html: reason }} />
                                                                    </div>
                                                                ))}
                                                                {(!creator.reasons || creator.reasons.length === 0) && (
                                                                    <div className="text-[11px] text-dark-400 italic px-1">
                                                                        High audience alignment and engagement overlap.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Reasons */}
                                    <div className="flex flex-wrap gap-2">
                                        {creator.reasons?.slice(0, 3).map((reason, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs"
                                                dangerouslySetInnerHTML={{ __html: reason.replace(/<[^>]+>/g, '') }}
                                            />
                                        ))}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-dark-100 mb-1">
                                            ₹{(creator.pricing?.min || 0).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-dark-500">
                                            Estimated cost
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ))}
            </div>

            {!hasRecommendations && (
                <div className="text-center py-12">
                    <HiSparkles className="text-6xl text-dark-700 mx-auto mb-4" />
                    <p className="text-dark-400">No recommendations yet</p>
                    <p className="text-sm text-dark-500 mt-2">
                        Add more details to your campaign for better matches
                    </p>
                </div>
            )}
        </div>
    );
};

export default SmartRecommendationsPanel;
