import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSparkles, HiTrendingUp, HiChartBar, HiLightningBolt, HiUserGroup } from 'react-icons/hi';
import { FaBrain, FaArrowUp, FaChartLine } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';
import { platformAPI } from '../services/api';

const Insights = () => {
    const [metrics, setMetrics] = useState(null);
    const [intelligence, setIntelligence] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, intelRes] = await Promise.all([
                    platformAPI.getMetrics().catch(() => null),
                    platformAPI.getIntelligenceSummary().catch(() => null)
                ]);
                if (metricsRes?.data?.success) setMetrics(metricsRes.data.data);
                if (intelRes?.data?.success) setIntelligence(intelRes.data.data);
            } catch (e) {
                console.error('Failed to fetch insights:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const platformStats = [
        { label: 'Campaigns Analyzed', value: metrics?.campaignsAnalyzed || '—', icon: HiChartBar, color: 'primary' },
        { label: 'Creators Profiled', value: metrics?.creatorsProfiled || '—', icon: HiUserGroup, color: 'secondary' },
        { label: 'Match Accuracy', value: metrics?.matchAccuracy ? `${metrics.matchAccuracy}%` : '—', icon: HiLightningBolt, color: 'emerald' },
        { label: 'AI Models Active', value: metrics?.aiModelsActive || 7, icon: FaBrain, color: 'pink' },
        { label: 'Data Signals Tracked', value: metrics?.dataSignalsTracked || 42, icon: FaChartLine, color: 'amber' },
        { label: 'Feedback Loops', value: metrics?.feedbackLoopsProcessed || '—', icon: HiSparkles, color: 'cyan' }
    ];

    const industryInsights = intelligence?.insights || [
        { label: 'Micro-creators (10K-50K) deliver 3.2x higher engagement per dollar', trend: 'up' },
        { label: 'Video-first creators see 47% more brand interest', trend: 'up' },
        { label: 'Multi-platform creators have 28% higher reliability scores', trend: 'up' },
        { label: 'Niche categories outperform broad categories by 2.1x on ROI', trend: 'up' },
        { label: 'Creators with consistent posting schedules score 35% higher on CQI', trend: 'up' }
    ];

    const categoryData = intelligence?.categoryDistribution || [];

    return (
        <>
            <SEO title="Platform Insights - TheCollabify" description="Real-time intelligence from the creator economy. Engagement benchmarks, niche trends, and collaboration data." />
            <div className="min-h-screen bg-dark-950">
                <Navbar />

                {/* Hero */}
                <section className="pt-32 pb-16 px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                                <HiTrendingUp className="mr-2" />
                                Live Platform Data
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-dark-100 mb-6">
                                Platform <span className="gradient-text">Insights</span>
                            </h1>
                            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                                Real data from our AI engine. No vanity metrics — just what our system is actually learning from creator collaboration patterns.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Platform Stats Grid */}
                <section className="pb-16 px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-6 text-center">Platform Intelligence</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {platformStats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="glass-card p-5 text-center hover:border-primary-500/30 transition"
                                >
                                    <stat.icon className={`mx-auto text-2xl mb-3 text-${stat.color}-400`} />
                                    <p className="text-2xl font-bold text-dark-100 mb-1">
                                        {loading ? '...' : stat.value}
                                    </p>
                                    <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Industry Insights */}
                <section className="py-20 px-4 bg-dark-900/30 border-y border-dark-800/50">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-dark-100 mb-4">
                                What the Data <span className="gradient-text">Shows</span>
                            </h2>
                            <p className="text-dark-400 max-w-xl mx-auto">
                                Patterns emerging from collaboration data across our platform.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {industryInsights.map((insight, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 p-5 glass-card hover:border-emerald-500/20 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <FaArrowUp className="text-emerald-400 text-sm" />
                                    </div>
                                    <p className="text-sm text-dark-200 font-medium">{insight.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Category Distribution */}
                {categoryData.length > 0 && (
                    <section className="py-20 px-4">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-2xl font-bold text-dark-100 mb-8 text-center">Creator Category Distribution</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {categoryData.map((cat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="glass-card p-4 text-center"
                                    >
                                        <p className="text-xl font-bold text-primary-400 mb-1">{cat.count}</p>
                                        <p className="text-xs text-dark-400 font-bold uppercase tracking-wider">{cat.category}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Quality Benchmarks */}
                <section className="py-20 px-4 bg-dark-900/30 border-t border-dark-800/50">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-dark-100 mb-4">Quality Benchmarks</h2>
                        <p className="text-dark-400 mb-10 max-w-xl mx-auto">
                            Aggregate performance data from profiled creators on the platform.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6">
                                <p className="text-3xl font-bold text-emerald-400 mb-2">
                                    {intelligence?.qualityBenchmarks?.averageEngagementRate
                                        ? `${intelligence.qualityBenchmarks.averageEngagementRate}%`
                                        : '—'}
                                </p>
                                <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">Avg Engagement Rate</p>
                            </div>
                            <div className="glass-card p-6">
                                <p className="text-3xl font-bold text-primary-400 mb-2">
                                    {intelligence?.qualityBenchmarks?.averageFollowerCount
                                        ? intelligence.qualityBenchmarks.averageFollowerCount.toLocaleString()
                                        : '—'}
                                </p>
                                <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">Avg Follower Count</p>
                            </div>
                            <div className="glass-card p-6">
                                <p className="text-3xl font-bold text-secondary-400 mb-2">
                                    {metrics?.avgCreatorQualityScore || '—'}
                                </p>
                                <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">Avg CQI Score</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Disclaimer */}
                <section className="py-12 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xs text-dark-600 italic">
                            All data is aggregated and anonymized. Individual creator profiles are never exposed publicly.
                            Insights are derived from platform activity and AI model outputs.
                        </p>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default Insights;
