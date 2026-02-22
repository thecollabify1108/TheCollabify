import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FaBriefcase,
    FaDollarSign,
    FaUsers,
    FaCheck,
    FaTimes,
    FaFlag
} from 'react-icons/fa';
import { HiSparkles, HiCreditCard, HiClipboardList } from 'react-icons/hi';
import toast from 'react-hot-toast';
import CreatorCard from './CreatorCard';
import CollaborationStepper from '../common/CollaborationStepper';
import PredictiveAnalyticsWidget from '../analytics/PredictiveAnalyticsWidget';
import { trackMatchOutcome } from '../../services/feedback';

const CampaignTracker = ({ request, onClose, onAccept, onReject, onUpdateStatus, onMessage, onManageCollaboration }) => {
    const [activeSection, setActiveSection] = useState('applicants');

    const applicants = request.matchedCreators?.filter(mc => mc.status === 'Applied') || [];
    const matched = request.matchedCreators?.filter(mc => mc.status === 'Matched') || [];
    const accepted = request.matchedCreators?.filter(mc => mc.status === 'Accepted') || [];
    const rejected = request.matchedCreators?.filter(mc => mc.status === 'Rejected') || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Creator Interested': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Accepted': return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
            case 'Completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-dark-600 text-dark-300 border-dark-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Campaign Header */}
            <motion.div
                className="p-s6 rounded-premium-2xl bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 shadow-premium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-s3 mb-s2">
                            <h2 className="text-h1 font-black text-dark-100 uppercase tracking-tight">{request.title}</h2>
                            <span className={`px-s3 py-1 rounded-full text-xs-pure font-black uppercase tracking-widest border shadow-sm ${getStatusColor(request.status)}`}>
                                {request.status}
                            </span>
                        </div>
                        <p className="text-body text-dark-400 mb-s4 leading-relaxed">{request.description}</p>

                        <div className="flex flex-wrap gap-s4 text-xs-pure font-bold">
                            <div className="flex items-center text-dark-300 bg-dark-900/40 px-s3 py-1.5 rounded-full border border-dark-700/50">
                                <FaDollarSign className="mr-1 text-emerald-400" />
                                <span className="uppercase tracking-wider font-black">${request.budgetRange?.min} - ${request.budgetRange?.max}</span>
                            </div>
                            <div className="flex items-center text-dark-300 bg-dark-900/40 px-s3 py-1.5 rounded-full border border-dark-700/50">
                                <FaUsers className="mr-1 text-primary-400" />
                                <span className="uppercase tracking-wider font-black">
                                    {request.followerRange?.min >= 1000
                                        ? `${(request.followerRange.min / 1000).toFixed(0)}K`
                                        : request.followerRange?.min} -
                                    {request.followerRange?.max >= 1000000
                                        ? `${(request.followerRange.max / 1000000).toFixed(1)}M`
                                        : `${(request.followerRange.max / 1000).toFixed(0)}K`}
                                </span>
                            </div>
                            <span className="px-s3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">{request.promotionType}</span>
                            <span className="px-s3 py-1.5 rounded-full bg-dark-700/50 text-dark-300 border border-dark-600 uppercase tracking-widest">{request.targetCategory}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col gap-2">
                        {/* Close Modal Button */}
                        <button
                            onClick={onClose}
                            className="px-s4 py-s2 rounded-premium-xl bg-dark-700/50 border border-dark-600 text-dark-300 hover:text-dark-100 hover:bg-dark-600 transition-all text-xs-pure font-bold uppercase tracking-widest flex items-center shadow-premium"
                        >
                            <FaTimes className="mr-2" />
                            Close
                        </button>

                        {/* Campaign Status Actions */}
                        {request.status === 'Accepted' && (
                            <button
                                onClick={() => {
                                    onUpdateStatus(request._id, 'Completed');
                                    // Track Outcome: COMPLETED
                                    // Note: We need a matchId. Since 'Completed' is campaign-level, 
                                    // we might need to iterate matchedCreators or just track the campaign ID as proxy if backend handles it.
                                    // For now, let's track it for all accepted creators
                                    request.matchedCreators.filter(mc => mc.status === 'Accepted').forEach(mc => {
                                        trackMatchOutcome({
                                            matchId: mc._id,
                                            status: 'completed'
                                        });
                                    });
                                }}
                                className="px-s4 py-s2 rounded-premium-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs-pure uppercase tracking-widest shadow-glow hover:shadow-glow-lg transition-all flex items-center"
                            >
                                <FaCheck className="mr-2" />
                                Mark Complete
                            </button>
                        )}
                        {['Open', 'Creator Interested'].includes(request.status) && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to cancel this campaign? This action cannot be undone.')) {
                                        onUpdateStatus(request._id, 'Cancelled');
                                        // Track Outcome: ABANDONED
                                        request.matchedCreators.forEach(mc => {
                                            trackMatchOutcome({
                                                matchId: mc._id,
                                                status: 'abandoned'
                                            });
                                        });
                                    }
                                }}
                                className="btn-outline text-sm flex items-center text-red-400 border-red-500/50 hover:bg-red-500/10"
                            >
                                <FaFlag className="mr-2" />
                                Cancel Campaign
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-s4 mt-s6 pt-s6 border-t border-dark-700/50">
                    <div className="text-center group">
                        <div className="text-h1 font-black text-dark-100 group-hover:scale-110 transition-transform">{matched.length}</div>
                        <div className="text-xs-pure font-black text-dark-500 uppercase tracking-widest mt-1">Matched</div>
                    </div>
                    <div className="text-center group">
                        <div className="text-h1 font-black text-amber-400 group-hover:scale-110 transition-transform">{applicants.length}</div>
                        <div className="text-xs-pure font-black text-dark-500 uppercase tracking-widest mt-1">Applied</div>
                    </div>
                    <div className="text-center group">
                        <div className="text-h1 font-black text-emerald-400 group-hover:scale-110 transition-transform">{accepted.length}</div>
                        <div className="text-xs-pure font-black text-dark-500 uppercase tracking-widest mt-1">Accepted</div>
                    </div>
                    <div className="text-center group">
                        <div className="text-h1 font-black text-red-500 group-hover:scale-110 transition-transform">{rejected.length}</div>
                        <div className="text-xs-pure font-black text-dark-500 uppercase tracking-widest mt-1">Rejected</div>
                    </div>
                </div>
            </motion.div>

            {/* AI Predictive Analytics */}
            <PredictiveAnalyticsWidget
                campaignData={{
                    budget: request.budgetRange?.max || 5000,
                    creatorFollowers: request.followerRange?.max || 50000,
                    creatorEngagementRate: 3.5,
                    promotionType: request.promotionType || 'Post',
                    category: request.targetCategory || 'Lifestyle',
                    duration: 14
                }}
                creatorProfile={{
                    followers: request.followerRange?.max || 50000,
                    avgEngagementRate: 3.5
                }}
            />

            {/* Section Tabs */}
            <div className="flex space-x-s2 bg-dark-800/60 p-s1 rounded-premium-xl w-fit border border-dark-700/50 shadow-premium">
                {['applicants', 'matched', 'accepted'].map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`px-s4 py-s2 rounded-premium-lg font-black text-xs-pure uppercase tracking-widest transition-all ${activeSection === section
                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-glow'
                            : 'text-dark-400 hover:text-dark-100'
                            }`}
                    >
                        {section} ({
                            section === 'applicants' ? applicants.length :
                                section === 'matched' ? matched.length :
                                    accepted.length
                        })
                    </button>
                ))}
            </div>

            {/* Creator Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-s6">
                {activeSection === 'applicants' && applicants.length === 0 && (
                    <div className="col-span-full p-s12 rounded-premium-2xl bg-dark-800/40 border border-dark-700/50 text-center shadow-premium">
                        <div className="w-20 h-20 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-s4 shadow-inner">
                            <FaBriefcase className="w-8 h-8 text-dark-500" />
                        </div>
                        <h3 className="text-h3 font-bold text-dark-200 mb-s2">No applications yet</h3>
                        <p className="text-body text-dark-500 uppercase tracking-tight font-medium">Creators who apply will appear here.</p>
                    </div>
                )}

                {activeSection === 'matched' && matched.length === 0 && (
                    <div className="col-span-full p-s12 rounded-premium-2xl bg-dark-800/40 border border-dark-700/50 text-center shadow-premium">
                        <HiSparkles className="w-16 h-16 text-dark-500 mx-auto mb-s4" />
                        <h3 className="text-h3 font-black text-dark-200 mb-s2 uppercase tracking-tight">No pending matches</h3>
                        <p className="text-body text-dark-500 uppercase tracking-tighter font-medium">All matched creators have either applied or been processed.</p>
                    </div>
                )}

                {activeSection === 'accepted' && accepted.length === 0 && (
                    <div className="col-span-full p-s12 rounded-premium-2xl bg-dark-800/40 border border-dark-700/50 text-center shadow-premium">
                        <FaCheck className="w-16 h-16 text-dark-500 mx-auto mb-s4" />
                        <h3 className="text-h3 font-black text-dark-200 mb-s2 uppercase tracking-tight">No accepted creators yet</h3>
                        <p className="text-body text-dark-500 uppercase tracking-tighter font-medium">Accept an applicant to start your campaign.</p>
                    </div>
                )}
                Broadway
                {activeSection === 'applicants' && applicants.map((mc, index) => (
                    <CreatorCard
                        key={mc._id || index}
                        creator={mc}
                        matchScore={mc.matchScore}
                        matchReason={mc.matchReason}
                        status={mc.status}
                        onAccept={() => onAccept(request._id, mc.creatorId._id || mc.creatorId)}
                        onReject={() => onReject(request._id, mc.creatorId._id || mc.creatorId)}
                    />
                ))}

                {activeSection === 'matched' && matched.map((mc, index) => (
                    <CreatorCard
                        key={mc._id || index}
                        creator={mc}
                        matchScore={mc.matchScore}
                        matchReason={mc.matchReason}
                        status={mc.status}
                    />
                ))}

                {activeSection === 'accepted' && accepted.map((mc, index) => (
                    <CreatorCard
                        key={mc._id || index}
                        creator={mc}
                        matchScore={mc.matchScore}
                        matchReason={mc.matchReason}
                        status={mc.status}
                        onMessage={() => onMessage && onMessage(request._id, mc.creatorId._id || mc.creatorId, mc.creatorId?.userId?.name || 'Creator')}
                    >
                        <div className="mt-s4 pt-s4 border-t border-dark-700/50 flex flex-col gap-s3">
                            {/* Quick Progress Tracker */}
                            <div className="mb-s2 px-s1">
                                <CollaborationStepper
                                    currentStatus={mc.collaborationStatus || 'ACCEPTED'}
                                    className="scale-[0.85] origin-top"
                                />
                            </div>

                            {/* Manage Collaboration Button (Value Retention) */}
                            <button
                                onClick={() => onManageCollaboration && onManageCollaboration(mc)}
                                className="w-full py-s3 rounded-premium-xl bg-dark-700/50 hover:bg-dark-700 text-white font-bold text-xs-pure uppercase tracking-widest border border-dark-600 transition-all flex items-center justify-center gap-2 shadow-premium group"
                            >
                                <HiClipboardList className="text-primary-400 group-hover:scale-110 transition-transform" /> Manage Collaboration
                            </button>

                            <button
                                onClick={() => {
                                    toast.success('Payment system upgrade in progress! ⚡');
                                }}
                                className="w-full py-s3 rounded-premium-xl bg-gradient-to-r from-emerald-600/50 to-teal-600/50 text-white/50 cursor-not-allowed font-black text-xs-pure uppercase tracking-widest shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <HiCreditCard /> Secure Checkout (Coming Soon)
                            </button>
                        </div>
                    </CreatorCard>
                ))}
            </div>
        </div>
    );
};

export default CampaignTracker;
