import { motion } from 'framer-motion';
import { FaInstagram, FaCheck, FaTimes, FaInfoCircle, FaComments } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiUserGroup } from 'react-icons/hi';
import MatchExplanation from '../common/MatchExplanation';

const CreatorCard = ({ creator, matchScore, matchReason, status, onAccept, onReject, onMessage, viewMode, onViewProfile, children }) => {
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
            className="p-s6 rounded-premium-2xl bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 shadow-premium hover:shadow-glow transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-s4">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black text-lg mr-s3 shadow-glow">
                        {user.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                        <h3 className="text-body font-bold text-dark-100">{user.name || 'Creator'}</h3>
                    </div>
                </div>

                {/* Match Score */}
                <div className="text-center">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getScoreColor(matchScore)} p-[2px] shadow-glow`}>
                        <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center">
                            <span className="text-lg font-black text-dark-100">{matchScore}</span>
                        </div>
                    </div>
                    <span className="text-xs-pure font-bold text-dark-400 mt-1 uppercase tracking-wider">Match</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-s3 mb-s4">
                <div className="text-center p-s3 bg-dark-900/40 rounded-premium-xl border border-dark-700/30">
                    <HiUserGroup className="mx-auto text-primary-400 mb-1" />
                    <span className="text-body font-bold text-dark-100">{formatFollowers(profile.followerCount)}</span>
                    <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-tighter">Followers</p>
                </div>
                <div className="text-center p-s3 bg-dark-900/40 rounded-premium-xl border border-dark-700/30">
                    <HiLightningBolt className="mx-auto text-amber-400 mb-1" />
                    <span className="text-body font-bold text-dark-100">{profile.engagementRate}%</span>
                    <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-tighter">Engage</p>
                </div>
                <div className="text-center p-s3 bg-dark-900/40 rounded-premium-xl border border-dark-700/30">
                    <HiSparkles className="mx-auto text-secondary-400 mb-1" />
                    <span className="text-body font-bold text-dark-100">{profile.insights?.score || 0}</span>
                    <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-tighter">AI Score</p>
                </div>
            </div>

            {/* Insights Badges */}
            <div className="flex flex-wrap gap-s2 mb-s4">
                <span className="px-s2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs-pure font-bold uppercase tracking-wider">{profile.category}</span>
                {profile.insights?.engagementQuality && (
                    <span className={`px-s2 py-1 rounded-full text-xs-pure font-bold uppercase tracking-wider border shadow-sm ${profile.insights.engagementQuality === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        profile.insights.engagementQuality === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {profile.insights.engagementQuality} Engage
                    </span>
                )}
                <span className="px-s2 py-1 rounded-full bg-dark-700/50 text-dark-300 border border-dark-600 text-xs-pure font-bold uppercase tracking-wider">
                    ₹{profile.priceRange?.min} - ₹{profile.priceRange?.max}
                </span>
            </div>

            {/* Match Reason */}
            {matchReason && (
                <div className="mb-s4">
                    <MatchExplanation explanation={matchReason} />
                </div>
            )}

            {/* Promotion Types */}
            <div className="flex flex-wrap gap-s1 mb-s4">
                {profile.promotionTypes?.map(type => (
                    <span key={type} className="text-xs-pure font-bold uppercase tracking-widest px-s2 py-1 bg-dark-900/60 border border-dark-700/50 text-dark-400 rounded-premium-sm">
                        {type}
                    </span>
                ))}
            </div>

            {/* Actions */}
            {status === 'Applied' ? (
                <div className="flex gap-s3">
                    <button
                        onClick={onAccept}
                        className="flex-1 py-s3 rounded-premium-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs-pure uppercase tracking-wider shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center"
                    >
                        <FaCheck className="mr-2" />
                        Accept
                    </button>
                    <button
                        onClick={onReject}
                        className="flex-1 py-s3 rounded-premium-xl bg-dark-700/50 border border-dark-600/50 text-red-400 hover:bg-red-400/10 font-bold text-xs-pure uppercase tracking-wider transition-all flex items-center justify-center shadow-premium"
                    >
                        <FaTimes className="mr-2" />
                        Reject
                    </button>
                </div>
            ) : status === 'Accepted' ? (
                <div className="space-y-s2">
                    <div className="w-full py-s3 rounded-premium-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs-pure uppercase tracking-widest flex items-center justify-center shadow-sm">
                        <FaCheck className="mr-2" />
                        Accepted
                    </div>
                    {onMessage && (
                        <button
                            onClick={onMessage}
                            className="w-full py-s3 rounded-premium-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-xs-pure uppercase tracking-wider shadow-glow flex items-center justify-center"
                        >
                            <FaComments className="mr-2" />
                            Message
                        </button>
                    )}
                </div>
            ) : status === 'Rejected' ? (
                <div className="w-full py-s3 rounded-premium-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs-pure uppercase tracking-widest flex items-center justify-center shadow-sm">
                    <FaTimes className="mr-2" />
                    Rejected
                </div>
            ) : viewMode === 'discovery' ? (
                <button
                    onClick={onViewProfile}
                    className="w-full py-s3 rounded-premium-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-xs-pure uppercase tracking-wider shadow-glow flex items-center justify-center group"
                >
                    <HiUserGroup className="mr-2 group-hover:scale-110 transition-transform" />
                    View Profile
                </button>
            ) : (
                <div className="w-full py-s3 rounded-premium-xl bg-dark-700/50 border border-dark-600 text-dark-400 font-bold text-xs-pure uppercase tracking-widest flex items-center justify-center shadow-sm">
                    Awaiting Application
                </div>
            )}
            {/* Extra Content (Children) */}
            {children}
        </motion.div>
    );
};

export default CreatorCard;
