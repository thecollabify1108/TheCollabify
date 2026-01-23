import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaDollarSign,
    FaTrendingUp,
    FaTrendingDown,
    FaBriefcase,
    FaStar,
    FaEye,
    FaUsers,
    FaChartLine,
    FaCalendar
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import axios from 'axios';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * Analytics Dashboard Component
 * Displays comprehensive analytics for creators and sellers
 */
const AnalyticsDashboard = ({ userType = 'creator' }) => {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('monthly');
    const [summary, setSummary] = useState(null);
    const [analytics, setAnalytics] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch summary and historical data
            const [summaryRes, analyticsRes] = await Promise.all([
                axios.get('/api/analytics/summary'),
                axios.get(`/api/analytics/dashboard?period=${period}&limit=12`)
            ]);

            setSummary(summaryRes.data.data);
            setAnalytics(analyticsRes.data.data.analytics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-dark-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-100 flex items-center gap-3">
                        <HiSparkles className="text-purple-500" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Track your performance and growth
                    </p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2">
                    {['daily', 'weekly', 'monthly'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === p
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            {userType === 'creator' ? (
                <CreatorSummaryCards summary={summary} />
            ) : (
                <SellerSummaryCards summary={summary} />
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userType === 'creator' ? (
                    <>
                        <EarningsChart analytics={analytics} />
                        <CampaignsChart analytics={analytics} />
                        <EngagementChart analytics={analytics} />
                        <FollowerGrowthChart analytics={analytics} />
                    </>
                ) : (
                    <>
                        <SpendingChart analytics={analytics} />
                        <CampaignsChart analytics={analytics} isSeller />
                        <ROIChart analytics={analytics} />
                        <ReachChart analytics={analytics} />
                    </>
                )}
            </div>
        </div>
    );
};

/**
 * Creator Summary Cards
 */
const CreatorSummaryCards = ({ summary }) => {
    const current = summary?.current || {};
    const growth = summary?.growth || {};

    const cards = [
        {
            title: 'Total Earnings',
            value: `₹${(current.totalEarnings || 0).toLocaleString()}`,
            growth: growth.earningsGrowth || 0,
            icon: FaDollarSign,
            color: 'emerald'
        },
        {
            title: 'Campaigns Completed',
            value: current.campaignsCompleted || 0,
            growth: growth.campaignsGrowth || 0,
            icon: FaBriefcase,
            color: 'blue'
        },
        {
            title: 'Average Rating',
            value: (current.averageRating || 0).toFixed(1),
            icon: FaStar,
            color: 'yellow',
            showGrowth: false
        },
        {
            title: 'Profile Views',
            value: (current.profileViews || 0).toLocaleString(),
            icon: FaEye,
            color: 'purple'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <SummaryCard key={index} {...card} />
            ))}
        </div>
    );
};

/**
 * Seller Summary Cards
 */
const SellerSummaryCards = ({ summary }) => {
    const current = summary?.current || {};
    const growth = summary?.growth || {};

    const cards = [
        {
            title: 'Total Spent',
            value: `₹${(current.totalSpent || 0).toLocaleString()}`,
            growth: growth.spentGrowth || 0,
            icon: FaDollarSign,
            color: 'red'
        },
        {
            title: 'Campaigns Created',
            value: current.campaignsCreated || 0,
            growth: growth.campaignsGrowth || 0,
            icon: FaBriefcase,
            color: 'blue'
        },
        {
            title: 'Creators Hired',
            value: current.creatorsHired || 0,
            icon: FaUsers,
            color: 'purple'
        },
        {
            title: 'Average ROI',
            value: `${(current.averageROI || 0).toFixed(1)}%`,
            icon: FaChartLine,
            color: 'emerald'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <SummaryCard key={index} {...card} />
            ))}
        </div>
    );
};

/**
 * Summary Card Component
 */
const SummaryCard = ({ title, value, growth, icon: Icon, color, showGrowth = true }) => {
    const colorClasses = {
        emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
        blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
        yellow: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20',
        purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
        red: 'from-red-500/10 to-pink-500/10 border-red-500/20'
    };

    const iconColorClasses = {
        emerald: 'bg-emerald-500/20 text-emerald-400',
        blue: 'bg-blue-500/20 text-blue-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        purple: 'bg-purple-500/20 text-purple-400',
        red: 'bg-red-500/20 text-red-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${iconColorClasses[color]} rounded-xl flex items-center justify-center`}>
                    <Icon className="text-2xl" />
                </div>
                {showGrowth && growth !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {growth >= 0 ? <FaTrendingUp /> : <FaTrendingDown />}
                        {Math.abs(growth).toFixed(1)}%
                    </div>
                )}
            </div>

            <div>
                <p className="text-dark-400 text-sm mb-1">{title}</p>
                <p className="text-3xl font-bold text-dark-100">{value}</p>
            </div>
        </motion.div>
    );
};

/**
 * Earnings Chart
 */
const EarningsChart = ({ analytics }) => {
    const data = {
        labels: analytics.map(a => new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Earnings',
            data: analytics.map(a => a.creatorMetrics?.totalEarnings || 0),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Earnings Over Time', color: '#fff' }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9CA3AF' }
            },
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9CA3AF' }
            }
        }
    };

    return (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <div className="h-64">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

/**
 * Campaigns Chart
 */
const CampaignsChart = ({ analytics, isSeller = false }) => {
    const data = {
        labels: analytics.map(a => new Date(a.date).toLocaleDateString('en-US', { month: 'short' })),
        datasets: [{
            label: isSeller ? 'Campaigns Created' : 'Campaigns Completed',
            data: analytics.map(a =>
                isSeller
                    ? a.sellerMetrics?.campaignsCreated || 0
                    : a.creatorMetrics?.campaignsCompleted || 0
            ),
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderRadius: 8
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Campaign Activity', color: '#fff' }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9CA3AF', stepSize: 1 }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9CA3AF' }
            }
        }
    };

    return (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <div className="h-64">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

/**
 * Additional chart components would go here
 * (EngagementChart, FollowerGrowthChart, SpendingChart, ROIChart, ReachChart)
 */
const EngagementChart = () => <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 h-64 flex items-center justify-center text-dark-500">Engagement Chart</div>;
const FollowerGrowthChart = () => <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 h-64 flex items-center justify-center text-dark-500">Follower Growth Chart</div>;
const SpendingChart = () => <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 h-64 flex items-center justify-center text-dark-500">Spending Chart</div>;
const ROIChart = () => <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 h-64 flex items-center justify-center text-dark-500">ROI Chart</div>;
const ReachChart = () => <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 h-64 flex items-center justify-center text-dark-500">Reach Chart</div>;

export default AnalyticsDashboard;
