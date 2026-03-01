import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiShieldCheck, HiLightningBolt, HiChartBar, HiUserGroup } from 'react-icons/hi';
import { FaBrain, FaRobot, FaBalanceScale, FaFingerprint, FaProjectDiagram } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const WhyCollabify = () => {
    const [activeEngine, setActiveEngine] = useState(0);

    const engines = [
        {
            id: 0,
            title: 'Creator Quality Index',
            icon: HiSparkles,
            color: 'primary',
            description: 'A composite score that captures what makes a creator valuable — not just followers.',
            signals: [
                { label: 'Content Quality', detail: 'Consistency, originality, production value across posts' },
                { label: 'Engagement Authenticity', detail: 'Real interaction patterns vs. bot/fake engagement detection' },
                { label: 'Delivery Reliability', detail: 'On-time completion rate, communication responsiveness' },
                { label: 'Collaboration History', detail: 'Past brand feedback, repeat partnership rate, satisfaction scores' }
            ]
        },
        {
            id: 1,
            title: 'Fraud Detection',
            icon: HiShieldCheck,
            color: 'emerald',
            description: 'Multi-signal authenticity engine that protects brands from wasted spend.',
            signals: [
                { label: 'Follower Velocity', detail: 'Unusual growth spikes that indicate purchased followers' },
                { label: 'Engagement Ratio', detail: 'Likes/comments vs follower count — anomalies flagged instantly' },
                { label: 'Bot Pattern Detection', detail: 'Comment analysis for generic, scripted, or bot-generated replies' },
                { label: 'Growth Consistency', detail: 'Long-term growth trajectory vs. artificial inflation events' }
            ]
        },
        {
            id: 2,
            title: 'Predictive Modeling',
            icon: HiChartBar,
            color: 'secondary',
            description: 'Campaign outcome prediction before commitment — know your expected ROI.',
            signals: [
                { label: 'Historical Performance', detail: 'Past campaign outcomes for similar creator-brand pairings' },
                { label: 'Audience Overlap', detail: 'Target demographic alignment between brand and creator audiences' },
                { label: 'Engagement Forecast', detail: 'Expected likes, comments, saves based on content category norms' },
                { label: 'ROI Projection', detail: 'Estimated cost-per-engagement and conversion probability' }
            ]
        },
        {
            id: 3,
            title: 'Feedback Learning',
            icon: FaBrain,
            color: 'pink',
            description: 'Every collaboration outcome makes the next match smarter. The system evolves.',
            signals: [
                { label: 'Outcome Recording', detail: 'Success, satisfaction, and performance data captured post-collab' },
                { label: 'Weight Adjustment', detail: 'Scoring weights recalibrate based on which factors predicted success' },
                { label: 'Model Retraining', detail: 'Periodic model updates incorporate latest collaboration patterns' },
                { label: 'Creator Score Update', detail: 'CQI reflects real-world performance, not just profile metrics' }
            ]
        }
    ];

    const differentiators = [
        {
            icon: FaFingerprint,
            title: 'Proprietary Scoring',
            desc: "Our CQI isn't a vanity metric. It's computed from 42 data signals across 7 AI models — none of which are publicly available."
        },
        {
            icon: FaProjectDiagram,
            title: 'Self-Improving',
            desc: 'Most platforms use static algorithms. Ours retrains on real collaboration outcomes. Every partnership teaches the system.'
        },
        {
            icon: FaBalanceScale,
            title: 'Transparent & Explainable',
            desc: 'Every match score comes with a full breakdown. No black boxes. You see exactly why a creator was recommended.'
        },
        {
            icon: FaRobot,
            title: 'Decision Assistant',
            desc: 'We don\'t replace human judgment. We surface the signals you need to make informed partnership decisions faster.'
        }
    ];

    return (
        <>
            <SEO title="Why Collabify - TheCollabify" description="What makes our AI collaboration intelligence different: proprietary scoring, fraud detection, predictive modeling, and self-improving algorithms." />
            <div className="min-h-screen bg-dark-950">
                <Navbar />

                {/* Hero */}
                <section className="pt-32 pb-16 px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary-500/10 text-secondary-400 border border-secondary-500/20 mb-6">
                                <FaBrain className="mr-2" />
                                Intelligence Architecture
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-dark-100 mb-6">
                                Why <span className="gradient-text">Collabify</span>
                            </h1>
                            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                                We didn't build another marketplace. We built the intelligence layer for creator commerce — and it gets smarter with every partnership.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Differentiators */}
                <section className="pb-20 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {differentiators.map((d, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card p-6 hover:border-primary-500/30 transition"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0">
                                            <d.icon className="text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-dark-100 mb-2">{d.title}</h3>
                                            <p className="text-sm text-dark-400 leading-relaxed">{d.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Engine Deep Dive */}
                <section className="py-20 px-4 bg-dark-900/30 border-y border-dark-800/50">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-4">
                                Inside the <span className="gradient-text">AI Engine</span>
                            </h2>
                            <p className="text-dark-400 max-w-xl mx-auto">
                                Four interconnected systems working together on every match.
                            </p>
                        </div>

                        {/* Engine Selector */}
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {engines.map((engine) => {
                                const Icon = engine.icon;
                                return (
                                    <button
                                        key={engine.id}
                                        onClick={() => setActiveEngine(engine.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeEngine === engine.id
                                            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                                            : 'bg-dark-800/50 border-dark-700/50 text-dark-400 hover:text-dark-200'
                                            }`}
                                    >
                                        <Icon />
                                        <span className="hidden sm:inline">{engine.title}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Engine Detail */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeEngine}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass-card p-8"
                            >
                                <h3 className="text-xl font-bold text-dark-100 mb-2">{engines[activeEngine].title}</h3>
                                <p className="text-dark-400 mb-6">{engines[activeEngine].description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {engines[activeEngine].signals.map((signal, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 bg-dark-900/40 rounded-xl border border-dark-700/30">
                                            <div className="w-6 h-6 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 text-xs font-bold flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-dark-200 mb-1">{signal.label}</p>
                                                <p className="text-xs text-dark-500 leading-relaxed">{signal.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* Data Transparency */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-dark-100 mb-6">
                                We Show Our Work
                            </h2>
                            <p className="text-dark-400 max-w-xl mx-auto mb-10">
                                Every match comes with a full score breakdown. Every prediction includes a confidence level. No black boxes.
                            </p>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="glass-card p-6 text-center">
                                    <p className="text-3xl font-bold text-primary-400 mb-2">7</p>
                                    <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">AI Models Active</p>
                                </div>
                                <div className="glass-card p-6 text-center">
                                    <p className="text-3xl font-bold text-secondary-400 mb-2">42</p>
                                    <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">Data Signals</p>
                                </div>
                                <div className="glass-card p-6 text-center">
                                    <p className="text-3xl font-bold text-emerald-400 mb-2">100%</p>
                                    <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">Explainable</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default WhyCollabify;
