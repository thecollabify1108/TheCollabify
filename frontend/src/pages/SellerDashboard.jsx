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
    FaCog
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { sellerAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';

// Components
import Navbar from '../components/common/Navbar';
import RequestForm from '../components/seller/RequestForm';
import CreatorCard from '../components/seller/CreatorCard';
import CampaignTracker from '../components/seller/CampaignTracker';
import ChatBox from '../components/common/ChatBox';
import ConversationList from '../components/common/ConversationList';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewRequestForm, setShowNewRequestForm] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [hideInactive, setHideInactive] = useState(true); // Hide completed/cancelled by default

    useEffect(() => {
        fetchRequests();
    }, []);

    // Handle tab query parameter from navbar
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'edit') {
            setActiveTab('edit');
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

    const handleCreateRequest = async (data) => {
        try {
            const res = await sellerAPI.createRequest(data);
            toast.success(`Request created! Found ${res.data.data.matchedCreatorsCount} matching creators.`);
            setShowNewRequestForm(false);
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

    const handleUpdateStatus = async (requestId, status) => {
        try {
            await sellerAPI.updateStatus(requestId, status);
            toast.success(`Campaign marked as ${status.toLowerCase()}`);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteRequest = async (requestId, e) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm('Are you sure you want to delete this request? All applied creators will be notified.')) {
            return;
        }
        try {
            await sellerAPI.deleteRequest(requestId);
            toast.success('Request deleted successfully');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete request');
        }
    };

    const handleMessageCreator = async (requestId, creatorId, creatorName) => {
        try {
            // Find or restore the conversation (works even if deleted previously)
            const res = await chatAPI.findOrRestoreConversation(requestId, creatorId);
            const conversation = res.data.data.conversation;

            if (conversation) {
                if (res.data.data.wasRestored) {
                    toast.success('Chat restored!');
                }
                setSelectedConversation({
                    ...conversation,
                    creatorUserId: conversation.creatorUserId || { name: creatorName }
                });
            } else {
                toast.error('Conversation not found. Please try again.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to open chat');
        }
    };

    const stats = {
        total: requests.length,
        active: requests.filter(r => ['Open', 'Creator Interested', 'Accepted'].includes(r.status)).length,
        completed: requests.filter(r => r.status === 'Completed').length,
        totalMatches: requests.reduce((sum, r) => sum + (r.matchedCreators?.length || 0), 0)
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
        { id: 'requests', label: 'My Requests', icon: <FaBriefcase /> },
        { id: 'messages', label: 'Messages', icon: <FaComments /> },
        { id: 'newrequest', label: 'New Request', icon: <FaPlus /> },
        { id: 'edit', label: 'Edit Profile', icon: <FaCog /> }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100 mb-2">
                            Welcome, {user?.name}! 👋
                        </h1>
                        <p className="text-dark-400">
                            Find the perfect creators for your brand promotions
                        </p>
                    </div>

                    <button
                        onClick={() => setActiveTab('newrequest')}
                        className="mt-4 md:mt-0 btn-3d flex items-center"
                    >
                        <FaPlus className="mr-2" />
                        New Request
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div
                        className="glass-card p-6 cursor-pointer hover:border-primary-500/50 transition-all"
                        onClick={() => setActiveTab('requests')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-400">Total Requests</span>
                            <FaBriefcase className="text-primary-400 text-xl" />
                        </div>
                        <div className="text-3xl font-bold text-dark-100">{stats.total}</div>
                    </div>

                    <div
                        className="glass-card p-6 cursor-pointer hover:border-amber-500/50 transition-all"
                        onClick={() => setActiveTab('requests')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-400">Active Campaigns</span>
                            <FaChartLine className="text-amber-400 text-xl" />
                        </div>
                        <div className="text-3xl font-bold text-dark-100">{stats.active}</div>
                    </div>

                    <div
                        className="glass-card p-6 cursor-pointer hover:border-emerald-500/50 transition-all"
                        onClick={() => { setActiveTab('requests'); setHideInactive(false); }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-400">Completed</span>
                            <FaCheck className="text-emerald-400 text-xl" />
                        </div>
                        <div className="text-3xl font-bold text-dark-100">{stats.completed}</div>
                    </div>

                    <div
                        className="glass-card p-6 cursor-pointer hover:border-secondary-500/50 transition-all"
                        onClick={() => setActiveTab('requests')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-dark-400">Total Matches</span>
                            <HiSparkles className="text-secondary-400 text-xl" />
                        </div>
                        <div className="text-3xl font-bold text-dark-100">{stats.totalMatches}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide mb-8 pb-2">
                    <div className="flex space-x-2 bg-dark-800/50 p-1 rounded-xl">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {requests.length === 0 ? (
                                <div className="glass-card p-12 text-center">
                                    <FaBriefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-dark-300 mb-2">No promotion requests yet</h3>
                                    <p className="text-dark-400 mb-6">Create your first promotion request to find matching creators.</p>
                                    <button
                                        onClick={() => setActiveTab('newrequest')}
                                        className="btn-3d"
                                    >
                                        <FaPlus className="mr-2" />
                                        Create First Request
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-dark-100">Recent Campaigns</h2>
                                        <label className="flex items-center cursor-pointer">
                                            <span className="text-sm text-dark-400 mr-3">Hide inactive</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={hideInactive}
                                                    onChange={() => setHideInactive(!hideInactive)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-10 h-5 rounded-full transition-colors ${hideInactive ? 'bg-primary-600' : 'bg-dark-600'}`}></div>
                                                <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${hideInactive ? 'translate-x-5' : ''}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                    {requests
                                        .filter(r => hideInactive ? ['Open', 'Creator Interested', 'Accepted'].includes(r.status) : true)
                                        .slice(0, 5).map((request, index) => (
                                            <motion.div
                                                key={request._id}
                                                className="glass-card p-6"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <h3 className="text-lg font-semibold text-dark-100 mr-3">{request.title}</h3>
                                                            <span className={`badge ${request.status === 'Completed' ? 'badge-success' :
                                                                request.status === 'Accepted' ? 'badge-info' :
                                                                    request.status === 'Creator Interested' ? 'badge-warning' :
                                                                        request.status === 'Cancelled' ? 'badge-danger' :
                                                                            'badge-neutral'
                                                                }`}>
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-dark-400 text-sm mb-3">{request.description?.substring(0, 150)}...</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="badge badge-info">{request.promotionType}</span>
                                                            <span className="badge badge-neutral">{request.targetCategory}</span>
                                                            <span className="text-sm text-dark-400">
                                                                Budget: ${request.budgetRange?.min} - ${request.budgetRange?.max}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                                                        <div className="text-dark-400 text-sm mb-2">
                                                            {request.matchedCreators?.length || 0} matches
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRequest(request);
                                                                    setActiveTab('requests');
                                                                }}
                                                                className="btn-outline text-sm py-1 px-3 flex items-center"
                                                            >
                                                                <FaEye className="mr-1" />
                                                                View Details
                                                            </button>
                                                            {['Completed', 'Cancelled'].includes(request.status) && (
                                                                <button
                                                                    onClick={(e) => handleDeleteRequest(request._id, e)}
                                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                                                    title="Delete campaign"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {selectedRequest ? (
                                <div>
                                    <button
                                        onClick={() => setSelectedRequest(null)}
                                        className="text-primary-400 hover:text-primary-300 mb-6 flex items-center"
                                    >
                                        ← Back to Requests
                                    </button>

                                    <CampaignTracker
                                        request={selectedRequest}
                                        onAccept={handleAcceptCreator}
                                        onReject={handleRejectCreator}
                                        onUpdateStatus={handleUpdateStatus}
                                        onMessage={handleMessageCreator}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold text-dark-100 mb-6">My Promotion Requests</h2>

                                    {requests.length === 0 ? (
                                        <div className="glass-card p-12 text-center">
                                            <FaBriefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-dark-300 mb-2">No requests yet</h3>
                                            <p className="text-dark-400">Create your first promotion request to find creators.</p>
                                        </div>
                                    ) : (
                                        requests.map((request, index) => (
                                            <motion.div
                                                key={request._id}
                                                className="glass-card p-6 cursor-pointer card-hover"
                                                onClick={() => setSelectedRequest(request)}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <h3 className="text-lg font-semibold text-dark-100 mr-3">{request.title}</h3>
                                                            <span className={`badge ${request.status === 'Completed' ? 'badge-success' :
                                                                request.status === 'Accepted' ? 'badge-info' :
                                                                    request.status === 'Creator Interested' ? 'badge-warning' :
                                                                        'badge-neutral'
                                                                }`}>
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="badge badge-info">{request.promotionType}</span>
                                                            <span className="badge badge-neutral">{request.targetCategory}</span>
                                                            <span className="text-sm text-dark-400">
                                                                {request.matchedCreators?.filter(m => m.status === 'Applied').length || 0} applications
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 md:mt-0 flex items-center gap-4">
                                                        <div className="text-sm text-dark-400">
                                                            Created: {new Date(request.createdAt).toLocaleDateString()}
                                                        </div>
                                                        {request.status !== 'Completed' && (
                                                            <button
                                                                onClick={(e) => handleDeleteRequest(request._id, e)}
                                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                                                title="Delete request"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'messages' && (
                        <motion.div
                            key="messages"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-semibold text-dark-100 mb-6">Messages</h2>
                            <ConversationList
                                onSelectConversation={(conv) => setSelectedConversation(conv)}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'newrequest' && (
                        <motion.div
                            key="newrequest"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <RequestForm onSubmit={handleCreateRequest} />
                        </motion.div>
                    )}

                    {activeTab === 'edit' && (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-semibold text-dark-100 mb-6">Edit Profile</h2>
                                <div className="space-y-4">
                                    {/* Non-editable fields */}
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Name (cannot be changed)</label>
                                        <input
                                            type="text"
                                            value={user?.name || ''}
                                            disabled
                                            className="input w-full bg-dark-700 cursor-not-allowed opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Email (cannot be changed)</label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="input w-full bg-dark-700 cursor-not-allowed opacity-60"
                                        />
                                    </div>

                                    <p className="text-dark-400 text-sm pt-4">
                                        To edit your promotion preferences, create new promotion requests with your updated criteria.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ChatBox Popup */}
                <AnimatePresence>
                    {selectedConversation && (
                        <ChatBox
                            conversationId={selectedConversation._id}
                            otherUserName={selectedConversation.creatorUserId?.name || 'Creator'}
                            promotionTitle={selectedConversation.promotionId?.title || 'Promotion'}
                            onClose={() => setSelectedConversation(null)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SellerDashboard;
