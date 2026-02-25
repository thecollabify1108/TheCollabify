import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CollabifyCore from '../components/effects/CollabifyCore';
import MarketingLayout from '../components/layout/MarketingLayout';

const easeOut = [0.16, 1, 0.3, 1];

const ForCreators = () => {
    const navigate = useNavigate();

    return (
        <MarketingLayout>
            <CollabifyCore mode="creators" />

            <header className="relative min-h-screen flex items-center pt-28 px-6 pb-20">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.2, ease: easeOut }}
                        >
                            <span className="text-[10px] uppercase tracking-[0.5em] font-bold block mb-8" style={{ color: 'var(--text-muted)' }}>
                                Creator Protocol IA_03
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black mb-10 leading-[1.05] tracking-tighter">
                                Influence as a<br />
                                <span style={{ opacity: 0.28 }}>Discipline.</span>
                            </h1>
                            <p className="text-xl leading-relaxed max-w-xl font-medium mb-12" style={{ color: 'var(--text-sec)' }}>
                                For the 1%. Join the institutional-grade platform designed for creators who treat their audience as a professional asset.
                                Secure premium partnerships with verified global brands.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button
                                    onClick={() => navigate('/register?role=creator')}
                                    className="btn-executive px-10 py-4 text-[11px] uppercase tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                                >
                                    Register Portfolio
                                </button>
                                <button
                                    onClick={() => navigate('/demo')}
                                    className="btn-secondary-exec px-10 py-4 text-[11px] uppercase tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                                >
                                    View Opportunities
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-20 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.03)', filter: 'blur(100px)' }} />
                        <div className="glass-card aspect-square flex flex-col items-center justify-center p-10 preserve-3d" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8" style={{ color: 'var(--text-muted)' }}>
                                Asset Verification
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="w-8 h-8 rounded-full" style={{ background: 'var(--text-prime)', opacity: 0.2 }} />
                                </div>
                                <span className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-prime)' }}>Elite Status</span>
                                <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--text-sec)' }}>Verified Authority</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-36 px-6 border-y" style={{ background: 'var(--surface-1)', borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="max-w-7xl mx-auto space-y-28">
                    <div className="max-w-3xl">
                        <span className="text-[10px] uppercase tracking-[0.5em] font-bold block mb-3" style={{ color: 'var(--text-muted)' }}>
                            Talent Excellence
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-7">High Performance<br />Collaborations</h2>
                        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-sec)' }}>
                            We bridge the gap between creative excellence and corporate requirement.
                            Access a locked-down network of high-capital brand opportunities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { title: 'Verified Invoicing', desc: 'Professional financial layers for cross-border campaign payments and tax compliance.' },
                            { title: 'Performance Moats', desc: 'Secure your rates with data-backed conversion history verified by the protocol.' },
                            { title: 'Exclusive Access', desc: 'Priority access to proprietary brand campaigns not available on generic marketplaces.' }
                        ].map((item, i) => (
                            <div key={i} className="p-9 rounded-panel transition-all duration-500 group" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                                <span className="text-3xl font-black mb-8 block" style={{ color: 'rgba(255,255,255,0.05)' }}>0{i + 1}</span>
                                <h4 className="text-lg font-bold mb-3 tracking-tight" style={{ color: 'var(--text-prime)' }}>{item.title}</h4>
                                <p className="leading-relaxed text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-36 px-6 text-center" style={{ background: 'var(--bg-prime)' }}>
                <div className="max-w-4xl mx-auto space-y-14">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Monetize Your Authority.</h2>
                    <button
                        onClick={() => navigate('/register?role=creator')}
                        className="btn-executive px-20 py-4 text-[11px] uppercase tracking-[0.3em] font-black focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                    >
                        Join Talent Protocol
                    </button>
                    <p className="text-[10px] uppercase tracking-[0.4em] mt-6" style={{ color: 'var(--text-muted)' }}>
                        Professional Verification Mandatory.
                    </p>
                </div>
            </section>

            <footer className="py-16 px-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
                    <p className="text-[10px] uppercase tracking-[0.6em] font-bold opacity-30" style={{ color: 'var(--text-muted)' }}>
                        TheCollabify Creator Protocol © 2024. Authority Verified.
                    </p>
                </div>
            </footer>
        </MarketingLayout>
    );
};

export default ForCreators;

