import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaCheck, FaTimes, FaClock, FaInbox } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { chatAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MessageRequests = ({ onAccept, onReject }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await chatAPI.getRequests();
            setRequests(res.data.data.requests);
        } catch (error) {
            toast.error('Failed to load message requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (conversationId) => {
        setProcessing(conversationId);
        try {
            await chatAPI.acceptRequest(conversationId);
            toast.success('Message request accepted!');
            setRequests(prev => prev.filter(r => r._id !== conversationId));
            onAccept?.();
        } catch (error) {
            toast.error('Failed to accept request');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (conversationId) => {
        if (!window.confirm('Reject this message request? This will delete the conversation.')) return;

        setProcessing(conversationId);
        try {
            await chatAPI.rejectRequest(conversationId);
            toast.success('Message request rejected');
            setRequests(prev => prev.filter(r => r._id !== conversationId));
            onReject?.();
        } catch (error) {
            toast.error('Failed to reject request');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className=\"flex items-center justify-center py-12\">
                < div className =\"w-8 h-8 border-2 border-primary-500 rounded-full border-t-transparent animate-spin\" />
            </div >
        );
    }

if (requests.length === 0) {
    return (
        <div className=\"flex flex-col items-center justify-center py-12 px-6 text-center\">
            < div className =\"w-20 h-20 rounded-full bg-dark-800/50 flex items-center justify-center mb-4\">
                < FaInbox className =\"text-4xl text-dark-600\" />
                </div >
        <h3 className=\"text-lg font-semibold text-dark-100 mb-2\">No message requests</h3>
            < p className =\"text-sm text-dark-400 max-w-sm\">
                    When sellers want to message you, their requests will appear here for your approval.
                </p >
            </div >
        );
}

return (
    <div className=\"space-y-3\">
        < AnimatePresence >
    {
        requests.map((request, index) => {
            const seller = request.sellerId;
            const campaign = request.promotionId;

            return (
                <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className=\"bg-dark-800/60 border border-dark-700 rounded-xl p-4 hover:border-primary-500/30 transition-all\"
                        >
                        {/* Seller Info */ }
                        < div className =\"flex items-center gap-3 mb-3\">
                            < div className =\"w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0\">
            { seller?.name?.charAt(0).toUpperCase() || 'S' }
                                </div >
                <div className=\"flex-1 min-w-0\">
                    < h4 className =\"font-semibold text-dark-100 truncate\">{seller?.name || 'Seller'}</h4>
                        < p className =\"text-sm text-dark-400 truncate\">{seller?.email}</p>
                                </div >
                <div className=\"flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full\">
                    < FaClock />
                    <span>Pending</span>
                                </div >
                            </div >

                {/* Campaign Info */ }
            {
                campaign && (
                    <div className=\"mb-4 p-3 bg-dark-700/50 rounded-lg\">
                        < div className =\"flex items-center gap-2 mb-1\">
                            < HiSparkles className =\"text-primary-400\" />
                                < span className =\"text-xs text-dark-400 uppercase tracking-wider\">Campaign</span>
                                    </div >
                    <p className=\"text-sm text-dark-200 font-medium truncate\">{campaign.title}</p>
                                </div >
                            )
    }

{/* Action Buttons */ }
<div className=\"flex gap-2\">
    < motion.button
whileHover = {{ scale: 1.02 }}
whileTap = {{ scale: 0.98 }}
onClick = {() => handleAccept(request._id)}
disabled = { processing === request._id}
className =\"flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition\"
    >
    <FaCheck />
{ processing === request._id ? 'Accepting...' : 'Accept' }
                                </motion.button >
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleReject(request._id)}
        disabled={processing === request._id}
        className=\"flex-1 px-4 py-2.5 rounded-lg bg-dark-700 border border-dark-600 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition\"
            >
            <FaTimes />
Reject
                                </motion.button >
                            </div >
                        </motion.div >
                    );
                })}
            </AnimatePresence >
        </div >
    );
};

export default MessageRequests;
