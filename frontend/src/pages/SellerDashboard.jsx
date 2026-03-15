import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaFire, FaLock, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { HiSparkles, HiUserGroup, HiViewGrid } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI } from '../services/api';
import toast from 'react-hot-toast';

// New Components
import DashboardLayout from '../components/layout/DashboardLayout';
import Navbar from '../components/common/Navbar';
import QuickStatsBar from '../components/seller/QuickStatsBar';
import CampaignTracker from '../components/seller/CampaignTracker';
import CollaborationHub from '../components/common/CollaborationHub';
import ChatBox from '../components/common/ChatBox';

// Lazy-loaded: defers InsightCards API call until dashboard scrolls into view
const BrandInsightCards = lazy(() => import('../components/analytics/InsightCards').then(m => ({ default: m.BrandInsightCards })));

// Modern Dashboard Widgets
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DashboardHero from '../components/dashboard/DashboardHero';

// Enhanced UI Components
import LoadingButton from '../components/common/LoadingButton';
import EmptyState from '../components/common/EmptyState';
import BottomSheet from '../components/common/BottomSheet';
import EarlyBirdBanner from '../components/common/EarlyBirdBanner';

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
    const [isCampaignsExpanded, setIsCampaignsExpanded] = useState(false);
    const [pendingCreators, setPendingCreators] = useState([]);

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
            toast.error('Failed to load dashboard data');
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

    const handleMessageCreator = (requestId, creatorId, creatorName) => {
        // Navigate to messages
        window.location.href = `/messages?user=${creatorId}&name=${creatorName}`;
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
            showGuide={showGuide}
        >
            {/* Early Bird Banner */}
            <EarlyBirdBanner />

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

            {/* Collapsible Stats Bar */}
            <QuickStatsBar 
                stats={stats} 
                onStatClick={(id) => {
                    if (id === 'pending') setActiveTab('discover');
                    else if (id === 'campaigns') setActiveTab('dashboard');
                    else if (id === 'matches') setActiveTab('discover');
                }}
            />

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
                            />
                        </div>
                    </motion.div>
                )}

                {/* Team Management Tab (locked — unfinished) */}
                {activeTab === 'team' && (
                    <motion.div
                        key="team"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
                            <FaLock className="text-3xl text-dark-400 mb-2" />
                            <span className="text-dark-300 text-sm font-medium">Currently we have not this, so content all locked. We are working on this and will soon implement.</span>
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
                        className="h-[calc(100vh-160px)] lg:h-[calc(100vh-100px)] -mt-2 -mx-2 sm:-mx-4 lg:-mx-6 rounded-2xl overflow-hidden border border-dark-700/50"
                    >
                        <ChatBox />
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
                        
                        <div className="h-[250px] lg:h-[300px]">
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

                        <div className="h-[280px] sm:h-[350px]">
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

                        {/* 4. Active Campaigns List (Modernized) */}
                        <FocusWrapper sectionId="campaigns">
                            <div className="space-y-s6 bg-dark-800/20 p-4 rounded-2xl border border-dark-700/50">
                                <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setIsCampaignsExpanded(!isCampaignsExpanded)}
                                >
                                    <h2 className="text-sm font-semibold text-dark-100 flex items-center gap-2 uppercase tracking-wider">
                                        Active Campaigns
                                        {isCampaignsExpanded ? <FaChevronUp className="text-dark-500" /> : <FaChevronDown className="text-dark-500" />}
                                    </h2>
                                    <LoadingButton
                                        onClick={(e) => { e.stopPropagation(); setShowRequestWizard(true); }}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors border-none"
                                    >
                                        + New Campaign
                                    </LoadingButton>
                                </div>

                                <AnimatePresence>
                                    {isCampaignsExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pt-2"
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
                                                                        {request.title ? request.title.charAt(0).toUpperCase() : '?'}
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                        onManageCollaboration={(mc) => {
                            setActiveCollabMatch(mc);
                            setSelectedRequest(null);
                        }}
                    />
                )}
            </BottomSheet>

            {/* Intelligence Copilot Panel — removed for production launch */}


        </DashboardLayout>
    );
};

export default SellerDashboard;
