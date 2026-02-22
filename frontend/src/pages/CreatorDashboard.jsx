import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCheck,
    FaTrophy,
    FaComments,
    FaCog,
    FaCalendar,
    FaBriefcase,
    FaHandshake
} from 'react-icons/fa';
import { HiHome, HiSparkles, HiUserGroup, HiLightningBolt, HiViewGrid, HiChat, HiBriefcase } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { creatorAPI } from '../services/api';
import { trackMatchFeedback } from '../services/feedback';
import toast from 'react-hot-toast';

// Components
// Components
import DashboardLayout from '../components/layout/DashboardLayout';
// Navbar removed explicitly, using DashboardLayout instead
import ProfileForm from '../components/creator/ProfileForm';
import CreatorOnboarding from '../components/creator/CreatorOnboarding';
import PromotionList from '../components/creator/PromotionList';
import ChatBox from '../components/common/ChatBox';
import ConversationList from '../components/common/ConversationList';
import CollaborationHub from '../components/common/CollaborationHub';
import CollaborationStepper from '../components/common/CollaborationStepper';

import CreatorAnalytics from '../components/creator/CreatorAnalytics';
import { CreatorInsightCards } from '../components/analytics/InsightCards';
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
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [focusMode, setFocusMode] = useState(null);
    const [showGuide, setShowGuide] = useState(true);
    const [availabilityStatus, setAvailabilityStatus] = useState('idle');
    const [activeCollab, setActiveCollab] = useState(null);

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
        toast.success('Pro features coming soon!');
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
            const states = ['AVAILABLE_NOW', 'LIMITED_AVAILABILITY', 'NOT_AVAILABLE'];
            const currentIndex = states.indexOf(profile.availabilityStatus || 'AVAILABLE_NOW');
            const nextStatus = states[(currentIndex + 1) % states.length];

            setAvailabilityStatus('loading');
            const res = await creatorAPI.updateAvailability(nextStatus);
            setProfile(prev => ({
                ...prev,
                availabilityStatus: res.data.data.availabilityStatus,
                isAvailable: res.data.data.availabilityStatus !== 'NOT_AVAILABLE'
            }));
            setAvailabilityStatus('success');
            setTimeout(() => setAvailabilityStatus('idle'), 2000);

            const labels = {
                'AVAILABLE_NOW': 'Available Now ⚡',
                'LIMITED_AVAILABILITY': 'Limited Availability ⏳',
                'NOT_AVAILABLE': 'Not Available 🌙'
            };
            toast.success(`Status: ${labels[nextStatus]}`);
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
            <div className="min-h-screen bg-dark-950 pb-s20">
                <Navbar />
                <div className="max-w-7xl mx-auto px-s4 sm:px-s6 lg:px-s8 pt-s6 space-y-s8">
                    {/* Hero Skeleton */}
                    <div className="glass-card p-s8 rounded-premium-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-s4">
                            <Skeleton variant="title" width="40%" height={40} />
                            <Skeleton variant="text" width="60%" height={24} />
                            <div className="flex gap-s4 mt-s6">
                                <Skeleton width={120} height={48} className="rounded-premium-xl" />
                                <Skeleton width={120} height={48} className="rounded-premium-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Skeleton */}
                    <SkeletonStats />

                    {/* Charts Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-s6 h-[400px]">
                        <div className="lg:col-span-2 glass-card p-s6">
                            <Skeleton variant="title" width="30%" height={28} className="mb-s6" />
                            <Skeleton variant="rectangular" width="100%" height="80%" />
                        </div>
                        <div className="glass-card p-s6">
                            <Skeleton variant="title" width="40%" height={28} className="mb-s6" />
                            <SkeletonList count={4} />
                        </div>
                    </div>

                    {/* Action Items Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-s4">
                        <div className="glass-card p-s6 h-40">
                            <Skeleton variant="title" width="50%" height={24} className="mb-s4" />
                            <Skeleton variant="rectangular" width="100%" height={8} className="rounded-full mb-s4" />
                            <Skeleton width="100%" height={40} className="rounded-premium-lg" />
                        </div>
                        <div className="glass-card p-s6 h-40">
                            <div className="flex gap-s4 items-center mb-s4">
                                <Skeleton variant="circular" width={48} height={48} />
                                <div className="space-y-s2">
                                    <Skeleton width={120} height={20} />
                                    <Skeleton width={180} height={16} />
                                </div>
                            </div>
                            <Skeleton width="100%" height={40} className="rounded-premium-lg" />
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
            iconName: 'home',
            description: 'Overview & Activity'
        },
        {
            id: 'opportunities',
            label: 'Jobs',
            iconName: 'briefcase',
            badge: promotions.length,
            description: 'Browse Brands'
        },
        {
            id: 'analytics',
            label: 'Stats',
            iconName: 'trophy',
            description: 'Performance'
        },
        {
            id: 'calendar',
            label: 'Calendar',
            iconName: 'calendar',
            description: 'Schedule'
        },
        {
            id: 'messages',
            label: 'Chat',
            iconName: 'chat',
            badge: pendingRequests,
            description: 'Messages'
        },
        {
            id: 'profile',
            label: 'Profile',
            iconName: 'settings',
            description: 'Settings'
        }
    ];

    return (
        <DashboardLayout
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
            showGuide={showGuide}
            setShowGuide={setShowGuide}
        >
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
                        className="space-y-s8 pb-s6"
                    >
                        {profile ? (
                            <>
                                {/* 1. Hero Section */}
                                <DashboardHero
                                    userName={user?.name?.split(' ')[0] || 'Creator'}
                                    role="Creator"
                                    dailyInsight="Complete your profile to increase visibility! 🌟"
                                    availabilityStatus={profile.availabilityStatus}
                                    onToggleAvailability={handleToggleAvailability}
                                />

                                {/* 2. Stats Grid */}
                                <FocusWrapper sectionId="stats" currentFocus={focusMode}>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-s4 md:gap-s6">
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
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-s6 min-h-[450px]">
                                        {/* Active Collaborations Section */}
                                        <div className="lg:col-span-2 space-y-s4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-body font-black text-dark-100 uppercase tracking-wider">Active Collaborations</h3>
                                                <span className="px-s3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs-pure font-black">
                                                    {applications.filter(app => app.applicationStatus === 'ACCEPTED' || app.status === 'Accepted').length} ACTIVE
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-s4">
                                                {applications.filter(app => app.applicationStatus === 'ACCEPTED' || app.status === 'Accepted').length === 0 ? (
                                                    <div className="md:col-span-2 p-s8 rounded-premium-2xl bg-dark-800/20 border border-dark-700/50 flex flex-col items-center justify-center text-center">
                                                        <FaHandshake className="text-4xl text-dark-700 mb-s3" />
                                                        <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-widest">No active collaborations yet</p>
                                                    </div>
                                                ) : (
                                                    applications.filter(app => app.applicationStatus === 'ACCEPTED' || app.status === 'Accepted').map(app => (
                                                        <motion.div
                                                            key={app._id}
                                                            whileHover={{ y: -4 }}
                                                            onClick={() => setActiveCollab({ id: app._id, promotion: app.promotion, seller: app.sellerId || app.seller })}
                                                            className="p-s4 rounded-premium-2xl bg-dark-800/40 border border-dark-700/50 backdrop-blur-sm cursor-pointer hover:border-primary-500/30 transition-all group"
                                                        >
                                                            <div className="flex items-center gap-s3 mb-s4">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black shadow-glow">
                                                                    {(app.sellerId?.name || app.seller?.name || 'B').charAt(0)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-small font-bold text-dark-100 truncate">{app.promotion?.title}</p>
                                                                    <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-tight">{app.sellerId?.name || app.seller?.name || 'Brand'}</p>
                                                                </div>
                                                            </div>

                                                            <CollaborationStepper
                                                                currentStatus={app.collaborationStatus || 'ACCEPTED'}
                                                                className="scale-90 origin-left mb-s2"
                                                            />

                                                            <div className="mt-s2 flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest group-hover:underline">Manage Collab →</span>
                                                                <span className="text-[10px] font-black text-dark-500 uppercase">{new Date(app.updatedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Earnings overview (moved lower) */}
                                            <div className="h-[250px] pt-s2">
                                                <PerformanceChart
                                                    title="Earnings Overview"
                                                    data={[]}
                                                    color="#10b981"
                                                />
                                            </div>
                                        </div>

                                        <div className="lg:col-span-1 h-full">
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

                                {/* Creator Insights */}
                                <CreatorInsightCards />

                                {/* 4. Action Items (Today's Focus - Modernized) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-s4">
                                    <FocusWrapper sectionId="profile" currentFocus={focusMode} className="h-full">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="p-1 rounded-premium-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 h-full"
                                        >
                                            <div className="bg-dark-900 rounded-premium-xl p-s5 h-full">
                                                <div className="flex justify-between items-center mb-s2">
                                                    <h3 className="font-bold text-white uppercase tracking-wider text-xs-pure">Profile Strength</h3>
                                                    <span className="text-h3 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
                                                        {calculateProfileCompletion()}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-dark-800 rounded-full h-2 mb-s4">
                                                    <div className="bg-gradient-to-r from-pink-500 to-yellow-500 h-2 rounded-full shadow-glow" style={{ width: `${calculateProfileCompletion()}%` }} />
                                                </div>
                                                <LoadingButton
                                                    onClick={() => setActiveTab('profile')}
                                                    className="w-full py-s2 rounded-premium-lg bg-dark-800 hover:bg-dark-700 text-small font-bold text-white transition-all border-none"
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
                                            className="p-s5 rounded-premium-2xl bg-dark-800/40 border border-dark-700/50 backdrop-blur-sm h-full shadow-md hover:shadow-glow transition-all"
                                        >
                                            <div className="flex items-center gap-s4 mb-s3">
                                                <div className="p-s3 rounded-full bg-purple-500/20 text-purple-400 shadow-sm">
                                                    <HiSparkles className="text-h3" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white uppercase tracking-wider text-xs-pure">Opportunity Match</h3>
                                                    <p className="text-small text-dark-400">{promotions.length} new campaigns fit your niche</p>
                                                </div>
                                            </div>
                                            <LoadingButton
                                                onClick={() => setActiveTab('opportunities')}
                                                className="w-full py-s2 rounded-premium-lg bg-purple-600 hover:bg-purple-700 text-small font-bold text-white transition-all border-none shadow-md"
                                            >
                                                Explore Matches
                                            </LoadingButton>
                                        </motion.div>
                                    </FocusWrapper>
                                </div>
                            </>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <CreatorOnboarding onComplete={handleProfileSaved} />
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Opportunities (Jobs) */}
                {activeTab === 'opportunities' && (
                    <motion.div
                        key="opportunities"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-s4"
                    >
                        <div className="mb-s4">
                            <h2 className="text-h2 font-bold text-dark-100 mb-s1">Available Opportunities</h2>
                            <p className="text-body text-dark-400">{promotions.length} brand collaborations</p>
                        </div>
                        <PromotionList
                            promotions={promotions}
                            onApply={handleApplyToPromotion}
                            creatorProfile={profile}
                        />
                    </motion.div>
                )}

                {/* Analytics */}
                {activeTab === 'analytics' && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-s4"
                    >
                        <div className="mb-s4">
                            <h2 className="text-h2 font-bold text-dark-100 mb-s1">Your Analytics</h2>
                            <p className="text-body text-dark-400">Track your performance and earnings</p>
                        </div>
                        <AnalyticsDashboard userType="creator" />
                    </motion.div>
                )}

                {/* Calendar */}
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

                {/* Messages */}
                {activeTab === 'messages' && (
                    <motion.div
                        key="messages"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-s4"
                    >
                        <div className="mb-s4">
                            <h2 className="text-h2 font-bold text-dark-100 mb-s3">Messages</h2>
                            <div className="flex gap-s2 p-1 bg-dark-800/40 rounded-premium-lg border border-dark-700/50">
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
                                onAccept={() => setMessageSubTab('conversations')}
                                onReject={() => { }}
                            />
                        )}
                    </motion.div>
                )}

                {/* Profile */}
                {activeTab === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-s4 space-y-s6"
                    >
                        <div className="mb-s4">
                            <h2 className="text-h2 font-bold text-dark-100 mb-s1">Profile Settings</h2>
                            <p className="text-body text-dark-400">Manage your creator profile</p>
                        </div>

                        {user.subscription?.status !== 'active' && (
                            <div className="p-s6 rounded-premium-2xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-premium relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-s6">
                                    <div>
                                        <h3 className="text-h2 font-bold text-white mb-s2">Unlock Pro Features</h3>
                                        <p className="text-purple-100 max-w-md text-body">Get AI-powered analytics, custom reports, and priority support to scale your creator career.</p>
                                    </div>
                                    <LoadingButton
                                        onClick={handleUpgrade}
                                        className="px-s8 py-s3 bg-white text-purple-600 rounded-premium-xl font-bold hover:bg-purple-50 transition-all shadow-premium border-none"
                                    >
                                        Upgrade Now
                                    </LoadingButton>
                                </div>
                            </div>
                        )}

                        {profile && !isEditingProfile ? (
                            <ProfileCard
                                profile={profile}
                                onEdit={() => setIsEditingProfile(true)}
                            />
                        ) : (
                            <>
                                {profile && (
                                    <div className="p-s4 rounded-premium-xl bg-dark-800/40 border border-dark-700/50 shadow-md">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-dark-100 mb-s1 uppercase tracking-wider text-xs-pure">Availability Status</h3>
                                                <p className="text-small text-dark-400">Let brands know you're open for work</p>
                                            </div>
                                            <LoadingButton
                                                onClick={handleToggleAvailability}
                                                status={availabilityStatus}
                                                className={`px-s4 py-s2 rounded-full text-xs-pure font-bold transition-all border-none shadow-sm ${profile.isAvailable
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow'
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

            {/* Quick Actions and Overlays */}
            <QuickActionsFAB
                userRole="creator"
                onBrowse={() => setActiveTab('opportunities')}
                onQuickApply={() => {
                    setActiveTab('opportunities');
                    toast.success('Browse opportunities below to apply!');
                }}
            />

            <AIAssistantPanel
                onUse={(content) => {
                    toast.success('AI content copied to clipboard!');
                    navigator.clipboard.writeText(content);
                }}
            />

            <AnimatePresence>
                {activeCollab && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl h-[85vh] bg-dark-900 rounded-premium-2xl overflow-hidden shadow-premium border border-dark-700/50"
                        >
                            <CollaborationHub
                                match={activeCollab}
                                isOwner={false}
                                onClose={() => setActiveCollab(null)}
                                onComplete={() => fetchData(true)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
        </DashboardLayout>
    );
};

const ApplicationsView = ({ applications }) => {
    if (!applications || applications.length === 0) {
        return (
            <EmptyState
                icon="box-empty"
                title="No Applications Yet"
                description="Your journey starts here! Explore available campaigns and apply to the ones that match your creative style."
                actionLabel="Explore Jobs"
                onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Assuming opportunities are on the same page or user needs to scroll
            />
        );
    }

    return (
        <div className="space-y-s4">
            {applications.map((app, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-s4 rounded-premium-xl bg-dark-800/40 border border-dark-700/50 shadow-md hover:shadow-glow transition-all"
                >
                    <div className="flex items-start justify-between gap-s3 mb-s3">
                        <div className="flex-1">
                            <h4 className="font-bold text-dark-100 mb-s1 uppercase tracking-wider text-small">{app.promotion.title}</h4>
                            <p className="text-small text-dark-400 line-clamp-2 leading-relaxed">{app.promotion.description}</p>
                        </div>
                        <span
                            className={`px-s3 py-1 rounded-full text-xs-pure font-bold whitespace-nowrap shadow-sm ${app.applicationStatus === 'Accepted'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : app.applicationStatus === 'Rejected'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                        >
                            {app.applicationStatus}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-s2">
                        <span className="px-s2 py-1 bg-dark-700/50 rounded-premium-sm text-xs-pure font-bold text-dark-300 border border-dark-600/30 uppercase tracking-widest">
                            {app.promotion.promotionType}
                        </span>
                        <span className="px-s2 py-1 bg-dark-700/50 rounded-premium-sm text-xs-pure font-bold text-emerald-400 border border-emerald-500/20">
                            ₹{app.promotion.budgetRange?.min} - ₹{app.promotion.budgetRange?.max}
                        </span>
                        <span className="px-s2 py-1 bg-dark-700/50 rounded-premium-sm text-xs-pure font-bold text-dark-400 border border-dark-600/30">
                            {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};


export default CreatorDashboard;
