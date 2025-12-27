import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlus,
    FaBriefcase,
    FaChartLine,
    FaUsers,
    FaCheck,
    FaTimes,
    FaEye,
    FaTrash,
    FaComments
} from 'react-icons/fa';
import { HiSparkles, HiMenuAlt2 } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';

// Components
import Navbar from '../components/common/Navbar';
import DashboardSidebar from '../components/seller/DashboardSidebar';
import QuickStatsWidget from '../components/seller/QuickStatsWidget';
import CampaignPipeline from '../components/seller/CampaignPipeline';
import ActivityFeed from '../components/seller/ActivityFeed';
import CreatorShowcase from '../components/seller/CreatorShowcase';
import MessagingPanel from '../components/seller/MessagingPanel';
import RequestWizard from '../components/seller/RequestWizard';
import CampaignTracker from '../components/seller/CampaignTracker';
import SkeletonLoader from '../components/common/SkeletonLoader';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRequestWizard, setShowRequestWizard] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchRequests();
        fetchConversations();
    }, []);

    // Handle tab query parameter from navbar
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'messages') {
            setActiveSection('messages');
        }
    }, [searchParams]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await sellerAPI.getRequests();
            setRequests(res.data.data.requests);
        } catch (error) {
            toast.error('Failed to fetch promotion requests');
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
            toast.success(`Campaign created! Found ${res.data.data.matchedCreatorsCount} matching creators.`);
            setShowRequestWizard(false);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create request');
        }
    };

    const handleAcceptCreator = async (requestId, creatorId) => {
        try {
            await sellerAPI.acceptCreator(requestId, creatorId);
            toast.success('Creator accepted!');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept creator');
        }
    };

    const handleRejectCreator = async (requestId, creatorId) => {
        try {
            await sellerAPI.rejectCreator(requestId, creatorId);
            toast.success('Creator rejected');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject creator');
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
                setActiveSection('messages');
            } else {
                toast.error('Conversation not found. Please try again.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to open chat');
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        try {
            await sellerAPI.updateStatus(requestId, status);
            toast.success(`Campaign marked as ${status.toLowerCase()}`);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await sellerAPI.deleteRequest(requestId);
            toast.success('Campaign deleted successfully');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete campaign');
        }
    };

    const stats = {
        total: requests.length,
        active: requests.filter(r => ['Open', 'Creator Interested', 'Accepted'].includes(r.status)).length,
        completed: requests.filter(r => r.status === 'Completed').length,
        totalMatches: requests.reduce((sum, r) => sum + (r.matchedCreators?.length || 0), 0)
    };

    const unreadMessages = conversations.filter(c => c.unreadCount > 0).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950">
                <Navbar />
                <div className="flex">
                    {/* Sidebar Skeleton */}
                    <div className="w-64 h-screen bg-dark-900 border-r border-dark-700 p-4 animate-pulse">
                        <div className="h-10 bg-dark-700 rounded-lg mb-6 shimmer"></div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-12 bg-dark-700 rounded-xl shimmer"></div>
                            ))}
                        </div>
                    </div>
                    {/* Content Skeleton */}
                    <div className="flex-1 p-8">
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-28 bg-dark-800 rounded-xl animate-pulse shimmer"></div>
                            ))}
                        </div>
                        <SkeletonLoader type="card" count={2} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            <div className="flex">
                {/* Sidebar - Hidden on mobile unless toggled */}
                <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
                    <DashboardSidebar
                        activeSection={activeSection}
                        setActiveSection={(section) => {
                            if (section === 'create') {
                                setShowRequestWizard(true);
                            } else {
                                setActiveSection(section);
                            }
                        }}
                        unreadMessages={unreadMessages}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 min-h-screen overflow-y-auto">
                    {/* Mobile Header */}
                    <div className="md:hidden p-4 flex items-center justify-between border-b border-dark-700">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 bg-dark-800 rounded-lg text-dark-400"
                        >
                            <HiMenuAlt2 className="text-xl" />
                        </button>
                        <h1 className="font-bold text-dark-100">Seller Hub</h1>
                        <div className="w-10"></div>
                    </div>

                    <div className="p-4 md:p-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-2xl md:text-3xl font-bold text-dark-100 mb-1"
                                >
                                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                                </motion.h1>
                                <p className="text-dark-400">
                                    {activeSection === 'dashboard' && 'Here\'s your campaign overview'}
                                    {activeSection === 'campaigns' && 'Manage your campaigns'}
                                    {activeSection === 'creators' && 'Discover interested creators'}
                                    {activeSection === 'messages' && 'Your conversations'}
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowRequestWizard(true)}
                                className="mt-4 md:mt-0 btn-3d flex items-center gap-2"
                            >
                                <FaPlus /> New Campaign
                            </motion.button>
                        </div>

                        {/* Dynamic Content Based on Active Section */}
                        <AnimatePresence mode="wait">
                            {/* Dashboard View */}
                            {activeSection === 'dashboard' && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Stats */}
                                    <QuickStatsWidget stats={stats} />

                                    {/* Two Column Layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Campaign Pipeline - Takes 2 columns */}
                                        <div className="lg:col-span-2">
                                            <CampaignPipeline
                                                requests={requests}
                                                onSelectRequest={(req) => {
                                                    setSelectedRequest(req);
                                                    setActiveSection('campaigns');
                                                }}
                                            />
                                        </div>

                                        {/* Activity Feed */}
                                        <div className="lg:col-span-1">
                                            <ActivityFeed requests={requests} />
                                        </div>
                                    </div>

                                    {/* Creator Showcase */}
                                    <CreatorShowcase
                                        requests={requests}
                                        onAccept={handleAcceptCreator}
                                        onReject={handleRejectCreator}
                                        onMessage={handleMessageCreator}
                                    />
                                </motion.div>
                            )}

                            {/* Campaigns View */}
                            {activeSection === 'campaigns' && (
                                <motion.div
                                    key="campaigns"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {requests.length === 0 ? (
                                        <div className="glass-card p-12 text-center">
                                            <FaBriefcase className="text-5xl text-dark-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-dark-200 mb-2">No campaigns yet</h3>
                                            <p className="text-dark-400 mb-6">Create your first campaign to start connecting with creators</p>
                                            <button
                                                onClick={() => setShowRequestWizard(true)}
                                                className="btn-primary"
                                            >
                                                <FaPlus className="mr-2" /> Create Campaign
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {requests.map((request) => (
                                                <motion.div
                                                    key={request._id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="glass-card p-6 hover:border-primary-500/30 transition-all cursor-pointer"
                                                    onClick={() => setSelectedRequest(request)}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="font-semibold text-dark-100 mb-1">{request.title}</h3>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${request.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                    request.status === 'Accepted' ? 'bg-purple-500/20 text-purple-400' :
                                                                        'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                        <span className="text-primary-400 font-semibold">₹{request.budget}</span>
                                                    </div>
                                                    <p className="text-sm text-dark-400 mb-4 line-clamp-2">{request.description}</p>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-dark-500">{request.promotionType}</span>
                                                        <span className="text-dark-500">
                                                            {request.matchedCreators?.length || 0} matches
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Campaign Detail Modal */}
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
                                </motion.div>
                            )}

                            {/* Creators View */}
                            {activeSection === 'creators' && (
                                <motion.div
                                    key="creators"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <CreatorShowcase
                                        requests={requests}
                                        onAccept={handleAcceptCreator}
                                        onReject={handleRejectCreator}
                                        onMessage={handleMessageCreator}
                                    />
                                </motion.div>
                            )}

                            {/* Messages View */}
                            {activeSection === 'messages' && (
                                <motion.div
                                    key="messages"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
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
                    </div>
                </main>
            </div>

            {/* Request Wizard Modal */}
            <RequestWizard
                isOpen={showRequestWizard}
                onClose={() => setShowRequestWizard(false)}
                onSubmit={handleCreateRequest}
            />
        </div>
    );
};

export default SellerDashboard;
