import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaFire
} from 'react-icons/fa';
import { HiSparkles, HiUserGroup, HiViewGrid } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI, chatAPI, collaborationAPI } from '../services/api';
import { trackMatchFeedback, trackMatchOutcome } from '../services/feedback';
import { trackEvent } from '../utils/analytics';
import { getCached, setCache } from '../utils/dashboardCache';
import toast from 'react-hot-toast';

// New Components
import DashboardLayout from '../components/layout/DashboardLayout';
import Navbar from '../components/common/Navbar';
import CampaignStories from '../components/seller/CampaignStories';
import QuickStatsBar from '../components/seller/QuickStatsBar';
import CampaignTracker from '../components/seller/CampaignTracker';
import CollaborationHub from '../components/common/CollaborationHub';

import QuickActionsFAB from '../components/common/QuickActionsFAB';
import { haptic } from '../utils/haptic';
import { getReliabilityLevel } from '../utils/reliability';

// NEW: Enhanced Components
import EnhancedCampaignWizard from '../components/seller/EnhancedCampaignWizard';
import AIAssistantPanel from '../components/common/AIAssistantPanel';

// Lazy-loaded: defers InsightCards API call until dashboard scrolls into view
const BrandInsightCards = lazy(() => import('../components/analytics/InsightCards').then(m => ({ default: m.BrandInsightCards })));

// Modern Dashboard Widgets
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DashboardHero from '../components/dashboard/DashboardHero';

// Enhanced UI Components
import LoadingButton from '../components/common/LoadingButton';
import EmptyState from '../components/common/EmptyState';
import BottomSheet from '../components/common/BottomSheet';
import EarlyBirdBanner from '../components/common/EarlyBirdBanner';

// Skeleton Loading Components
import { Skeleton, SkeletonStats, SkeletonCard, SkeletonList } from '../components/common/Skeleton';

import GuidedAIMode from '../components/dashboard/GuidedAIMode';
import FocusWrapper from '../components/dashboard/FocusWrapper';

// Lazy-loaded tab content (only fetched when the user navigates to that tab)
const PerformanceChart = lazy(() => import('../components/dashboard/PerformanceChart'));
const EnhancedCreatorSearch = lazy(() => import('../components/seller/EnhancedCreatorSearch'));
const SmartRecommendationsPanel = lazy(() => import('../components/seller/SmartRecommendationsPanel'));
const AnalyticsDashboard = lazy(() => import('../components/analytics/AnalyticsDashboard'));
const TeamManagement = lazy(() => import('../components/team/TeamManagement'));
const MessagingPanel = lazy(() => import('../components/seller/MessagingPanel'));
const SwipeableCreatorCard = lazy(() => import('../components/seller/SwipeableCreatorCard'));

const SellerDashboard = () => {
    const { user } = useAuth();
    const _mountTime = performance.now();
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
        // Cache-first: show cached data instantly, then revalidate
        const loadDashboard = async () => {
            const cachedRequests = getCached('seller_requests');
            const cachedConversations = getCached('seller_conversations');

            // If we have cached data, render immediately (no loading spinner)
            if (cachedRequests) {
                setRequests(cachedRequests);
                setConversations(cachedConversations || []);
                setLoading(false);
                console.log(`[Perf] SellerDashboard cache-hit TTI: ${(performance.now() - _mountTime).toFixed(0)}ms`);
            } else {
                setLoading(true);
            }

            // Fetch fresh data in parallel (stale-while-revalidate)
            try {
                const [requestsRes, conversationsRes] = await Promise.allSettled([
                    sellerAPI.getRequests(),
                    chatAPI.getConversations()
                ]);

                if (requestsRes.status === 'fulfilled') {
                    const freshRequests = requestsRes.value.data.data.requests;
                    setRequests(freshRequests);
                    setCache('seller_requests', freshRequests);
                }
                if (conversationsRes.status === 'fulfilled') {
                    const freshConversations = conversationsRes.value.data.data.conversations || [];
                    setConversations(freshConversations);
                    setCache('seller_conversations', freshConversations);
                }
            } catch (error) {
                if (!cachedRequests) toast.error('Failed to fetch data');
            } finally {
                setLoading(false);
                console.log(`[Perf] SellerDashboard network TTI: ${(performance.now() - _mountTime).toFixed(0)}ms`);
            }
        };

        loadDashboard();

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

    // fetchConversations removed — duplicate of fetchMatches above

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
            toast.success(`Campaign created. ${res.data.data.matchedCreatorsCount} creators matched.`);
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
                if (r.id === requestId) {
                    return {
                        ...r,
                        matchedCreators: r.matchedCreators?.map(mc =>
                            mc.creatorId === creatorId
                                ? { ...mc, status }
                                : mc
                        )
                    };
                }
                return r;
            };
            setRequests(prev => prev.map(updater));
            if (selectedRequest && selectedRequest.id === requestId) {
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
        const match = selectedRequest?.matchedCreators?.find(mc => mc.creatorId === creatorId);
        if (match) {
            trackMatchOutcome({
                matchId: match.id,
                status: 'accepted'
            });
        }

        try {
            await sellerAPI.acceptCreator(requestId, creatorId);
            // Initialize collaboration in background
            if (match) {
                await collaborationAPI.initializeCollaboration(match.id).catch(err => console.error("Auto-init failed", err));
            }
            trackEvent('collaboration_accepted');
            toast.success('Creator accepted. Collaboration initiated.');
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
                if (r.id === requestId) {
                    return {
                        ...r,
                        matchedCreators: r.matchedCreators?.map(mc =>
                            mc.creatorId === creatorId
                                ? { ...mc, status }
                                : mc
                        )
                    };
                }
                return r;
            };
            setRequests(prev => prev.map(updater));
            if (selectedRequest && selectedRequest.id === requestId) {
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
        const match = selectedRequest?.matchedCreators?.find(mc => mc.creatorId === creatorId);
        if (match) {
            trackMatchOutcome({
                matchId: match.id,
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
        setConversations(conversations.filter(c => c.id !== conversationId));
        if (selectedConversation?.id === conversationId) {
            setSelectedConversation(null);
        }

        try {
            await chatAPI.deleteConversation(conversationId);
            toast.success('Conversation deleted');
            // Background refresh to ensure sync
            fetchMatches();
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
                if (creator.status === 'Applied' && !processedCreators.has(`${request.id}-${creator.creatorId}`)) {
                    creators.push({
                        ...creator,
                        requestId: request.id,
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
            badge: conversations.filter(c => c.unreadCountSeller > 0).length,
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[300px] lg:h-[400px]">
                        <div className="lg:col-span-2 glass-card p-4">
                            <Skeleton variant="title" width="30%" height={28} className="mb-4" />
                            <Skeleton variant="rectangular" width="100%" height="80%" />
                        </div>
                        <div className="glass-card p-4">
                            <Skeleton variant="title" width="40%" height={28} className="mb-4" />
                            <SkeletonList count={4} />
                        </div>
                    </div>

                    {/* Active Campaigns Skeleton */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <Skeleton variant="title" width={200} height={32} />
                            <Skeleton width={140} height={40} className="rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
            {/* Campaign Stories */}
            <EarlyBirdBanner />
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

            <Suspense fallback={<div className="flex items-center justify-center py-12"><Skeleton className="w-full h-64" /></div>}>
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
                        <div className="mb-3">
                            <h2 className="text-sm font-semibold text-dark-100 uppercase tracking-wider">Analytics</h2>
                            <p className="text-[10px] text-dark-500">Campaign performance metrics</p>
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
                        className="space-y-4 pb-4"
                    >
                        {/* 1. Hero Section */}
                        <DashboardHero
                            userName={user?.name?.split(' ')[0] || 'Brand'}
                            role="Seller"
                            dailyInsight={requests?.[0]?.aiInsight || "Create a campaign to begin matching with creators."}
                            reliability={{
                                level: getReliabilityLevel(user?.reliabilityScore || 1.0),
                                score: user?.reliabilityScore || 1.0
                            }}
                        />



                        {/* 2. Campaign Pipeline Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                            <StatCard
                                label="Total Budget"
                                value={`₹${requests.reduce((sum, r) => sum + (r.budget || r.maxBudget || 0), 0).toLocaleString()}`}
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:h-[350px]">
                            <div className="lg:col-span-2 h-[200px] sm:h-[250px] lg:h-full">
                                <PerformanceChart
                                    title="Campaign Spend & ROI"
                                    color="#f59e0b"
                                    data={[]} // Empty data until analytics API is ready
                                />
                            </div>
                            <div className="h-[280px] sm:h-[350px] lg:h-full">
                                <ActivityFeed
                                    activities={pendingCreators.slice(0, 5).map(c => ({
                                        id: c.creatorId,
                                        title: c.creator?.user?.name || 'Unknown Creator',
                                        description: `Applied to ${c.requestTitle || 'a campaign'}`,
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
                                    <h2 className="text-sm font-semibold text-dark-100 flex items-center gap-2 uppercase tracking-wider">
                                        Active Campaigns
                                    </h2>
                                    <LoadingButton
                                        onClick={() => setShowRequestWizard(true)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors border-none"
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-s4">
                                        {requests.slice(0, 6).map((request, index) => (
                                            request ? (
                                                <motion.div
                                                    key={request.id}
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
                                                            {(request.title && typeof request.title === 'string') ? request.title.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <span className={`px-s2.5 py-1 rounded-premium-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${request.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-dark-700/50 text-dark-400 border-dark-600/30'
                                                            }`}>
                                                            {request.status}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-body font-black text-dark-100 mb-s2 group-hover:text-primary-400 transition-colors uppercase tracking-tight leading-tight">{request.title || 'Untitled Campaign'}</h3>
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
                                                            className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-free"
                                                        />
                                                    </div>
                                                </motion.div>
                                            ) : null
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
            </Suspense>

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
                title={(selectedRequest && typeof selectedRequest.title === 'string') ? selectedRequest.title : 'Campaign Details'}
                className="p-0" // Remove default padding as CampaignTracker has its own
            >
                {selectedRequest && (
                    <CampaignTracker
                        request={selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                        onAccept={(creatorId) => handleAcceptCreator(selectedRequest.id, creatorId)}
                        onReject={(creatorId) => handleRejectCreator(selectedRequest.id, creatorId)}
                        onMessage={(creatorId, creatorName) => handleMessageCreator(selectedRequest.id, creatorId, creatorName)}
                        onUpdateStatus={(status) => handleUpdateStatus(selectedRequest.id, status)}
                        onDelete={() => handleDeleteRequest(selectedRequest.id)}
                    />
                )}
            </BottomSheet>

            {/* Intelligence Copilot Panel */}
            <AIAssistantPanel
                campaign={selectedRequest}
                onUse={(content) => {
                    console.log('Copilot Content:', content);
                    toast.success('Content ready to use');
                }}
            />


        </DashboardLayout>
    );
};

export default SellerDashboard;
