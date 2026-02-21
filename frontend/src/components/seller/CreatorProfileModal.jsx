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
                        <div className="bg-dark-900 w-full h-full md:h-auto md:max-w-4xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-screen md:max-h-[90vh]">
                            {/* Header */}
                            <div className="bg-dark-800 border-b border-dark-700 p-4 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                                    >
                                        <FaArrowLeft className="text-dark-300" />
                                    </button>
                                    <h2 className="text-lg md:text-xl font-bold text-dark-100 flex-1 text-center">
                                        Creator Profile
                                    </h2>
                                    <button
                                        onClick={handleSaveToggle}
                                        className={`p-2 hover:bg-dark-700 rounded-lg transition-colors ${isSaved ? 'text-red-400' : 'text-dark-400'
                                            }`}
                                    >
                                        {isSaved ? <FaHeart className="fill-current" /> : <FaStar />}
                                    </button>
                                </div>

                                {/* Creator Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                        {user.name?.charAt(0).toUpperCase() || 'C'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                                            {user.name || 'Creator'}
                                            {profile.instagramVerified && (
                                                <FaCheckCircle className="text-primary-400 text-sm" />
                                            )}
                                        </h3>
                                        <span className="badge badge-info text-xs">
                                            {profile.category} Creator
                                        </span>
                                    </div>

                                    {/* Match Score */}
                                    <div className="text-center hidden md:block">
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(matchScore)} p-0.5`}>
                                            <div className="w-full h-full rounded-full bg-dark-800 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold text-dark-100">{matchScore}</span>
                                                <span className="text-xs text-dark-400">Match</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="bg-dark-900/50 rounded-xl p-3 text-center">
                                        <HiUserGroup className="mx-auto text-primary-400 mb-1 text-xl" />
                                        <p className="text-lg font-bold text-dark-100">{formatFollowers(profile.followerCount)}</p>
                                        <p className="text-xs text-dark-400">Followers</p>
                                    </div>
                                    <div className="bg-dark-900/50 rounded-xl p-3 text-center">
                                        <HiLightningBolt className="mx-auto text-amber-400 mb-1 text-xl" />
                                        <p className="text-lg font-bold text-dark-100">{profile.engagementRate}%</p>
                                        <p className="text-xs text-dark-400">Engagement</p>
                                    </div>
                                    <div className="bg-dark-900/50 rounded-xl p-3 text-center">
                                        <HiSparkles className="mx-auto text-secondary-400 mb-1 text-xl" />
                                        <p className="text-lg font-bold text-dark-100">{profile.insights?.score || 0}</p>
                                        <p className="text-xs text-dark-400">AI Score</p>
                                    </div>
                                </div>

                                {/* CTAs */}
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => onMessage?.(creator)}
                                        className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
                                    >
                                        <HiChat />
                                        <span>Message</span>
                                    </button>
                                    <button
                                        onClick={() => onInvite?.(creator)}
                                        className="flex-1 btn-3d py-3 flex items-center justify-center gap-2"
                                    >
                                        <FaEnvelope />
                                        <span>Invite to Campaign</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="bg-dark-800 border-b border-dark-700 overflow-x-auto">
                                <div className="flex">
                                    {tabs.map(tab => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 whitespace-nowrap transition-colors relative ${activeTab === tab.id
                                                    ? 'text-primary-400'
                                                    : 'text-dark-400 hover:text-dark-200'
                                                    }`}
                                            >
                                                <Icon className="text-lg" />
                                                <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
                                                {activeTab === tab.id && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
    <div className="space-y-6">
        {/* Bio */}
        <div>
            <h4 className="text-sm font-semibold text-dark-100 mb-2 flex items-center gap-2">
                <HiSparkles className="text-primary-400" />
                About
            </h4>
            <p className="text-dark-300 text-sm leading-relaxed">
                {profile.bio || 'No bio available yet. This creator is building an amazing presence on Instagram!'}
            </p>
        </div>

        {/* Detailed Stats */}
        <div>
            <h4 className="text-sm font-semibold text-dark-100 mb-3">Detailed Statistics</h4>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-800/50 rounded-xl p-4">
                    <p className="text-xs text-dark-400 mb-1">Engagement Quality</p>
                    <span className={`badge ${profile.insights?.engagementQuality === 'High' ? 'badge-success' :
                        profile.insights?.engagementQuality === 'Medium' ? 'badge-warning' : 'badge-danger'
                        }`}>
                        {profile.insights?.engagementQuality || 'Unknown'}
                    </span>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4">
                    <p className="text-xs text-dark-400 mb-1">Price Range</p>
                    <p className="text-sm font-semibold text-dark-100">
                        ${profile.priceRange?.min} - ${profile.priceRange?.max}
                    </p>
                </div>
            </div>
        </div>

        {/* Content Specialties */}
        <div>
            <h4 className="text-sm font-semibold text-dark-100 mb-3">Content Specialties</h4>
            <div className="flex flex-wrap gap-2">
                {profile.promotionTypes?.map(type => (
                    <span key={type} className="badge badge-neutral">
                        {type}
                    </span>
                ))}
            </div>
        </div>

        {/* Location & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-dark-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-primary-400" />
                    <h5 className="text-sm font-semibold text-dark-100">Location</h5>
                </div>
                <p className="text-sm text-dark-300">{profile.location || 'India'}</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <FaLanguage className="text-secondary-400" />
                    <h5 className="text-sm font-semibold text-dark-100">Languages</h5>
                </div>
                <p className="text-sm text-dark-300">{profile.languages?.join(', ') || 'English, Hindi'}</p>
            </div>
        </div>
    </div>
);

// Portfolio Tab Component
const PortfolioTab = ({ profile }) => (
    <div className="space-y-4">
        <p className="text-sm text-dark-400 text-center py-8">
            Portfolio integration coming soon! Connect your Instagram to showcase your best work.
        </p>
        {/* Instagram feed grid - Coming soon */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-dark-800/50 rounded-xl flex items-center justify-center">
                    <HiPhotograph className="text-dark-600 text-4xl" />
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
