import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * MessageRequests - Shows pending message requests from sellers
 * Creators can accept or reject requests
 */
const MessageRequests = ({ onAccept }) => {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [processing, setProcessing] = useState(new Set());

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getConversations();

            // Filter only pending conversations
            const pendingRequests = response.data.data.conversations.filter(
                conv => conv.status === 'pending'
            );

            setRequests(pendingRequests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            toast.error('Failed to load message requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        setProcessing(prev => new Set([...prev, requestId]));
        try {
            await chatAPI.acceptRequest(requestId);
            toast.success('✅ Message request accepted!');

            // Remove from list
            setRequests(prev => prev.filter(r => r._id !== requestId));

            // Notify parent to refresh conversations
            if (onAccept) {
                onAccept();
            }
        } catch (error) {
            toast.error('Failed to accept request');
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const handleReject = async (requestId) => {
        setProcessing(prev => new Set([...prev, requestId]));
        try {
            await chatAPI.rejectRequest(requestId);
            toast.success('Message request rejected');

            // Remove from list
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            toast.error('Failed to reject request');
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-dark-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-dark-700 rounded w-1/3" />
                                <div className="h-3 bg-dark-700 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
                    <FaEnvelope className="text-3xl text-dark-500" />
                </div>
                <h3 className="text-lg font-semibold text-dark-200 mb-2">No Pending Requests</h3>
                <p className="text-sm text-dark-400">
                    You don't have any message requests at the moment
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark-100">
                    Message Requests ({requests.length})
                </h3>
            </div>

            {requests.map((request) => {
                const seller = request.sellerUserId || {};
                const isProcessing = processing.has(request._id);

                return (
                    <motion.div
                        key={request._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="glass-card p-4 hover:border-primary-500/30 transition"
                    >
                        <div className="flex items-start gap-3">
                            {/* Seller Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {seller.name?.charAt(0).toUpperCase() || 'S'}
                            </div>

                            {/* Request Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-dark-100">{seller.name || 'Brand'}</h4>
                                    <FaBuilding className="text-xs text-dark-500" />
                                </div>
                                <p className="text-sm text-dark-400 mb-3">
                                    wants to send you a message
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(request._id)}
                                        disabled={isProcessing}
                                        className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <FaCheck className="text-sm" />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(request._id)}
                                        disabled={isProcessing}
                                        className="flex-1 px-4 py-2 rounded-lg bg-dark-700 text-dark-200 font-medium hover:bg-dark-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <FaTimes className="text-sm" />
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default MessageRequests;
