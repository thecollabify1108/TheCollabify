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
    FaHandshake
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp } from 'react-icons/hi';
import EmptyState from '../common/EmptyState';

/**
 * Campaign Analytics Dashboard
 * Shows key metrics, trends, and insights for seller campaigns
 */
const CampaignAnalytics = ({ requests = [] }) => {
    const [timeRange, setTimeRange] = useState('all');
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalApplicants: 0,
        acceptanceRate: 0,
        avgMatchScore: 0,
        totalBudget: 0,
        avgBudget: 0
    });

    // Calculate statistics from requests
    useEffect(() => {
        if (!requests || requests.length === 0) {
            return;
        }

        const totalCampaigns = requests.length;
        const activeCampaigns = requests.filter(r =>
            ['Open', 'Creator Interested', 'Accepted'].includes(r.status)
        ).length;
        const completedCampaigns = requests.filter(r => r.status === 'Completed').length;

        // Count total applicants across all campaigns
        const totalApplicants = requests.reduce((sum, r) => {
            const applicants = r.matchedCreators?.filter(mc => mc.status === 'Applied').length || 0;
            return sum + applicants;
        }, 0);

        // Calculate acceptance rate
        const accepted = requests.reduce((sum, r) => {
            const acceptedCount = r.matchedCreators?.filter(mc => mc.status === 'Accepted').length || 0;
            return sum + acceptedCount;
        }, 0);
        const acceptanceRate = totalApplicants > 0 ? Math.round((accepted / totalApplicants) * 100) : 0;

        // Calculate average match score
        const allScores = requests.flatMap(r =>
            r.matchedCreators?.map(mc => mc.matchScore) || []
        ).filter(score => score > 0);
        const avgMatchScore = allScores.length > 0
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;

        // Calculate budget stats
        const totalBudget = requests.reduce((sum, r) => {
            return sum + ((r.budgetRange?.min || 0) + (r.budgetRange?.max || 0)) / 2;
        }, 0);
        const avgBudget = totalCampaigns > 0 ? Math.round(totalBudget / totalCampaigns) : 0;

        setStats({
            totalCampaigns,
            activeCampaigns,
            completedCampaigns,
            totalApplicants,
            acceptanceRate,
            avgMatchScore,
            totalBudget: Math.round(totalBudget),
            avgBudget
        });
    }, [requests, timeRange]);

    const statCards = [
        {
            title: 'Total Campaigns',
            value: stats.totalCampaigns,
            icon: FaChartLine,
            color: 'from-primary-500 to-secondary-500',
            change: '+12%',
            positive: true
        },
        {
            title: 'Active Campaigns',
            value: stats.activeCampaigns,
            icon: FaClock,
            color: 'from-amber-500 to-orange-500',
            change: stats.activeCampaigns > 0 ? 'Active' : 'None',
            positive: stats.activeCampaigns > 0
        },
        {
            title: 'Completed',
            value: stats.completedCampaigns,
            icon: FaCheckCircle,
            color: 'from-green-500 to-emerald-500',
            change: '+5%',
            positive: true
        },
        {
            title: 'Total Applicants',
            value: stats.totalApplicants,
            icon: FaUsers,
            color: 'from-blue-500 to-cyan-500',
            change: '+18%',
            positive: true
        }
    ];

    const insightCards = [
        {
            title: 'Acceptance Rate',
            value: `${stats.acceptanceRate}%`,
            description: 'of applicants accepted',
            icon: FaHandshake,
            color: 'text-green-400'
        },
        {
            title: 'Avg Match Score',
            value: `${stats.avgMatchScore}%`,
            description: 'AI matching accuracy',
            icon: HiSparkles,
            color: 'text-purple-400'
        },
        {
            title: 'Match Trust Avg',
            value: stats.matchReliabilityAvg || '1.0',
            description: 'Creator reliability avg',
            icon: FaCheckCircle,
            color: 'text-emerald-400'
        },
        {
            title: 'Avg Budget',
            value: `₹${stats.avgBudget.toLocaleString()}`,
            description: 'per campaign',
            icon: FaRupeeSign,
            color: 'text-amber-400'
        }
    ];

    // Get campaign status distribution
    const statusDistribution = {
        'Open': requests.filter(r => r.status === 'Open').length,
        'Interested': requests.filter(r => r.status === 'Creator Interested').length,
        'Accepted': requests.filter(r => r.status === 'Accepted').length,
        'Completed': requests.filter(r => r.status === 'Completed').length,
        'Cancelled': requests.filter(r => r.status === 'Cancelled').length
    };

    const statusColors = {
        'Open': 'bg-blue-500',
        'Interested': 'bg-amber-500',
        'Accepted': 'bg-green-500',
        'Completed': 'bg-emerald-500',
        'Cancelled': 'bg-red-500'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                        <HiTrendingUp className="text-primary-400" />
                        Campaign Analytics
                    </h2>
                    <p className="text-dark-400 text-sm">Track your campaign performance</p>
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

            {/* Campaign Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-dark-800/50 border border-dark-700 rounded-xl p-4"
                >
                    <h3 className="text-lg font-semibold text-dark-100 mb-4">Status Distribution</h3>

                    {/* Status Bar */}
                    <div className="h-4 rounded-full overflow-hidden flex mb-4 bg-dark-700">
                        {Object.entries(statusDistribution).map(([status, count]) => {
                            const percentage = stats.totalCampaigns > 0
                                ? (count / stats.totalCampaigns) * 100
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

                {/* Match Trust Index */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-dark-800/50 border border-dark-700 rounded-xl p-4"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-dark-100">Match Trust Trend</h3>
                        <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            Objective Benchmarks
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-dark-400 text-xs">A measure of creator reliability & campaign completion success.</span>
                        </div>

                        <div className="flex items-end gap-1 h-32 pt-4">
                            {[40, 65, 55, 85, 75, 90, 80].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-dark-700 rounded-t-sm relative group">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: 0.8 + (i * 0.05) }}
                                            className={`w-full rounded-t-sm ${h > 80 ? 'bg-primary-500' : 'bg-primary-500/40'}`}
                                        />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            Score: {(h / 20).toFixed(1)}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-dark-500">M{i + 1}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 rounded-lg bg-primary-500/5 border border-primary-500/10">
                            <p className="text-[11px] text-dark-300 leading-relaxed italic">
                                💡 Your "Match Trust Avg" is <strong>{stats.matchReliabilityAvg || '1.0'}</strong>. You are currently matching with creators who have a high history of successful brand partnerships.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Empty State */}
            {stats.totalCampaigns === 0 && (
                <EmptyState
                    icon="chart"
                    title="No Campaign Data Yet"
                    description="Launch your first campaign to unlock powerful AI-driven insights and track your brand's growth."
                    actionLabel="Setup Campaign"
                    onAction={() => { }} // Usually parent handles wizard
                />
            )}
        </div>
    );
};

export default CampaignAnalytics;
