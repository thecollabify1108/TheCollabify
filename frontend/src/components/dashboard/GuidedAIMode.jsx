import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiX, HiArrowRight } from 'react-icons/hi';
import { FaRocket, FaSearch, FaChartLine, FaUserEdit, FaBullhorn, FaComments } from 'react-icons/fa';

const GuidedAIMode = ({ role, onAction, onClose }) => {
    const goals = role === 'creator' ? [
        {
            id: 'growth',
            icon: <FaChartLine />,
            label: 'Check my growth',
            target: 'stats',
            description: 'Analyze your performance metrics'
        },
        {
            id: 'deals',
            icon: <FaRocket />,
            label: 'Find brand deals',
            target: 'promotions',
            description: 'Browse new opportunities'
        },
        {
            id: 'portfolio',
            icon: <FaUserEdit />,
            label: 'Update portfolio',
            target: 'profile',
            description: 'Polish your profile for brands'
        }
    ] : [
        {
            id: 'find',
            icon: <FaSearch />,
            label: 'Find creators',
            target: 'search',
            description: 'Discover perfect matches'
        },
        {
            id: 'campaign',
            icon: <FaBullhorn />,
            label: 'Launch campaign',
            target: 'campaigns',
            description: 'Start a new collaboration'
        },
        {
            id: 'messages',
            icon: <FaComments />,
            label: 'Check messages',
            target: 'messages',
            description: 'Reply to creator inquiries'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative mb-8"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl blur-xl" />
            <div className="relative bg-dark-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-dark-400 hover:text-dark-200 transition-colors"
                >
                    <HiX />
                </button>

                <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                        <HiSparkles className="text-white text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">
                            What are you trying to do today?
                        </h2>
                        <p className="text-dark-400 text-sm">
                            Select a goal to focus your dashboard.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {goals.map((goal) => (
                        <motion.button
                            key={goal.id}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            onMouseEnter={() => onAction?.('hover', goal.target)}
                            onMouseLeave={() => onAction?.('leave', null)}
                            onClick={() => onAction?.('click', goal.target)}
                            className="flex items-center gap-4 p-4 rounded-xl border border-dark-700 hover:border-purple-500/50 transition-all text-left group bg-dark-800/50"
                        >
                            <div className="w-10 h-10 rounded-lg bg-dark-700 group-hover:bg-purple-500/20 flex items-center justify-center text-purple-400 transition-colors">
                                {goal.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-dark-100 group-hover:text-purple-300 transition-colors">
                                    {goal.label}
                                </h3>
                                <p className="text-xs text-dark-400 mt-0.5">
                                    {goal.description}
                                </p>
                            </div>
                            <HiArrowRight className="ml-auto text-dark-600 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default GuidedAIMode;
