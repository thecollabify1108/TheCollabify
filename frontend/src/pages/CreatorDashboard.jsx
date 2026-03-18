import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBriefcase,
    FaHandshake
} from 'react-icons/fa';
import { HiSparkles, HiUserGroup, HiLightningBolt, HiBriefcase } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { creatorAPI } from '../services/api';
import { trackMatchFeedback } from '../services/feedback';
import { getCached, setCache, clearDashboardCache } from '../utils/dashboardCache';
import toast from 'react-hot-toast';

// Components
import DashboardLayout from '../components/layout/DashboardLayout';
import Navbar from '../components/common/Navbar';
import CreatorOnboarding from '../components/creator/CreatorOnboarding';
import ChatBox from '../components/common/ChatBox';
import CollaborationHub from '../components/common/CollaborationHub';
import CollaborationStepper from '../components/common/CollaborationStepper';

// Lazy-loaded: defers InsightCards API call until dashboard scrolls into view
const CreatorInsightCards = lazy(() => import('../components/analytics/InsightCards').then(m => ({ default: m.CreatorInsightCards })));
import QuickActionsFAB from '../components/common/QuickActionsFAB';
import { getReliabilityLevel } from '../utils/reliability';
import CreatorPitchWizard from '../components/creator/CreatorPitchWizard';
import { availabilityAPI } from '../services/api';

// NEW: Enhanced Components
import AIAssistantPanel from '../components/common/AIAssistantPanel';
import { getUpgradePlan } from '../config/subscriptions';

// Modern Dashboard Widgets
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DashboardHero from '../components/dashboard/DashboardHero';

// Enhanced UI Components
import LoadingButton from '../components/common/LoadingButton';
import EmptyState from '../components/common/EmptyState';
import EarlyBirdBanner from '../components/common/EarlyBirdBanner';

// Skeleton Loading Components
import { Skeleton, SkeletonStats, SkeletonList } from '../components/common/Skeleton';

import FocusWrapper from '../components/dashboard/FocusWrapper';

// Lazy-loaded tab content — only fetched when user navigates to these tabs
const PerformanceChart = lazy(() => import('../components/dashboard/PerformanceChart'));
const AnalyticsDashboard = lazy(() => import('../components/analytics/AnalyticsDashboard'));
const ProfileForm = lazy(() => import('../components/creator/ProfileForm'));
const ProfileCard = lazy(() => import('../components/creator/ProfileCard'));
const PromotionList = lazy(() => import('../components/creator/PromotionList'));
const ConversationList = lazy(() => import('../components/common/ConversationList'));
const MessageRequests = lazy(() => import('../components/creator/MessageRequests'));

const CreatorDashboard = () => {
    const { user } = useAuth();
    const _mountTime = performance.now();
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
    const [availabilityStatus, setAvailabilityStatus] = useState('idle');
    const [activeCollab, setActiveCollab] = useState(null);
    const [activePitch, setActivePitch] = useState(null);
    const [showPitchWizard, setShowPitchWizard] = useState(false);

    const [searchParams] = useSearchParams();

    // Helper function to format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    /**
     * Normalize profile data from the backend.
     * Prisma stores flat fields (minPrice, maxPrice, aiScore) but
     * frontend components expect nested structures (priceRange, insights).
     */
    const normalizeProfile = (p) => {
        if (!p) return p;
        return {
            ...p,
            // Map flat price fields to the nested shape UI components expect
            priceRange: p.priceRange || {
                min: p.minPrice ?? 0,
                max: p.maxPrice ?? 0,
            },
            // Map aiScore into the insights.score shape ProfileCard reads
            insights: p.insights || { score: p.aiScore ?? 0 },
        };
    };

    // Calculate profile completion percentage based on actual form fields
    const calculateProfileCompletion = () => {
        if (!profile) return 0;
        const fields = [
            profile.followerCount > 0,
            profile.engagementRate > 0,
            profile.category,
            profile.bio
        ];
        const filledFields = fields.filter(Boolean).length;
        return Math.round((filledFields / fields.length) * 100);
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
        // Cache-first: show cached data instantly, then revalidate
        if (!isBackground) {
            const cachedProfile = getCached('creator_profile');
            const cachedPromotions = getCached('creator_promotions');
            const cachedApplications = getCached('creator_applications');

            if (cachedProfile) {
                setProfile(normalizeProfile(cachedProfile));
                setPromotions(cachedPromotions || []);
                setApplications(cachedApplications || []);
                setLoading(false);
                console.log(`[Perf] CreatorDashboard cache-hit TTI: ${(performance.now() - _mountTime).toFixed(0)}ms`);
            } else {
                setLoading(true);
            }
        }

        try {
            let profilePromise, promotionsPromise, applicationsPromise;
            if (user?.role === 'seller' || user?.role === 'brand') {
                // Sellers/brands should fetch their own profile
                profilePromise = import('../services/api').then(m => m.sellerAPI.getRequests());
                promotionsPromise = Promise.resolve({ status: 'fulfilled', value: { data: { data: { promotions: [] } } } });
                applicationsPromise = Promise.resolve({ status: 'fulfilled', value: { data: { data: { applications: [] } } } });
            } else {
                profilePromise = creatorAPI.getProfile();
                promotionsPromise = creatorAPI.getPromotions();
                applicationsPromise = creatorAPI.getApplications();
            }
            const [profileRes, promotionsRes, applicationsRes, pitchRes] = await Promise.allSettled([
                profilePromise,
                promotionsPromise,
                applicationsPromise,
                user?.role !== 'seller' && user?.role !== 'brand' ? availabilityAPI.getMy() : Promise.resolve({ data: { data: { campaign: null } } })
            ]);

            if (profileRes.status === 'fulfilled') {
                let freshProfile;
                if (user?.role === 'seller' || user?.role === 'brand') {
                    // Seller/brand profile shape
                    freshProfile = profileRes.value.data.data.requests?.[0] || {};
                } else {
                    freshProfile = normalizeProfile(profileRes.value.data.data.profile);
                }
                setProfile(freshProfile);
                setCache('creator_profile', freshProfile);
            } else if (profileRes.reason?.response?.status === 404) {
                setShowProfileForm(true);
            }

            if (promotionsRes.status === 'fulfilled') {
                const rawPromotions = promotionsRes.value.data.data.promotions;
                // Deduplicate by ID to prevent duplicate campaign cards
                const uniquePromotions = Array.from(new Map(rawPromotions.map(p => [p.id, p])).values());
                setPromotions(uniquePromotions);
                setCache('creator_promotions', uniquePromotions);
            }

            if (applicationsRes.status === 'fulfilled') {
                const freshApplications = applicationsRes.value.data.data.applications;
                setApplications(freshApplications);
                setCache('creator_applications', freshApplications);
            }

            if (pitchRes?.status === 'fulfilled') {
                setActivePitch(pitchRes.value.data.data.campaign);
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
                console.log(`[Perf] CreatorDashboard network TTI: ${(performance.now() - _mountTime).toFixed(0)}ms`);
            }
        }
    };

    const handleProfileSaved = (updatedProfile) => {
        // Immediately apply the updated profile so the UI reflects changes
        if (updatedProfile) {
            const normalized = normalizeProfile(updatedProfile);
            setProfile(normalized);
            // Update the cache with fresh data so it doesn't serve stale values
            setCache('creator_profile', normalized);
        } else {
            // Fallback: clear cache and re-fetch
            clearDashboardCache();
            fetchData(true);
        }
        setShowProfileForm(false);
        setIsEditingProfile(false);
        // Stay on profile tab so user sees their updated profile
        setActiveTab('profile');
    };

    const handleUpgrade = () => {
        const plan = getUpgradePlan(user?.role || 'creator');
        setSelectedPlan(plan);
        toast.success(`${plan.name} features coming soon!`);
    };

    const handleApplyToPromotion = async (promotionId) => {
        // Optimistic Update
        const previousPromotions = [...promotions];
        setPromotions(promotions.map(p =>
            p.id === promotionId ? { ...p, hasApplied: true, status: 'Applied' } : p
        ));

        // Get promotion details for feedback
        const promotion = promotions.find(p => p.id === promotionId);
        if (promotion) {
            trackMatchFeedback({
                targetUserId: promotion.sellerId, // The brand/seller
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
                'AVAILABLE_NOW': 'Status: Available',
                'LIMITED_AVAILABILITY': 'Status: Limited',
                'NOT_AVAILABLE': 'Status: Unavailable'
            };
            toast.success(`Status: ${labels[nextStatus]}`);
        } catch (error) {
            setAvailabilityStatus('error');
            setTimeout(() => setAvailabilityStatus('idle'), 2000);
            toast.error('Failed to update availability');
        }
    };

    const handleDeletePitch = async () => {
        if (!activePitch) return;
        try {
            await availabilityAPI.delete(activePitch.id);
            setActivePitch(null);
            toast.success('Collab Request Deactivated');
        } catch (error) {
            toast.error('Failed to deactivate request');
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
            setTimeout(() => setFocusMode(null), 3000);
        }
    };

    // Imported Skeleton components moved to top-level imports

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 pb-s20">
                <Navbar />
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 space-y-4">
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[300px]">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-s4">
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
        >
            <Suspense fallback={<div className="flex items-center justify-center py-12"><Skeleton className="w-full h-64" /></div>}>
                <AnimatePresence mode="wait">

                    {/* Dashboard Tab - Modernized */}
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4 pb-4"
                        >
                            {profile ? (
                                <>
                                    {/* 1. Hero Section */}
                                    <DashboardHero
                                        userName={user?.name}
                                        role="Creator"
                                        dailyInsight={profile?.aiInsights?.daily}
                                        availabilityStatus={profile?.availabilityStatus}
                                        onToggleAvailability={handleToggleAvailability}
                                        reliability={{
                                            level: getReliabilityLevel(profile?.reliabilityScore || 1.0),
                                            score: profile?.reliabilityScore || 1.0
                                        }}
                                    />

                                    {/* 2. Stats Grid */}
                                    <FocusWrapper sectionId="stats" currentFocus={focusMode}>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
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
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 min-h-[280px] sm:min-h-[350px]">
                                            {/* Active Collaborations Section */}
                                            <div className="lg:col-span-2 space-y-s4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-body font-black text-dark-100 uppercase tracking-wider">Active Collaborations</h3>
                                                    <span className="px-s3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs-pure font-black">
                                                        {applications.filter(app => app.applicationStatus === 'ACCEPTED' || app.status === 'Accepted').length} ACTIVE
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                    {(() => {
                                                        const activeCollabs = applications.filter(app => app.applicationStatus === 'ACCEPTED' || app.status === 'Accepted');
                                                        const uniqueCollabs = Array.from(new Map(activeCollabs.map(item => [item.promotion?.id || Math.random(), item])).values());
                                                        
                                                        if (uniqueCollabs.length === 0) {
                                                            return (
                                                                <div className="md:col-span-2 p-12 rounded-[2rem] bg-dark-800/20 border border-white/5 flex flex-col items-center justify-center text-center backdrop-blur-md">
                                                                    <div className="w-16 h-16 rounded-full bg-dark-700/30 flex items-center justify-center mb-6 border border-white/5">
                                                                        <FaHandshake className="text-3xl text-dark-500" />
                                                                    </div>
                                                                    <p className="text-xs font-black text-dark-400 uppercase tracking-[0.2em]">No active collaborations yet</p>
                                                                </div>
                                                            );
                                                        }

                                                        return uniqueCollabs.map((app, i) => (
                                                            <motion.div
                                                                key={app.id}
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: i * 0.1 }}
                                                                whileHover={{ y: -8, scale: 1.02 }}
                                                                onClick={() => setActiveCollab({ id: app.id, promotion: app.promotion, seller: app.sellerId || app.seller })}
                                                                className="relative p-6 rounded-[2rem] bg-dark-900/40 border border-white/5 backdrop-blur-3xl cursor-pointer hover:border-primary-500/50 transition-all group overflow-hidden shadow-2xl hover:shadow-primary-500/10"
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-indigo-500/0 group-hover:from-primary-500/5 group-hover:to-indigo-500/10 transition-all duration-500" />
                                                                
                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-4 mb-6">
                                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-xl border border-white/10">
                                                                            {(app.sellerId?.name || app.seller?.name || 'B').charAt(0)}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-lg font-black text-white truncate leading-tight">{app.promotion?.title}</p>
                                                                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{app.sellerId?.name || app.seller?.name || 'Brand'}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-1 px-2 mb-6">
                                                                        <CollaborationStepper
                                                                            currentStatus={app.collaborationStatus || 'ACCEPTED'}
                                                                            className="scale-90 origin-left"
                                                                        />
                                                                    </div>

                                                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-primary-400 transition-colors">Manage Collab →</span>
                                                                        <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">{new Date(app.updatedAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ));
                                                    })()}
                                                </div>

                                                {/* Earnings overview (moved lower) */}
                                                <div className="h-[200px] sm:h-[250px] pt-s2">
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
                                                        id: app.id,
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
                                    <CreatorInsightCards profileCompletion={calculateProfileCompletion()} />

                                    {/* 4. Action Items (Today's Focus - Modernized) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-s4">
                                        {calculateProfileCompletion() < 100 && (
                                            <FocusWrapper sectionId="profile" currentFocus={focusMode} className="h-full">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="p-[1px] rounded-premium-2xl bg-gradient-to-r from-indigo-600 to-indigo-400 h-full"
                                                >
                                                    <div className="bg-dark-900 rounded-premium-xl p-s5 h-full">
                                                        <div className="flex justify-between items-center mb-s2">
                                                            <h3 className="font-bold text-white uppercase tracking-wider text-xs-pure">Profile Strength</h3>
                                                            <span className="text-h3 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                                                                {calculateProfileCompletion()}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-dark-800 rounded-full h-2 mb-s4">
                                                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full" style={{ width: `${calculateProfileCompletion()}%` }} />
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
                                        )}

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
                                                    className="w-full py-s2 rounded-premium-lg bg-indigo-600 hover:bg-indigo-500 text-small font-bold text-white transition-all border-none"
                                                >
                                                    Explore Matches
                                                </LoadingButton>
                                            </motion.div>
                                        </FocusWrapper>

                                        {/* Creator Pitch Card */}
                                        <FocusWrapper sectionId="pitch" currentFocus={focusMode} className="h-full">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.7 }}
                                                className={`p-s5 rounded-premium-2xl border backdrop-blur-sm h-full shadow-md transition-all ${
                                                    activePitch 
                                                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                                                    : 'bg-primary-500/5 border-primary-500/20 hover:shadow-glow'
                                                }`}
                                            >
                                                {activePitch ? (
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-bold text-white uppercase tracking-wider text-xs-pure flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                    Active Lead
                                                                </h3>
                                                                <p className="text-[10px] text-dark-400 mt-1 uppercase tracking-widest">{activePitch.locationCity}</p>
                                                            </div>
                                                            <button 
                                                                onClick={handleDeletePitch}
                                                                className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors"
                                                            >
                                                                Deactivate
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-small text-white">₹{activePitch.collaborationBudgetMin} - ₹{activePitch.collaborationBudgetMax}</span>
                                                            <span className="text-[10px] font-bold text-dark-500">{activePitch.durationDays} Days</span>
                                                        </div>
                                                        <p className="text-[10px] text-dark-400 line-clamp-2 md:line-clamp-1 italic">"{activePitch.description}"</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-s4">
                                                            <div className="p-s3 rounded-full bg-primary-500/20 text-primary-400 shadow-sm">
                                                                <HiLightningBolt className="text-h3" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white uppercase tracking-wider text-xs-pure">Raise Pitch</h3>
                                                                <p className="text-small text-dark-400">Can't find matches? Let brands find you.</p>
                                                            </div>
                                                        </div>
                                                        <LoadingButton
                                                            onClick={() => setShowPitchWizard(true)}
                                                            className="w-full py-s2 rounded-premium-lg bg-primary-600 hover:bg-primary-500 text-small font-bold text-white transition-all border-none"
                                                        >
                                                            Create Lead
                                                        </LoadingButton>
                                                    </div>
                                                )}
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
                                profileComplete={calculateProfileCompletion() >= 100}
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
                            className="p-3 space-y-4"
                        >
                            <div className="mb-s4">
                                <h2 className="text-h2 font-bold text-dark-100 mb-s1">Profile Settings</h2>
                                <p className="text-body text-dark-400">Manage your creator profile</p>
                            </div>

                            {user.subscription?.status !== 'active' && (
                                <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/20">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-base font-semibold text-white mb-1">Upgrade to Pro Plan</h3>
                                            <p className="text-indigo-300/70 max-w-md text-xs">Access advanced analytics, structured reports, and priority matching.</p>
                                        </div>
                                        <LoadingButton
                                            onClick={handleUpgrade}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm border-none"
                                        >
                                            Upgrade
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
            </Suspense>

            {/* Quick Actions and Overlays */}
            <QuickActionsFAB
                userRole="creator"
                onBrowse={() => setActiveTab('opportunities')}
                onPitch={() => setShowPitchWizard(true)}
            />

            <AIAssistantPanel
                onUse={(content) => {
                    toast.success('Content copied to clipboard');
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
                        conversationId={selectedConversation.id}
                        otherUserName={selectedConversation.sellerId?.name || 'Seller'}
                        promotionTitle={selectedConversation.promotionId?.title || 'Promotion'}
                        conversation={selectedConversation}
                        onClose={() => setSelectedConversation(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPitchWizard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl bg-dark-900 rounded-premium-2xl overflow-y-auto max-h-[90vh] shadow-premium border border-dark-700/50"
                        >
                            <CreatorPitchWizard 
                                onClose={() => setShowPitchWizard(false)} 
                                onSuccess={() => fetchData(true)}
                            />
                        </motion.div>
                    </div>
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
