import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiOutlineDocumentText, HiOutlineScale, HiOutlineIdentification, HiOutlineShieldCheck, HiOutlineCurrencyRupee, HiOutlineBan, HiOutlineMail, HiOutlineCheckCircle, HiOutlineLightningBolt } from 'react-icons/hi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-dark-950 font-sans selection:bg-primary-500/30">
            <SEO title="Terms & Conditions - TheCollabify" description="Our platform usage terms. Built for fair partnerships between brands and creators." />
            <Navbar />

            <div className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Visual accents */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-600/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="mb-16">
                        <Link to="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-8 group">
                            <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            Platform <span className="gradient-text">Agreement</span>
                        </h1>
                        <p className="text-dark-400 font-medium font-mono text-sm">Last Rev: March 2026 • Version 2.0 (Upgraded)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {/* Sidebar/QuickNav - Desktop Only */}
                        <div className="hidden md:block">
                            <div className="sticky top-32 space-y-4">
                                {[
                                    { label: "Acceptance", icon: HiOutlineCheckCircle },
                                    { label: "Accounts", icon: HiOutlineIdentification },
                                    { label: "AI Usage", icon: HiOutlineLightningBolt },
                                    { label: "Payments", icon: HiOutlineCurrencyRupee },
                                    { label: "Liability", icon: HiOutlineScale }
                                ].map((tab, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-dark-400 hover:text-white transition-all cursor-pointer">
                                        <tab.icon className="text-lg" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Body */}
                        <div className="md:col-span-3 space-y-8">
                            <article className="prose prose-invert max-w-none">
                                <section className="p-8 rounded-3xl glass-card border border-white/5 space-y-4 transition-all hover:bg-white/[0.02]">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mt-0">
                                        <HiOutlineDocumentText className="text-primary-400 shrink-0" />
                                        1. Scope of Service
                                    </h2>
                                    <p className="text-dark-300 text-sm leading-relaxed m-0">
                                        TheCollabify provides an AI-orchestrated infrastructure for influencer matchmaking, campaign management, and payment fulfillment. By initiating a "Campaign Launch," you authorize our AI models to process your data for the purpose of identifying optimal partnerships.
                                    </p>
                                </section>

                                <section className="p-8 rounded-3xl glass-card border border-white/5 space-y-4 transition-all hover:bg-white/[0.02]">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mt-0">
                                        <HiOutlineShieldCheck className="text-emerald-400 shrink-0" />
                                        2. Brand Responsibilities
                                    </h2>
                                    <ul className="text-dark-300 text-sm space-y-3 list-none p-0 m-0">
                                        <li className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            <span>Brands must provide truthful campaign briefs and honor agreed budgets.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            <span>Payments must be secured via our gateway prior to creator content production.</span>
                                        </li>
                                    </ul>
                                </section>

                                <section className="p-8 rounded-3xl glass-card border border-white/5 space-y-4 transition-all hover:bg-white/[0.02]">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mt-0">
                                        <HiOutlineScale className="text-secondary-400 shrink-0" />
                                        3. Creator Eligibility
                                    </h2>
                                    <p className="text-dark-300 text-sm leading-relaxed m-0">
                                        Creators must maintain human-centric account authenticity. Use of "follower bots" or engagement-inflation tools constitutes a material breach and results in immediate CQI (Creator Quality Index) blacklisting.
                                    </p>
                                </section>

                                <section className="p-8 rounded-3xl glass-card border border-white/5 space-y-4 transition-all hover:bg-white/[0.02]">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mt-0">
                                        <HiOutlineCurrencyRupee className="text-amber-400 shrink-0" />
                                        4. Financial Settlement
                                    </h2>
                                    <p className="text-dark-300 text-sm leading-relaxed m-0">
                                        Platform service fees are calculated based on contract volume. Payouts are triggered automatically upon "AI Deliverable Verification" or manual brand approval of the finalized content.
                                    </p>
                                </section>

                                <section className="p-8 rounded-3xl glass-card border border-white/5 space-y-4 transition-all hover:bg-white/[0.02]">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mt-0">
                                        <HiOutlineBan className="text-red-400 shrink-0" />
                                        5. Termination
                                    </h2>
                                    <p className="text-dark-300 text-sm leading-relaxed m-0">
                                        We reserve the right to suspend any account that exhibits patterns of fraud, harassment, or platform bypass (attempting to take payments off-platform).
                                    </p>
                                </section>
                            </article>

                            <div className="p-12 rounded-[2.5rem] bg-gradient-to-br from-dark-900 to-dark-950 border border-white/5 text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full group-hover:bg-primary-500/20 transition-all"></div>
                                <HiOutlineMail className="text-4xl mx-auto mb-6 text-primary-400" />
                                <h3 className="text-xl font-bold text-white mb-3">Enterprise Legal Review</h3>
                                <p className="text-dark-400 text-sm mb-8 max-w-sm mx-auto">Need a specialized agreement for your agency or large-scale brand?</p>
                                <a 
                                    href="mailto:support@thecollabify.ai" 
                                    className="px-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest border border-white/10 transition-all inline-block"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TermsConditions;
