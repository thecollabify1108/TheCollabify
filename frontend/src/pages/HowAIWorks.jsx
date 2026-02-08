import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    HiSparkles,
    HiShieldCheck,
    HiLightningBolt,
    HiChartBar,
    HiUserGroup
} from 'react-icons/hi';
import { FaRobot, FaBrain, FaBalanceScale, FaLock } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const HowAIWorks = () => {
    return (
        <div className="min-h-screen bg-dark-950 relative overflow-hidden">
            <SEO
                title="How Our AI Works - Transparent Matchmaking"
                description="Understand the intelligence behind TheCollabify's AI. No black boxes, just smarter connections."
            />

            {/* Background Effects */}
            <div className="grid-pattern fixed inset-0 z-0 opacity-40"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary-900/10 blur-[120px] rounded-full pointer-events-none"></div>

            <Navbar />

            <main className="relative z-10 pt-32 pb-24 px-4">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                            <HiShieldCheck className="mr-2" />
                            Transparency First
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark-100">
                            Our AI, <span className="gradient-text">Explained</span>
                        </h1>
                        <p className="text-xl text-dark-300 max-w-2xl mx-auto leading-relaxed">
                            We believe in "Explicable AI." You deserve to know exactly why a match was recommended,
                            how our system learns, and why you remain in control.
                        </p>
                    </motion.div>
                </div>

                {/* Section 1: The Signals */}
                <section className="max-w-6xl mx-auto mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-dark-100 mb-6">
                                <span className="text-primary-400">01.</span> What We Analyze
                            </h2>
                            <p className="text-dark-300 mb-8 leading-relaxed">
                                Our matchmaking engine doesn't just look at follower counts.
                                It processes three layers of data to calculate a <strong>Match Score (0-100)</strong>.
                            </p>

                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-primary-400 text-xl border border-dark-700 shrink-0">
                                        <HiUserGroup />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-dark-100 mb-1">Core Relevance (80%)</h3>
                                        <p className="text-sm text-dark-400">The "Must-Haves": Budget fit, Niche similarity, Engagement rates, and Audience demographics.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-secondary-400 text-xl border border-dark-700 shrink-0">
                                        <HiLightningBolt />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-dark-100 mb-1">Short-Term Intent (5%)</h3>
                                        <p className="text-sm text-dark-400">Context matters. If you've been browsing "Tech Reviews" all morning, we prioritize tech creators for that session.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-pink-400 text-xl border border-dark-700 shrink-0">
                                        <FaBrain />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-dark-100 mb-1">Personal History (15%)</h3>
                                        <p className="text-sm text-dark-400">Your taste profile. We learn from who you've hired, rejected, or saved in the past.</p>
                                    </div>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 blur-[60px] rounded-full"></div>
                            <div className="relative glass-card p-8 border border-dark-700/50">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                                        <span className="text-dark-300">Base Compatibility</span>
                                        <span className="text-emerald-400 font-mono">High</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                                        <span className="text-dark-300">Audience Quality</span>
                                        <span className="text-emerald-400 font-mono">Verified</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                                        <span className="text-dark-300">Brand Safety</span>
                                        <span className="text-emerald-400 font-mono">98%</span>
                                    </div>
                                    <div className="h-px bg-dark-700 my-4"></div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-dark-100">Final Match Score</span>
                                        <span className="text-2xl font-black gradient-text">92/100</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 2: The Loop */}
                <section className="max-w-5xl mx-auto mb-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-dark-100 mb-6">
                            <span className="text-secondary-400">02.</span> The Learning Loop
                        </h2>
                        <p className="text-dark-300 max-w-2xl mx-auto mb-12">
                            Every interaction makes the system smarter for YOU. We don't share your specific preference data with competitors.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-dark-700 to-transparent z-0"></div>

                            <div className="relative z-10 bg-dark-950 p-6">
                                <div className="w-16 h-16 mx-auto rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-2xl mb-4 text-blue-400">
                                    <FaRobot />
                                </div>
                                <h3 className="font-bold text-dark-100 mb-2">1. Recommendation</h3>
                                <p className="text-sm text-dark-400">AI suggests a creator based on your campaign brief.</p>
                            </div>

                            <div className="relative z-10 bg-dark-950 p-6">
                                <div className="w-16 h-16 mx-auto rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-2xl mb-4 text-purple-400">
                                    <FaBalanceScale />
                                </div>
                                <h3 className="font-bold text-dark-100 mb-2">2. Your Action</h3>
                                <p className="text-sm text-dark-400">You Accept, Reject, or Save the profile. This is the feedback signal.</p>
                            </div>

                            <div className="relative z-10 bg-dark-950 p-6">
                                <div className="w-16 h-16 mx-auto rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-2xl mb-4 text-emerald-400">
                                    <HiChartBar />
                                </div>
                                <h3 className="font-bold text-dark-100 mb-2">3. Future Refinement</h3>
                                <p className="text-sm text-dark-400">Next time, we weight similar profiles higher (or lower) automatically.</p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Section 3: Confidence Buckets */}
                <section className="max-w-6xl mx-auto mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            className="order-2 md:order-1"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="space-y-4">
                                <div className="glass-card p-6 border border-emerald-500/30 flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <div>
                                        <div className="text-emerald-400 font-bold text-sm uppercase tracking-wider">High Confidence (85%+)</div>
                                        <div className="text-dark-300 text-sm">"We are very sure this is a great fit."</div>
                                    </div>
                                </div>
                                <div className="glass-card p-6 border border-blue-500/30 flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <div>
                                        <div className="text-blue-400 font-bold text-sm uppercase tracking-wider">Good Match (65-84%)</div>
                                        <div className="text-dark-300 text-sm">"Solid option, meets most criteria."</div>
                                    </div>
                                </div>
                                <div className="glass-card p-6 border border-purple-500/30 flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                    <div>
                                        <div className="text-purple-400 font-bold text-sm uppercase tracking-wider">Experimental (&lt;65%)</div>
                                        <div className="text-dark-300 text-sm">"Wildcard option. Might be a hidden gem."</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="order-1 md:order-2"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-dark-100 mb-6">
                                <span className="text-amber-400">03.</span> Honest Confidence
                            </h2>
                            <p className="text-dark-300 mb-6 leading-relaxed">
                                We don't pretend to be perfect. Instead of showing you a generic list,
                                we clearly label our confidence level for every single match.
                            </p>
                            <p className="text-dark-300 leading-relaxed">
                                This helps you quickly distinguish between the <strong>"Safe Bets"</strong> and the
                                <strong>"Creative Risks"</strong> allowing you to build a diverse portfolio of influencers.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Section 4: Trust & Boundaries */}
                <section className="max-w-4xl mx-auto text-center border-t border-dark-800 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="w-16 h-16 mx-auto rounded-full bg-dark-800 flex items-center justify-center text-3xl mb-6 text-dark-200">
                            <FaLock />
                        </div>
                        <h2 className="text-3xl font-bold text-dark-100 mb-6">Trust & Boundaries</h2>
                        <p className="text-dark-300 mb-8 max-w-2xl mx-auto">
                            We are committed to ethical AI.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                            <div className="p-6 rounded-xl bg-dark-900/50">
                                <h4 className="font-bold text-dark-100 mb-2">No Black Boxes</h4>
                                <p className="text-sm text-dark-400">
                                    We explain "Why" for every match. You are never left guessing why a creator was recommended.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl bg-dark-900/50">
                                <h4 className="font-bold text-dark-100 mb-2">Human Control</h4>
                                <p className="text-sm text-dark-400">
                                    AI suggests; You decide. We never automate contracts or payments without your explicit approval.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HowAIWorks;
