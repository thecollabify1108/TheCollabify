import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaUsers, FaHandshake, FaCheckCircle, FaTimesCircle,
    FaClock, FaChartLine, FaBriefcase, FaRocket,
    FaUserCheck, FaPercentage, FaStar, FaShieldAlt
} from 'react-icons/fa';
import { adminAPI, analyticsAPI } from '../../services/api';

// ─── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, suffix = '', color = 'primary', delay = 0 }) => {
    const colors = {
        primary: 'from-primary-500/10 to-primary-500/5 border-primary-500/20 text-primary-400',
        emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
        amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
        rose: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-400',
        purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
        blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
        cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
        indigo: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.08, duration: 0.3 }}
            className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4 sm:p-5`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
                    <Icon size={16} />
                </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
                {value !== null && value !== undefined ? `${value}${suffix}` : '—'}
            </div>
            <div className="text-xs text-dark-400 font-medium">{label}</div>
        </motion.div>
    );
};

// ─── Loading Skeleton ───────────────────────────────────────────
const SkeletonGrid = ({ count = 5 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 sm:p-5 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-dark-700 mb-3" />
                <div className="h-7 w-16 bg-dark-700 rounded mb-2" />
                <div className="h-3 w-24 bg-dark-700 rounded" />
            </div>
        ))}
    </div>
);

// ─── Admin Insight Cards ────────────────────────────────────────
export const AdminInsightCards = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await adminAPI.getInsights();
                setData(res.data.data.insights);
            } catch (err) {
                console.error('Failed to load admin insights:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <SkeletonGrid count={8} />;
    if (!data) return null;

    const cards = [
        { icon: FaUsers, label: 'Total Brands', value: data.totalBrands, color: 'primary' },
        { icon: FaStar, label: 'Total Creators', value: data.totalCreators, color: 'purple' },
        { icon: FaHandshake, label: 'Active Collaborations', value: data.activeCollaborations, color: 'emerald' },
        { icon: FaCheckCircle, label: 'Completed', value: data.completedCollaborations, color: 'blue' },
        { icon: FaTimesCircle, label: 'Cancelled', value: data.cancelledCollaborations, color: 'rose' },
        { icon: FaPercentage, label: 'Acceptance Rate', value: data.acceptanceRate, suffix: '%', color: 'cyan' },
        { icon: FaClock, label: 'Avg Days to Accept', value: data.avgDaysToAccept, suffix: 'd', color: 'amber' },
        { icon: FaRocket, label: 'Avg Days to Complete', value: data.avgDaysToComplete, suffix: 'd', color: 'indigo' }
    ];

    return (
        <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-primary-400" /> Platform Insights
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {cards.map((card, i) => <StatCard key={i} {...card} delay={i} />)}
            </div>
        </div>
    );
};

// ─── Brand Insight Cards ────────────────────────────────────────
export const BrandInsightCards = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await analyticsAPI.getInsights();
                setData(res.data.data.insights);
            } catch (err) {
                console.error('Failed to load brand insights:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <SkeletonGrid count={5} />;
    if (!data) return null;

    const cards = [
        { icon: FaBriefcase, label: 'Campaigns Launched', value: data.campaignsLaunched, color: 'primary' },
        { icon: FaUsers, label: 'Creators Shortlisted', value: data.creatorsShortlisted, color: 'purple' },
        { icon: FaUserCheck, label: 'Acceptance Rate', value: data.acceptanceRate, suffix: '%', color: 'emerald' },
        { icon: FaCheckCircle, label: 'Completion Rate', value: data.completionRate, suffix: '%', color: 'blue' },
        { icon: FaClock, label: 'Avg Collab Duration', value: data.avgCollaborationDays, suffix: 'd', color: 'amber' }
    ];

    return (
        <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaChartLine className="text-primary-400" /> Your Brand Insights
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {cards.map((card, i) => <StatCard key={i} {...card} delay={i} />)}
            </div>
        </div>
    );
};

// ─── Creator Insight Cards ──────────────────────────────────────
export const CreatorInsightCards = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await analyticsAPI.getInsights();
                setData(res.data.data.insights);
            } catch (err) {
                console.error('Failed to load creator insights:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <SkeletonGrid count={5} />;
    if (!data) return null;

    const likelihoodColor = {
        High: 'emerald', Medium: 'amber', Low: 'rose', New: 'blue'
    };

    const cards = [
        { icon: FaHandshake, label: 'Requests Received', value: data.requestsReceived, color: 'primary' },
        { icon: FaPercentage, label: 'Acceptance Rate', value: data.acceptanceRate, suffix: '%', color: 'emerald' },
        { icon: FaCheckCircle, label: 'Completed Collabs', value: data.completedCollaborations, color: 'blue' },
        { icon: FaStar, label: 'Response Likelihood', value: data.responseLikelihood, color: likelihoodColor[data.responseLikelihood] || 'blue' },
        { icon: FaChartLine, label: 'Profile Completion', value: data.profileCompletion, suffix: '%', color: 'purple' }
    ];

    return (
        <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaChartLine className="text-primary-400" /> Your Insights
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {cards.map((card, i) => <StatCard key={i} {...card} delay={i} />)}
            </div>
        </div>
    );
};
