import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaEnvelope, FaBuilding, FaUserPlus } from 'react-icons/fa';
import { creatorAPI } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * MessageRequests - Shows pending collaboration requests from brands
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
            const response = await creatorAPI.getApplications();
            // Filter for INVITED status
            // The API returns { promotion, applicationStatus, ... }
            const pendingRequests = response.data.data.applications.filter(
                app => app.applicationStatus === 'INVITED'
            );
            setRequests(pendingRequests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            // toast.error('Failed to load requests'); // Silently fail or retry
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (promotionId, status) => {
        setProcessing(prev => new Set([...prev, promotionId]));
        try {
            await creatorAPI.respondToRequest(promotionId, status);
            toast.success(status === 'ACCEPTED' ? '✅ Request Accepted!' : 'Request Declined');

            // Remove from list
            setRequests(prev => prev.filter(r => r.promotion.id !== promotionId));

            if (status === 'ACCEPTED' && onAccept) {
                onAccept();
            }
        } catch (error) {
            console.error('Failed to respond:', error);
            toast.error('Failed to update request');
        } finally {
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(promotionId);
                return newSet;
            });
        }
    };

    if (loading) return (
        <div className="space-y-3">
            <div className="glass-card p-4 animate-pulse">
                <div className="h-4 bg-dark-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-dark-700 rounded w-1/2" />
            </div>
        </div>
    );

    if (requests.length === 0) return null; // Hide if empty

    return (
        <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FaUserPlus className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-dark-100">
                    New Collab Requests <span className="text-sm font-normal text-dark-400">({requests.length})</span>
                </h3>
            </div>

            <AnimatePresence>
                {requests.map((req) => {
                    const { promotion, seller } = req;
                    const isProcessing = processing.has(promotion.id);

                    return (
                        <motion.div
                            key={promotion.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass-card p-5 border-l-4 border-blue-500 relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-dark-700 overflow-hidden">
                                        {seller?.avatar ? (
                                            <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold">
                                                {seller?.name?.charAt(0) || 'B'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-dark-100">{promotion.title}</h4>
                                        <p className="text-sm text-dark-300 mb-1">{seller?.name || 'A Brand'}</p>
                                        <div className="flex items-center gap-2 text-xs text-dark-400">
                                            <span className="px-2 py-0.5 rounded-full bg-dark-700 border border-dark-600">
                                                {promotion.promotionType?.[0] || 'Campaign'}
                                            </span>
                                            {promotion.minBudget && (
                                                <span className="text-emerald-400 font-medium">
                                                    ${promotion.minBudget} - ${promotion.maxBudget}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleResponse(promotion.id, 'ACCEPTED')}
                                        disabled={isProcessing}
                                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <FaCheck /> Accept
                                    </button>
                                    <button
                                        onClick={() => handleResponse(promotion.id, 'REJECTED')}
                                        disabled={isProcessing}
                                        className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <FaTimes /> Decline
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default MessageRequests;
