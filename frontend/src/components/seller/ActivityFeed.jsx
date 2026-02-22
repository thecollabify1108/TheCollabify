import { motion } from 'framer-motion';
import { FaUser, FaCheck, FaBell, FaComments, FaRocket, FaClock, FaFire, FaHeart } from 'react-icons/fa';
import { HiLightningBolt, HiSparkles } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = ({ requests }) => {
    // Generate activity items from requests
    const generateActivities = () => {
        const activities = [];

        requests.forEach(request => {
            // Add creation activity
            activities.push({
                id: `${request._id}-created`,
                type: 'created',
                title: 'Campaign launched',
                subtitle: request.title,
                time: new Date(request.createdAt),
                icon: <FaRocket />,
                gradient: 'from-violet-500 to-purple-500',
                bgColor: 'bg-violet-500/10'
            });

            // Add matched creator activities
            request.matchedCreators?.forEach(creator => {
                if (creator.status === 'Applied') {
                    activities.push({
                        id: `${request._id}-${creator.creatorId}-applied`,
                        type: 'applied',
                        title: 'New application',
                        subtitle: `${creator.creatorName} applied`,
                        time: new Date(creator.appliedAt || request.createdAt),
                        icon: <FaFire />,
                        gradient: 'from-amber-500 to-orange-500',
                        bgColor: 'bg-amber-500/10'
                    });
                }
                if (creator.status === 'Accepted') {
                    activities.push({
                        id: `${request._id}-${creator.creatorId}-accepted`,
                        type: 'accepted',
                        title: 'Creator accepted',
                        subtitle: `${creator.creatorName} is working`,
                        time: new Date(creator.acceptedAt || request.createdAt),
                        icon: <FaHeart />,
                        gradient: 'from-pink-500 to-rose-500',
                        bgColor: 'bg-pink-500/10'
                    });
                }
            });

            if (request.status === 'Completed') {
                activities.push({
                    id: `${request._id}-completed`,
                    type: 'completed',
                    title: 'Campaign completed',
                    subtitle: request.title,
                    time: new Date(request.updatedAt),
                    icon: <FaCheck />,
                    gradient: 'from-emerald-500 to-teal-500',
                    bgColor: 'bg-emerald-500/10'
                });
            }
        });

        return activities.sort((a, b) => b.time - a.time).slice(0, 8);
    };

    const activities = generateActivities();

    const formatTime = (date) => {
        try {
            return formatDistanceToNow(date, { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-premium-2xl bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 shadow-premium h-full"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>

            {/* Header */}
            <div className="relative p-s5 border-b border-dark-700/50 bg-dark-800/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-s3">
                        <div className="p-2.5 rounded-premium-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-glow">
                            <HiLightningBolt className="text-lg text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-body font-black text-dark-100 uppercase tracking-wider">Activity</h3>
                            <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-tight">Recent updates</p>
                        </div>
                    </div>
                    {activities.length > 0 && (
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                        />
                    )}
                </div>
            </div>

            {/* Activity List */}
            <div className="p-s4 overflow-y-auto max-h-80 scrollbar-thin">
                {activities.length === 0 ? (
                    <div className="text-center py-s8">
                        <div className="w-16 h-16 mx-auto mb-s4 rounded-premium-2xl bg-dark-800/50 flex items-center justify-center border border-dark-700/50 shadow-inner">
                            <FaClock className="text-2xl text-dark-600" />
                        </div>
                        <p className="text-body font-bold text-dark-400 uppercase tracking-widest">No activity yet</p>
                        <p className="text-xs-pure font-bold text-dark-600 uppercase tracking-widest mt-2">Create a campaign to see updates</p>
                    </div>
                ) : (
                    <div className="space-y-s3">
                        {activities.map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group flex items-start gap-s3 p-s3 rounded-premium-xl hover:bg-dark-800/80 hover:shadow-premium transition-all cursor-pointer border border-transparent hover:border-dark-700/30"
                            >
                                <div className={`p-s2 rounded-premium-lg bg-gradient-to-br ${activity.gradient} shadow-glow flex-shrink-0`}>
                                    <span className="text-white text-[10px]">{activity.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-small font-bold text-dark-200">{activity.title}</p>
                                    <p className="text-xs-pure font-bold text-dark-500 truncate uppercase mt-0.5">{activity.subtitle}</p>
                                    <p className="text-[10px] font-black text-dark-600 uppercase tracking-tighter mt-1">{formatTime(activity.time)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ActivityFeed;
