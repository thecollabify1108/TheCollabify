import { motion } from 'framer-motion';
import { FaInstagram, FaComments, FaCheck, FaTimes, FaStar, FaUsers } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const CreatorShowcase = ({ requests, onAccept, onReject, onMessage }) => {
    // Get all matched creators with pending status
    const getInterestedCreators = () => {
        const creators = [];

        requests.forEach(request => {
            request.matchedCreators?.forEach(creator => {
                if (creator.status === 'Applied') {
                    creators.push({
                        ...creator,
                        requestId: request._id,
                        requestTitle: request.title,
                        budget: request.budget
                    });
                }
            });
        });

        return creators.slice(0, 6);
    };

    const creators = getInterestedCreators();

    if (creators.length === 0) {
        return (
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-dark-100">Interested Creators</h3>
                    <HiSparkles className="text-secondary-400" />
                </div>
                <div className="text-center py-8">
                    <FaUsers className="text-4xl text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-400">No pending applications</p>
                    <p className="text-sm text-dark-500">Create a campaign to get creator matches</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-100">Interested Creators</h3>
                <span className="text-sm text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full">
                    {creators.length} pending
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creators.map((creator, index) => (
                    <motion.div
                        key={`${creator.requestId}-${creator.creatorId}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 hover:border-primary-500/30 transition-all"
                    >
                        {/* Creator Info */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {creator.creatorName?.charAt(0) || 'C'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-dark-100 truncate">{creator.creatorName}</p>
                                <div className="flex items-center gap-2 text-xs text-dark-400">
                                    <FaInstagram className="text-pink-400" />
                                    <span>{creator.followerCount?.toLocaleString() || '0'} followers</span>
                                </div>
                            </div>
                        </div>

                        {/* Campaign Info */}
                        <div className="bg-dark-900/50 rounded-lg p-2 mb-3">
                            <p className="text-xs text-dark-400">Applied to:</p>
                            <p className="text-sm text-dark-200 truncate">{creator.requestTitle}</p>
                            <p className="text-xs text-primary-400">₹{creator.budget}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onAccept(creator.requestId, creator.creatorId)}
                                className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1 text-sm"
                            >
                                <FaCheck /> Accept
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onMessage(creator.requestId, creator.creatorId, creator.creatorName)}
                                className="py-2 px-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                            >
                                <FaComments />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onReject(creator.requestId, creator.creatorId)}
                                className="py-2 px-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                            >
                                <FaTimes />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CreatorShowcase;
