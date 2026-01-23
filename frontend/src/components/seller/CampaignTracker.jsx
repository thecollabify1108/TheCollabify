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
import { HiSparkles } from 'react-icons/hi';
import CreatorCard from './CreatorCard';
import PredictiveAnalyticsWidget from '../analytics/PredictiveAnalyticsWidget';

const CampaignTracker = ({ request, onClose, onAccept, onReject, onUpdateStatus, onMessage }) => {
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
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-dark-100">{request.title}</h2>
                            <span className={`badge border ${getStatusColor(request.status)}`}>
                                {request.status}
                            </span>
                        </div>
                        <p className="text-dark-400 mb-4">{request.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center text-dark-300">
                                <FaDollarSign className="mr-1 text-emerald-400" />
                                ${request.budgetRange?.min} - ${request.budgetRange?.max}
                            </div>
                            <div className="flex items-center text-dark-300">
                                <FaUsers className="mr-1 text-primary-400" />
                                {request.followerRange?.min >= 1000
                                    ? `${(request.followerRange.min / 1000).toFixed(0)}K`
                                    : request.followerRange?.min} -
                                {request.followerRange?.max >= 1000000
                                    ? `${(request.followerRange.max / 1000000).toFixed(1)}M`
                                    : `${(request.followerRange.max / 1000).toFixed(0)}K`}
                            </div>
                            <span className="badge badge-info">{request.promotionType}</span>
                            <span className="badge badge-neutral">{request.targetCategory}</span>
                            <span className="badge badge-neutral">{request.campaignGoal}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col gap-2">
                        {/* Close Modal Button */}
                        <button
                            onClick={onClose}
                            className="btn-outline text-sm flex items-center text-dark-300 border-dark-600 hover:bg-dark-700"
                        >
                            <FaTimes className="mr-2" />
                            Close
                        </button>

                        {/* Campaign Status Actions */}
                        {request.status === 'Accepted' && (
                            <button
                                onClick={() => onUpdateStatus(request._id, 'Completed')}
                                className="btn-3d text-sm flex items-center"
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
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-700">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-dark-100">{matched.length}</div>
                        <div className="text-xs text-dark-400">Matched</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400">{applicants.length}</div>
                        <div className="text-xs text-dark-400">Applied</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400">{accepted.length}</div>
                        <div className="text-xs text-dark-400">Accepted</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{rejected.length}</div>
                        <div className="text-xs text-dark-400">Rejected</div>
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
            <div className="flex space-x-2 bg-dark-800/50 p-1 rounded-xl w-fit">
                {['applicants', 'matched', 'accepted'].map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${activeSection === section
                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                            : 'text-dark-400 hover:text-dark-200'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSection === 'applicants' && applicants.length === 0 && (
                    <div className="col-span-full glass-card p-12 text-center">
                        <FaBriefcase className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-dark-300 mb-2">No applications yet</h3>
                        <p className="text-dark-400">Creators who apply to your request will appear here.</p>
                    </div>
                )}

                {activeSection === 'matched' && matched.length === 0 && (
                    <div className="col-span-full glass-card p-12 text-center">
                        <HiSparkles className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-dark-300 mb-2">No pending matches</h3>
                        <p className="text-dark-400">All matched creators have either applied or been processed.</p>
                    </div>
                )}

                {activeSection === 'accepted' && accepted.length === 0 && (
                    <div className="col-span-full glass-card p-12 text-center">
                        <FaCheck className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-dark-300 mb-2">No accepted creators yet</h3>
                        <p className="text-dark-400">Accept an applicant to start your campaign.</p>
                    </div>
                )}

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
                    />
                ))}
            </div>
        </div>
    );
};

export default CampaignTracker;
