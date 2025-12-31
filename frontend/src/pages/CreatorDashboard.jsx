import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaInstagram,
    FaUser,
    FaEdit,
    FaChartLine,
    FaBriefcase,
    FaBell,
    FaSignOutAlt,
    FaCheck,
    FaTimes,
    FaToggleOn,
    FaToggleOff,
    FaStar,
    FaDollarSign,
    FaHashtag,
    FaComments
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiUserGroup } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { creatorAPI } from '../services/api';
import toast from 'react-hot-toast';

// Components
// Navbar removed for Sidebar Layout
import NotificationBell from '../components/common/NotificationBell';
// InsightsCard removed - AI profile insights disabled
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
import { FaTrophy } from 'react-icons/fa';

const CreatorDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    // Handle tab query parameter from navbar
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'edit') {
            setActiveTab('profile');
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch profile
            try {
                const profileRes = await creatorAPI.getProfile();
                setProfile(profileRes.data.data.profile);
            } catch (error) {
                if (error.response?.status === 404) {
                    // Profile doesn't exist, show form
                    setShowProfileForm(true);
                }
            }

            // Fetch promotions
            try {
                const promotionsRes = await creatorAPI.getPromotions();
                setPromotions(promotionsRes.data.data.promotions);
            } catch (error) {
                console.error('Failed to fetch promotions:', error);
            }

            // Fetch applications
            try {
                const applicationsRes = await creatorAPI.getApplications();
                setApplications(applicationsRes.data.data.applications);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async () => {
        try {
            const res = await creatorAPI.updateProfile({ isAvailable: !profile.isAvailable });
            setProfile(res.data.data.profile);
            toast.success(res.data.data.profile.isAvailable ? 'You are now available!' : 'You are now unavailable');
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    const handleApplyToPromotion = async (promotionId) => {
        try {
            await creatorAPI.applyToPromotion(promotionId);
            toast.success('Application submitted!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply');
        }
    };

    const handleProfileSaved = (newProfile) => {
        setProfile(newProfile);
        setShowProfileForm(false);
        fetchData();
    };

    // Sidebar Navigation Items
    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
        { id: 'promotions', label: 'Opportunities', icon: <FaBriefcase /> },
        { id: 'applications', label: 'Applications', icon: <FaCheck /> },
        { id: 'achievements', label: 'Achievements', icon: <FaTrophy /> },
        { id: 'messages', label: 'Messages', icon: <FaComments /> },
        { id: 'profile', label: 'Settings', icon: <FaEdit /> }
    ];

    if (loading) {
        return <SkeletonLoader />; // Using simpler loader for brevity or the previous one
    }

    return (
        <div className="flex h-screen bg-dark-950 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="w-64 bg-dark-900 border-r border-dark-800 hidden md:flex flex-col z-20">
                {/* Logo Area */}
                <div className="p-6 border-b border-dark-800 flex items-center gap-3">
                    <img src="/logo.png" alt="Collabify" className="w-8 h-8" />
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
                        TheCollabify
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-primary-600/20 to-secondary-600/20 text-primary-400 border border-primary-500/10'
                                    : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
                                    }`}
                            >
                                <span className={`text-xl ${isActive ? 'text-primary-400' : 'text-dark-500 group-hover:text-dark-300'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute right-0 w-1 h-8 bg-primary-500 rounded-l-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-dark-800">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                            {user?.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
                            <p className="text-xs text-dark-400 truncate">{profile?.category || 'Creator'}</p>
                        </div>
                        <button onClick={logout} className="text-dark-400 hover:text-red-400 transition-colors">
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800 flex items-center justify-between px-8 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-dark-100">
                            {sidebarItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p className="text-sm text-dark-400">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Profile Complete Badge */}
                        {profile?.category && profile?.followerCount > 0 && (
                            <div className="hidden md:flex flex-col items-end">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                                    <FaCheck className="text-[10px]" /> Profile Complete
                                </span>
                            </div>
                        )}

                        {/* Availability Toggle */}
                        {profile && (
                            <button
                                onClick={handleToggleAvailability}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${profile.isAvailable
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-dark-800 text-dark-400 border border-dark-700'
                                    }`}
                            >
                                {profile.isAvailable ? (
                                    <><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available</>
                                ) : (
                                    <><div className="w-2 h-2 rounded-full bg-dark-500" /> Unavailable</>
                                )}
                            </button>
                        )}

                        <div className="w-px h-8 bg-dark-800 mx-2" />

                        <NotificationBell />
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">
                    <div className="max-w-6xl mx-auto">

                        {/* Onboarding Tour for new users */}
                        <OnboardingTour role="creator" />

                        {/* Show profile form if no profile */}
                        {showProfileForm && !profile && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <ProfileForm onSave={handleProfileSaved} />
                            </motion.div>
                        )}

                        {/* Tab Content */}
                        {profile && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'overview' && (
                                        <div className="space-y-8">
                                            {/* Welcome Banner */}
                                            <div className="bg-gradient-to-r from-primary-900/40 to-secondary-900/40 border border-primary-500/20 rounded-2xl p-8 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                                <div className="relative z-10">
                                                    <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h2>
                                                    <p className="text-dark-300 max-w-xl">
                                                        You have <span className="text-primary-400 font-semibold">{applications.filter(a => a.applicationStatus === 'Pending').length} pending applications</span> and <span className="text-secondary-400 font-semibold">{promotions.length} new opportunities</span> waiting for you.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Profile Progress (Hidden if 100%) */}
                                            <ProfileProgress profile={profile} onEditProfile={() => setActiveTab('profile')} />

                                            {/* Quick Stats */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {[
                                                    { label: 'Followers', value: profile.followerCount >= 1000000 ? `${(profile.followerCount / 1000000).toFixed(1)}M` : profile.followerCount >= 1000 ? `${(profile.followerCount / 1000).toFixed(1)}K` : profile.followerCount, icon: <HiUserGroup className="text-blue-400" />, sub: 'Total Audience' },
                                                    { label: 'Engagement', value: profile.engagementRate + '%', icon: <HiLightningBolt className="text-yellow-400" />, sub: 'Average Rate' },
                                                    { label: 'Completed', value: profile.successfulPromotions || 0, icon: <FaBriefcase className="text-emerald-400" />, sub: 'Campaigns' },
                                                    { label: 'Earned', value: '₹0', icon: <FaDollarSign className="text-purple-400" />, sub: 'This Month' }
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-dark-800/40 border border-dark-700/50 rounded-xl p-5 hover:bg-dark-800/60 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-dark-400 text-sm font-medium">{stat.label}</span>
                                                            <div className="p-2 bg-dark-700/50 rounded-lg">{stat.icon}</div>
                                                        </div>
                                                        <div className="text-2xl font-bold text-dark-100">{stat.value}</div>
                                                        <div className="text-xs text-dark-500 mt-1">{stat.sub}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <div className="lg:col-span-2">
                                                    <h3 className="text-lg font-semibold text-dark-100 mb-4">Performance Analytics</h3>
                                                    <CreatorAnalytics profile={profile} applications={applications} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-dark-100 mb-4">Recommended for You</h3>
                                                    <AIOpportunitySuggestions
                                                        profile={profile}
                                                        promotions={promotions}
                                                        onApplySuggestion={(s) => setActiveTab(s.type === 'opportunity' ? 'promotions' : 'profile')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'promotions' && <PromotionList promotions={promotions} onApply={handleApplyToPromotion} />}

                                    {activeTab === 'applications' && (
                                        <div className="space-y-6">
                                            {applications.length === 0 ? (
                                                <div className="glass-card p-12 text-center">
                                                    <FaBriefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-dark-300 mb-2">No applications yet</h3>
                                                    <p className="text-dark-400">Browse opportunities and apply to promotions that match your profile.</p>
                                                </div>
                                            ) : (
                                                applications.map((app, index) => (
                                                    <div key={index} className="bg-dark-800/40 border border-dark-700/50 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-4">
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-dark-100">{app.promotion.title}</h4>
                                                            <p className="text-dark-400 text-sm mt-1 mb-3">{app.promotion.description?.substring(0, 100)}...</p>
                                                            <div className="flex gap-2">
                                                                <span className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">{app.promotion.promotionType}</span>
                                                                <span className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">Budget: ₹{app.promotion.budgetRange?.min} - ₹{app.promotion.budgetRange?.max}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.applicationStatus === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                app.applicationStatus === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                                                    'bg-amber-500/20 text-amber-400'
                                                                }`}>{app.applicationStatus}</span>
                                                            <span className="text-xs text-dark-500">{new Date(app.appliedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'achievements' && <BadgeShowcase />}

                                    {activeTab === 'messages' && <ConversationList onSelectConversation={setSelectedConversation} />}

                                    {activeTab === 'profile' && <ProfileForm profile={profile} onSave={handleProfileSaved} />}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </main>

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

export default CreatorDashboard;
