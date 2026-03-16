import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineCube, HiOutlineUserGroup, HiOutlineStatusOnline, HiOutlineShieldCheck, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const Section = ({ title, icon: Icon, children, colorClass }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="group border border-white/5 rounded-[2rem] overflow-hidden glass-card transition-all hover:border-white/10">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-8 py-6 text-left bg-transparent hover:bg-white/[0.02] transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${colorClass} bg-white/5 group-hover:scale-110 transition-transform`}>
                        <Icon className="text-xl" />
                    </div>
                    <span className="font-bold text-white tracking-tight">{title}</span>
                </div>
                <span className={`text-dark-400 text-2xl transition-transform duration-300 font-light ${open ? 'rotate-45 text-primary-400' : ''}`}>+</span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 text-sm text-dark-300 leading-relaxed border-t border-white/5 pt-6 bg-white/[0.01]">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-dark-950 font-sans selection:bg-primary-500/30">
            <SEO title="About Us - TheCollabify" description="Learn about TheCollabify — the AI-powered architecture connecting brands with authentic creator intelligence." />
            <Navbar />

            <div className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/10 blur-[130px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-secondary-900/10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 font-bold text-[10px] uppercase tracking-widest mb-8"
                        >
                            <HiOutlineSparkles className="text-sm" /> The Intelligence Layer
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
                            Redefining How <br />
                            <span className="gradient-text">Trust is Engineered.</span>
                        </h1>
                        <p className="text-lg text-dark-300 max-w-2xl mx-auto leading-relaxed">
                            TheCollabify isn't just a marketplace. We're an AI-orchestrated infrastructure
                            designed to eliminate the guesswork in creator commerce through deep transparency and fraud-aware discovery.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        <Section title="Our Mission" icon={HiOutlineSparkles} colorClass="text-primary-400">
                            We're building the intelligence layer for global partnerships. By aggregating dozens of performance signals into our proprietary Creator Quality Index (CQI), we ensure brands invest in authenticity while creators earn based on true impact. Every collaboration refines our neural matching models, creating a virtuous cycle of partnership ROI.
                        </Section>

                        <Section title="The Core Engine" icon={HiOutlineCube} colorClass="text-secondary-400">
                            <div className="grid md:grid-cols-2 gap-6">
                                <ul className="space-y-4 list-none p-0">
                                    <li className="flex items-start gap-3"><HiOutlineShieldCheck className="text-emerald-400 shrink-0 mt-1" /> <span>Multi-signal Fraud Detection V2</span></li>
                                    <li className="flex items-start gap-3"><HiOutlineShieldCheck className="text-emerald-400 shrink-0 mt-1" /> <span>Predictive ROI Attribution</span></li>
                                </ul>
                                <ul className="space-y-4 list-none p-0">
                                    <li className="flex items-start gap-3"><HiOutlineShieldCheck className="text-emerald-400 shrink-0 mt-1" /> <span>Semantic Aesthetic Matching</span></li>
                                    <li className="flex items-start gap-3"><HiOutlineShieldCheck className="text-emerald-400 shrink-0 mt-1" /> <span>Real-time Reputation Scoring</span></li>
                                </ul>
                            </div>
                        </Section>

                        <Section title="Ecosystem Architecture" icon={HiOutlineUserGroup} colorClass="text-amber-400">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-white font-bold mb-2">For Enterprise Brands</h4>
                                    <p className="text-dark-400">A data-driven command center to discover, manage, and verify influencer campaigns with a focus on verified reach and performance integrity.</p>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div>
                                    <h4 className="text-white font-bold mb-2">For Professional Creators</h4>
                                    <p className="text-dark-400">A meritocratic spotlight where quality is the primary currency. Build your score, get matched with high-affinity brands, and secure your income via AI-verified milestones.</p>
                                </div>
                            </div>
                        </Section>

                        <Section title="Current Status" icon={HiOutlineStatusOnline} colorClass="text-indigo-400">
                            TheCollabify is in active evolution. Core matchmaking and campaign prediction modules are live, currently processing signals for a growing network of elite creators. We are continuously deploying "Guided AI" upgrades to streamline the entire collaboration lifecycle from brief to final payout.
                        </Section>
                    </div>

                    <div className="mt-24 p-12 rounded-[2.5rem] bg-gradient-to-br from-dark-900 to-dark-950 border border-white/5 text-center relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 blur-[80px] rounded-full group-hover:bg-primary-500/20 transition-all duration-700"></div>
                        <h2 className="text-2xl font-bold text-white mb-4">Join the Future of Collaboration</h2>
                        <p className="text-dark-400 mb-10 max-w-md mx-auto">Experience the precision of creator intelligence today.</p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-900/20">
                                Get Started Free
                            </Link>
                            <Link to="/contact" className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all group/btn">
                                Contact Engineering <HiOutlineArrowNarrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUs;
