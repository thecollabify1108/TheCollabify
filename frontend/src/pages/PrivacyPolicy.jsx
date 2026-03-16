import { motion } from 'framer-motion';
import { HiShieldCheck, HiOutlineLockClosed, HiCheck, HiOutlineMail } from 'react-icons/hi';
import { FaCookieBite, FaUserShield } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-dark-950 font-sans selection:bg-primary-500/30">
            <SEO title="Privacy Policy - TheCollabify" description="Our commitment to your privacy. No tracking cookies. No third-party ads. No selling your data." />
            <Navbar />

            <div className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-900/10 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] uppercase tracking-widest mb-6"
                        >
                            <HiShieldCheck className="text-sm" /> Privacy First Protocol
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight"
                        >
                            Privacy Isn't a Feature. <br />
                            <span className="gradient-text">It's Our Foundation.</span>
                        </motion.h1>
                        <p className="text-lg text-dark-300 max-w-2xl mx-auto leading-relaxed">
                            No tracking cookies. No third-party ads. No selling your data.
                            Just a transparent platform built on trust and AI integrity.
                        </p>
                    </div>

                    {/* Key Promises Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        {[
                            { 
                                icon: FaUserShield, 
                                title: "Zero ID Tracking", 
                                desc: "We don't track who you are. We analyze behavior patterns anonymously to optimize matches.",
                                color: "text-primary-400"
                            },
                            { 
                                icon: FaCookieBite, 
                                title: "No Creepy Cookies", 
                                desc: "Zero persistent tracker cookies. Your off-platform browsing history stays private.",
                                color: "text-secondary-400"
                            },
                            { 
                                icon: HiOutlineLockClosed, 
                                title: "Data Ownership", 
                                desc: "Your profile is YOURS. You can export your data or delete your account with one click.",
                                color: "text-emerald-400"
                            }
                        ].map((promise, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl glass-card border border-white/5 hover:border-white/10 transition-all group"
                            >
                                <promise.icon className={`text-4xl mb-6 ${promise.color} group-hover:scale-110 transition-transform`} />
                                <h3 className="text-lg font-bold mb-3 text-white">{promise.title}</h3>
                                <p className="text-sm text-dark-400 leading-relaxed">
                                    {promise.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Detailed Policy Content */}
                    <div className="glass-card p-8 md:p-14 rounded-[2.5rem] border border-white/5">
                        <article className="prose prose-invert max-w-none">
                            <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                                <span className="text-primary-400 font-mono text-sm capitalize">01.</span> What Data We Collect
                            </h2>
                            <p className="text-dark-300 mb-8">We believe in minimal data collection. Here is exactly what we store:</p>
                            
                            <div className="grid gap-4 mb-12">
                                {[
                                    { k: "Account Info", v: "Encrypted name, email, and credentials (verified via JWT)." },
                                    { k: "Signal Processing", v: "Public social media metrics used by our AI to calculate your Match Score." },
                                    { k: "Platform Usage", v: "Local session data to keep you logged in and handle real-time messaging." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-dark-900/50 border border-white/5">
                                        <HiCheck className="text-emerald-400 shrink-0 mt-1" />
                                        <div>
                                            <span className="block font-bold text-white text-sm">{item.k}</span>
                                            <span className="text-xs text-dark-400">{item.v}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

                            <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                                <span className="text-secondary-400 font-mono text-sm capitalize">02.</span> AI Fairness & Data
                            </h2>
                            <p className="text-dark-300">
                                Our matchmaking AI does not use sensitive personal data points (race, religion, etc.) to calculate correlations. We only weight professional performance signals.
                            </p>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

                            <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                                <span className="text-emerald-400 font-mono text-sm capitalize">03.</span> Your Rights
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-dark-300">
                                <div className="space-y-4">
                                    <h4 className="text-white font-bold">Portability</h4>
                                    <p className="text-sm">Download your entire historical collaboration data in JSON format at any time from your settings.</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-white font-bold">The Right To Be Forgotten</h4>
                                    <p className="text-sm">Deleting your account removes all personal identifiers from our prediction models within 24 hours.</p>
                                </div>
                            </div>
                        </article>

                        <div className="mt-16 p-8 rounded-2xl bg-primary-600/5 border border-primary-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Have specific questions?</h3>
                                <p className="text-sm text-dark-400">Our Data Privacy Officer is here to help clarify our AI training protocols.</p>
                            </div>
                            <a 
                                href="mailto:privacy@thecollabify.tech" 
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm transition-all shadow-lg"
                            >
                                <HiOutlineMail /> Contact Privacy Team
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
