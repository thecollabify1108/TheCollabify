import { motion } from 'framer-motion';
import { HiSparkles, HiLightningBolt, HiChartBar, HiShieldCheck, HiUserGroup, HiGlobe } from 'react-icons/hi';
import { FaBrain, FaRocket, FaDatabase, FaLock } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const Roadmap = () => {
    const phases = [
        {
            phase: 'Phase 1',
            status: 'live',
            title: 'Intelligence Foundation',
            subtitle: 'Shipped',
            color: 'emerald',
            items: [
                { label: 'Creator Quality Index (CQI) scoring', done: true },
                { label: 'Multi-signal fraud detection', done: true },
                { label: 'Semantic embedding-based matching', done: true },
                { label: 'Campaign performance prediction', done: true },
                { label: 'Adaptive weight optimization', done: true },
                { label: 'Feedback learning loop', done: true },
                { label: 'Model version tracking', done: true }
            ]
        },
        {
            phase: 'Phase 2',
            status: 'building',
            title: 'Audience Intelligence',
            subtitle: 'In Progress',
            color: 'primary',
            items: [
                { label: 'Audience demographic profiling', done: true },
                { label: 'Cross-platform audience overlap analysis', done: false },
                { label: 'Audience authenticity deep scan', done: false },
                { label: 'Lookalike audience discovery', done: false },
                { label: 'Sentiment analysis on creator content', done: false }
            ]
        },
        {
            phase: 'Phase 3',
            status: 'planned',
            title: 'Predictive Commerce',
            subtitle: 'Q3 2025',
            color: 'secondary',
            items: [
                { label: 'Revenue attribution modeling', done: false },
                { label: 'Multi-touch campaign sequencing', done: false },
                { label: 'Dynamic pricing intelligence', done: false },
                { label: 'Creator portfolio benchmarking', done: false },
                { label: 'Automated A/B match testing', done: false }
            ]
        },
        {
            phase: 'Phase 4',
            status: 'planned',
            title: 'Enterprise Infrastructure',
            subtitle: 'Q4 2025',
            color: 'amber',
            items: [
                { label: 'Multi-user brand accounts', done: false },
                { label: 'API access for enterprise integration', done: false },
                { label: 'Custom scoring model training', done: false },
                { label: 'White-label intelligence reports', done: false },
                { label: 'SOC 2 compliance certification', done: false }
            ]
        }
    ];

    const techStack = [
        { icon: FaBrain, label: '7 AI Models', desc: 'CQI, fraud, prediction, embeddings, audience, weights, retraining' },
        { icon: FaDatabase, label: '42 Data Signals', desc: 'Per-match scoring across engagement, content, reliability, audience' },
        { icon: HiShieldCheck, label: 'Multi-Signal Fraud', desc: 'Follower velocity, engagement ratio, growth pattern anomaly detection' },
        { icon: HiLightningBolt, label: 'Self-Improving', desc: 'Every collaboration outcome feeds back into model refinement' }
    ];

    const getStatusBadge = (status) => {
        if (status === 'live') return { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', text: 'LIVE' };
        if (status === 'building') return { bg: 'bg-primary-500/10 border-primary-500/20 text-primary-400', text: 'BUILDING' };
        return { bg: 'bg-dark-700/50 border-dark-600 text-dark-400', text: 'PLANNED' };
    };

    return (
        <>
            <SEO title="AI Roadmap - TheCollabify" description="Our AI intelligence roadmap: what's live, what's building, and what's next." />
            <div className="min-h-screen bg-dark-950">
                <Navbar />

                {/* Hero */}
                <section className="pt-32 pb-16 px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-6">
                                <HiSparkles className="mr-2" />
                                Intelligence Roadmap
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-dark-100 mb-6">
                                What We're <span className="gradient-text">Building</span>
                            </h1>
                            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                                Our AI engine is live and learning. Here's what's shipped, what's in progress, and where we're headed.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Tech Stack Summary */}
                <section className="pb-16 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {techStack.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card p-5 text-center hover:border-primary-500/30 transition"
                                >
                                    <item.icon className="mx-auto text-primary-400 text-2xl mb-3" />
                                    <p className="text-sm font-bold text-dark-100 mb-1">{item.label}</p>
                                    <p className="text-xs text-dark-500">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Phases */}
                <section className="pb-24 px-4">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {phases.map((phase, idx) => {
                            const badge = getStatusBadge(phase.status);
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-8 hover:border-primary-500/20 transition"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <span className="text-xs font-bold text-dark-500 uppercase tracking-widest">{phase.phase}</span>
                                            <h3 className="text-xl font-bold text-dark-100">{phase.title}</h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badge.bg}`}>
                                            {badge.text}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {phase.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-700/50 text-dark-600'}`}>
                                                    {item.done ? '✓' : '○'}
                                                </div>
                                                <span className={`text-sm ${item.done ? 'text-dark-200' : 'text-dark-500'}`}>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default Roadmap;
