import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaComments,
    FaFire,
    FaStream,
    FaUsers,
    FaTimes,
    FaArrowLeft,
    FaSearch
} from 'react-icons/fa';
import { HiSparkles, HiHome, HiUserGroup, HiChat, HiViewGrid } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI, chatAPI, collaborationAPI } from '../services/api';
import { trackMatchFeedback, trackMatchOutcome } from '../services/feedback';
import { trackEvent } from '../utils/analytics';
import toast from 'react-hot-toast';

// New Components
import DashboardLayout from '../components/layout/DashboardLayout';
// Navbar removed
import CampaignStories from '../components/seller/CampaignStories';
import SwipeableCreatorCard from '../components/seller/SwipeableCreatorCard';
import QuickStatsBar from '../components/seller/QuickStatsBar';
import CampaignTracker from '../components/seller/CampaignTracker';
import MessagingPanel from '../components/seller/MessagingPanel';
import CollaborationHub from '../components/common/CollaborationHub';

import CreatorSearch from '../components/seller/CreatorSearch';
import QuickActionsFAB from '../components/common/QuickActionsFAB';
import ProfileCompletionBar from '../components/common/ProfileCompletionBar';
import { haptic } from '../utils/haptic';

// NEW: Enhanced Components
import EnhancedCampaignWizard from '../components/seller/EnhancedCampaignWizard';
import SmartRecommendationsPanel from '../components/seller/SmartRecommendationsPanel';
import AIAssistantPanel from '../components/common/AIAssistantPanel';
import PredictiveAnalyticsWidget from '../components/analytics/PredictiveAnalyticsWidget';
import EnhancedCreatorSearch from '../components/seller/EnhancedCreatorSearch';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import { BrandInsightCards } from '../components/analytics/InsightCards';
import TeamManagement from '../components/team/TeamManagement';
import { subscriptionPlans } from '../config/subscriptions';

// Modern Dashboard Widgets
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import DashboardHero from '../components/dashboard/DashboardHero';

// Enhanced UI Components
import LoadingButton from '../components/common/LoadingButton';
import EmptyState from '../components/common/EmptyState';
import BottomSheet from '../components/common/BottomSheet';

// Skeleton Loading Components
import { Skeleton, SkeletonStats, SkeletonCard, SkeletonList } from '../components/common/Skeleton';

import GuidedAIMode from '../components/dashboard/GuidedAIMode';
import FocusWrapper from '../components/dashboard/FocusWrapper';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestWizard, setShowRequestWizard] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeCollabMatch, setActiveCollabMatch] = useState(null); // New state for modal
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [processedCreators, setProcessedCreators] = useState(new Set());
    const [aiSuggestionData, setAiSuggestionData] = useState(null);

    // NEW: Enhanced features state
    const [showAIRecommendations, setShowAIRecommendations] = useState(false);
    const [allCreators, setAllCreators] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [focusMode, setFocusMode] = useState(null);
    const [showGuide, setShowGuide] = useState(true);

    const fetchMatches = async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data.data.conversations || []);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    const handleGuideAction = (type, target) => {
        if (type === 'hover') {
            if (activeTab === 'dashboard' && target === 'campaigns') {
                setFocusMode('campaigns');
            }
        } else if (type === 'leave') {
            setFocusMode(null);
        } else if (type === 'click') {
            if (target === 'search') setActiveTab('search');
            else if (target === 'messages') setActiveTab('messages');
            else if (target === 'campaigns') {
                setActiveTab('dashboard');
                setFocusMode('campaigns');
            }
            setShowGuide(false);
            setTimeout(() => setFocusMode(null), 3000);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchMatches();

        // Listen for message request events from CreatorSearch
        const handleSwitchToMessages = (event) => {
            const { conversation } = event.detail;
            if (conversation) {
                setSelectedConversation(conversation);
                setActiveTab('messages');
            }
        };

        window.addEventListener('switchToMessages', handleSwitchToMessages);
        return () => window.removeEventListener('switchToMessages', handleSwitchToMessages);
    }, []);

    const fetchRequests = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const res = await sellerAPI.getRequests();
            setRequests(res.data.data.requests);
        } catch (error) {
            if (!isBackground) toast.error('Failed to fetch data');
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data.data.conversations || []);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    // Transform AI suggestion to form data
    const transformSuggestionToFormData = (suggestion) => {
        const baseData = {
            title: '',
            promotionType: '',
            budget: '',
            description: '',
            requirements: '',
            targetNiche: [],
            minFollowers: 1000,
            maxFollowers: 100000
        };

        switch (suggestion.type) {
            case 'timing':
                return {
                    ...baseData,
                    title: 'Evening Launch Campaign',
                    description: 'Campaign optimized for evening launch (6-9 PM) to maximize creator engagement and application rates.'
                };

            case 'category':
                return {
                    ...baseData,
                    title: `${suggestion.data?.category || 'Fashion'} Campaign`,
                    targetNiche: [suggestion.data?.category || 'Fashion'],
                    description: `Promote your brand in the ${suggestion.data?.category || 'Fashion'} niche with high creator availability.`
                };

            case 'budget':
                return {
                    ...baseData,
                    title: 'Optimized Budget Campaign',
                    budget: suggestion.data?.max || suggestion.data?.min || '3000',
                    description: 'Campaign with budget optimized for maximum quality applicants based on market trends.'
                };

            case 'promotion':
                return {
                    ...baseData,
                    title: `${suggestion.data?.promotionType || 'Reels'} Campaign`,
                    promotionType: suggestion.data?.promotionType || 'Reel',
                    description: `${suggestion.data?.promotionType || 'Reels'} campaign designed for maximum engagement and viral potential.`
                };

            case 'followers':
                return {
                    ...baseData,
                    title: 'Micro-Influencer Campaign',
                    minFollowers: suggestion.data?.followerMin || 5000,
                    maxFollowers: suggestion.data?.followerMax || 25000,
                    description: 'Target micro-influencers with high engagement rates for authentic, impactful promotions.'
                };

            case 'quickstart':
                return {
                    ...baseData,
                    title: 'Quick Start Campaign',
                    promotionType: 'Reel',
                    budget: '3000',
                    targetNiche: ['Fashion'],
                    description: 'AI-optimized quick start campaign with recommended settings for best results.'
                };

            default:
                return baseData;
        }
    };

    const handleCreateRequest = async (data) => {
        try {
            const res = await sellerAPI.createRequest(data);
            toast.success(`🎉 Campaign launched! Found ${res.data.data.matchedCreatorsCount} creators.`);
            setShowRequestWizard(false);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create campaign');
        }
    };

    const handleAcceptCreator = async (requestId, creatorId) => {
        setProcessedCreators(prev => new Set([...prev, `${requestId}-${creatorId}`]));

        // Optimistic Update
        const updateState = (status) => {
            const updater = (r) => {
                if (r._id === requestId) {
                    return {
                        ...r,
                        matchedCreators: r.matchedCreators?.map(mc =>
                            (mc.creatorId?._id === creatorId || mc.creatorId === creatorId)
                                ? { ...mc, status }
                                : mc
                        )
                    };
                }
                return r;
            };
            setRequests(prev => prev.map(updater));
            if (selectedRequest && selectedRequest._id === requestId) {
                setSelectedRequest(prev => updater(prev));
            }
        };

        updateState('Accepted');

        // Fire Feedback Event
        trackMatchFeedback({
            targetUserId: creatorId,
            action: 'ACCEPTED',
            source: 'seller_dashboard',
            matchId: requestId, // linking matchId to promotionId for now
            meta: { requestId }
        });

        // Track Outcome: ACCEPTED
        // We need the specific matchedCreator ID. 
        // We can find it in the local state.
        const match = selectedRequest?.matchedCreators?.find(mc => mc.creatorId._id === creatorId || mc.creatorId === creatorId);
        if (match) {
            trackMatchOutcome({
                matchId: match._id,
                status: 'accepted'
            });

            // NEW: Auto-open collaboration hub
            // We need the full match object with promotion and creator populated for the hub
            // For now, we'll let them click the button, or fetch it.
            // But let's show a toast action maybe?
        }

        try {
            await sellerAPI.acceptCreator(requestId, creatorId);
            // Initialize collaboration in background
            if (match) {
                await collaborationAPI.initializeCollaboration(match._id).catch(err => console.error("Auto-init failed", err));
            }
            trackEvent('collaboration_accepted');
            toast.success('✅ Creator accepted! Collaboration started.');
            fetchRequests(true);
        } catch (error) {
            updateState('Matched'); // Revert (assuming it was matched)
            toast.error('Failed to accept creator');
        }
    };

    const handleRejectCreator = async (requestId, creatorId) => {
        setProcessedCreators(prev => new Set([...prev, `${requestId}-${creatorId}`]));

        // Optimistic Update
        const updateState = (status) => {
            const updater = (r) => {
                if (r._id === requestId) {
                    return {
                        ...r,
                        matchedCreators: r.matchedCreators?.map(mc =>
                            (mc.creatorId?._id === creatorId || mc.creatorId === creatorId)
                                ? { ...mc, status }
                                : mc
                        )
                    };
                }
                return r;
            };
            setRequests(prev => prev.map(updater));
            if (selectedRequest && selectedRequest._id === requestId) {
                setSelectedRequest(prev => updater(prev));
            }
        };

        updateState('Rejected');

        // Fire Feedback Event
        trackMatchFeedback({
            targetUserId: creatorId,
            action: 'REJECTED',
            source: 'seller_dashboard',
            matchId: requestId,
            meta: { requestId }
        });

        try {
            await sellerAPI.rejectCreator(requestId, creatorId);
            toast.success('Creator passed');
            fetchRequests(true);
        } catch (error) {
            updateState('Matched'); // Revert
            toast.error('Failed to reject creator');
        }
    };

    const handleMessageCreator = async (requestId, creatorId, creatorName) => {
        // Fire Feedback Event (Interest/Click)
        trackMatchFeedback({
            targetUserId: creatorId,
            action: 'CLICKED',
            source: 'seller_dashboard_chat',
            matchId: requestId,
            meta: { type: 'chat_start' }
        });

        // Track Outcome: CONTACTED
        const match = selectedRequest?.matchedCreators?.find(mc => mc.creatorId._id === creatorId || mc.creatorId === creatorId);
        if (match) {
            trackMatchOutcome({
                matchId: match._id,
                status: 'contacted'
            });
        }

        try {
            const res = await chatAPI.findOrRestoreConversation(requestId, creatorId);
            const conversation = res.data.data.conversation;
            if (conversation) {
                setSelectedConversation({
                    ...conversation,
                    creatorUserId: conversation.creatorUserId || { name: creatorName }
                });
                setActiveTab('messages');
            }
        } catch (error) {
            toast.error('Failed to open chat');
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        try {
            await sellerAPI.updateStatus(requestId, status);
            toast.success(`Campaign ${status.toLowerCase()}`);
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm('Delete this campaign?')) return;
        try {
            await sellerAPI.deleteRequest(requestId);
            toast.success('Campaign deleted');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!window.confirm('Delete this conversation?')) return;

        // Optimistic Update
        const previousConversations = [...conversations];
        setConversations(conversations.filter(c => c._id !== conversationId));
        if (selectedConversation?._id === conversationId) {
            setSelectedConversation(null);
        }

        try {
            await chatAPI.deleteConversation(conversationId);
            toast.success('Conversation deleted');
            // Background refresh to ensure sync
            fetchConversations();
        } catch (error) {
            // Revert on failure
            setConversations(previousConversations);
            toast.error('Failed to delete conversation');
        }
    };

    // Get pending creators for swipe
    const getPendingCreators = () => {
        const creators = [];
        requests.forEach(request => {
            request.matchedCreators?.forEach(creator => {
                if (creator.status === 'Applied' && !processedCreators.has(`${request._id}-${creator.creatorId}`)) {
                    creators.push({
                        ...creator,
                        requestId: request._id,
                        requestTitle: request.title,
                        budget: request.budget,
                        promotionType: request.promotionType,
                        niche: request.targetNiche
                    });
                }
            });
        });
        return creators;
    };

    const stats = {
        total: requests.length,
        active: requests.filter(r => ['Open', 'Creator Interested', 'Accepted'].includes(r.status)).length,
        completed: requests.filter(r => r.status === 'Completed').length,
        pending: getPendingCreators().length,
        totalMatches: requests.reduce((sum, r) => sum + (r.matchedCreators?.length || 0), 0)
    };

    const pendingCreators = getPendingCreators();

    // Bottom navigation - 6 tabs with Analytics & Team
    const tabs = [
        {
            id: 'dashboard',
            label: 'Home',
            icon: <HiHome />,
            description: 'Campaigns'
        },
        {
            id: 'search',
            label: 'Search',
            icon: <FaSearch />,
            description: 'Find Creators'
        },
        {
            id: 'analytics',
            label: 'Stats',
            icon: <FaStream />,
            description: 'Analytics'
        },
        {
            id: 'team',
            label: 'Team',
            icon: <FaUsers />,
            description: 'Manage Team'
        },
        {
            id: 'discover',
            label: 'Matches',
            icon: <HiUserGroup />,
            badge: pendingCreators.length,
            description: 'Applicants'
        },
        {
            id: 'messages',
            label: 'Chat',
            icon: <HiChat />,
            badge: conversations.filter(c => c.unreadCount > 0).length,
            description: 'Messages'
        }
    ];

    // Helper to open collab hub
    const handleOpenCollab = (match) => {
        // Construct full match object if needed, or pass what we have
        // We need: id, promotion: {title}, creator: {user: {name}}
        // The match object from requests already has this structure usually
        setActiveCollabMatch(match);
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

                    {/* Active Campaigns Skeleton */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton variant="title" width={200} height={32} />
                            <Skeleton width={140} height={40} className="rounded-xl" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout
            user={user}
            activeTab={activeTab}
            setActiveTab={(tab) => {
                setActiveTab(tab);
                haptic.light();
            }}
            tabs={tabs}
            showGuide={showGuide}
            setShowGuide={setShowGuide}
        >
            {/* Onboarding Tour for new users */}
            <OnboardingTour role="seller" />

            {/* Campaign Stories */}
            <CampaignStories
                campaigns={requests}
                onCreateNew={() => setShowRequestWizard(true)}
                onSelectCampaign={(campaign) => setSelectedRequest(campaign)}
            />

            {/* Collaboration Hub Modal */}
            <AnimatePresence>
                {activeCollabMatch && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl h-[85vh] bg-dark-900 rounded-3xl overflow-hidden shadow-2xl border border-dark-700"
                        >
                            <CollaborationHub
                                match={activeCollabMatch}
                                isOwner={true}
                                onClose={() => setActiveCollabMatch(null)}
                                onComplete={() => fetchRequests(true)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Collapsible Stats Bar */}
            <QuickStatsBar stats={stats} />

            <AnimatePresence mode="wait">
                {/* Guided AI Mode Overlay */}
                {showGuide && (
                    <GuidedAIMode
                        role="seller"
                        onAction={handleGuideAction}
                        onClose={() => setShowGuide(false)}
                    />
                )}

                {/* Search Tab - Creator Discovery with AI */}
                {activeTab === 'search' && (
                    <motion.div
                        key="search"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        {/* Enhanced Creator Search */}
                        <EnhancedCreatorSearch
                            onSearch={(results) => {
                                setAllCreators(results);
                                setShowAIRecommendations(true);
                            }}
                            onSelect={(creator) => {
                                console.log('Selected creator:', creator);
                                toast.success(`Selected ${creator.name}`);
                            }}
                        />

                        {/* AI Smart Recommendations */}
                        {showAIRecommendations && selectedRequest && (
                            <SmartRecommendationsPanel
                                campaign={selectedRequest}
                                allCreators={allCreators}
                                onInvite={(creators) => {
                                    console.log('Inviting creators:', creators);
                                    toast.success(`Invited ${creators.length} creators!`);
                                }}
                            />
                        )}
                    </motion.div>
                )}

                {/* Discover Tab - Swipe Cards Only */}
                {activeTab === 'discover' && (
                    <motion.div
                        key="discover"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex justify-center"
                    >
                        {/* Swipeable Creator Cards */}
                        <div className="w-full max-w-md">
                            <SwipeableCreatorCard
                                creators={pendingCreators}
                                onAccept={handleAcceptCreator}
                                onReject={handleRejectCreator}
                                onMessage={handleMessageCreator}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-dark-100 mb-1">Campaign Analytics</h2>
                            <p className="text-sm text-dark-400">Track your campaign performance</p>
                        </div>
                        <AnalyticsDashboard userType="seller" requests={requests} />
                    </motion.div>
                )}

                {/* Team Management Tab */}
                {activeTab === 'team' && (
                    <motion.div
                        key="team"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <TeamManagement />
                    </motion.div>
                )}

                {/* Dashboard Tab - Modernized */}
                {activeTab === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8 pb-6"
                    >
                        {/* 1. Hero Section */}
                        <DashboardHero
                            userName={(user?.companyName || user?.name || '').split(' ')[0] || 'Seller'}
                            role="Seller"
                            dailyInsight="Welcome to your campaign dashboard! 🚀"
                        />



                        {/* 2. Campaign Pipeline Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <StatCard
                                label="Total Budget"
                                value="₹0" // Placeholder until real budget logic
                                icon={<FaFire />}
                                color="orange"
                                trend={0}
                                delay={0.1}
                            />
                            <StatCard
                                label="Active Campaigns"
                                value={stats.active}
                                icon={<HiViewGrid />}
                                color="blue"
                                trend={0}
                                delay={0.2}
                            />
                            <StatCard
                                label="Pending Applicants"
                                value={stats.pending}
                                icon={<HiUserGroup />}
                                color="purple"
                                trend={0}
                                delay={0.3}
                            />
                            <StatCard
                                label="Total Matches"
                                value={stats.totalMatches}
                                icon={<HiSparkles />}
                                color="emerald"
                                trend={0}
                                delay={0.4}
                            />
                        </div>

                        {/* Brand Insights */}
                        <BrandInsightCards />

                        {/* 3. Charts & Applicant Feed */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[450px]">
                            <div className="lg:col-span-2 h-[300px] lg:h-full">
                                <PerformanceChart
                                    title="Campaign Spend & ROI"
                                    color="#f59e0b"
                                    data={[]} // Empty data until analytics API is ready
                                />
                            </div>
                            <div className="h-[400px] lg:h-full">
                                <ActivityFeed
                                    activities={pendingCreators.slice(0, 5).map(c => ({
                                        id: c.creatorId,
                                        title: c.name,
                                        description: `Applied to ${c.requestTitle}`,
                                        time: 'Just now',
                                        icon: <HiUserGroup />,
                                        iconColor: 'bg-purple-500/20 text-purple-400'
                                    }))}
                                    emptyMessage="No pending applicants"
                                />
                            </div>
                        </div>

                        {/* 4. Active Campaigns List (Modernized) */}
                        <FocusWrapper sectionId="campaigns" currentFocus={focusMode}>
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                                        <HiSparkles className="text-primary-400" /> Active Campaigns
                                    </h2>
                                    <LoadingButton
                                        onClick={() => setShowRequestWizard(true)}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors border-none shadow-lg shadow-primary-500/20"
                                    >
                                        + New Campaign
                                    </LoadingButton>
                                </div>

                                {requests.length === 0 ? (
                                    <EmptyState
                                        icon={<HiViewGrid />}
                                        title="No campaigns yet"
                                        description="Launch your first campaign to find creators"
                                        action={
                                            <LoadingButton
                                                onClick={() => setShowRequestWizard(true)}
                                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold border-none shadow-lg shadow-primary-500/20"
                                            >
                                                Launch Campaign
                                            </LoadingButton>
                                        }
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {requests.slice(0, 6).map((request, index) => (
                                            <motion.div
                                                key={request._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => setSelectedRequest(request)}
                                                className="p-4 rounded-2xl bg-dark-800/60 border border-dark-700/50 hover:border-primary-500/30 cursor-pointer transition-all group hover:bg-dark-800"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${request.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        request.status === 'Accepted' ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {request.title?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'Open' ? 'bg-green-500/10 text-green-400' : 'bg-dark-700 text-dark-400'
                                                        }`}>
                                                        {request.status}
                                                    </span>
                                                </div>

                                                <h3 className="font-semibold text-dark-100 mb-1 group-hover:text-primary-400 transition-colors">{request.title}</h3>
                                                <div className="flex items-center justify-between text-sm text-dark-400">
                                                    <span>Budget: ₹{request.budget?.toLocaleString()}</span>
                                                    <span>{request.matchedCreators?.length || 0} Matches</span>
                                                </div>

                                                {/* Progress Bar Simulation */}
                                                <div className="w-full bg-dark-700 rounded-full h-1.5 mt-4 overflow-hidden">
                                                    <div
                                                        className="bg-primary-500 h-full rounded-full"
                                                        style={{ width: `${Math.min(100, (request.matchedCreators?.length || 0) * 10)}%` }}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </FocusWrapper>
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
                        <MessagingPanel
                            conversations={conversations}
                            selectedConversation={selectedConversation}
                            onSelectConversation={(conv) => setSelectedConversation(conv)}
                            onDeleteConversation={handleDeleteConversation}
                            onBack={() => setSelectedConversation(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Actions and Modals */}
            <QuickActionsFAB
                userRole="seller"
                onBrowse={() => setActiveTab('search')}
                onCreateCampaign={() => setShowRequestWizard(true)}
            />

            {/* Modals */}
            {/* Enhanced Campaign Wizard (Primary) */}
            <EnhancedCampaignWizard
                isOpen={showRequestWizard}
                onClose={() => {
                    setShowRequestWizard(false);
                    setAiSuggestionData(null);
                }}
                onSubmit={handleCreateRequest}
                initialData={aiSuggestionData}
            />

            {/* Enhanced Campaign Tracker in Bottom Sheet */}
            <BottomSheet
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                title={selectedRequest?.title || 'Campaign Details'}
                className="p-0" // Remove default padding as CampaignTracker has its own
            >
                {selectedRequest && (
                    <CampaignTracker
                        request={selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                        onAccept={(creatorId) => handleAcceptCreator(selectedRequest._id, creatorId)}
                        onReject={(creatorId) => handleRejectCreator(selectedRequest._id, creatorId)}
                        onMessage={(creatorId, creatorName) => handleMessageCreator(selectedRequest._id, creatorId, creatorName)}
                        onUpdateStatus={(status) => handleUpdateStatus(selectedRequest._id, status)}
                        onDelete={() => handleDeleteRequest(selectedRequest._id)}
                    />
                )}
            </BottomSheet>

            {/* NEW: AI Assistant Panel (Always available) */}
            <AIAssistantPanel
                campaign={selectedRequest}
                onUse={(content) => {
                    console.log('AI Content:', content);
                    toast.success('AI content ready to use!');
                }}
            />

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    plan={selectedPlan}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </DashboardLayout>
    );
};

export default SellerDashboard;
