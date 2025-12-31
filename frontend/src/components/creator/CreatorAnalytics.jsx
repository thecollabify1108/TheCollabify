import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaChartLine,
    FaUsers,
    FaCheckCircle,
    FaClock,
    FaRupeeSign,
    FaArrowUp,
    FaArrowDown,
    FaEye,
    FaHeart,
    FaStar,
    FaBriefcase
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp, HiLightningBolt } from 'react-icons/hi';

/**
 * Creator Analytics Dashboard
 * Shows key metrics, trends, and insights for creator performance
 */
const CreatorAnalytics = ({ profile, applications = [] }) => {
    const [timeRange, setTimeRange] = useState('all');
    const [stats, setStats] = useState({
        totalApplications: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
        acceptanceRate: 0,
        avgMatchScore: 0,
        potentialEarnings: 0
    });

    // Calculate statistics from applications
    useEffect(() => {
        if (!applications || applications.length === 0) {
            return;
        }

        const totalApplications = applications.length;
        const acceptedApplications = applications.filter(a => a.applicationStatus === 'Accepted').length;
        const pendingApplications = applications.filter(a => a.applicationStatus === 'Applied').length;
        const rejectedApplications = applications.filter(a => a.applicationStatus === 'Rejected').length;

        const acceptanceRate = totalApplications > 0
            ? Math.round((acceptedApplications / totalApplications) * 100)
            : 0;

        // Calculate potential earnings from accepted applications
        const potentialEarnings = applications
            .filter(a => a.applicationStatus === 'Accepted')
            .reduce((sum, a) => {
                const avg = ((a.promotion?.budgetRange?.min || 0) + (a.promotion?.budgetRange?.max || 0)) / 2;
                return sum + avg;
            }, 0);

        setStats({
            totalApplications,
            acceptedApplications,
            pendingApplications,
            rejectedApplications,
            acceptanceRate,
            avgMatchScore: profile?.insights?.score || 0,
            potentialEarnings: Math.round(potentialEarnings)
        });
    }, [applications, profile, timeRange]);

    const statCards = [
        {
            title: 'Applications Sent',
            value: stats.totalApplications,
            icon: FaBriefcase,
            color: 'from-primary-500 to-secondary-500',
            change: '+8%',
            positive: true
        },
        {
            title: 'Accepted',
            value: stats.acceptedApplications,
            icon: FaCheckCircle,
            color: 'from-green-500 to-emerald-500',
            change: stats.acceptedApplications > 0 ? 'Active' : 'None',
            positive: stats.acceptedApplications > 0
        },
        {
            title: 'Pending',
            value: stats.pendingApplications,
            icon: FaClock,
            color: 'from-amber-500 to-orange-500',
            change: 'Awaiting',
            positive: true
        },
        {
            title: 'Profile Score',
            value: `${stats.avgMatchScore}%`,
            icon: HiSparkles,
            color: 'from-purple-500 to-pink-500',
            change: '+12%',
            positive: true
        }
    ];

    const insightCards = [
        {
            title: 'Acceptance Rate',
            value: `${stats.acceptanceRate}%`,
            description: 'of your applications',
            icon: FaHeart,
            color: 'text-green-400'
        },
        {
            title: 'Potential Earnings',
            value: `₹${stats.potentialEarnings.toLocaleString()}`,
            description: 'from accepted gigs',
            icon: FaRupeeSign,
            color: 'text-amber-400'
        },
        {
            title: 'Creator Tier',
            value: profile?.followerCount >= 100000 ? 'Macro' : profile?.followerCount >= 10000 ? 'Mid-Tier' : 'Micro',
            description: profile?.followerCount >= 10000 ? 'influencer' : 'higher engagement',
            icon: FaStar,
            color: 'text-purple-400'
        }
    ];

    // Application status distribution
    const statusDistribution = {
        'Applied': stats.pendingApplications,
        'Accepted': stats.acceptedApplications,
        'Rejected': stats.rejectedApplications
    };

    const statusColors = {
        'Applied': 'bg-amber-500',
        'Accepted': 'bg-green-500',
        'Rejected': 'bg-red-500'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                        <HiTrendingUp className="text-primary-400" />
                        Your Performance
                    </h2>
                    <p className="text-dark-400 text-sm">Track your creator journey</p>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-2">
                    {['week', 'month', 'all'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }`}
                        >
                            {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-dark-800/50 border border-dark-700 rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="text-white text-lg" />
                            </div>
                            <span className={`text-xs font-medium flex items-center gap-1 ${stat.positive ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {stat.positive ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-dark-100">{stat.value}</h3>
                        <p className="text-dark-400 text-sm">{stat.title}</p>
                    </motion.div>
                ))}
            </div>

            {/* Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insightCards.map((insight, index) => (
                    <motion.div
                        key={insight.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="bg-dark-800/30 border border-dark-700 rounded-xl p-4 flex items-center gap-4"
                    >
                        <insight.icon className={`text-3xl ${insight.color}`} />
                        <div>
                            <h4 className="text-lg font-bold text-dark-100">{insight.value}</h4>
                            <p className="text-dark-400 text-sm">{insight.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Application Status Distribution */}
            {stats.totalApplications > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-dark-800/50 border border-dark-700 rounded-xl p-4"
                >
                    <h3 className="text-lg font-semibold text-dark-100 mb-4">Application Status</h3>

                    {/* Status Bar */}
                    <div className="h-4 rounded-full overflow-hidden flex mb-4 bg-dark-700">
                        {Object.entries(statusDistribution).map(([status, count]) => {
                            const percentage = stats.totalApplications > 0
                                ? (count / stats.totalApplications) * 100
                                : 0;
                            if (percentage === 0) return null;
                            return (
                                <div
                                    key={status}
                                    className={`${statusColors[status]} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                    title={`${status}: ${count}`}
                                />
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4">
                        {Object.entries(statusDistribution).map(([status, count]) => (
                            <div key={status} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                                <span className="text-dark-300 text-sm">
                                    {status}: <span className="font-semibold text-dark-100">{count}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {stats.totalApplications === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 bg-dark-800/30 rounded-xl border border-dark-700"
                >
                    <FaChartLine className="text-4xl text-dark-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-dark-300 mb-2">No Application Data Yet</h3>
                    <p className="text-dark-400">Apply to promotions to see your analytics!</p>
                </motion.div>
            )}
        </div>
    );
};

export default CreatorAnalytics;
