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
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAccept(request._id)}
                                    disabled={processing === request._id}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <FaCheck />
                                    {processing === request._id ? 'Accepting...' : 'Accept'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleReject(request._id)}
                                    disabled={processing === request._id}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-600 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <FaTimes />
                                    Reject
                                </motion.button>
                            </div >
                        </motion.div >
                    );
                })}
            </AnimatePresence >
        </div >
    );
};

export default MessageRequests;
