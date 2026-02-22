import { motion } from 'framer-motion';

const ActivityFeed = ({ activities = [], emptyMessage = "No recent activity" }) => {
    return (
        <div className="rounded-premium-xl bg-dark-800/40 border border-dark-700/50 p-s5 backdrop-blur-sm h-full flex flex-col shadow-md">
            <div className="flex items-center justify-between mb-s4">
                <h3 className="text-h3 font-bold text-white">Recent Activity</h3>
                <button className="text-xs-pure font-bold text-primary-400 hover:text-primary-300 transition-all uppercase tracking-widest">View All</button>
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
                            className="flex items-start gap-s3 p-s3 rounded-premium-lg bg-dark-700/30 hover:bg-dark-700/50 transition-all cursor-pointer group border border-transparent hover:border-dark-600/50"
                        >
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item.iconColor || 'bg-dark-600 text-dark-300'}`}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-small font-bold text-dark-100 group-hover:text-white transition-colors truncate">
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
