import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiChevronDown } from 'react-icons/hi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const Roadmap = () => {
    const phases = [
        {
            phase: 'Phase 1',
            status: 'live',
            title: 'Intelligence Foundation',
            subtitle: 'Complete & Refined',
            color: 'emerald',
            items: [
                { label: 'Creator Quality Index (CQI) scoring', done: true },
                { label: 'Multi-signal fraud detection (V2)', done: true },
                { label: 'Semantic embedding-based matching', done: true },
                { label: 'Campaign performance prediction', done: true },
                { label: 'Adaptive weight optimization', done: true },
                { label: 'Feedback learning loop (Active)', done: true },
                { label: 'Real-time WebSocket infrastructure', done: true }
            ]
        },
        {
            phase: 'Phase 2',
            status: 'building',
            title: 'Advanced Analytics',
            subtitle: 'Active Deployment',
            color: 'primary',
            items: [
                { label: 'Audience demographic deep-profiling', done: true },
                { label: 'Cross-platform overlap analysis', done: false },
                { label: 'Sentiment analysis on creator content', done: true },
                { label: 'Lookalike audience discovery V1', done: true },
                { label: 'Campaign ROI forecasting tool', done: false }
            ]
        },
        {
            phase: 'Phase 3',
            status: 'planned',
            title: 'Predictive Commerce',
            subtitle: 'Q3 2026',
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
            title: 'Global Scale',
            subtitle: 'Q4 2026',
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

    const [openPhase, setOpenPhase] = useState(null);

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

                {/* Phases */}
                <section className="pb-24 px-4">
                    <div className="max-w-2xl mx-auto space-y-3">
                        {phases.map((phase, idx) => {
                            const badge = getStatusBadge(phase.status);
                            const isOpen = openPhase === idx;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="glass-card overflow-hidden"
                                >
                                    <button
                                        className="w-full flex items-center justify-between p-4 text-left"
                                        onClick={() => setOpenPhase(isOpen ? null : idx)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badge.bg}`}>
                                                {badge.text}
                                            </span>
                                            <div>
                                                <span className="text-xs text-dark-500 uppercase tracking-widest">{phase.phase}</span>
                                                <p className="text-sm font-semibold text-dark-100">{phase.title}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-dark-500">{phase.subtitle}</span>
                                            <HiChevronDown className={`text-dark-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-dark-800 pt-3">
                                                    {phase.items.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${item.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-700/50 text-dark-600'}`}>
                                                                {item.done ? '✓' : '○'}
                                                            </div>
                                                            <span className={`text-xs ${item.done ? 'text-dark-200' : 'text-dark-500'}`}>{item.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
