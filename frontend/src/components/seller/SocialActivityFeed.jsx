import { motion } from 'framer-motion';
import {
    FaHeart,
    FaComment,
    FaShare,
    FaRocket,
    FaCheck,
    FaUser,
    FaBell,
    FaFire,
    FaHandshake,
    FaTrophy
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';

const SocialActivityFeed = ({ requests, onViewCampaign }) => {
    // Generate social-style activity items
    const generateActivities = () => {
        const activities = [];

        requests.forEach(request => {
            // Campaign created
            activities.push({
                id: `${request._id}-created`,
                type: 'campaign_created',
                icon: <FaRocket />,
                iconBg: 'from-violet-500 to-purple-500',
                title: 'You launched a new campaign',
                subtitle: request.title,
                budget: request.budget,
                time: new Date(request.createdAt),
                likes: Math.floor(Math.random() * 50) + 10,
                requestId: request._id
            });

            // Applied creators
            request.matchedCreators?.forEach(creator => {
                if (creator.status === 'Applied') {
                    activities.push({
                        id: `${request._id}-${creator.creatorId}-applied`,
                        type: 'creator_applied',
                        icon: <FaFire />,
                        iconBg: 'from-amber-500 to-orange-500',
                        title: `${creator.creatorName} wants to collaborate`,
                        subtitle: `Applied to "${request.title}"`,
                        creatorName: creator.creatorName,
                        followerCount: creator.followerCount,
                        time: new Date(creator.appliedAt || request.createdAt),
                        likes: Math.floor(Math.random() * 30) + 5,
                        requestId: request._id
                    });
                }
                if (creator.status === 'Accepted') {
                    activities.push({
                        id: `${request._id}-${creator.creatorId}-accepted`,
                        type: 'creator_accepted',
                        icon: <FaHandshake />,
                        iconBg: 'from-emerald-500 to-teal-500',
                        title: `Partnership started with ${creator.creatorName}`,
                        subtitle: `For "${request.title}"`,
                        time: new Date(creator.acceptedAt || request.createdAt),
                        likes: Math.floor(Math.random() * 100) + 20,
                        requestId: request._id
                    });
                }
            });

            // Completed campaigns
            if (request.status === 'Completed') {
                activities.push({
                    id: `${request._id}-completed`,
                    type: 'campaign_completed',
                    icon: <FaTrophy />,
                    iconBg: 'from-amber-400 to-yellow-500',
                    title: 'Campaign completed successfully! 🎉',
                    subtitle: request.title,
                    time: new Date(request.updatedAt),
                    likes: Math.floor(Math.random() * 200) + 50,
                    requestId: request._id
                });
            }
        });

        return activities.sort((a, b) => b.time - a.time).slice(0, 10);
    };

    const activities = generateActivities();

    const formatTime = (date) => {
        try {
            return formatDistanceToNow(date, { addSuffix: false });
        } catch {
            return 'Recently';
        }
    };

    if (activities.length === 0) {
        return (
            <div className="py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
                    <FaBell className="text-3xl text-dark-500" />
                </div>
                <h3 className="text-lg font-semibold text-dark-300 mb-2">No activity yet</h3>
                <p className="text-dark-500 text-sm">Create your first campaign to see updates here</p>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {activities.map((activity, index) => (
                <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dark-800/50 last:border-0"
                >
                    {/* Activity Card - Instagram Style */}
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activity.iconBg} flex items-center justify-center text-white shadow-lg`}>
                                {activity.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-dark-100">{activity.title}</p>
                                <p className="text-xs text-dark-400">{formatTime(activity.time)}</p>
                            </div>
                            <button className="text-dark-400 hover:text-dark-200">
                                •••
                            </button>
                        </div>

                        {/* Content Card */}
                        <div
                            onClick={() => onViewCampaign?.(activity.requestId)}
                            className="rounded-2xl bg-gradient-to-br from-dark-800/80 to-dark-900/80 border border-dark-700/50 p-4 cursor-pointer hover:border-primary-500/30 transition-all"
                        >
                            <p className="text-dark-200 font-medium mb-2">{activity.subtitle}</p>
                            {activity.budget && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
                                    <HiSparkles /> ₹{activity.budget.toLocaleString()}
                                </span>
                            )}
                            {activity.followerCount && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-sm font-medium ml-2">
                                    {activity.followerCount.toLocaleString()} followers
                                </span>
                            )}
                        </div>

                        {/* Action Bar - Instagram Style */}
                        <div className="flex items-center gap-6 mt-3 pl-1">
                            <button className="flex items-center gap-2 text-dark-400 hover:text-red-400 transition-colors group">
                                <FaHeart className="text-lg group-hover:scale-110 transition-transform" />
                                <span className="text-sm">{activity.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-dark-400 hover:text-blue-400 transition-colors group">
                                <FaComment className="text-lg group-hover:scale-110 transition-transform" />
                            </button>
                            <button className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors group">
                                <FaShare className="text-lg group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default SocialActivityFeed;
