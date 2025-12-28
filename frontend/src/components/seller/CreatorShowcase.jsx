import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaComments, FaCheck, FaTimes, FaUserPlus, FaHeart } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiFire } from 'react-icons/hi';

const CreatorShowcase = ({ requests, onAccept, onReject, onMessage }) => {
    const [processedCreators, setProcessedCreators] = useState(new Set());
    const [localCreators, setLocalCreators] = useState([]);

    // Get all matched creators with pending status
    useEffect(() => {
        const creators = [];
        requests.forEach(request => {
            request.matchedCreators?.forEach(creator => {
                if (creator.status === 'Applied' && !processedCreators.has(`${request._id}-${creator.creatorId}`)) {
                    creators.push({
                        ...creator,
                        requestId: request._id,
                        requestTitle: request.title,
                        budget: request.budget,
                        promotionType: request.promotionType
                    });
                }
            });
        });
        setLocalCreators(creators.slice(0, 6));
    }, [requests, processedCreators]);

    const handleAccept = async (requestId, creatorId) => {
        // Immediately remove from UI
        setProcessedCreators(prev => new Set([...prev, `${requestId}-${creatorId}`]));
        setLocalCreators(prev => prev.filter(c => !(c.requestId === requestId && c.creatorId === creatorId)));
        // Call parent handler
        await onAccept(requestId, creatorId);
    };

    const handleReject = async (requestId, creatorId) => {
        // Immediately remove from UI
        setProcessedCreators(prev => new Set([...prev, `${requestId}-${creatorId}`]));
        setLocalCreators(prev => prev.filter(c => !(c.requestId === requestId && c.creatorId === creatorId)));
        // Call parent handler
        await onReject(requestId, creatorId);
    };

    if (localCreators.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800/80 to-dark-900/80 backdrop-blur-xl border border-dark-700/50 p-8"
            >
                {/* Decorative gradient orbs */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                        <FaUserPlus className="text-3xl text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-dark-100 mb-2">No Pending Applications</h3>
                    <p className="text-dark-400 max-w-sm mx-auto">
                        Create a campaign to start receiving applications from talented creators
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800/60 to-dark-900/60 backdrop-blur-xl border border-dark-700/50"
        >
            {/* Header with gradient accent */}
            <div className="relative p-6 border-b border-dark-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5"></div>
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <HiFire className="text-xl text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-dark-100">Hot Applications</h3>
                            <p className="text-sm text-dark-400">Creators waiting for your response</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                    >
                        <span className="text-sm font-semibold text-amber-400">{localCreators.length} pending</span>
                    </motion.div>
                </div>
            </div>

            {/* Creator Cards Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {localCreators.map((creator, index) => (
                            <motion.div
                                key={`${creator.requestId}-${creator.creatorId}`}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -100 }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 to-dark-850 border border-dark-700/50 hover:border-primary-500/40 transition-all duration-300"
                            >
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all duration-300"></div>

                                {/* Content */}
                                <div className="relative p-5">
                                    {/* Creator Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                                <span className="text-white font-bold text-xl">
                                                    {creator.creatorName?.charAt(0).toUpperCase() || 'C'}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-dark-800 flex items-center justify-center">
                                                <FaInstagram className="text-white text-xs" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-dark-100 truncate text-lg">{creator.creatorName}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-pink-400 font-medium">
                                                    {(creator.followerCount || 0).toLocaleString()} followers
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campaign Badge */}
                                    <div className="mb-4 p-3 rounded-xl bg-dark-900/60 border border-dark-700/50">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-dark-400 uppercase tracking-wider">Campaign</span>
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500/20 text-primary-400">
                                                {creator.promotionType || 'Promo'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-dark-200 truncate">{creator.requestTitle}</p>
                                        <p className="text-lg font-bold text-emerald-400 mt-1">₹{creator.budget?.toLocaleString()}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleAccept(creator.requestId, creator.creatorId)}
                                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaCheck /> Accept
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onMessage(creator.requestId, creator.creatorId, creator.creatorName)}
                                            className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                                        >
                                            <FaComments className="text-lg" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleReject(creator.requestId, creator.creatorId)}
                                            className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                                        >
                                            <FaTimes className="text-lg" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default CreatorShowcase;
