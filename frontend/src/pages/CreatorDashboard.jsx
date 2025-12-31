import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaChartLine,
    FaBriefcase,
    FaCheck,
    FaTrophy,
    FaComments,
    FaCog,
    FaSignOutAlt,
    FaBell,
    FaArrowRight,
    FaFire
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiUserGroup } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { creatorAPI } from '../services/api';
import toast from 'react-hot-toast';

// Components
import NotificationBell from '../components/common/NotificationBell';
import ProfileForm from '../components/creator/ProfileForm';
import PromotionList from '../components/creator/PromotionList';
import ChatBox from '../components/common/ChatBox';
import ConversationList from '../components/common/ConversationList';
import SkeletonLoader from '../components/common/SkeletonLoader';
import OnboardingTour from '../components/common/OnboardingTour';
import CreatorAnalytics from '../components/creator/CreatorAnalytics';
import AIOpportunitySuggestions from '../components/creator/AIOpportunitySuggestions';
import ProfileProgress from '../components/creator/ProfileProgress';
import BadgeShowcase from '../components/creator/BadgeShowcase';

const CreatorDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'edit') {
            setActiveTab('settings');
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, promotionsRes, applicationsRes] = await Promise.allSettled([
                creatorAPI.getProfile(),
                creatorAPI.getPromotions(),
                creatorAPI.getApplications()
            ]);

            if (profileRes.status === 'fulfilled') {
                setProfile(profileRes.value.data.data.profile);
            } else if (profileRes.reason?.response?.status === 404) {
                setShowProfileForm(true);
            }

            if (promotionsRes.status === 'fulfilled') {
                setPromotions(promotionsRes.value.data.data.promotions);
            }

            if (applicationsRes.status === 'fulfilled') {
                setApplications(applicationsRes.value.data.data.applications);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSaved = () => {
        setShowProfileForm(false);
        fetchData();
        toast.success('Profile updated successfully!');
    };

    const handleApplyToPromotion = async (promotionId) => {
        try {
            await creatorAPI.applyToPromotion(promotionId);
            toast.success('Application submitted successfully!');
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Failed to apply');
        }
    };

    const handleToggleAvailability = async () => {
        try {
            const updatedProfile = await creatorAPI.updateProfile({
                isAvailable: !profile.isAvailable
            });
            setProfile(updatedProfile.data.data.profile);
            toast.success(`You are now ${!profile.isAvailable ? 'available' : 'unavailable'} for work`);
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    if (loading) {
        return <SkeletonLoader />;
    }

    const pendingApplications = applications.filter(a => a.applicationStatus === 'Pending').length;
    const completedCampaigns = profile?.successfulPromotions || 0;

    // Navigation items
    const navItems = [
        { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
        { id: 'opportunities', label: 'Opportunities', icon: <FaBriefcase />, badge: promotions.length },
        { id: 'applications', label: 'Applications', icon: <FaCheck />, badge: pendingApplications },
        { id: 'achievements', label: 'Achievements', icon: <FaTrophy /> },
        { id: 'messages', label: 'Messages', icon: <FaComments /> },
        { id: 'settings', label: 'Settings', icon: <FaCog /> }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
            <OnboardingTour role="creator" />

            {/* Top Navigation Bar */}
            <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img src="/star-logo.png" alt="Logo" className="w-8 h-8" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
                                TheCollabify
                            </span>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Availability Toggle */}
                            {profile && (
                                <button
                                    onClick={handleToggleAvailability}
                                    className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${profile.isAvailable
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                            : 'bg-dark-800 text-dark-400 border border-dark-700 hover:bg-dark-700'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${profile.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-dark-500'}`} />
                                    {profile.isAvailable ? 'Available' : 'Unavailable'}
                                </button>
                            )}

                            <NotificationBell />

                            {/* User Menu */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-800/50">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                                    {user?.name?.[0]}
                                </div>
                                <button onClick={logout} className="text-dark-400 hover:text-red-400 transition-colors" title="Logout">
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-dark-400">
                        {profile ? `Manage your creator profile and discover opportunities` : 'Complete your profile to get started'}
                    </p>
                </div>

                {/* Profile Setup */}
                {showProfileForm && !profile && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <ProfileForm onSave={handleProfileSaved} />
                    </motion.div>
                )}

                {profile && (
                    <>
                        {/* Tab Navigation */}
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === item.id
                                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                                            : 'bg-dark-800/50 text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary-500/20 text-primary-300 font-semibold">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <StatCard
                                                icon={<HiUserGroup className="text-blue-400" />}
                                                label="Followers"
                                                value={formatNumber(profile.followerCount)}
                                                subtitle={profile.category}
                                            />
                                            <StatCard
                                                icon={<HiLightningBolt className="text-amber-400" />}
                                                label="Engagement"
                                                value={`${profile.engagementRate}%`}
                                                subtitle="Average Rate"
                                            />
                                            <StatCard
                                                icon={<FaBriefcase className="text-emerald-400" />}
                                                label="Completed"
                                                value={completedCampaigns}
                                                subtitle="Campaigns"
                                            />
                                            <StatCard
                                                icon={<FaFire className="text-orange-400" />}
                                                label="Active"
                                                value={pendingApplications}
                                                subtitle="Applications"
                                            />
                                        </div>

                                        {/* Profile Progress */}
                                        <ProfileProgress profile={profile} onEditProfile={() => setActiveTab('settings')} />

                                        {/* Two Column Layout */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Analytics */}
                                            <div className="lg:col-span-2">
                                                <SectionCard title="Performance Analytics">
                                                    <CreatorAnalytics profile={profile} applications={applications} />
                                                </SectionCard>
                                            </div>

                                            {/* AI Suggestions */}
                                            <div>
                                                <SectionCard title="Recommended">
                                                    <AIOpportunitySuggestions
                                                        profile={profile}
                                                        promotions={promotions}
                                                        onApplySuggestion={s => setActiveTab(s.type === 'opportunity' ? 'opportunities' : 'settings')}
                                                    />
                                                </SectionCard>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'opportunities' && (
                                    <SectionCard title={`${promotions.length} Opportunities Available`}>
                                        <PromotionList promotions={promotions} onApply={handleApplyToPromotion} />
                                    </SectionCard>
                                )}

                                {activeTab === 'applications' && (
                                    <ApplicationsView applications={applications} />
                                )}

                                {activeTab === 'achievements' && (
                                    <SectionCard title="Your Achievements">
                                        <BadgeShowcase />
                                    </SectionCard>
                                )}

                                {activeTab === 'messages' && (
                                    <SectionCard title="Messages">
                                        <ConversationList onSelectConversation={setSelectedConversation} />
                                    </SectionCard>
                                )}

                                {activeTab === 'settings' && (
                                    <SectionCard title="Profile Settings">
                                        <ProfileForm profile={profile} onSave={handleProfileSaved} />
                                    </SectionCard>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}
            </div>

            {/* Chat Overlay */}
            <AnimatePresence>
                {selectedConversation && (
                    <ChatBox
                        conversationId={selectedConversation._id}
                        otherUserName={selectedConversation.sellerId?.name || 'Seller'}
                        promotionTitle={selectedConversation.promotionId?.title || 'Promotion'}
                        onClose={() => setSelectedConversation(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, subtitle }) => (
    <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-xl p-5 hover:bg-dark-800/70 transition-all">
        <div className="flex items-center justify-between mb-3">
            <span className="text-dark-400 text-sm font-medium">{label}</span>
            <div className="p-2 bg-dark-700/50 rounded-lg">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-dark-500">{subtitle}</div>
    </div>
);

// Section Card Component
const SectionCard = ({ title, children, action }) => (
    <div className="bg-dark-800/30 backdrop-blur-sm border border-dark-700/50 rounded-xl overflow-hidden">
        {title && (
            <div className="px-6 py-4 border-b border-dark-700/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {action}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

// Applications View Component
const ApplicationsView = ({ applications }) => {
    if (applications.length === 0) {
        return (
            <SectionCard>
                <div className="text-center py-12">
                    <FaBriefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-300 mb-2">No applications yet</h3>
                    <p className="text-dark-400">Browse opportunities to get started!</p>
                </div>
            </SectionCard>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((app, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-dark-800/30 backdrop-blur-sm border border-dark-700/50 rounded-xl p-6 hover:bg-dark-800/50 transition-all"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">{app.promotion.title}</h4>
                            <p className="text-dark-400 text-sm mb-3">{app.promotion.description?.substring(0, 120)}...</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-dark-700/50 rounded-full text-xs text-dark-300">
                                    {app.promotion.promotionType}
                                </span>
                                <span className="px-3 py-1 bg-dark-700/50 rounded-full text-xs text-dark-300">
                                    ₹{app.promotion.budgetRange?.min} - ₹{app.promotion.budgetRange?.max}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${app.applicationStatus === 'Accepted'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : app.applicationStatus === 'Rejected'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}
                            >
                                {app.applicationStatus}
                            </span>
                            <span className="text-xs text-dark-500">{new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// Helper function
const formatNumber = num => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
};

export default CreatorDashboard;
