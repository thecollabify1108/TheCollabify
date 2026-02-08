import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCheck,
    FaTrophy,
    FaComments,
    FaCog,
    FaCalendar,
    FaBriefcase
} from 'react-icons/fa';
import { HiHome, HiSparkles, HiUserGroup, HiLightningBolt, HiViewGrid, HiChat, HiBriefcase } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { creatorAPI } from '../services/api';
import { trackMatchFeedback } from '../services/feedback';
import toast from 'react-hot-toast';

// Components
import Navbar from '../components/common/Navbar';
import ProfileForm from '../components/creator/ProfileForm';
import PromotionList from '../components/creator/PromotionList';
import ChatBox from '../components/common/ChatBox';
import ConversationList from '../components/common/ConversationList';

import CreatorAnalytics from '../components/creator/CreatorAnalytics';
import AIOpportunitySuggestions from '../components/creator/AIOpportunitySuggestions';
import ProfileProgress from '../components/creator/ProfileProgress';
import BadgeShowcase from '../components/creator/BadgeShowcase';
import ContentCreatorTips from '../components/creator/ContentCreatorTips';
import MessageRequests from '../components/creator/MessageRequests';
import ProfileCard from '../components/creator/ProfileCard';
import PullToRefresh from '../components/common/PullToRefresh';
import QuickActionsFAB from '../components/common/QuickActionsFAB';
import ProfileCompletionBar from '../components/common/ProfileCompletionBar';
import { haptic } from '../utils/haptic';

// NEW: Enhanced Components
import AIAssistantPanel from '../components/common/AIAssistantPanel';
import PredictiveAnalyticsWidget from '../components/analytics/PredictiveAnalyticsWidget';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import ContentCalendar from '../components/calendar/ContentCalendar';
import PaymentModal from '../components/payment/PaymentModal';
import { subscriptionPlans } from '../config/subscriptions';

// Modern Dashboard Widgets
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import DashboardHero from '../components/dashboard/DashboardHero';

// Enhanced UI Components
import LoadingButton from '../components/common/LoadingButton';
import EmptyState from '../components/common/EmptyState';

// Skeleton Loading Components
import { Skeleton, SkeletonStats, SkeletonCard, SkeletonList, SkeletonMobileCard } from '../components/common/Skeleton';

import GuidedAIMode from '../components/dashboard/GuidedAIMode';
import FocusWrapper from '../components/dashboard/FocusWrapper';

const CreatorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'edit') return 'profile';
        return tab || 'dashboard';
    });
    const [profile, setProfile] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageSubTab, setMessageSubTab] = useState('conversations'); // 'conversations' or 'requests'
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [focusMode, setFocusMode] = useState(null);
    const [showGuide, setShowGuide] = useState(true);
    const [availabilityStatus, setAvailabilityStatus] = useState('idle');

    const [searchParams] = useSearchParams();

    // Helper function to format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        if (!profile) return 0;
        let completion = 0;
        const fields = [
            profile.instagramHandle,
            profile.followerCount > 0,
            profile.engagementRate > 0,
            profile.category,
            profile.bio,
            profile.portfolio?.length > 0
        ];
        const filledFields = fields.filter(Boolean).length;
        completion = Math.round((filledFields / fields.length) * 100);
        return completion;
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'edit') {
            setActiveTab('profile');
        }
    }, [searchParams]);

    const fetchData = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
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
            if (!isBackground) setLoading(false);
        }
    };

    const handleProfileSaved = () => {
        setShowProfileForm(false);
        setIsEditingProfile(false);
        fetchData(true); // Seamless update
        toast.success('Profile updated successfully!');
        // Navigate to home tab after successful save
        setActiveTab('home');
    };

    const handleUpgrade = () => {
        setSelectedPlan(subscriptionPlans.pro);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (data) => {
        fetchData(); // Refresh user data to show new subscription status
        toast.success('Welcome to Pro!');
    };

    const handleApplyToPromotion = async (promotionId) => {
        // Optimistic Update
        const previousPromotions = [...promotions];
        setPromotions(promotions.map(p =>
            p._id === promotionId ? { ...p, hasApplied: true, status: 'Applied' } : p
        ));

        // Get promotion details for feedback
        const promotion = promotions.find(p => p._id === promotionId);
        if (promotion) {
            trackMatchFeedback({
                targetUserId: promotion.sellerId?._id || promotion.sellerId, // The brand/seller
                action: 'APPLIED',
                source: 'creator_dashboard',
                matchId: promotionId, // Promotion ID as context
                meta: { promotionTitle: promotion.title }
            });
        }

        // Optimistically add to applications if we could construct it, but simpler to just wait for background refetch
        // or we could add a temporary item to applications list

        try {
            await creatorAPI.applyToPromotion(promotionId);
            toast.success('Application submitted successfully!');
            fetchData(true); // Background update
        } catch (error) {
            // Revert
            setPromotions(previousPromotions);
            toast.error(error.message || 'Failed to apply');
        }
    };

    const handleToggleAvailability = async () => {
        try {
            setAvailabilityStatus('loading');
            const updatedProfile = await creatorAPI.updateProfile({
                isAvailable: !profile.isAvailable
            });
            setProfile(updatedProfile.data.data.profile);
            setAvailabilityStatus('success');
            setTimeout(() => setAvailabilityStatus('idle'), 2000);
            toast.success(`You are now ${!profile.isAvailable ? 'available' : 'unavailable'} for work`);
        } catch (error) {
            setAvailabilityStatus('error');
            setTimeout(() => setAvailabilityStatus('idle'), 2000);
            toast.error('Failed to update availability');
        }
    };

    const handleGuideAction = (type, target) => {
        if (type === 'hover') {
            if (activeTab === 'dashboard') {
                setFocusMode(target);
            }
        } else if (type === 'leave') {
            setFocusMode(null);
        } else if (type === 'click') {
            if (activeTab !== 'dashboard') {
                setActiveTab('dashboard');
            }
            setFocusMode(target);
            setShowGuide(false);
            setTimeout(() => setFocusMode(null), 3000);
        }
    };

    // Imported Skeleton components moved to top-level imports

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 pb-20">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
                    {/* Hero Skeleton */}
                    <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <Skeleton variant="title" width="40%" height={40} />
                            <Skeleton variant="text" width="60%" height={24} />
                            <div className="flex gap-4 mt-6">
                                <Skeleton width={120} height={48} className="rounded-xl" />
                                <Skeleton width={120} height={48} className="rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Skeleton */}
                    <SkeletonStats />

                    {/* Charts Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                        <div className="lg:col-span-2 glass-card p-6">
                            <Skeleton variant="title" width="30%" height={28} className="mb-6" />
                            <Skeleton variant="rectangular" width="100%" height="80%" />
                        </div>
                        <div className="glass-card p-6">
                            <Skeleton variant="title" width="40%" height={28} className="mb-6" />
                            <SkeletonList count={4} />
                        </div>
                    </div>

                    {/* Action Items Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-card p-6 h-40">
                            <Skeleton variant="title" width="50%" height={24} className="mb-4" />
                            <Skeleton variant="rectangular" width="100%" height={8} className="rounded-full mb-4" />
                            <Skeleton width="100%" height={40} className="rounded-lg" />
                        </div>
                        <div className="glass-card p-6 h-40">
                            <div className="flex gap-4 items-center mb-4">
                                <Skeleton variant="circular" width={48} height={48} />
                                <div className="space-y-2">
                                    <Skeleton width={120} height={20} />
                                    <Skeleton width={180} height={16} />
                                </div>
                            </div>
                            <Skeleton width="100%" height={40} className="rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const pendingApplications = applications.filter(a => a.applicationStatus === 'Pending').length;
    const completedCampaigns = profile?.successfulPromotions || 0;
    const pendingRequests = applications.filter(a => a.applicationStatus === 'INVITED').length;

    // Bottom navigation - 6 tabs with Analytics & Calendar
    const tabs = [
        {
            id: 'dashboard',
            label: 'Home',
            icon: <HiHome />,
            description: 'Overview & Activity'
        },
        {
            id: 'opportunities',
            label: 'Jobs',
            icon: <HiBriefcase />,
            badge: promotions.length,
            description: 'Browse Brands'
        },
        {
            id: 'analytics',
            label: 'Stats',
            icon: <FaTrophy />,
            description: 'Performance'
        },
        {
            id: 'calendar',
            label: 'Calendar',
            icon: <FaCalendar />,
            description: 'Schedule'
        },
        {
            id: 'messages',
            label: 'Chat',
            icon: <HiChat />,
            badge: pendingRequests,
            description: 'Messages'
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: <FaCog />,
            description: 'Settings'
        }
    ];

    return (
        <div className="min-h-screen bg-dark-950 pb-20">

            <Navbar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-6">
                <AnimatePresence mode="wait">
                    {/* Guided AI Mode Overlay */}
                    {activeTab === 'dashboard' && showGuide && (
                        <GuidedAIMode
                            role="creator"
                            onAction={handleGuideAction}
                            onClose={() => setShowGuide(false)}
                        />
                    )}

                    {/* Dashboard Tab - Modernized */}
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8 pb-6"
                        >
                            {profile ? (
                                <>
                                    {/* 1. Hero Section */}
                                    <DashboardHero
                                        userName={user?.name?.split(' ')[0] || 'Creator'}
                                        role="Creator"
                                        dailyInsight="Complete your profile to increase visibility! 🌟"
                                    />

                                    {/* 2. Stats Grid */}
                                    <FocusWrapper sectionId="stats" currentFocus={focusMode}>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                            <StatCard
                                                label="Active Jobs"
                                                value={pendingApplications}
                                                icon={<HiBriefcase />}
                                                color="blue"
                                                trend={0}
                                                delay={0.1}
                                            />
                                            <StatCard
                                                label="Total Earnings"
                                                value={`₹${(profile?.totalEarnings || 0).toLocaleString()}`}
                                                icon={<HiLightningBolt />}
                                                color="emerald"
                                                trend={0}
                                                delay={0.2}
                                            />
                                            <StatCard
                                                label="AI Match Score"
                                                value={profile.aiMatchScore || 0}
                                                icon={<HiSparkles />}
                                                color="purple"
                                                trend={0}
                                                delay={0.3}
                                            />
                                            <StatCard
                                                label="Profile Views"
                                                value={profile?.profileViews || 0}
                                                icon={<HiUserGroup />}
                                                color="amber"
                                                trend={0}
                                                delay={0.4}
                                            />
                                        </div>
                                    </FocusWrapper>

                                    {/* 3. Charts & Activity Split */}
                                    <FocusWrapper sectionId="stats" currentFocus={focusMode}>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[450px]">
                                            <div className="lg:col-span-2 h-[300px] lg:h-full">
                                                <PerformanceChart
                                                    title="Earnings Overview"
                                                    data={[]} // Empty until analytics
                                                    color="#10b981"
                                                />
                                            </div>
                                            <div className="h-[400px] lg:h-full">
                                                <ActivityFeed
                                                    activities={applications.slice(0, 5).map(app => ({
                                                        id: app._id,
                                                        title: `Applied to ${app.promotion?.title || 'Campaign'}`,
                                                        description: app.status === 'Accepted' ? 'Application accepted!' : 'Application pending review',
                                                        icon: <FaBriefcase />,
                                                        iconColor: app.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                                                    }))}
                                                    emptyMessage="No recent applications"
                                                />
                                            </div>
                                        </div>
                                    </FocusWrapper>

                                    {/* 4. Action Items (Today's Focus - Modernized) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FocusWrapper sectionId="profile" currentFocus={focusMode} className="h-full">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                className="p-1 rounded-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 h-full"
                                            >
                                                <div className="bg-dark-900 rounded-xl p-5 h-full">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="font-bold text-white">Profile Strength</h3>
                                                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
                                                            {calculateProfileCompletion()}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-dark-800 rounded-full h-2 mb-4">
                                                        <div className="bg-gradient-to-r from-pink-500 to-yellow-500 h-2 rounded-full" style={{ width: `${calculateProfileCompletion()}%` }} />
                                                    </div>
                                                    <LoadingButton
                                                        onClick={() => setActiveTab('profile')}
                                                        className="w-full py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-sm font-medium text-white transition-colors border-none"
                                                    >
                                                        Complete Profile
                                                    </LoadingButton>
                                                </div>
                                            </motion.div>
                                        </FocusWrapper>

                                        <FocusWrapper sectionId="promotions" currentFocus={focusMode} className="h-full">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                className="p-5 rounded-2xl bg-dark-800/40 border border-dark-700/50 backdrop-blur-sm h-full"
                                            >
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                                                        <HiSparkles className="text-xl" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white">Opportunity Match</h3>
                                                        <p className="text-sm text-dark-400">{promotions.length} new campaigns fit your niche</p>
                                                    </div>
                                                </div>
                                                <LoadingButton
                                                    onClick={() => setActiveTab('opportunities')}
                                                    className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-medium text-white transition-colors border-none"
                                                >
                                                    Explore Matches
                                                </LoadingButton>
                                            </motion.div>
                                        </FocusWrapper>
                                    </div>
                                </>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <ProfileForm onSave={handleProfileSaved} />
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Opportunities Tab */}
                    {activeTab === 'opportunities' && (
                        <motion.div
                            key="opportunities"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-1">Available Opportunities</h2>
                                <p className="text-sm text-dark-400">{promotions.length} brand collaborations</p>
                            </div>
                            <PromotionList
                                promotions={promotions}
                                onApply={handleApplyToPromotion}
                                creatorProfile={profile}
                            />
                        </motion.div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-1">Your Analytics</h2>
                                <p className="text-sm text-dark-400">Track your performance and earnings</p>
                            </div>
                            <AnalyticsDashboard userType="creator" />
                        </motion.div>
                    )}

                    {/* Calendar Tab */}
                    {activeTab === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4"
                        >
                            <ContentCalendar userId={user._id} />
                        </motion.div>
                    )}

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <motion.div
                            key="messages"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-3">Messages</h2>

                                {/* Sub-tabs for Messages */}
                                <div className="flex gap-2 p-1 bg-dark-800/40 rounded-lg border border-dark-700/50">
                                    <button
                                        onClick={() => setMessageSubTab('conversations')}
                                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${messageSubTab === 'conversations'
                                            ? 'bg-primary-500 text-white'
                                            : 'text-dark-400 hover:text-dark-200'
                                            }`}
                                    >
                                        Conversations
                                    </button>
                                    <button
                                        onClick={() => setMessageSubTab('requests')}
                                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${messageSubTab === 'requests'
                                            ? 'bg-primary-500 text-white'
                                            : 'text-dark-400 hover:text-dark-200'
                                            }`}
                                    >
                                        Requests
                                    </button>
                                </div>
                            </div>

                            {messageSubTab === 'conversations' ? (
                                <ConversationList onSelectConversation={setSelectedConversation} />
                            ) : (
                                <MessageRequests
                                    onAccept={() => {
                                        // Refresh conversations when request accepted
                                        setMessageSubTab('conversations');
                                    }}
                                    onReject={() => {
                                        // Stay on requests tab after rejection
                                    }}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4 space-y-6"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-dark-100 mb-1">Profile Settings</h2>
                                <p className="text-sm text-dark-400">Manage your creator profile</p>
                            </div>

                            {/* Pro Upgrade Card */}
                            {user.subscription?.status !== 'active' && (
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-xl shadow-purple-900/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Unlock Pro Features</h3>
                                            <p className="text-purple-100 max-w-md">Get AI-powered analytics, custom reports, and priority support to scale your creator career.</p>
                                        </div>
                                        <LoadingButton
                                            onClick={handleUpgrade}
                                            className="px-8 py-3 bg-white text-purple-600 rounded-2xl font-bold hover:bg-purple-50 transition-colors shadow-lg shadow-black/10 border-none"
                                        >
                                            Upgrade Now
                                        </LoadingButton>
                                    </div>
                                </div>
                            )}

                            {/* Show ProfileCard if profile exists and not editing */}
                            {profile && !isEditingProfile ? (
                                <ProfileCard
                                    profile={profile}
                                    onEdit={() => setIsEditingProfile(true)}
                                />
                            ) : (
                                <>
                                    {/* Availability Toggle - only show when editing */}
                                    {profile && (
                                        <div className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-dark-100 mb-1">Availability Status</h3>
                                                    <p className="text-sm text-dark-400">Let brands know you're open for work</p>
                                                </div>
                                                <LoadingButton
                                                    onClick={handleToggleAvailability}
                                                    status={availabilityStatus}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-none ${profile.isAvailable
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-dark-700 text-dark-400 border border-dark-600'
                                                        }`}
                                                >
                                                    {profile.isAvailable ? '● Available' : 'Unavailable'}
                                                </LoadingButton>
                                            </div>
                                        </div>
                                    )}

                                    <ProfileForm profile={profile} onSave={handleProfileSaved} />
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Quick Actions FAB */}
            <QuickActionsFAB
                userRole="creator"
                onBrowse={() => setActiveTab('opportunities')}
                onQuickApply={() => {
                    setActiveTab('opportunities');
                    toast.success('Browse opportunities below to apply!');
                }}
            />

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-t border-dark-800 z-50">
                <div className="max-w-lg mx-auto px-1 md:px-2 py-1 md:py-2">
                    <div className="flex items-center justify-around">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex flex-col items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'text-primary-400'
                                    : 'text-dark-400 hover:text-dark-200'
                                    }`}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span className="text-xs font-medium">{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                                        {tab.badge > 9 ? '9+' : tab.badge}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* AI Assistant Panel (Always available) */}
            <AIAssistantPanel
                onUse={(content) => {
                    toast.success('AI content copied to clipboard!');
                    navigator.clipboard.writeText(content);
                }}
            />

            {/* Chat Overlay */}
            <AnimatePresence>
                {selectedConversation && (
                    <ChatBox
                        conversationId={selectedConversation._id}
                        otherUserName={selectedConversation.sellerId?.name || 'Seller'}
                        promotionTitle={selectedConversation.promotionId?.title || 'Promotion'}
                        conversation={selectedConversation}
                        onClose={() => setSelectedConversation(null)}
                    />
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    plan={selectedPlan}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

const ApplicationsView = ({ applications }) => {
    if (applications.length === 0) {
        return (
            <EmptyState
                icon={<FaBriefcase />}
                title="No applications yet"
                description="Browse opportunities to get started!"
            />
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
                    className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50"
                >
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                            <h4 className="font-semibold text-dark-100 mb-1">{app.promotion.title}</h4>
                            <p className="text-sm text-dark-400 line-clamp-2">{app.promotion.description}</p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${app.applicationStatus === 'Accepted'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : app.applicationStatus === 'Rejected'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                        >
                            {app.applicationStatus}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-dark-700/50 rounded text-xs text-dark-300">
                            {app.promotion.promotionType}
                        </span>
                        <span className="px-2 py-1 bg-dark-700/50 rounded text-xs text-dark-300">
                            ₹{app.promotion.budgetRange?.min} - ₹{app.promotion.budgetRange?.max}
                        </span>
                        <span className="px-2 py-1 bg-dark-700/50 rounded text-xs text-dark-400">
                            {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};


export default CreatorDashboard;
