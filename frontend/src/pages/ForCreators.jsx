import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import Logo from '../components/common/Logo';
import ThreeScene from '../components/effects/ThreeScene';

const ForCreators = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getStarted = () => navigate('/register?role=creator');

    return (
        <div className="relative min-h-screen bg-bg-prime text-text-prime font-sans overflow-x-hidden selection:bg-white selection:text-black">
            <ThreeScene type="creators" />

            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 md:px-12 ${scrolled ? 'py-4 luxury-blur border-b border-white/5 bg-bg-prime/20' : 'py-8'
                }`}>
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-12 lg:gap-24">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                            <Logo className="h-7 w-auto grayscale brightness-150" />
                            <span className="text-sm font-black uppercase tracking-[0.3em] hidden sm:block">Protocol</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <ThemeToggle />
                        <button onClick={getStarted} className="btn-executive text-[10px] uppercase tracking-[0.4em] font-black py-3 px-8">
                            Establish
                        </button>
                    </div>
                </div>
            </nav>

            <header className="relative min-h-screen flex items-center pt-32 px-6">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="mb-12"
                        >
                            <span className="text-[10px] uppercase tracking-[0.5em] text-text-muted font-bold block mb-8">Creator Protocol IA_03</span>
                            <h1 className="text-5xl md:text-7xl font-black mb-12 leading-[1.1] tracking-tighter">
                                Influence as a<br />
                                <span className="opacity-30">Discipline.</span>
                            </h1>
                            <p className="text-text-sec text-xl leading-relaxed max-w-xl font-medium mb-12">
                                For the 1%. Join the institutional-grade platform designed for creators who treat their audience as a professional asset.
                                Secure premium partnerships with verified global brands.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-8">
                                <button onClick={getStarted} className="btn-executive px-12 py-5">Register Portfolio</button>
                                <button onClick={() => navigate('/demo')} className="btn-secondary-exec px-12 py-5">View Opportunities</button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-24 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
                        <div className="glass-card aspect-square flex flex-col items-center justify-center p-12 border-white/5 preserve-3d">
                            <div className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold mb-8">Asset Verification</div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-text-prime opacity-20" />
                                </div>
                                <span className="text-3xl font-black tracking-tighter">Elite Status</span>
                                <span className="text-[10px] text-text-sec tracking-[0.4em] uppercase">Verified Authority</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-48 px-6 bg-surface-1 border-y border-white/5">
                <div className="max-w-7xl mx-auto space-y-32">
                    <div className="max-w-3xl">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-text-muted font-bold block mb-4">Talent Excellence</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8">High Performance<br />Collaborations</h2>
                        <p className="text-text-sec text-lg leading-relaxed">
                            We bridge the gap between creative excellence and corporate requirement.
                            Access a locked-down network of high-capital brand opportunities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: 'Verified Invoicing', desc: 'Professional financial layers for cross-border campaign payments and tax compliance.' },
                            { title: 'Performance Moats', desc: 'Secure your rates with data-backed conversion history verified by the protocol.' },
                            { title: 'Exclusive Access', desc: 'Priority access to proprietary brand campaigns not available on generic marketplaces.' }
                        ].map((item, i) => (
                            <div key={i} className="p-10 border border-white/5 rounded-panel hover:bg-white/[0.02] transition-all duration-500 group">
                                <span className="text-4xl font-black text-white/5 mb-8 block group-hover:text-white/10 transition-colors">0{i + 1}</span>
                                <h4 className="text-xl font-bold text-text-prime mb-4 tracking-tight">{item.title}</h4>
                                <p className="text-text-muted leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-48 px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-16">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Monetize Your Authority.</h2>
                    <button onClick={getStarted} className="btn-executive px-24 py-6 text-xs uppercase tracking-[0.4em] font-black">Join Talent Protocol</button>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted mt-8">Professional Verification Mandatory.</p>
                </div>
            </section>

            <footer className="py-24 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                    <Logo className="h-6 w-auto grayscale opacity-30" />
                    <p className="text-[10px] uppercase tracking-[0.6em] text-text-muted font-bold opacity-50">
                        TheCollabify Creator Protocol © 2024. Authority Verified.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default ForCreators;
