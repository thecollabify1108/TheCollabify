import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaStar, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { calculateMatchScore, getAutomatedRecommendations, getSmartSuggestions } from '../../services/automatedMatching';
import toast from 'react-hot-toast';

/**
 * Smart Recommendations Panel
 * AI-powered creator recommendations for campaigns
 */
const SmartRecommendationsPanel = ({ campaign, allCreators, onInvite }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCreators, setSelectedCreators] = useState([]);

    useEffect(() => {
        if (campaign && allCreators) {
            loadRecommendations();
        }
    }, [campaign, allCreators]);

    const loadRecommendations = () => {
        setLoading(true);
        setTimeout(() => {
            const recs = getAutomatedRecommendations(campaign, allCreators, 10);
            setRecommendations(recs);
            setLoading(false);
        }, 1000);
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

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <FaRobot className="text-2xl text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-dark-100">AI Recommendations</h3>
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
            <div className="space-y-3">
                {recommendations.map((creator, index) => (
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
                                </div>

                                {/* Match Score */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-dark-500">Match Score</span>
                                            <span className="font-semibold text-purple-400">
                                                {creator.matchScore}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                style={{ width: `${creator.matchScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Reasons */}
                                <div className="flex flex-wrap gap-2">
                                    {creator.reasons?.slice(0, 3).map((reason, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs"
                                        >
                                            {reason}
                                        </span>
                                    ))}
                                </div>
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
                        </div>
                    </motion.div>
                ))}
            </div>

            {recommendations.length === 0 && (
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
