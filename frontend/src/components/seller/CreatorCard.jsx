import { motion } from 'framer-motion';
import { FaInstagram, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiUserGroup } from 'react-icons/hi';

const CreatorCard = ({ creator, matchScore, matchReason, status, onAccept, onReject }) => {
    const profile = creator.creatorId || creator;
    const user = profile.userId || {};

    const getScoreColor = (score) => {
        if (score >= 80) return 'from-emerald-500 to-emerald-400';
        if (score >= 60) return 'from-amber-500 to-amber-400';
        return 'from-red-500 to-red-400';
    };

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count;
    };

    return (
        <motion.div
            className="glass-card p-6 card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg mr-3">
                        {user.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                        <h3 className="font-semibold text-dark-100">{user.name || 'Creator'}</h3>
                        <div className="flex items-center text-sm text-dark-400">
                            <FaInstagram className="mr-1 text-primary-400" />
                            @{profile.instagramUsername}
                        </div>
                    </div>
                </div>

                {/* Match Score */}
                <div className="text-center">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getScoreColor(matchScore)} p-0.5`}>
                        <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center">
                            <span className="text-lg font-bold text-dark-100">{matchScore}</span>
                        </div>
                    </div>
                    <span className="text-xs text-dark-400 mt-1">Match</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                    <HiUserGroup className="mx-auto text-primary-400 mb-1" />
                    <span className="text-dark-100 font-semibold">{formatFollowers(profile.followerCount)}</span>
                    <p className="text-xs text-dark-400">Followers</p>
                </div>
                <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                    <HiLightningBolt className="mx-auto text-amber-400 mb-1" />
                    <span className="text-dark-100 font-semibold">{profile.engagementRate}%</span>
                    <p className="text-xs text-dark-400">Engagement</p>
                </div>
                <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                    <HiSparkles className="mx-auto text-secondary-400 mb-1" />
                    <span className="text-dark-100 font-semibold">{profile.insights?.score || 0}</span>
                    <p className="text-xs text-dark-400">AI Score</p>
                </div>
            </div>

            {/* Insights Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge badge-info">{profile.category}</span>
                {profile.insights?.engagementQuality && (
                    <span className={`badge ${profile.insights.engagementQuality === 'High' ? 'badge-success' :
                            profile.insights.engagementQuality === 'Medium' ? 'badge-warning' : 'badge-danger'
                        }`}>
                        {profile.insights.engagementQuality} Engagement
                    </span>
                )}
                <span className="badge badge-neutral">
                    ${profile.priceRange?.min} - ${profile.priceRange?.max}
                </span>
            </div>

            {/* Match Reason */}
            {matchReason && (
                <div className="flex items-start p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl mb-4">
                    <FaInfoCircle className="text-primary-400 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-dark-300">{matchReason}</p>
                </div>
            )}

            {/* Promotion Types */}
            <div className="flex flex-wrap gap-1 mb-4">
                {profile.promotionTypes?.map(type => (
                    <span key={type} className="text-xs px-2 py-1 bg-dark-700 text-dark-300 rounded">
                        {type}
                    </span>
                ))}
            </div>

            {/* Actions */}
            {status === 'Applied' ? (
                <div className="flex gap-3">
                    <button
                        onClick={onAccept}
                        className="flex-1 btn-3d py-3 flex items-center justify-center"
                    >
                        <FaCheck className="mr-2" />
                        Accept
                    </button>
                    <button
                        onClick={onReject}
                        className="flex-1 btn-secondary py-3 flex items-center justify-center text-red-400 hover:text-red-300"
                    >
                        <FaTimes className="mr-2" />
                        Reject
                    </button>
                </div>
            ) : status === 'Accepted' ? (
                <div className="badge badge-success w-full justify-center py-3">
                    <FaCheck className="mr-2" />
                    Accepted
                </div>
            ) : status === 'Rejected' ? (
                <div className="badge badge-danger w-full justify-center py-3">
                    <FaTimes className="mr-2" />
                    Rejected
                </div>
            ) : (
                <div className="badge badge-neutral w-full justify-center py-3">
                    Awaiting Application
                </div>
            )}
        </motion.div>
    );
};

export default CreatorCard;
