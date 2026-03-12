import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const Section = ({ title, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-dark-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-dark-900/60 hover:bg-dark-800/60 transition"
            >
                <span className="font-semibold text-dark-100 text-sm">{title}</span>
                <span className={`text-primary-400 text-lg transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
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
                        <div className="px-5 py-4 text-sm text-dark-400 leading-relaxed border-t border-dark-800">
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
        <>
            <SEO title="About Us - TheCollabify" description="Learn about TheCollabify — the AI-powered platform connecting brands with authentic content creators." />
            <div className="min-h-screen bg-dark-950">
                <Navbar />

                <section className="pt-28 pb-16 px-4">
                    <div className="max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-10"
                        >
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-4">
                                About TheCollabify
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-dark-100 mb-3">
                                What We're <span className="gradient-text">Building</span>
                            </h1>
                            <p className="text-dark-400 text-sm max-w-lg mx-auto">
                                TheCollabify is a collaboration platform connecting brands and content creators
                                through smart matching, quality scoring, and fraud-aware discovery.
                            </p>
                        </motion.div>

                        <div className="space-y-3">
                            <Section title="Our Mission">
                                We're building the intelligence layer for creator commerce — making it easy for
                                brands to find authentic creators and for creators to find brand partnerships that
                                match their niche. Every collaboration on our platform teaches the system to make
                                better matches next time.
                            </Section>

                            <Section title="What TheCollabify Does">
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><span className="text-primary-400 mt-0.5">▸</span> Connects brands (sellers) with content creators in their niche</li>
                                    <li className="flex items-start gap-2"><span className="text-primary-400 mt-0.5">▸</span> Scores creator quality based on engagement authenticity and delivery reliability</li>
                                    <li className="flex items-start gap-2"><span className="text-primary-400 mt-0.5">▸</span> Detects suspicious follower patterns to protect brands from fake reach</li>
                                    <li className="flex items-start gap-2"><span className="text-primary-400 mt-0.5">▸</span> Tracks collaboration milestones, deliverables, and feedback in one place</li>
                                    <li className="flex items-start gap-2"><span className="text-primary-400 mt-0.5">▸</span> Improves match quality as more partnerships are completed</li>
                                </ul>
                            </Section>

                            <Section title="Who It's For">
                                <p className="mb-2"><strong className="text-dark-200">Brands &amp; Sellers</strong> — businesses looking to run influencer campaigns, find creators in specific niches, and track collaboration outcomes without guesswork.</p>
                                <p><strong className="text-dark-200">Content Creators</strong> — influencers and content makers who want to be discovered by relevant brands, build their reputation based on real work, and manage partnerships cleanly.</p>
                            </Section>

                            <Section title="Where We Are Now">
                                TheCollabify is currently in early access. Core features — creator discovery,
                                quality scoring, fraud detection, campaign management, and real-time messaging —
                                are live and being refined with real user feedback. We are adding new capabilities
                                regularly based on what creators and brands actually need.
                            </Section>

                            <Section title="Our Values">
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> <strong className="text-dark-200">Authenticity first</strong> — we surface real creators, not inflated numbers</li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> <strong className="text-dark-200">Transparency</strong> — scores and match reasons are always explained</li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> <strong className="text-dark-200">Privacy</strong> — we do not sell your data or share it with third parties</li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> <strong className="text-dark-200">Continual improvement</strong> — every partnership outcome makes the next match better</li>
                                </ul>
                            </Section>
                        </div>

                        <div className="mt-10 text-center space-y-3">
                            <Link to="/register" className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition">
                                Get Started Free
                            </Link>
                            <div>
                                <Link to="/contact" className="text-sm text-dark-400 hover:text-primary-400 transition">
                                    Contact Us →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default AboutUs;
