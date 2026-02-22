import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaCheck, FaClock, FaFire, FaUsers } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import UrgencyBadge from '../common/UrgencyBadge';

const CampaignStories = ({ campaigns, onCreateNew, onSelectCampaign }) => {
    const [selectedStory, setSelectedStory] = useState(null);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'from-emerald-500 to-teal-500';
            case 'Accepted': return 'from-purple-500 to-pink-500';
            case 'Creator Interested': return 'from-amber-500 to-orange-500';
            default: return 'from-blue-500 to-cyan-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <FaCheck />;
            case 'Accepted': return <FaUsers />;
            case 'Creator Interested': return <FaFire />;
            default: return <FaClock />;
        }
    };

    return (
        <>
            {/* Stories Bar */}
            <div className="py-s4 px-s2 overflow-x-auto scrollbar-hide">
                <div className="flex gap-s4 min-w-max px-s2">
                    {/* Create New Story */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCreateNew}
                        className="flex flex-col items-center gap-s2"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-dashed border-dark-500 flex items-center justify-center shadow-premium">
                                <FaPlus className="text-2xl text-dark-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
                                <FaPlus className="text-white text-xs" />
                            </div>
                        </div>
                        <span className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Create</span>
                    </motion.button>

                    {/* Campaign Stories */}
                    {campaigns.map((campaign, index) => (
                        <motion.button
                            key={campaign._id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedStory(campaign)}
                            className="flex flex-col items-center gap-s2"
                        >
                            <div className="relative">
                                {/* Gradient Ring */}
                                <div className={`w-20 h-20 rounded-full p-[3px] bg-gradient-to-br ${getStatusColor(campaign.status)} shadow-premium`}>
                                    <div className="w-full h-full rounded-full bg-dark-900 p-1">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-dark-200">
                                                {campaign.title?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r ${getStatusColor(campaign.status)} flex items-center justify-center shadow-glow`}>
                                    <span className="text-white text-xs">{getStatusIcon(campaign.status)}</span>
                                </div>
                            </div>
                            <span className="text-xs-pure text-dark-300 font-bold max-w-[80px] truncate uppercase tracking-tight">
                                {campaign.title}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Story Viewer Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-md"
                        onClick={() => setSelectedStory(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative w-full max-w-md mx-s4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Progress Bar */}
                            <div className="absolute top-s4 left-s4 right-s4 flex gap-1 z-20">
                                <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full bg-gradient-to-r ${getStatusColor(selectedStory.status)} shadow-glow`}
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 5 }}
                                    />
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedStory(null)}
                                className="absolute top-s4 right-s4 z-30 p-s2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors shadow-premium"
                            >
                                <FaTimes />
                            </button>

                            {/* Story Content */}
                            <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-premium-2xl overflow-hidden shadow-2xl border border-white/5">
                                {/* Header */}
                                <div className={`h-48 bg-gradient-to-br ${getStatusColor(selectedStory.status)} p-s6 flex flex-col justify-end relative`}>
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="relative z-10 flex items-center gap-s3">
                                        <div className="w-14 h-14 rounded-premium-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-premium border border-white/20">
                                            {getStatusIcon(selectedStory.status)}
                                        </div>
                                        <div>
                                            <span className="text-white/80 text-xs-pure font-bold uppercase tracking-wider">{selectedStory.status}</span>
                                            <h3 className="text-h2 font-bold text-white shadow-sm">{selectedStory.title}</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="p-s6 space-y-s4">
                                    <div className="grid grid-cols-3 gap-s4 text-center">
                                        <div className="p-s2 rounded-premium-lg bg-dark-700/50">
                                            <div className="text-h3 font-bold text-dark-100">
                                                ₹{selectedStory.budget?.toLocaleString()}
                                            </div>
                                            <div className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Budget</div>
                                        </div>
                                        <div className="p-s2 rounded-premium-lg bg-dark-700/50">
                                            <div className="text-h3 font-bold text-dark-100">
                                                {selectedStory.matchedCreators?.length || 0}
                                            </div>
                                            <div className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Matches</div>
                                        </div>
                                        <div className="p-s2 rounded-premium-lg bg-dark-700/50">
                                            <div className="text-h3 font-bold text-dark-100">
                                                {selectedStory.matchedCreators?.filter(c => c.status === 'Applied').length || 0}
                                            </div>
                                            <div className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Pending</div>
                                        </div>
                                    </div>

                                    <p className="text-body text-dark-300 line-clamp-3">{selectedStory.description}</p>

                                    {/* Urgency Indicators */}
                                    <div className="pt-s2">
                                        <UrgencyBadge
                                            daysLeft={selectedStory.deadline ? Math.ceil((new Date(selectedStory.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : undefined}
                                            applicantCount={selectedStory.matchedCreators?.length}
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedStory(null);
                                            onSelectCampaign(selectedStory);
                                        }}
                                        className="w-full py-s3 rounded-premium-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold shadow-glow hover:shadow-glow-lg transition-all"
                                    >
                                        VIEW CAMPAIGN DETAILS
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CampaignStories;
