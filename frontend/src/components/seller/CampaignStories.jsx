import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaCheck, FaClock, FaFire, FaUsers } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

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
            <div className="py-4 px-2 overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 min-w-max px-2">
                    {/* Create New Story */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCreateNew}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-dashed border-dark-500 flex items-center justify-center">
                                <FaPlus className="text-2xl text-dark-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                                <FaPlus className="text-white text-xs" />
                            </div>
                        </div>
                        <span className="text-xs text-dark-400 font-medium">Create</span>
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
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="relative">
                                {/* Gradient Ring */}
                                <div className={`w-20 h-20 rounded-full p-[3px] bg-gradient-to-br ${getStatusColor(campaign.status)}`}>
                                    <div className="w-full h-full rounded-full bg-dark-900 p-1">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-dark-200">
                                                {campaign.title?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r ${getStatusColor(campaign.status)} flex items-center justify-center shadow-lg`}>
                                    <span className="text-white text-xs">{getStatusIcon(campaign.status)}</span>
                                </div>
                            </div>
                            <span className="text-xs text-dark-300 font-medium max-w-[80px] truncate">
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
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                        onClick={() => setSelectedStory(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative w-full max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Progress Bar */}
                            <div className="absolute top-4 left-4 right-4 flex gap-1">
                                <motion.div
                                    className={`h-1 rounded-full bg-gradient-to-r ${getStatusColor(selectedStory.status)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 5 }}
                                />
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedStory(null)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <FaTimes />
                            </button>

                            {/* Story Content */}
                            <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl overflow-hidden">
                                {/* Header */}
                                <div className={`h-40 bg-gradient-to-br ${getStatusColor(selectedStory.status)} p-6 flex flex-col justify-end`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                            {getStatusIcon(selectedStory.status)}
                                        </div>
                                        <div>
                                            <span className="text-white/80 text-sm">{selectedStory.status}</span>
                                            <h3 className="text-xl font-bold text-white">{selectedStory.title}</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-dark-100">
                                                ₹{selectedStory.budget?.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-dark-400">Budget</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-dark-100">
                                                {selectedStory.matchedCreators?.length || 0}
                                            </div>
                                            <div className="text-xs text-dark-400">Matches</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-dark-100">
                                                {selectedStory.matchedCreators?.filter(c => c.status === 'Applied').length || 0}
                                            </div>
                                            <div className="text-xs text-dark-400">Pending</div>
                                        </div>
                                    </div>

                                    <p className="text-dark-300 text-sm line-clamp-3">{selectedStory.description}</p>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedStory(null);
                                            onSelectCampaign(selectedStory);
                                        }}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold"
                                    >
                                        View Details
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
