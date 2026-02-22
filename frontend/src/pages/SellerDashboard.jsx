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
import { getReliabilityLevel } from '../utils/reliability';

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
            iconName: 'home',
            description: 'Campaigns'
        },
        {
            id: 'search',
            label: 'Search',
            iconName: 'search',
            description: 'Find Creators'
        },
        {
            id: 'analytics',
            label: 'Stats',
            iconName: 'grid',
            description: 'Analytics'
        },
        {
            id: 'team',
            label: 'Team',
            iconName: 'users',
            description: 'Manage Team'
        },
        {
            id: 'discover',
            label: 'Matches',
            iconName: 'users',
            badge: pendingCreators.length,
            description: 'Applicants'
        },
        {
            id: 'messages',
            label: 'Chat',
            iconName: 'chat',
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

                    {/* Active Campaigns Skeleton */}
                    <div>
                        <div className="flex justify-between items-center mb-s6">
                            <Skeleton variant="title" width={200} height={32} />
                            <Skeleton width={140} height={40} className="rounded-premium-xl" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-s4">
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
                            className="w-full max-w-4xl h-[85vh] bg-dark-900 rounded-premium-2xl overflow-hidden shadow-premium border border-dark-700/50"
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
                        className="space-y-s4"
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
                        <div className="mb-s4">
                            <h2 className="text-h2 font-black text-dark-100 mb-s1 uppercase tracking-widest">Campaign Analytics</h2>
                            <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-tight">Track your campaign performance</p>
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
                        className="space-y-s8 pb-s6"
                    >
                        {/* 1. Hero Section */}
                        <DashboardHero
                            userName={user?.name?.split(' ')[0] || 'Brand'}
                            role="Seller"
                            dailyInsight={requests?.[0]?.aiInsight || "Launch a new campaign to discover top matches! 🚀"}
                            reliability={{
                                level: getReliabilityLevel(user?.reliabilityScore || 1.0),
                                score: user?.reliabilityScore || 1.0
                            }}
                        />



                        {/* 2. Campaign Pipeline Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-s4 md:gap-s6">
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-s6 lg:h-[450px]">
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
                            <div className="space-y-s6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-h2 font-black text-dark-100 flex items-center gap-s3 uppercase tracking-widest">
                                        <HiSparkles className="text-primary-400" /> Active Campaigns
                                    </h2>
                                    <LoadingButton
                                        onClick={() => setShowRequestWizard(true)}
                                        className="px-s6 py-s3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-premium-xl text-xs-pure font-black uppercase tracking-widest transition-all border-none shadow-glow hover:shadow-glow-lg"
                                    >
                                        + New Campaign
                                    </LoadingButton>
                                </div>

                                {requests.length === 0 ? (
                                    <EmptyState
                                        icon="box-empty"
                                        title="No Campaigns Launched Yet"
                                        description="Ready to scale your brand? Launch your first campaign and let our AI find the perfect creators for you."
                                        actionLabel="Launch Campaign"
                                        onAction={() => setShowRequestWizard(true)}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-s4">
                                        {requests.slice(0, 6).map((request, index) => (
                                            <motion.div
                                                key={request._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => setSelectedRequest(request)}
                                                className="p-s5 rounded-premium-2xl bg-dark-800/40 backdrop-blur-md border border-dark-700/50 hover:border-primary-500/30 cursor-pointer transition-all group hover:bg-dark-800/60 shadow-md hover:shadow-premium"
                                            >
                                                <div className="flex items-start justify-between mb-s4">
                                                    <div className={`w-12 h-12 rounded-premium-xl flex items-center justify-center shadow-glow border border-white/10 text-lg font-black ${request.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        request.status === 'Accepted' ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {request.title?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={`px-s2.5 py-1 rounded-premium-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${request.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-dark-700/50 text-dark-400 border-dark-600/30'
                                                        }`}>
                                                        {request.status}
                                                    </span>
                                                </div>

                                                <h3 className="text-body font-black text-dark-100 mb-s2 group-hover:text-primary-400 transition-colors uppercase tracking-tight leading-tight">{request.title}</h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-dark-500 uppercase tracking-tighter">Budget</span>
                                                        <span className="text-xs-pure font-black text-dark-100">₹{request.budget?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-black text-dark-500 uppercase tracking-tighter">Matches</span>
                                                        <span className="text-xs-pure font-black text-primary-400">{request.matchedCreators?.length || 0}</span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar Simulation */}
                                                <div className="w-full bg-dark-950/50 rounded-free h-1 mt-s5 overflow-hidden border border-dark-800/50">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (request.matchedCreators?.length || 0) * 10)}%` }}
                                                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-free shadow-glow"
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
                        className="p-s4"
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


        </DashboardLayout>
    );
};

export default SellerDashboard;
