import { motion } from 'framer-motion';
import { FaEye, FaComments, FaCheck, FaTimes, FaClock } from 'react-icons/fa';

const CampaignPipeline = ({ requests, onSelectRequest, onViewDetails }) => {
    const stages = [
        { id: 'Open', label: 'Open', color: 'border-blue-500', bgColor: 'bg-blue-500/10', icon: <FaClock /> },
        { id: 'Creator Interested', label: 'Interested', color: 'border-amber-500', bgColor: 'bg-amber-500/10', icon: <FaEye /> },
        { id: 'Accepted', label: 'In Progress', color: 'border-purple-500', bgColor: 'bg-purple-500/10', icon: <FaComments /> },
        { id: 'Completed', label: 'Completed', color: 'border-emerald-500', bgColor: 'bg-emerald-500/10', icon: <FaCheck /> }
    ];

    const getRequestsByStage = (stageId) => {
        if (stageId === 'Creator Interested') {
            return requests.filter(r => r.status === 'Creator Interested' || r.status === 'Open' && r.matchedCreators?.some(c => c.status === 'Applied'));
        }
        return requests.filter(r => r.status === stageId);
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-100">Campaign Pipeline</h3>
                <span className="text-sm text-dark-400">{requests.length} total</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stages.map((stage, index) => {
                    const stageRequests = getRequestsByStage(stage.id);

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border-2 ${stage.color} ${stage.bgColor}`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-dark-300">{stage.icon}</span>
                                <span className="text-sm font-medium text-dark-200">{stage.label}</span>
                            </div>

                            <div className="text-2xl font-bold text-dark-100 mb-2">
                                {stageRequests.length}
                            </div>

                            {/* Mini campaign cards */}
                            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                                {stageRequests.slice(0, 3).map((request) => (
                                    <motion.div
                                        key={request._id}
                                        className="p-2 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-700/50 transition-all"
                                        onClick={() => onSelectRequest(request)}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <p className="text-xs text-dark-200 truncate">{request.title}</p>
                                        <p className="text-xs text-dark-400">₹{request.budget}</p>
                                    </motion.div>
                                ))}
                                {stageRequests.length > 3 && (
                                    <p className="text-xs text-primary-400 text-center cursor-pointer hover:underline">
                                        +{stageRequests.length - 3} more
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default CampaignPipeline;
