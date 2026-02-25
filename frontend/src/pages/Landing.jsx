import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import CollabifyCore from '../components/effects/CollabifyCore';
import MarketingLayout from '../components/layout/MarketingLayout';

const easeOut = [0.16, 1, 0.3, 1];

const Landing = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <MarketingLayout>
            {/* Z3: Signature 3D artifact */}
            <CollabifyCore mode="homepage" />

            {/* HERO */}
            <header className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
                <div className="max-w-4xl w-full z-10 text-center flex flex-col items-center" style={{ paddingTop: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: easeOut }}
                        className="mb-10 flex flex-col items-center"
                    >
                        <div className="h-px w-10 mb-5" style={{ background: 'var(--text-muted)' }} />
                        <span className="text-[10px] uppercase tracking-[0.6em] font-bold" style={{ color: 'var(--text-muted)' }}>
                            Intelligence Layer 0.1
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.15, ease: easeOut }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black mb-10 leading-[1.05] tracking-tighter"
                        style={{ letterSpacing: 'var(--letter-tighter)' }}
                    >
                        Matching is Broken.<br />
                        <span style={{ opacity: 0.28 }}>System Corrected.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: easeOut }}
                        className="max-w-2xl mx-auto mb-14 text-lg md:text-xl leading-relaxed font-medium"
                        style={{ color: 'var(--text-sec)' }}
                    >
                        We eliminated the noise, the manual vetting, and the guess-work.
                        TheCollabify is the architectural protocol for high-performance influencer marketing.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.45, ease: easeOut }}
                        className="flex flex-col sm:flex-row gap-6 items-center"
                    >
                        <button
                            onClick={() => navigate('/register?role=seller')}
                            className="btn-executive min-w-[240px] py-4 text-[11px] uppercase tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                        >
                            Brand Portal
                        </button>
                        <button
                            onClick={() => navigate('/register?role=creator')}
                            className="btn-secondary-exec min-w-[240px] py-4 text-[11px] uppercase tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                        >
                            Creator Protocol
                        </button>
                    </motion.div>
                </div>

                {/* Depth scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                    aria-hidden="true"
                >
                    <div className="h-14 w-px" style={{ background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }} />
                </motion.div>
            </header>

            {/* INTELLIGENCE ENGINE */}
            <section
                id="intelligence"
                className="relative py-28 md:py-40 px-6 border-y"
                style={{ background: 'var(--surface-1)', borderColor: 'rgba(255,255,255,0.04)' }}
            >
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-14">
                        <div className="space-y-5">
                            <span className="text-[10px] uppercase tracking-[0.5em] font-bold block" style={{ color: 'var(--text-muted)' }}>
                                Engine Core
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Proprietary Signal<br />Processing
                            </h2>
                            <p className="text-lg leading-relaxed max-w-lg" style={{ color: 'var(--text-sec)' }}>
                                Our protocol decodes audience authenticity and niche resonance in real-time.
                                We don't analyze profiles — we validate performance vectors.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Authenticity Matrix', desc: 'Hardware-level detection of synthetic engagement and bot clusters.' },
                                { title: 'Niche Resonance', desc: 'Mathematical alignment between brand moats and creator influence.' },
                                { title: 'Architectural Security', desc: 'Secure payment layers powered by verified milestone validation.' },
                                { title: 'Predictive Moat', desc: 'ROI modeling based on deep-learning historical conversion data.' }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="p-7 rounded-panel transition-all duration-500 group"
                                    style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    <div className="h-px w-8 mb-5 transition-all duration-700 group-hover:w-full" style={{ background: 'var(--text-muted)' }} />
                                    <h4 className="font-bold mb-2 text-base tracking-tight" style={{ color: 'var(--text-prime)' }}>{item.title}</h4>
                                    <p className="text-sm leading-loose" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="relative aspect-square glass-card flex items-center justify-center p-10 preserve-3d group overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02), transparent)' }} />
                        <div className="relative z-10 w-full h-full border flex flex-col items-center justify-center gap-12 internal-parallax" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <div className="text-8xl font-black select-none" style={{ color: 'rgba(255,255,255,0.03)' }}>IA_01</div>
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-[10px] uppercase tracking-[0.6em] font-bold" style={{ color: 'var(--text-muted)' }}>Protocol Stability</span>
                                <span className="text-5xl md:text-6xl font-black tracking-tighter" style={{ color: 'var(--text-prime)' }}>99.98%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALIDATION */}
            <section id="validation" className="py-28 md:py-40 px-6" style={{ background: 'var(--bg-prime)' }}>
                <div className="max-w-7xl mx-auto text-center mb-24">
                    <span className="text-[10px] uppercase tracking-[0.5em] font-bold block mb-3" style={{ color: 'var(--text-muted)' }}>
                        Institutional Validation
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">System Metrics</h2>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-20">
                    {[
                        { label: 'Validated Entities', value: '1.2k+' },
                        { label: 'Capital Flow', value: '$4.8M' },
                        { label: 'Vector Growth', value: '+142%' },
                        { label: 'Integrity Rate', value: '99.4%' }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 group">
                            <span className="text-5xl md:text-6xl font-black tracking-tighter transition-transform duration-700 group-hover:scale-110" style={{ color: 'var(--text-prime)' }}>
                                {stat.value}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black" style={{ color: 'var(--text-muted)' }}>
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-28 md:py-56 px-6 text-center relative overflow-hidden" style={{ background: 'var(--bg-prime)' }}>
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'rgba(255,255,255,0.03)', filter: 'blur(100px)' }} />
                </div>
                <div className="max-w-4xl mx-auto space-y-14 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Ready to Establish?</h2>
                    <p className="text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto font-medium" style={{ color: 'var(--text-sec)' }}>
                        Secure your position in the protocol. Join the elite network of brands and creators defining the future of influence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="btn-executive px-14 py-4 min-w-[240px] text-[11px] uppercase tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                        >
                            Request Access
                        </button>
                        <button
                            onClick={() => navigate('/demo')}
                            className="btn-secondary-exec px-14 py-4 min-w-[240px] text-[11px] uppercase tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                        >
                            Interactive Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-20 px-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
                    <div className="flex gap-10 text-[10px] uppercase tracking-[0.4em] font-black" style={{ color: 'var(--text-muted)' }}>
                        <a href="/privacy" className="hover:opacity-100 opacity-60 transition-opacity focus-visible:outline-none focus-visible:underline">Privacy</a>
                        <a href="/terms" className="hover:opacity-100 opacity-60 transition-opacity focus-visible:outline-none focus-visible:underline">Terms</a>
                        <a href="/ai-explained" className="hover:opacity-100 opacity-60 transition-opacity focus-visible:outline-none focus-visible:underline">How It Works</a>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.6em] font-bold opacity-30" style={{ color: 'var(--text-muted)' }}>
                        TheCollabify Protocol © 2024. Authority Verified.
                    </p>
                </div>
            </footer>
        </MarketingLayout>
    );
};

export default Landing;

