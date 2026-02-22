import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaComments, FaCheck, FaClock, FaRocket, FaFire } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const CampaignPipeline = ({ requests, onSelectRequest }) => {
    const stages = [
        {
            id: 'Open',
            label: 'Open',
            gradient: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            icon: <FaRocket />,
            description: 'Waiting for creators'
        },
        {
            id: 'Creator Interested',
            label: 'Interested',
            gradient: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            icon: <FaFire />,
            description: 'Creators applied'
        },
        {
            id: 'Accepted',
            label: 'In Progress',
            gradient: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            icon: <FaComments />,
            description: 'Working with creators'
        },
        {
            id: 'Completed',
            label: 'Completed',
            gradient: 'from-emerald-500 to-teal-500',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            icon: <FaCheck />,
            description: 'Successfully finished'
        }
    ];

    const getRequestsByStage = (stageId) => {
        if (stageId === 'Creator Interested') {
            return requests.filter(r => r.status === 'Creator Interested' || (r.status === 'Open' && r.matchedCreators?.some(c => c.status === 'Applied')));
        }
        return requests.filter(r => r.status === stageId);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-premium-2xl bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 shadow-premium"
        >
            {/* Header */}
            <div className="relative p-s6 border-b border-dark-700/50 bg-dark-800/40">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-secondary-500/5"></div>
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-s3">
                        <div className="p-s2.5 rounded-premium-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 shadow-glow">
                            <HiSparkles className="text-xl text-primary-400" />
                        </div>
                        <div>
                            <h3 className="text-body font-black text-dark-100 uppercase tracking-widest leading-none">Campaign Pipeline</h3>
                            <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-tight mt-1">Track your campaigns progress</p>
                        </div>
                    </div>
                    <span className="px-s4 py-s2 rounded-premium-full bg-dark-700/50 text-xs-pure font-black text-dark-300 uppercase tracking-widest border border-dark-600/30">
                        {requests.length} total
                    </span>
                </div>
            </div>

            {/* Pipeline Stages */}
            <div className="p-s6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-s4">
                    {stages.map((stage, index) => {
                        const stageRequests = getRequestsByStage(stage.id);

                        return (
                            <motion.div
                                key={stage.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative overflow-hidden rounded-premium-2xl ${stage.bgColor} border ${stage.borderColor} p-s5 hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-premium`}
                            >
                                {/* Glow effect */}
                                <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${stage.gradient} opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-opacity`}></div>

                                <div className="relative z-10">
                                    {/* Stage Header */}
                                    <div className="flex items-center gap-s2 mb-s4">
                                        <div className={`p-s2 rounded-premium-lg bg-gradient-to-br ${stage.gradient} shadow-glow`}>
                                            <span className="text-white text-sm">{stage.icon}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs-pure font-black text-dark-100 uppercase tracking-widest leading-none">{stage.label}</span>
                                            <p className="text-[10px] font-bold text-dark-500 uppercase tracking-tight mt-0.5">{stage.description}</p>
                                        </div>
                                    </div>

                                    {/* Count */}
                                    <div className="text-h1 font-black text-dark-100 mb-s3 group-hover:scale-110 transition-transform origin-left">
                                        {stageRequests.length}
                                    </div>

                                    {/* Mini Cards */}
                                    <div className="space-y-s2 max-h-24 overflow-y-auto scrollbar-thin">
                                        <AnimatePresence>
                                            {stageRequests.slice(0, 2).map((request) => (
                                                <motion.div
                                                    key={request._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    className="p-s2 bg-dark-800/60 backdrop-blur rounded-premium-lg cursor-pointer hover:bg-dark-700/60 transition-all border border-dark-700/30"
                                                    onClick={() => onSelectRequest(request)}
                                                >
                                                    <p className="text-[10px] font-bold text-dark-200 truncate uppercase tracking-tight">{request.title}</p>
                                                    <p className="text-[10px] font-black text-primary-400 mt-0.5">₹{request.budget?.toLocaleString()}</p>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {stageRequests.length > 2 && (
                                            <p className="text-[10px] font-black text-dark-500 text-center py-s1 hover:text-primary-400 cursor-pointer transition-colors uppercase tracking-widest">
                                                +{stageRequests.length - 2} more campaigns
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default CampaignPipeline;
