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
                className="relative overflow-hidden rounded-premium-2xl bg-dark-800/40 backdrop-blur-xl border border-dark-700/50 p-s8 shadow-inner"
            >
                {/* Decorative gradient orbs */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-s6 rounded-premium-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center shadow-glow border border-white/10">
                        <FaUserPlus className="text-4xl text-primary-400" />
                    </div>
                    <h3 className="text-h2 font-black text-dark-100 mb-s2 uppercase tracking-tight">No Pending Applications</h3>
                    <p className="text-body font-bold text-dark-500 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
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
            className="relative overflow-hidden rounded-premium-2xl bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 shadow-premium"
        >
            {/* Header with gradient accent */}
            <div className="relative p-s6 border-b border-dark-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5"></div>
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-s4">
                        <div className="p-s3 rounded-premium-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-glow border border-amber-500/20">
                            <HiFire className="text-2xl text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-h3 font-black text-dark-100 uppercase tracking-tight">Hot Applications</h3>
                            <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-widest">Creators waiting for your response</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="px-s4 py-s2 rounded-premium-full bg-amber-500/10 border border-amber-500/30 shadow-glow"
                    >
                        <span className="text-xs-pure font-black text-amber-400 uppercase tracking-widest">{localCreators.length} Applications</span>
                    </motion.div>
                </div>
            </div>

            {/* Creator Cards Grid */}
            <div className="p-s6 bg-dark-900/20">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-s5">
                    <AnimatePresence>
                        {localCreators.map((creator, index) => (
                            <motion.div
                                key={`${creator.requestId}-${creator.creatorId}`}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -100 }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                className="group relative overflow-hidden rounded-premium-2xl bg-dark-800/40 backdrop-blur-sm border-2 border-dark-700/50 hover:border-primary-500/40 transition-all duration-300 hover:shadow-premium"
                            >
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all duration-300"></div>

                                {/* Content */}
                                <div className="relative p-s5">
                                    {/* Creator Header */}
                                    <div className="flex items-start gap-s4 mb-s4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-premium-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg border border-white/20">
                                                <span className="text-white font-black text-2xl drop-shadow-md">
                                                    {creator.creatorName?.charAt(0).toUpperCase() || 'C'}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-900 border-2 border-dark-800 flex items-center justify-center shadow-glow">
                                                <FaInstagram className="text-pink-400 text-[10px]" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-body font-black text-dark-100 truncate uppercase tracking-tight">{creator.creatorName}</h4>
                                            <div className="flex items-center gap-s2 mt-s1">
                                                <span className="text-xs-pure text-pink-400 font-bold uppercase tracking-widest leading-none">
                                                    {(creator.followerCount || 0).toLocaleString()} followers
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campaign Badge */}
                                    <div className="mb-s4 p-s4 rounded-premium-xl bg-dark-900/60 border border-dark-700/50 shadow-inner">
                                        <div className="flex items-center justify-between mb-s2">
                                            <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Campaign</span>
                                            <span className="px-s2.5 py-0.5 text-[10px] font-black rounded-premium-full bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase tracking-widest">
                                                {creator.promotionType || 'Promo'}
                                            </span>
                                        </div>
                                        <p className="text-xs-pure font-bold text-dark-200 truncate uppercase tracking-tight mb-s1">{creator.requestTitle}</p>
                                        <p className="text-h3 font-black text-emerald-400">₹{creator.budget?.toLocaleString()}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-s2">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAccept(creator.requestId, creator.creatorId)}
                                            className="flex-1 py-s3 px-s4 rounded-premium-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs-pure font-black uppercase tracking-widest shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-s2"
                                        >
                                            <FaCheck className="text-xs" /> Accept
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onMessage(creator.requestId, creator.creatorId, creator.creatorName)}
                                            className="p-s3 rounded-premium-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all shadow-sm"
                                        >
                                            <FaComments className="text-lg" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleReject(creator.requestId, creator.creatorId)}
                                            className="p-s3 rounded-premium-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all shadow-sm"
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
