import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft, FaStar, FaInstagram, FaEnvelope, FaTimes,
    FaMapMarkerAlt, FaLanguage, FaCheckCircle, FaHeart
} from 'react-icons/fa';
import {
    HiSparkles, HiLightningBolt, HiUserGroup, HiCash, HiChat,
    HiPhotograph, HiChartBar, HiStar
} from 'react-icons/hi';
import EmptyState from '../common/EmptyState';

/**
 * Full-Screen Creator Profile Modal
 * Shows detailed creator information with tabbed navigation
 */
const CreatorProfileModal = ({ creator, matchScore, isOpen, onClose, onMessage, onInvite }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaved, setIsSaved] = useState(false);

    if (!isOpen || !creator) return null;

    const profile = creator.creatorId || creator;
    const user = profile.userId || {};

    const tabs = [
        { id: 'overview', label: 'Overview', icon: HiSparkles },
        { id: 'portfolio', label: 'Portfolio', icon: HiPhotograph },
        { id: 'analytics', label: 'Analytics', icon: HiChartBar },
        { id: 'reviews', label: 'Reviews', icon: HiStar }
    ];

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'from-emerald-500 to-emerald-400';
        if (score >= 60) return 'from-amber-500 to-amber-400';
        return 'from-red-500 to-red-400';
    };

    const handleSaveToggle = async () => {
        setIsSaved(!isSaved);
        // Future: API call to save/unsave creator will be implemented
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 md:inset-4 z-50 flex items-center justify-center p-0 md:p-4"
                    >
                        <div className="bg-dark-900 w-full h-full md:h-auto md:max-w-4xl md:rounded-premium-2xl overflow-hidden shadow-premium flex flex-col max-h-screen md:max-h-[90vh] border border-dark-700/50">
                            {/* Header */}
                            <div className="bg-dark-800/80 backdrop-blur-xl border-b border-dark-700/50 p-s4 md:p-s6">
                                <div className="flex items-center justify-between mb-s4">
                                    <button
                                        onClick={onClose}
                                        className="p-s2 hover:bg-dark-700 rounded-premium-lg transition-colors border border-transparent hover:border-dark-600/30"
                                    >
                                        <FaArrowLeft className="text-dark-300" />
                                    </button>
                                    <h2 className="text-body font-black text-dark-100 flex-1 text-center uppercase tracking-widest leading-none">
                                        Creator Profile
                                    </h2>
                                    <button
                                        onClick={handleSaveToggle}
                                        className={`p-s2 hover:bg-dark-700 rounded-premium-lg transition-colors border border-transparent hover:border-dark-600/30 ${isSaved ? 'text-red-400' : 'text-dark-400'
                                            }`}
                                    >
                                        {isSaved ? <FaHeart className="fill-current" /> : <FaStar />}
                                    </button>
                                </div>

                                {/* Creator Info */}
                                <div className="flex items-start gap-s4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-glow border-2 border-white/20">
                                        {user.name?.charAt(0).toUpperCase() || 'C'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-h3 font-black text-dark-100 flex items-center gap-s2 tracking-tight">
                                            {user.name || 'Creator'}
                                            {profile.instagramVerified && (
                                                <FaCheckCircle className="text-primary-400 text-sm shadow-sm" />
                                            )}
                                        </h3>
                                        <span className="inline-block mt-s1 px-s2 py-0.5 rounded-premium-md bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-wider border border-primary-500/20">
                                            {profile.category} Creator
                                        </span>
                                    </div>

                                    {/* Match Score */}
                                    <div className="text-center hidden md:block">
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(matchScore)} p-0.5 shadow-glow`}>
                                            <div className="w-full h-full rounded-full bg-dark-800 flex flex-col items-center justify-center">
                                                <span className="text-h3 font-black text-dark-100 leading-none">{matchScore}</span>
                                                <span className="text-[10px] font-black text-dark-500 uppercase tracking-tighter">Match</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-s3 mt-s4">
                                    <div className="bg-dark-900/50 rounded-premium-xl p-s3 text-center border border-dark-700/30">
                                        <HiUserGroup className="mx-auto text-primary-400 mb-1 text-xl" />
                                        <p className="text-h3 font-black text-dark-100">{formatFollowers(profile.followerCount)}</p>
                                        <p className="text-xs-pure font-black text-dark-500 uppercase tracking-widest mt-0.5">Followers</p>
                                    </div>
                                    <div className="bg-dark-900/50 rounded-premium-xl p-s3 text-center border border-dark-700/30">
                                        <HiLightningBolt className="mx-auto text-amber-400 mb-1 text-xl" />
                                        <p className="text-h3 font-black text-dark-100">{profile.engagementRate}%</p>
                                        <p className="text-xs-pure font-black text-dark-500 uppercase tracking-widest mt-0.5">Engagement</p>
                                    </div>
                                    <div className="bg-dark-900/50 rounded-premium-xl p-s3 text-center border border-dark-700/30">
                                        <HiSparkles className="mx-auto text-secondary-400 mb-1 text-xl" />
                                        <p className="text-h3 font-black text-dark-100">{profile.insights?.score || 0}</p>
                                        <p className="text-xs-pure font-black text-dark-500 uppercase tracking-widest mt-0.5">AI Score</p>
                                    </div>
                                </div>

                                {/* CTAs */}
                                <div className="flex gap-s3 mt-s4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onMessage?.(creator)}
                                        className="flex-1 py-s3 flex items-center justify-center gap-s2 rounded-premium-xl bg-dark-700/50 text-dark-100 font-black text-xs-pure uppercase tracking-widest border border-dark-600/30 hover:bg-dark-700 transition-all hover:shadow-premium"
                                    >
                                        <HiChat className="text-lg" />
                                        <span>Message</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onInvite?.(creator)}
                                        className="flex-1 py-s3 flex items-center justify-center gap-s2 rounded-premium-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-black text-xs-pure uppercase tracking-widest shadow-glow hover:shadow-glow-lg transition-all"
                                    >
                                        <FaEnvelope className="text-sm" />
                                        <span>Invite to Campaign</span>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="bg-dark-800/80 backdrop-blur-md border-b border-dark-700/50 overflow-x-auto">
                                <div className="flex px-s4">
                                    {tabs.map(tab => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 px-s4 py-s3.5 flex items-center justify-center gap-s2 whitespace-nowrap transition-all relative ${activeTab === tab.id
                                                    ? 'text-primary-400'
                                                    : 'text-dark-500 hover:text-dark-200'
                                                    }`}
                                            >
                                                <Icon className="text-lg" />
                                                <span className="hidden sm:inline text-xs-pure font-black uppercase tracking-widest">{tab.label}</span>
                                                {activeTab === tab.id && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 shadow-glow"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-s4 md:p-s6 scrollbar-thin">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {activeTab === 'overview' && <OverviewTab profile={profile} user={user} />}
                                        {activeTab === 'portfolio' && <PortfolioTab profile={profile} />}
                                        {activeTab === 'analytics' && <AnalyticsTab profile={profile} />}
                                        {activeTab === 'reviews' && <ReviewsTab profile={profile} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Overview Tab Component
const OverviewTab = ({ profile, user }) => (
    <div className="space-y-s6">
        {/* Bio */}
        <div className="bg-dark-800/40 backdrop-blur-sm p-s6 rounded-premium-2xl border border-dark-700/30 shadow-inner">
            <h4 className="text-xs-pure font-black text-dark-100 mb-s3 flex items-center gap-s2 uppercase tracking-widest">
                <HiSparkles className="text-primary-400 text-lg" />
                About
            </h4>
            <p className="text-dark-400 text-small leading-relaxed font-medium">
                {profile.bio || 'No bio available yet. This creator is building an amazing presence on Instagram!'}
            </p>
        </div>

        {/* Detailed Stats */}
        <div>
            <h4 className="text-xs-pure font-black text-dark-500 mb-s4 uppercase tracking-widest">Detailed Statistics</h4>
            <div className="grid grid-cols-2 gap-s4">
                <div className="bg-dark-800/40 backdrop-blur-sm rounded-premium-xl p-s5 border border-dark-700/30 shadow-md">
                    <p className="text-[10px] font-black text-dark-400 mb-s2 uppercase tracking-widest leading-none">Engagement Quality</p>
                    <div className="flex items-center gap-s2">
                        <span className={`px-s2 py-0.5 rounded-premium-md text-[10px] font-black uppercase tracking-wider ${profile.insights?.engagementQuality === 'High' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            profile.insights?.engagementQuality === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {profile.insights?.engagementQuality || 'Unknown'}
                        </span>
                    </div>
                </div>
                <div className="bg-dark-800/40 backdrop-blur-sm rounded-premium-xl p-s5 border border-dark-700/30 shadow-md">
                    <p className="text-[10px] font-black text-dark-400 mb-s2 uppercase tracking-widest leading-none">Est. Price Range</p>
                    <p className="text-h3 font-black text-dark-100 uppercase tracking-tight">
                        ₹{profile.priceRange?.min?.toLocaleString()} - ₹{profile.priceRange?.max?.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>

        {/* Content Specialties */}
        <div>
            <h4 className="text-xs-pure font-black text-dark-500 mb-s4 uppercase tracking-widest">Content Specialties</h4>
            <div className="flex flex-wrap gap-s2">
                {profile.promotionTypes?.map(type => (
                    <span key={type} className="px-s4 py-1.5 rounded-premium-full bg-dark-900/60 text-dark-300 text-[10px] font-black uppercase tracking-widest border border-dark-700/50 shadow-sm">
                        {type}
                    </span>
                ))}
            </div>
        </div>

        {/* Location & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-s4">
            <div className="bg-dark-800/40 backdrop-blur-sm rounded-premium-xl p-s5 border border-dark-700/30 shadow-md">
                <div className="flex items-center gap-s2 mb-s2">
                    <FaMapMarkerAlt className="text-primary-400" />
                    <h5 className="text-[10px] font-black text-dark-500 uppercase tracking-widest leading-none">Location</h5>
                </div>
                <p className="text-body font-black text-dark-200 uppercase tracking-tight">{profile.location || 'India'}</p>
            </div>
            <div className="bg-dark-800/40 backdrop-blur-sm rounded-premium-xl p-s5 border border-dark-700/30 shadow-md">
                <div className="flex items-center gap-s2 mb-s2">
                    <FaLanguage className="text-secondary-400" />
                    <h5 className="text-[10px] font-black text-dark-500 uppercase tracking-widest leading-none">Languages</h5>
                </div>
                <p className="text-body font-black text-dark-200 uppercase tracking-tight">{profile.languages?.join(', ') || 'English, Hindi'}</p>
            </div>
        </div>
    </div>
);

// Portfolio Tab Component
const PortfolioTab = ({ profile }) => (
    <div className="space-y-s6">
        <div className="bg-dark-800/40 backdrop-blur-sm p-s8 rounded-premium-2xl border border-dark-700/30 text-center shadow-inner">
            <HiPhotograph className="mx-auto text-dark-600 text-5xl mb-s4 opacity-50" />
            <h4 className="text-body font-black text-dark-200 mb-s2 uppercase tracking-widest">Portfolio Coming Soon</h4>
            <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-widest">
                Connecting Instagram insights to showcase top-performing content.
            </p>
        </div>
        {/* Instagram feed grid - Coming soon placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-s4">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-dark-800/40 backdrop-blur-sm rounded-premium-2xl flex items-center justify-center border border-dark-700/30 group cursor-not-allowed hover:bg-dark-800/60 transition-all">
                    <HiPhotograph className="text-dark-600 text-3xl group-hover:scale-110 transition-transform opacity-30" />
                </div>
            ))}
        </div>
    </div>
);

// Analytics Tab Component
const AnalyticsTab = ({ profile }) => (
    <div className="space-y-6">
        <div className="bg-dark-800/50 rounded-xl p-6 text-center">
            <HiChartBar className="mx-auto text-primary-400 text-5xl mb-4" />
            <h4 className="text-lg font-semibold text-dark-100 mb-2">Detailed Analytics</h4>
            <p className="text-sm text-dark-400">
                Unlock detailed audience demographics, growth trends, and engagement patterns.
            </p>
            <button className="btn-3d mt-4 px-6 py-2">
                Upgrade to Pro
            </button>
        </div>
    </div>
);

// Reviews Tab Component
const ReviewsTab = ({ profile }) => (
    <div className="space-y-4">
        <EmptyState
            icon="heart-broken"
            title="No Reviews Yet"
            description="This creator hasn't received any feedback from brands yet. Be the first to collaborate and leave a review!"
            variant="default"
            className="border-none bg-transparent py-4"
        />
    </div>
);

export default CreatorProfileModal;
