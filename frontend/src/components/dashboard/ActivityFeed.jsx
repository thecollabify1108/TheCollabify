import { motion } from 'framer-motion';

const ActivityFeed = ({ activities = [], emptyMessage = "No recent activity" }) => {
    return (
        <div className="rounded-2xl bg-dark-800/40 border border-dark-700/50 p-5 backdrop-blur-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View All</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-dark-500">
                        <p className="text-sm">{emptyMessage}</p>
                    </div>
                ) : (
                    activities.map((item, index) => (
                        <motion.div
                            key={item.id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-dark-700/30 hover:bg-dark-700/50 transition-colors cursor-pointer group"
                        >
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item.iconColor || 'bg-dark-600 text-dark-300'}`}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-dark-100 group-hover:text-white transition-colors truncate">
                                    {item.title}
                                </p>
                                <p className="text-xs text-dark-400 line-clamp-1">
                                    {item.description}
                                </p>
                            </div>
                            <span className="text-[10px] text-dark-500 whitespace-nowrap">
                                {item.time}
                            </span>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
