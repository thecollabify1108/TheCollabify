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
            description: 'Every creator gets a quality score based on measurable factors — not just follower count. CQI reflects what actually matters in a partnership.',
            points: [
                'Engagement authenticity — real interactions vs. inflated metrics',
                'Delivery reliability — on-time completion and communication history',
                'Collaboration track record — past brand feedback and satisfaction scores',
                'Content consistency — regular posting and production quality'
            ]
        },
        {
            icon: HiShieldCheck,
            title: 'Fraud Detection',
            color: 'bg-emerald-500/20 text-emerald-400',
            description: 'Brands should never pay for fake reach. Our system flags suspicious patterns before a match is presented — protecting your budget from day one.',
            points: [
                'Rapid follower growth spikes — indicates purchased followers',
                'Engagement ratio anomalies — likes vs. comments vs. follower count',
                'Suspicious comment patterns — generic or bot-generated content',
                'Growth trajectory analysis — consistent growth vs. artificial inflation'
            ]
        },
        {
            icon: HiChartBar,
            title: 'Smart Matching',
            color: 'bg-secondary-500/20 text-secondary-400',
            description: 'We match brands with creators based on niche alignment, audience fit, and reliability — not just keyword searches or follower count.',
            points: [
                'Niche and category relevance to your brand',
                'Audience demographic alignment with your target market',
                'Creator reliability score for campaign delivery',
                'Collaboration outcome history for similar partnerships'
            ]
        },
        {
            icon: HiLightningBolt,
            title: 'Collaboration Management',
            color: 'bg-amber-500/20 text-amber-400',
            description: 'From initial contact to final deliverable, manage the entire partnership in one place — no spreadsheets or scattered emails.',
            points: [
                'Structured workflow with clear milestones and status tracking',
                'Real-time in-platform messaging between brands and creators',
                'Deliverable tracking and post-collaboration feedback',
                'Feedback loop that improves future match quality'
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
