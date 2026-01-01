import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaComments,
    FaFire,
    FaStream,
    FaUsers,
    FaTimes,
    FaArrowLeft
} from 'react-icons/fa';
import { HiSparkles, HiHome, HiUserGroup, HiChat, HiViewGrid } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';

// New Components
import Navbar from '../components/common/Navbar';
import CampaignStories from '../components/seller/CampaignStories';
import SwipeableCreatorCard from '../components/seller/SwipeableCreatorCard';
import SocialActivityFeed from '../components/seller/SocialActivityFeed';
import FloatingCreateButton from '../components/seller/FloatingCreateButton';
import QuickStatsBar from '../components/seller/QuickStatsBar';
import RequestWizard from '../components/seller/RequestWizard';
import CampaignTracker from '../components/seller/CampaignTracker';
import MessagingPanel from '../components/seller/MessagingPanel';
import CampaignAnalytics from '../components/seller/CampaignAnalytics';
import AICampaignSuggestions from '../components/seller/AICampaignSuggestions';
import OnboardingTour from '../components/common/OnboardingTour';
import CreatorSearch from '../components/seller/CreatorSearch';
import StartupTips from '../components/seller/StartupTips';
import { FaSearch } from 'react-icons/fa';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('discover');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestWizard, setShowRequestWizard] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [processedCreators, setProcessedCreators] = useState(new Set());

    useEffect(() => {
        fetchRequests();
        fetchConversations();
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

    // Bottom navigation tabs
    const tabs = [
        { id: 'feed', label: 'Profile', icon: <HiHome /> },
        { id: 'search', label: 'Find', icon: <FaSearch /> },
        { id: 'discover', label: 'Matches', icon: <HiUserGroup /> },
        { id: 'campaigns', label: 'Campaigns', icon: <HiViewGrid /> },
        { id: 'messages', label: 'Messages', icon: <HiChat />, badge: conversations.filter(c => c.unreadCount > 0).length },
        { id: 'ai', label: 'AI', icon: <HiSparkles /> }
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
                onCreateNew={() => setShowRequestWizard(true)}
                onSelectCampaign={(campaign) => setSelectedRequest(campaign)}
            />

            {/* Collapsible Stats Bar */}
            <QuickStatsBar stats={stats} />

            {/* Main Content Area */}
            <main className="max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {/* Profile/Feed Tab - Startup Tips */}
                    {activeTab === 'feed' && (
                        <motion.div
                            key="feed"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6 p-4"
                        >
                            {/* Startup Tips & Business Insights */}
                            <StartupTips />
                        </motion.div>
                    )}

                    {/* Search Tab - Creator Discovery */}
                    {activeTab === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4"
                        >
                            <CreatorSearch />
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

                    {/* Campaigns Tab - Grid */}
                    {activeTab === 'campaigns' && (
                        <motion.div
                            key="campaigns"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4 space-y-4"
                        >
                            <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                                <HiSparkles className="text-primary-400" /> Your Campaigns
                            </h2>

                            {requests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
                                        <HiViewGrid className="text-4xl text-dark-500" />
                                    </div>
                                    <p className="text-dark-400">No campaigns yet</p>
                                    <button
                                        onClick={() => setShowRequestWizard(true)}
                                        className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold"
                                    >
                                        Create First Campaign
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {requests.map((request, index) => (
                                        <motion.div
                                            key={request._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setSelectedRequest(request)}
                                            className="p-4 rounded-2xl bg-dark-800/60 border border-dark-700/50 hover:border-primary-500/30 cursor-pointer transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${request.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        request.status === 'Accepted' ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {request.title?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-dark-100">{request.title}</h3>
                                                        <p className="text-sm text-dark-400">{request.status}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-primary-400">₹{request.budget?.toLocaleString()}</div>
                                                    <div className="text-xs text-dark-500">{request.matchedCreators?.length || 0} matches</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
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

                    {/* AI Suggestions Tab */}
                    {activeTab === 'ai' && (
                        <motion.div
                            key="ai"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 space-y-6"
                        >
                            {/* AI Campaign Suggestions */}
                            <AICampaignSuggestions
                                requests={requests}
                                onApplySuggestion={(suggestion) => {
                                    if (suggestion.type === 'quickstart' || suggestion.type === 'category') {
                                        setShowRequestWizard(true);
                                    }
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Floating Create Button */}
            <FloatingCreateButton onClick={() => setShowRequestWizard(true)} />

            {/* Bottom Navigation - Mobile Style */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-t border-dark-700/50 z-30">
                <div className="max-w-lg mx-auto flex items-center justify-around py-2">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${activeTab === tab.id
                                ? 'text-primary-400'
                                : 'text-dark-400 hover:text-dark-200'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="text-xs font-medium">{tab.label}</span>

                            {/* Active indicator */}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400"
                                />
                            )}

                            {/* Badge */}
                            {tab.badge > 0 && (
                                <span className="absolute top-0 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                    {tab.badge}
                                </span>
                            )}
                        </motion.button>
                    ))}
                </div>
            </nav>

            {/* Modals */}
            <RequestWizard
                isOpen={showRequestWizard}
                onClose={() => setShowRequestWizard(false)}
                onSubmit={handleCreateRequest}
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
        </div>
    );
};

export default SellerDashboard;
