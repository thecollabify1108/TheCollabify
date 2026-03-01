import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import Logo from '../components/common/Logo';
import HeroSidePanels from '../components/effects/HeroSidePanels';

const Landing = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getStarted = () => navigate('/register');

    return (
        <div className="relative min-h-screen selection:bg-white selection:text-black bg-bg-prime text-text-prime font-sans overflow-x-hidden">

            {/* NAVIGATION - Minimal & Executive */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 md:px-12 ${scrolled ? 'py-4 luxury-blur border-b border-white/5 bg-bg-prime/20' : 'py-8'
                }`}>
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-12 lg:gap-24">
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                            <Logo className="h-7 w-auto grayscale brightness-150 transition-all duration-500 group-hover:brightness-200" />
                            <span className="text-sm font-black uppercase tracking-[0.3em] hidden sm:block">Protocol</span>
                        </div>
                        <div className="hidden lg:flex items-center gap-12">
                            <a href="#intelligence" className="text-[10px] uppercase tracking-[0.3em] text-text-sec hover:text-text-prime transition-colors py-2">Intelligence</a>
                            <a href="#validation" className="text-[10px] uppercase tracking-[0.3em] text-text-sec hover:text-text-prime transition-colors py-2">Validation</a>
                            <a href="#about" className="text-[10px] uppercase tracking-[0.3em] text-text-sec hover:text-text-prime transition-colors py-2">About</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <ThemeToggle />
                        {!isAuthenticated && (
                            <button
                                onClick={() => navigate('/login')}
                                className="text-[10px] uppercase tracking-[0.3em] text-text-sec hover:text-text-prime transition-colors hidden sm:block"
                            >
                                Access
                            </button>
                        )}
                        <button
                            onClick={getStarted}
                            className="btn-executive text-[10px] uppercase tracking-[0.4em] font-black py-3 px-8"
                        >
                            Establish
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO - Problem -> Solution Engine */}
            <header className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
                <HeroSidePanels />

                <div className="max-w-4xl w-full z-10 text-center flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-12 items-center flex flex-col"
                    >
                        <div className="h-[1px] w-12 bg-text-muted mb-6" />
                        <span className="text-[10px] uppercase tracking-[0.6em] text-text-muted font-bold inline-block">Intelligence Layer 0.1</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black mb-12 leading-[1.1] tracking-tighter"
                    >
                        Matching is Broken.<br />
                        <span className="opacity-30">System Corrected.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="text-text-sec max-w-2xl mx-auto mb-16 text-lg md:text-xl leading-relaxed font-medium"
                    >
                        We eliminated the noise, the manual vetting, and the guess-work.
                        TheCollabify is the architectural protocol for high-performance influencer marketing.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col sm:flex-row gap-8 items-center"
                    >
                        <button onClick={() => navigate('/register?role=seller')} className="btn-executive min-w-[280px] py-5">
                            Brand Portal
                        </button>
                        <button onClick={() => navigate('/register?role=creator')} className="btn-secondary-exec min-w-[280px] py-5">
                            Creator Protocol
                        </button>
                    </motion.div>
                </div>

                {/* Vertical Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                >
                    <div className="h-16 w-[1px] bg-gradient-to-b from-text-muted to-transparent" />
                </motion.div>
            </header>

            {/* INTELLIGENCE ENGINE - MERGED VIEW */}
            <section id="intelligence" className="relative py-32 md:py-48 px-6 bg-surface-1 border-y border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-16">
                        <div className="space-y-6">
                            <span className="text-[10px] uppercase tracking-[0.5em] text-text-muted font-bold block">Engine Core</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Proprietary Signal<br />Processing</h2>
                            <p className="text-text-sec text-lg leading-relaxed max-w-lg">
                                Our protocol decodes audience authenticity and niche resonance in real-time.
                                We don't analyze profiles—we validate performance vectors.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { title: 'Authenticity Matrix', desc: 'Hardware-level detection of synthetic engagement and bot clusters.' },
                                { title: 'Niche Resonance', desc: 'Mathematical alignment between brand moats and creator influence.' },
                                { title: 'Architectural Security', desc: 'Secure payment layers powered by verified milestone validation.' },
                                { title: 'Predictive Moat', desc: 'ROI modeling based on deep-learning historical conversion data.' }
                            ].map((item, i) => (
                                <div key={i} className="p-8 border border-white/5 rounded-panel hover:bg-white/[0.02] transition-all duration-500 group">
                                    <div className="w-8 h-[1px] bg-text-muted mb-6 group-hover:w-full transition-all duration-700" />
                                    <h4 className="font-bold text-text-prime mb-3 text-lg tracking-tight">{item.title}</h4>
                                    <p className="text-sm text-text-muted leading-loose">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative aspect-square glass-card flex items-center justify-center p-12 preserve-3d group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                        <div className="relative z-10 w-full h-full border border-white/5 flex flex-col items-center justify-center gap-16 internal-parallax">
                            <div className="text-9xl font-black text-white/[0.02] group-hover:text-white/[0.05] transition-colors duration-1000 select-none">IA_01</div>
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-[10px] uppercase tracking-[0.6em] text-text-muted font-bold">Protocol Stability</span>
                                <span className="text-5xl md:text-6xl font-black text-text-prime tracking-tighter">99.98%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALIDATION - Institutional Proof */}
            <section id="validation" className="py-32 md:py-48 px-6 bg-bg-prime">
                <div className="max-w-7xl mx-auto text-center mb-32">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-text-muted font-bold block mb-4">Institutional Validation</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">System Metrics</h2>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24">
                    {[
                        { label: 'Validated Entities', value: '1.2k+' },
                        { label: 'Capital Flow', value: '$4.8M' },
                        { label: 'Vector Growth', value: '+142%' },
                        { label: 'Integrity Rate', value: '99.4%' }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 group">
                            <span className="text-5xl md:text-6xl font-black tracking-tighter text-text-prime group-hover:scale-110 transition-transform duration-700">{stat.value}</span>
                            <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-black">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA - The Final Action */}
            <section className="py-32 md:py-64 px-6 text-center bg-bg-prime relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/10 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-4xl mx-auto space-y-16 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Ready to Establish?</h2>
                    <p className="text-text-sec text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto font-medium">
                        Secure your position in the protocol. Join the elite network of brands and creators defining the future of influence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                        <button onClick={getStarted} className="btn-executive px-16 py-5 min-w-[280px] text-xs">Request Access</button>
                        <button onClick={() => navigate('/demo')} className="btn-secondary-exec px-16 py-5 min-w-[280px] text-xs">Interactive Demo</button>
                    </div>
                </div>
            </section>

            {/* FOOTER - Minimal & Professional */}
            <footer className="py-24 px-6 border-t border-white/5 bg-bg-prime/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                    <Logo className="h-6 w-auto grayscale opacity-30" />
                    <div className="flex gap-12 text-[10px] uppercase tracking-[0.4em] text-text-muted font-black">
                        <a href="#" className="hover:text-text-prime transition-colors">Privacy</a>
                        <a href="#" className="hover:text-text-prime transition-colors">Terms</a>
                        <a href="#" className="hover:text-text-prime transition-colors">Security</a>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.6em] text-text-muted font-bold opacity-50">
                        TheCollabify Intelligence Protocol © 2024. Authority Verified.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
