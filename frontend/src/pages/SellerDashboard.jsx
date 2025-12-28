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
    FaComments,
    FaArrowRight,
    FaInstagram,
    FaRocket,
    FaFire,
    FaCrown,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiTrendingUp, HiClock, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';

// Components
import Navbar from '../components/common/Navbar';
import RequestWizard from '../components/seller/RequestWizard';
import CampaignTracker from '../components/seller/CampaignTracker';
import MessagingPanel from '../components/seller/MessagingPanel';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestWizard, setShowRequestWizard] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [showMessages, setShowMessages] = useState(false);
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
        setProcessedCreators(prev => new Set([...prev, `${requestId}-${creatorId}`]));
        try {
            await sellerAPI.acceptCreator(requestId, creatorId);
            toast.success('Creator accepted!');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept creator');
        }
    };

    const handleRejectCreator = async (requestId, creatorId) => {
        setProcessedCreators(prev => new Set([...prev, `${requestId}-${creatorId}`]));
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
                setShowMessages(true);
            }
        } catch (error) {
            toast.error('Failed to open chat');
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

    // Stats
    const stats = {
        total: requests.length,
        active: requests.filter(r => ['Open', 'Creator Interested', 'Accepted'].includes(r.status)).length,
        completed: requests.filter(r => r.status === 'Completed').length,
        pending: requests.filter(r => r.matchedCreators?.some(c => c.status === 'Applied')).length,
        totalMatches: requests.reduce((sum, r) => sum + (r.matchedCreators?.length || 0), 0)
    };

    // Get pending creators
    const getPendingCreators = () => {
        const creators = [];
        requests.forEach(request => {
            request.matchedCreators?.forEach(creator => {
                if (creator.status === 'Applied' && !processedCreators.has(`${request._id}-${creator.creatorId}`)) {
                    creators.push({
                        ...creator,
                        requestId: request._id,
                        requestTitle: request.title,
                        budget: request.budget
                    });
                }
            });
        });
        return creators.slice(0, 4);
    };

    const pendingCreators = getPendingCreators();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950">
                <Navbar />
                <div className="max-w-7xl mx-auto p-6">
                    <div className="grid grid-cols-4 gap-4 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className={`h-48 bg-dark-800 rounded-3xl shimmer ${i <= 2 ? 'col-span-2' : ''}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            {/* Main Content - Bento Grid */}
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between mb-8"
                >
                    <div>
                        <p className="text-primary-400 font-medium mb-1">Welcome back</p>
                        <h1 className="text-4xl md:text-5xl font-black text-dark-100">
                            {user?.name?.split(' ')[0]} 👋
                        </h1>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowRequestWizard(true)}
                        className="mt-4 md:mt-0 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white font-bold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center gap-3"
                    >
                        <FaPlus /> Create New Campaign
                    </motion.button>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-[120px]">

                    {/* Stats - Big Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-4 md:col-span-3 lg:col-span-4 row-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 cursor-pointer group"
                        onClick={() => setSelectedRequest(requests[0])}
                    >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <HiSparkles className="text-white/80" />
                            <span className="text-white/80 text-sm font-medium">Total Campaigns</span>
                        </div>
                        <div className="text-6xl font-black text-white">{stats.total}</div>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                        <span className="text-sm">View all campaigns</span>
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </motion.div>

            {/* Active Campaigns */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="col-span-2 md:col-span-3 lg:col-span-4 row-span-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 flex items-center justify-between"
            >
                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Active</p>
                    <div className="text-4xl font-black text-white">{stats.active}</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <HiLightningBolt className="text-2xl text-white" />
                </div>
            </motion.div>

            {/* Pending Applications */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="col-span-2 md:col-span-3 lg:col-span-4 row-span-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 flex items-center justify-between"
            >
                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Pending</p>
                    <div className="text-4xl font-black text-white">{pendingCreators.length}</div>
                </div>
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center"
                >
                    <FaFire className="text-2xl text-white" />
                </motion.div>
            </motion.div>

            {/* Completed */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="col-span-2 md:col-span-3 lg:col-span-4 row-span-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 flex items-center justify-between"
            >
                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Completed</p>
                    <div className="text-4xl font-black text-white">{stats.completed}</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <HiCheckCircle className="text-2xl text-white" />
                </div>
            </motion.div>

            {/* Creator Matches */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="col-span-2 md:col-span-3 lg:col-span-4 row-span-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 flex items-center justify-between"
            >
                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Total Matches</p>
                    <div className="text-4xl font-black text-white">{stats.totalMatches}</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <FaUsers className="text-2xl text-white" />
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="col-span-4 md:col-span-6 lg:col-span-4 row-span-2 relative overflow-hidden rounded-3xl bg-dark-800/80 backdrop-blur-xl border border-dark-700/50 p-6"
            >
                <h3 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
                    <HiLightningBolt className="text-amber-400" /> Quick Actions
                </h3>
                <div className="space-y-3">
                    <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => setShowRequestWizard(true)}
                        className="w-full p-4 rounded-2xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 flex items-center gap-4 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <FaPlus className="text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-dark-100">New Campaign</p>
                            <p className="text-xs text-dark-400">Launch a promotion</p>
                        </div>
                        <FaArrowRight className="text-dark-500 group-hover:text-primary-400 transition-colors" />
                    </motion.button>
                    <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => setShowMessages(true)}
                        className="w-full p-4 rounded-2xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 flex items-center gap-4 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <FaComments className="text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-dark-100">Messages</p>
                            <p className="text-xs text-dark-400">{conversations.length} conversations</p>
                        </div>
                        <FaArrowRight className="text-dark-500 group-hover:text-primary-400 transition-colors" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Pending Creators - Large Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="col-span-4 md:col-span-6 lg:col-span-8 row-span-3 relative overflow-hidden rounded-3xl bg-dark-800/80 backdrop-blur-xl border border-dark-700/50 p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                        <FaFire className="text-orange-400" /> Pending Applications
                    </h3>
                    {pendingCreators.length > 0 && (
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium">
                            {pendingCreators.length} waiting
                        </span>
                    )}
                </div>

                {pendingCreators.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[calc(100%-60px)] text-center">
                        <div className="w-20 h-20 rounded-3xl bg-dark-700/50 flex items-center justify-center mb-4">
                            <FaUsers className="text-3xl text-dark-500" />
                        </div>
                        <p className="text-dark-400 font-medium">No pending applications</p>
                        <p className="text-dark-500 text-sm">Create a campaign to start receiving applications</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {pendingCreators.map((creator, index) => (
                                <motion.div
                                    key={`${creator.requestId}-${creator.creatorId}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: -50 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 rounded-2xl bg-dark-900/60 border border-dark-700/50 hover:border-primary-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                            <span className="text-white font-bold text-xl">
                                                {creator.creatorName?.charAt(0).toUpperCase() || 'C'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-dark-100">{creator.creatorName}</p>
                                            <div className="flex items-center gap-2 text-sm text-dark-400">
                                                <FaInstagram className="text-pink-400" />
                                                <span>{(creator.followerCount || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-2 rounded-xl bg-dark-800/60 mb-3">
                                        <p className="text-xs text-dark-400">For: <span className="text-dark-200">{creator.requestTitle}</span></p>
                                        <p className="text-sm font-bold text-emerald-400">₹{creator.budget?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAcceptCreator(creator.requestId, creator.creatorId)}
                                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                        >
                                            <FaCheck /> Accept
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleMessageCreator(creator.requestId, creator.creatorId, creator.creatorName)}
                                            className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        >
                                            <FaComments />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleRejectCreator(creator.requestId, creator.creatorId)}
                                            className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30"
                                        >
                                            <FaTimes />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

            {/* Recent Campaigns */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="col-span-4 md:col-span-6 lg:col-span-12 row-span-2 relative overflow-hidden rounded-3xl bg-dark-800/80 backdrop-blur-xl border border-dark-700/50 p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                        <FaRocket className="text-primary-400" /> Your Campaigns
                    </h3>
                </div>

                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[calc(100%-60px)] text-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowRequestWizard(true)}
                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold"
                        >
                            <FaPlus className="inline mr-2" /> Create Your First Campaign
                        </motion.button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {requests.slice(0, 4).map((request, index) => (
                            <motion.div
                                key={request._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                onClick={() => setSelectedRequest(request)}
                                className="p-4 rounded-2xl bg-dark-900/60 border border-dark-700/50 hover:border-primary-500/30 cursor-pointer transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${request.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                            request.status === 'Accepted' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {request.status}
                                    </span>
                                    <FaExternalLinkAlt className="text-xs text-dark-500 group-hover:text-primary-400 transition-colors" />
                                </div>
                                <h4 className="font-bold text-dark-100 mb-1 truncate">{request.title}</h4>
                                <p className="text-xl font-black text-primary-400">₹{request.budget?.toLocaleString()}</p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-dark-400">
                                    <FaUsers />
                                    <span>{request.matchedCreators?.length || 0} matches</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
            </div >

    {/* Modals */ }
    < RequestWizard
isOpen = { showRequestWizard }
onClose = {() => setShowRequestWizard(false)}
onSubmit = { handleCreateRequest }
    />

    { selectedRequest && (
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

{/* Messages Overlay */ }
<AnimatePresence>
    {showMessages && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMessages(false)}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-4xl max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <MessagingPanel
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    onSelectConversation={(conv) => setSelectedConversation(conv)}
                    onBack={() => setSelectedConversation(null)}
                />
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
        </div >
    );
};

export default SellerDashboard;
