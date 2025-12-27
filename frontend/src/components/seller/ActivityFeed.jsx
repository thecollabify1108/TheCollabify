import { motion } from 'framer-motion';
import { FaUser, FaCheck, FaBell, FaComments, FaRocket, FaClock } from 'react-icons/fa';
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
                title: `Campaign "${request.title}" created`,
                time: new Date(request.createdAt),
                icon: <FaRocket />,
                color: 'text-primary-400',
                bgColor: 'bg-primary-500/10'
            });

            // Add matched creator activities
            request.matchedCreators?.forEach(creator => {
                if (creator.status === 'Applied') {
                    activities.push({
                        id: `${request._id}-${creator.creatorId}-applied`,
                        type: 'applied',
                        title: `Creator applied to "${request.title}"`,
                        time: new Date(creator.appliedAt || request.createdAt),
                        icon: <FaUser />,
                        color: 'text-amber-400',
                        bgColor: 'bg-amber-500/10'
                    });
                }
                if (creator.status === 'Accepted') {
                    activities.push({
                        id: `${request._id}-${creator.creatorId}-accepted`,
                        type: 'accepted',
                        title: `Creator accepted for "${request.title}"`,
                        time: new Date(creator.acceptedAt || request.createdAt),
                        icon: <FaCheck />,
                        color: 'text-emerald-400',
                        bgColor: 'bg-emerald-500/10'
                    });
                }
            });

            // Add completion activity
            if (request.status === 'Completed') {
                activities.push({
                    id: `${request._id}-completed`,
                    type: 'completed',
                    title: `Campaign "${request.title}" completed`,
                    time: new Date(request.updatedAt),
                    icon: <FaCheck />,
                    color: 'text-emerald-400',
                    bgColor: 'bg-emerald-500/10'
                });
            }
        });

        // Sort by time, most recent first
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
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-100">Recent Activity</h3>
                <FaBell className="text-dark-400" />
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <FaClock className="text-4xl text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-400">No recent activity</p>
                    <p className="text-sm text-dark-500">Create your first campaign to get started</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin pr-2">
                    {activities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-3"
                        >
                            <div className={`p-2 rounded-lg ${activity.bgColor} ${activity.color}`}>
                                {activity.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-dark-200 truncate">{activity.title}</p>
                                <p className="text-xs text-dark-500">{formatTime(activity.time)}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
