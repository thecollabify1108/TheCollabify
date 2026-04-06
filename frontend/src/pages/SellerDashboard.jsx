import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaFire
} from 'react-icons/fa';
import { HiSparkles, HiUserGroup } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';

// New Components
import DashboardLayout from '../components/layout/DashboardLayout';
import Navbar from '../components/common/Navbar';
import CampaignTracker from '../components/seller/CampaignTracker';
import CollaborationHub from '../components/common/CollaborationHub';
import ConversationList from '../components/common/ConversationList';
import ChatBox from '../components/common/ChatBox';
import CreatorLeads from '../components/seller/CreatorLeads';

// Lazy-loaded: defers InsightCards API call until dashboard scrolls into view
const BrandInsightCards = lazy(() => import('../components/analytics/InsightCards').then(m => ({ default: m.BrandInsightCards })));

// Modern Dashboard Widgets
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DashboardHero from '../components/dashboard/DashboardHero';

// Enhanced UI Components
import LoadingButton from '../components/common/LoadingButton';
import EmptyState from '../components/common/EmptyState';
import BottomSheet from '../components/common/BottomSheet';

// Skeleton Loading Components
import { Skeleton, SkeletonStats, SkeletonCard, SkeletonList } from '../components/common/Skeleton';
import EnhancedCreatorSearch from '../components/seller/EnhancedCreatorSearch';
import SmartRecommendationsPanel from '../components/seller/SmartRecommendationsPanel';
import SwipeableCreatorCard from '../components/seller/SwipeableCreatorCard';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import { getReliabilityLevel } from '../utils/reliability';
import StatCard from '../components/dashboard/StatCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import FocusWrapper from '../components/dashboard/FocusWrapper';
import QuickActionsFAB from '../components/common/QuickActionsFAB';
import EnhancedCampaignWizard from '../components/seller/EnhancedCampaignWizard';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestWizard, setShowRequestWizard] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeCollabMatch, setActiveCollabMatch] = useState(null);
    const [showAIRecommendations, setShowAIRecommendations] = useState(false);
    const [allCreators, setAllCreators] = useState([]);
    const [pendingCreators, setPendingCreators] = useState([]);
    const [leadsCount] = useState(0);
    const [selectedConversation, setSelectedConversation] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const requestsRes = await sellerAPI.getRequests();
            const requestsData = requestsRes.data?.data?.requests || requestsRes.data || [];
            setRequests(requestsData);

            // Derive pending applicants (APPLIED status) from the already-fetched requests
            const pending = requestsData.flatMap(r =>
                (r.matchedCreators || [])
                    .filter(mc => mc.status === 'APPLIED')
                    .map(mc => ({ ...mc, requestTitle: r.title }))
            );
            setPendingCreators(pending);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            // Don't show error toast - just show empty state if requests fail
            setRequests([]);
            setPendingCreators([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const stats = {
        total: requests.length,
        active: requests.filter(r => ['Open', 'Creator Interested', 'Accepted'].includes(r.status)).length,
        completed: requests.filter(r => r.status === 'Completed').length,
        pending: pendingCreators.length,
        totalMatches: requests.reduce((sum, r) => sum + (r.matchedCreators?.length || 0), 0)
    };

    // Handlers
    const handleAcceptCreator = async (requestId, creatorId) => {
        try {
            await sellerAPI.acceptCreator(requestId, creatorId);
            toast.success('Creator accepted successfully!');
            // Refresh data
            fetchData();
        } catch (err) {
            toast.error('Failed to accept creator');
        }
    };

    const handleRejectCreator = async (requestId, creatorId) => {
        try {
            await sellerAPI.rejectCreator(requestId, creatorId);
            toast.success('Creator rejected');
            // Refresh data
            fetchData();
        } catch (err) {
            toast.error('Failed to reject creator');
        }
    };

    const handleUpdateCampaignStatus = async (requestId, status) => {
        try {
            await sellerAPI.updateStatus(requestId, status);
            toast.success(`Campaign status updated to ${status}`);
            // Refresh data
            fetchData();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteCampaign = async (requestId) => {
        try {
            await sellerAPI.deleteRequest(requestId);
            toast.success('Campaign deleted successfully');
            setSelectedRequest(null);
            fetchData();
        } catch (err) {
            toast.error('Failed to delete campaign');
        }
    };

    const handleMessageCreator = async (requestId, creatorId) => {
        try {
            setActiveTab('messages');
            const res = await chatAPI.sendMessageRequest(creatorId, requestId);
            const conversation = res?.data?.data?.conversation;

            if (conversation?.id) {
                setSelectedConversation(conversation);
                toast.success('Conversation opened');
            } else {
                toast.error('Unable to open conversation');
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Failed to open chat';
            toast.error(errorMsg);
        }
    };

    // Bottom navigation - 6 tabs with Analytics & Team
    const tabs = [
        {
            id: 'dashboard',
            label: 'Home',
            iconName: 'home',
            description: 'Campaigns'
        },
        {
            id: 'analytics',
            label: 'Stats',
            iconName: 'grid',
            description: 'Analytics'
        },
        {
            id: 'discover',
            label: 'Nearby',
            iconName: 'search',
            badge: leadsCount > 0 ? leadsCount : undefined,
            description: 'Creator Leads'
        },
        {
            id: 'applicants',
            label: 'Matches',
            iconName: 'users',
            badge: pendingCreators.length,
            description: 'Applicants'
        },
        {
            id: 'messages',
            label: 'Chat',
            iconName: 'chat',
            description: 'Messages'
        }
    ];

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
                // haptic.light();
            }}
            tabs={tabs}
        >
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
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QuickStatsBar Removed */}

            <Suspense fallback={<div className="flex items-center justify-center py-12"><Skeleton className="w-full h-64" /></div>}>
            <AnimatePresence mode="wait">
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
                                    toast.success('Invitations sent!');
                                }}
                            />
                        )}
                    </motion.div>
                )}

                {/* Nearby Leads Tab */}
                {activeTab === 'discover' && (
                    <motion.div
                        key="discover"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4"
                    >
                        <CreatorLeads
                            brandLocation={user?.brandProfile?.locationCity || ''}
                            onOpenConversation={handleMessageCreator}
                        />
                    </motion.div>
                )}

                {/* Applicants Tab (formerly Matches) */}
                {activeTab === 'applicants' && (
                    <motion.div
                        key="applicants"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        {/* Swipeable Creator Cards */}
                        <div className="w-full max-w-md">
                            <SwipeableCreatorCard
                                creators={pendingCreators}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <motion.div
                        key="messages"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-s4 flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-100px)]"
                    >
                        <div className="mb-s4 shrink-0">
                            <h2 className="text-h2 font-bold text-dark-100 mb-s1">Messages</h2>
                            <p className="text-body text-dark-400">Chat with applicants and creators</p>
                        </div>
                        <ConversationList onSelectConversation={setSelectedConversation} />
                    </motion.div>
                )}

                {/* Analytics / Stats Tab */}
                {activeTab === 'analytics' && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="mb-3">
                            <h2 className="text-sm font-semibold text-dark-100 uppercase tracking-wider">Analytics</h2>
                            <p className="text-[10px] text-dark-500">Campaign performance metrics</p>
                        </div>
                        
                        <BrandInsightCards />
                        
                        <div className="h-[200px] lg:h-[250px]">
                            <PerformanceChart
                                title="Campaign Spend & ROI"
                                color="#f59e0b"
                                data={[]} // Empty data until analytics API is ready
                            />
                        </div>

                        <AnalyticsDashboard userType="seller" requests={requests} />
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
                            userName={user?.name?.split(' ')[0] || 'Seller'}
                            role="Seller"
                            dailyInsight={requests?.[0]?.aiInsight || "Welcome to your Seller Dashboard. Launch a campaign to get started!"}
                            reliability={{
                                level: getReliabilityLevel(user?.reliabilityScore || 1.0),
                                score: user?.reliabilityScore || 1.0
                            }}
                            hideProfileButton={true}
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
                                label="Total Matches"
                                value={stats.totalMatches}
                                icon={<HiSparkles />}
                                color="emerald"
                                trend={0}
                                delay={0.4}
                            />
                        </div>

                        <div className="h-[220px] sm:h-[300px]">
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

                        {/* 4. Active Campaigns List (Aligned with Creator Opportunities) */}
                        <FocusWrapper sectionId="campaigns">
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div>
                                        <h2 className="text-h2 font-bold text-dark-100 mb-1 leading-tight tracking-tight">Active Campaigns</h2>
                                        <p className="text-body text-dark-400">{requests.length} campaigns running</p>
                                    </div>
                                    <LoadingButton
                                        onClick={(e) => { e.stopPropagation(); setShowRequestWizard(true); }}
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-primary-600 text-white shadow-glow hover:shadow-premium rounded-xl text-xs font-bold transition-all border-none flex items-center gap-1.5"
                                    >
                                        <HiSparkles /> Launch
                                    </LoadingButton>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-visible"
                                >
                                            {requests.length === 0 ? (
                                                <EmptyState
                                                    icon="box-empty"
                                                    title="No Campaigns Launched Yet"
                                                    description="Ready to scale your brand? Launch your first campaign and let our AI find the perfect creators for you."
                                                    actionLabel="Launch Campaign"
                                                    onAction={() => setShowRequestWizard(true)}
                                                />
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {requests.slice(0, 6).map((request, index) => (
                                                        request ? (
                                                            <motion.div
                                                                key={request.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                onClick={() => setSelectedRequest(request)}
                                                                className="flex items-center justify-between p-4 rounded-premium-2xl bg-dark-900/40 border border-white/5 hover:bg-dark-800/60 hover:border-primary-500/30 cursor-pointer transition-all group shadow-sm hover:shadow-primary-500/5 mb-1"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${
                                                                        request.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                        request.status === 'Accepted' ? 'bg-purple-500/20 text-purple-400' :
                                                                        'bg-blue-500/20 text-blue-400'
                                                                    }`}>
                                                                        {request.title ? request.title.charAt(0).toUpperCase() : '?'}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-base font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">
                                                                            {request.title || 'Untitled Campaign'}
                                                                        </h3>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-[10px] font-medium text-dark-400 uppercase tracking-widest">
                                                                                ₹{(request.maxBudget || request.minBudget || 0).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-xl font-black text-primary-400 group-hover:scale-110 transition-transform">
                                                                        {request.matchedCreators?.length || 0}
                                                                    </span>
                                                                    <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">
                                                                        Matches
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        ) : null
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                            </div>
                        </FocusWrapper>
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
                }}
                onSubmit={async (payload) => {
                    try {
                        const loadingToast = toast.loading('Launching campaign...');
                        // Validate payload
                        if (!payload.title || !payload.description) {
                            toast.error('Campaign title and description are required', { id: loadingToast });
                            return;
                        }
                        await sellerAPI.createRequest(payload);
                        toast.success('Campaign launched successfully!', { id: loadingToast });
                        setShowRequestWizard(false);
                        // Refresh dashboard data immediately
                        await fetchData();
                    } catch (err) {
                        const errorMsg = err.response?.data?.message || err.message || 'Failed to launch campaign';
                        toast.error(errorMsg);
                        console.error('Campaign creation error:', err);
                    }
                }}
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
                        onAccept={handleAcceptCreator}
                        onReject={handleRejectCreator}
                        onUpdateStatus={handleUpdateCampaignStatus}
                        onMessage={handleMessageCreator}
                        onDelete={handleDeleteCampaign}
                        onManageCollaboration={(mc) => {
                            setActiveCollabMatch(mc);
                            setSelectedRequest(null);
                        }}
                    />
                )}
            </BottomSheet>

            {/* Intelligence Copilot Panel — removed for production launch */}

            <AnimatePresence>
                {selectedConversation && (
                    <ChatBox
                        conversationId={selectedConversation.id}
                        otherUserName={selectedConversation.creatorUser?.name || selectedConversation.otherUser?.name || 'Creator'}
                        promotionTitle={selectedConversation.promotionId?.title || 'Campaign'}
                        conversation={selectedConversation}
                        onClose={() => setSelectedConversation(null)}
                    />
                )}
            </AnimatePresence>


        </DashboardLayout>
    );
};

export default SellerDashboard;
