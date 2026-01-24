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
import { sellerAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';

// New Components
import Navbar from '../components/common/Navbar';
import CampaignStories from '../components/seller/CampaignStories';
import SwipeableCreatorCard from '../components/seller/SwipeableCreatorCard';
import QuickStatsBar from '../components/seller/QuickStatsBar';
import RequestWizard from '../components/seller/RequestWizard';
import CampaignTracker from '../components/seller/CampaignTracker';
import MessagingPanel from '../components/seller/MessagingPanel';
import OnboardingTour from '../components/common/OnboardingTour';
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
import TeamManagement from '../components/team/TeamManagement';

// NEW: Modern Dashboard Widgets
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import DashboardHero from '../components/dashboard/DashboardHero';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestWizard, setShowRequestWizard] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [processedCreators, setProcessedCreators] = useState(new Set());
    const [aiSuggestionData, setAiSuggestionData] = useState(null);

    // NEW: Enhanced features state
    const [showEnhancedWizard, setShowEnhancedWizard] = useState(false);
    const [showAIRecommendations, setShowAIRecommendations] = useState(false);
    const [allCreators, setAllCreators] = useState([]);

    const fetchMatches = async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data.data.conversations || []);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
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

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await sellerAPI.getRequests();
            setRequests(res.data.data.requests);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
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
        try {
            await sellerAPI.acceptCreator(requestId, creatorId);
            toast.success('✅ Creator accepted!');
            fetchRequests();
        } catch (error) {
            toast.error('Failed to accept creator');
        }
    };

    const handleRejectCreator = async (requestId, creatorId) => {
        setProcessedCreators(prev => new Set([...prev, `${requestId}-${creatorId}`]));
        try {
            await sellerAPI.rejectCreator(requestId, creatorId);
            toast.success('Creator passed');
            fetchRequests();
        } catch (error) {
            toast.error('Failed to reject creator');
        }
    };

    const handleMessageCreator = async (requestId, creatorId, creatorName) => {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950">
                <Navbar />
                <div className="max-w-lg mx-auto p-4 space-y-4">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-20 h-20 rounded-full bg-dark-800 animate-pulse shimmer flex-shrink-0"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-dark-800 rounded-3xl animate-pulse shimmer"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950 pb-20">
            <Navbar />

            {/* Onboarding Tour for new users */}
            <OnboardingTour role="seller" />

            {/* Campaign Stories */}
            <CampaignStories
                campaigns={requests}
                onCreateNew={() => setShowEnhancedWizard(true)}
                onSelectCampaign={(campaign) => setSelectedRequest(campaign)}
            />

            {/* Collapsible Stats Bar */}
            <QuickStatsBar stats={stats} />

            {/* Main Content Area */}
            <main className="max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {/* Search Tab - Creator Discovery with AI */}
                    {activeTab === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4 space-y-4"
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
                            className="p-4"
                        >
                            {/* Swipeable Creator Cards */}
                            <SwipeableCreatorCard
                                creators={pendingCreators}
                                onAccept={handleAcceptCreator}
                                onReject={handleRejectCreator}
                                onMessage={handleMessageCreator}
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
                            className="p-4"
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
                            className="space-y-6 p-4"
                        >
                            {/* 1. Hero Section */}
                            <DashboardHero
                                userName={user.companyName || user.name.split(' ')[0]}
                                role="Seller"
                                dailyInsight="Campaign 'Summer Launch' has 5 new high-quality applicants! 🚀"
                            />

                            {/* 2. Campaign Pipeline Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    label="Total Budget"
                                    value="₹1.5L"
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
                                    trend={2}
                                    delay={0.2}
                                />
                                <StatCard
                                    label="Pending Applicants"
                                    value={stats.pending}
                                    icon={<HiUserGroup />}
                                    color="purple"
                                    trend={stats.pending > 0 ? 10 : 0}
                                    delay={0.3}
                                />
                                <StatCard
                                    label="Total Matches"
                                    value={stats.totalMatches}
                                    icon={<HiSparkles />}
                                    color="emerald"
                                    trend={5}
                                    delay={0.4}
                                />
                            </div>

                            {/* 3. Charts & Applicant Feed */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
                                <div className="md:col-span-2 h-full">
                                    <PerformanceChart
                                        title="Campaign Spend & ROI"
                                        color="#f59e0b"
                                        data={[
                                            { name: 'Week 1', value: 12000 },
                                            { name: 'Week 2', value: 19000 },
                                            { name: 'Week 3', value: 15000 },
                                            { name: 'Week 4', value: 25000 },
                                            { name: 'Week 5', value: 32000 },
                                        ]}
                                    />
                                </div>
                                <div className="h-full">
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
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                                        <HiSparkles className="text-primary-400" /> Active Campaigns
                                    </h2>
                                    <button
                                        onClick={() => setShowRequestWizard(true)}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
                                    >
                                        + New Campaign
                                    </button>
                                </div>

                                {requests.length === 0 ? (
                                    <div className="text-center py-12 bg-dark-800/20 rounded-2xl border border-dark-700/50 border-dashed">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
                                            <HiViewGrid className="text-2xl text-dark-500" />
                                        </div>
                                        <p className="text-dark-400 mb-4">No campaigns yet</p>
                                        <button
                                            onClick={() => setShowRequestWizard(true)}
                                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold"
                                        >
                                            Launch Campaign
                                        </button>
                                    </div>
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
                                onBack={() => setSelectedConversation(null)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Quick Actions FAB */}
            <QuickActionsFAB
                userRole="seller"
                onBrowse={() => setActiveTab('search')}
                onCreateCampaign={() => setShowRequestWizard(true)}
            />

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-t border-dark-800 z-50">
                <div className="max-w-lg mx-auto px-2 py-2">
                    <div className="flex items-center justify-around">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    haptic.light();
                                }}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === tab.id
                                    ? 'text-primary-400 bg-primary-500/10'
                                    : 'text-dark-400 hover:text-dark-200'
                                    }`}
                            >
                                {tab.icon}
                                <span className="text-xs font-medium">{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="absolute top-0 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Modals */}
            <RequestWizard
                isOpen={showRequestWizard}
                onClose={() => {
                    setShowRequestWizard(false);
                    setAiSuggestionData(null);
                }}
                onSubmit={handleCreateRequest}
                initialData={aiSuggestionData}
            />

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

            {/* NEW: Enhanced Campaign Wizard */}
            <EnhancedCampaignWizard
                isOpen={showEnhancedWizard}
                onClose={() => setShowEnhancedWizard(false)}
                onSubmit={handleCreateRequest}
            />

            {/* NEW: AI Assistant Panel (Always available) */}
            <AIAssistantPanel
                campaign={selectedRequest}
                onUse={(content) => {
                    console.log('AI Content:', content);
                    toast.success('AI content ready to use!');
                }}
            />

            {/* Onboarding Tour */}
            <OnboardingTour role="seller" />
        </div>
    );
};

export default SellerDashboard;
