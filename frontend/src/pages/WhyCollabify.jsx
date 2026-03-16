import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiShieldCheck, HiLightningBolt, HiChartBar } from 'react-icons/hi';
import { FaFingerprint, FaProjectDiagram, FaBalanceScale, FaSearch, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const AccordionCard = ({ icon: Icon, title, color, description, points }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-dark-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-4 text-left bg-dark-900/60 hover:bg-dark-800/60 transition gap-3"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="text-sm" />
                    </div>
                    <span className="font-semibold text-dark-100 text-sm">{title}</span>
                </div>
                <span className={`text-dark-400 text-lg transition-transform flex-shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 py-4 border-t border-dark-800 space-y-3">
                            <p className="text-sm text-dark-400 leading-relaxed">{description}</p>
                            {points && (
                                <ul className="space-y-2">
                                    {points.map((p, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-dark-500">
                                            <FaCheckCircle className="text-primary-500 mt-0.5 flex-shrink-0" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const WhyCollabify = () => {

    const coreFeatures = [
        {
            icon: HiSparkles,
            title: 'Creator Quality Index (CQI)',
            color: 'bg-primary-500/20 text-primary-400',
            description: 'Our proprietary AI score that aggregates dozens of performance signals into a single readability index. We measure what actually generates ROI, not just vanity metrics.',
            points: [
                'Engagement authenticity — detecting real vs. synthetic interactions',
                'Historical ROI — average conversion rates from past partnerships',
                'Brand affinity — how well their voice aligns with specific niches',
                'Reliability benchmark — on-time content delivery tracking'
            ]
        },
        {
            icon: HiShieldCheck,
            title: 'Deep Fraud Prevention',
            color: 'bg-emerald-500/20 text-emerald-400',
            description: 'We identify bot farms and engagement groups before they waste your budget. Our multi-layer scan looks for anomalies in growth and comment patterns.',
            points: [
                'Growth spike analysis — identifying purchased follower bursts',
                'Comment sentiment verification — flagging generic bot scripts',
                'Audience location heatmaps — ensuring geographic alignment',
                'Engagement-to-Reach ratios — verifying real impression volume'
            ]
        },
        {
            icon: HiChartBar,
            title: 'Semantic Smart Matching',
            color: 'bg-secondary-500/20 text-secondary-400',
            description: 'Beyond keywords. Our AI uses semantic embedding to understand the "soul" of a creator\'s content and matches it to your brand\'s core values.',
            points: [
                'Visual style mapping — matching aesthetic preferences',
                'Tone-of-voice alignment — ensuring brand voice consistency',
                'Competitor overlap — identifying creators your rivals missed',
                'Niche depth analysis — finding specialized micro-experts'
            ]
        },
        {
            icon: HiLightningBolt,
            title: 'AI-Guided Workflows',
            color: 'bg-amber-500/20 text-amber-400',
            description: 'Manage the entire collaboration lifecycle within a single dashboard. Our AI suggests timeline adjustments and helps verify deliverables automatically.',
            points: [
                'Smart timeline suggestions based on creator habits',
                'Automated deliverable verification via vision AI',
                'Real-time messaging with embedded contract tracking',
                'Post-campaign learning loop to refine future matches'
            ]
        }
    ];

    const differentiators = [
        {
            icon: FaFingerprint,
            title: 'Quality Over Vanity',
            desc: 'We rank creators by what makes them a reliable partner — engagement authenticity, delivery history, and feedback scores — not just follower numbers.'
        },
        {
            icon: FaSearch,
            title: 'Fraud-Aware Discovery',
            desc: 'Every creator in search results has passed authenticity checks. Brands see real creators, not fake accounts cluttering results.'
        },
        {
            icon: FaBalanceScale,
            title: 'Transparent Scoring',
            desc: 'CQI scores come with a breakdown. You can see exactly which factors contributed — nothing is hidden or arbitrary.'
        },
        {
            icon: FaProjectDiagram,
            title: 'Outcome-Driven',
            desc: 'Collaboration results feed back into match quality. Completed partnerships help both brands and creators get better recommendations over time.'
        }
    ];

    return (
        <>
            <SEO title="Why Collabify - TheCollabify" description="What makes TheCollabify different: quality scoring, fraud detection, smart matching, and transparent collaboration tools." />
            <div className="min-h-screen bg-dark-950">
                <Navbar />

                {/* Hero */}
                <section className="pt-28 pb-10 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary-500/10 text-secondary-400 border border-secondary-500/20 mb-5">
                                Why TheCollabify
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-dark-100 mb-3">
                                Built for <span className="gradient-text">Real Partnerships</span>
                            </h1>
                            <p className="text-dark-400 text-sm max-w-lg mx-auto">
                                We built a platform that scores quality, detects fraud, and makes collaboration manageable — so both brands and creators spend time on the work, not the admin.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Core Features - Expandable */}
                <section className="pb-10 px-4">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-sm font-bold text-dark-400 mb-4 text-center uppercase tracking-widest">Platform Capabilities</h2>
                        <div className="space-y-2">
                            {coreFeatures.map((f, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                                    <AccordionCard {...f} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Differentiators */}
                <section className="py-10 px-4 bg-dark-900/30 border-y border-dark-800/50">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-sm font-bold text-dark-400 mb-6 text-center uppercase tracking-widest">What Makes Us Different</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {differentiators.map((d, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 flex-shrink-0">
                                            <d.icon className="text-sm" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-dark-100 mb-1">{d.title}</h3>
                                            <p className="text-xs text-dark-400 leading-relaxed">{d.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Transparency summary */}
                <section className="py-10 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-sm font-bold text-dark-400 mb-5 uppercase tracking-widest">Transparency by Design</h2>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="glass-card p-4 text-center">
                                <p className="text-xl font-bold text-primary-400 mb-1">CQI</p>
                                <p className="text-xs font-medium text-dark-500 uppercase tracking-widest">Quality Score</p>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <p className="text-xl font-bold text-emerald-400 mb-1">Fraud</p>
                                <p className="text-xs font-medium text-dark-500 uppercase tracking-widest">Detection Built-In</p>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <p className="text-xl font-bold text-secondary-400 mb-1">100%</p>
                                <p className="text-xs font-medium text-dark-500 uppercase tracking-widest">Explainable</p>
                            </div>
                        </div>
                        <p className="text-xs text-dark-500 mt-4 max-w-sm mx-auto">
                            Every score and match includes the reasoning behind it. No black boxes, no hidden algorithms.
                        </p>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default WhyCollabify;
