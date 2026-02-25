import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CollabifyCore from '../components/effects/CollabifyCore';
import MarketingLayout from '../components/layout/MarketingLayout';

const easeOut = [0.16, 1, 0.3, 1];

const ForBrands = () => {
    const navigate = useNavigate();

    return (
        <MarketingLayout>
            <CollabifyCore mode="brands" />

            <header className="relative min-h-screen flex items-center pt-28 px-6 pb-20">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.2, ease: easeOut }}
                        >
                            <span className="text-[10px] uppercase tracking-[0.5em] font-bold block mb-8" style={{ color: 'var(--text-muted)' }}>
                                Brand Protocol IA_02
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black mb-10 leading-[1.05] tracking-tighter">
                                Influence as<br />
                                <span style={{ opacity: 0.28 }}>Capital.</span>
                            </h1>
                            <p className="text-xl leading-relaxed max-w-xl font-medium mb-12" style={{ color: 'var(--text-sec)' }}>
                                Stop chasing engagement. Start acquiring influence.
                                Our protocol identifies proprietary data moats within the creator economy to scale your brand with institutional precision.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button
                                    onClick={() => navigate('/register?role=seller')}
                                    className="btn-executive px-10 py-4 text-[11px] uppercase tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                                >
                                    Initiate Campaign
                                </button>
                                <button
                                    onClick={() => navigate('/demo')}
                                    className="btn-secondary-exec px-10 py-4 text-[11px] uppercase tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                                >
                                    View Metrics
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-20 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.03)', filter: 'blur(100px)' }} />
                        <div className="glass-card aspect-square flex flex-col items-center justify-center p-10 preserve-3d" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8" style={{ color: 'var(--text-muted)' }}>
                                Data Node Verification
                            </div>
                            <div className="w-full space-y-4 opacity-40">
                                {[94, 88, 99, 91].map((val, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between text-[10px] font-mono" style={{ color: 'var(--text-sec)' }}>
                                            <span>NODE_{i + 102}</span>
                                            <span>{val}%</span>
                                        </div>
                                        <div className="h-px w-full" style={{ background: 'var(--surface-3)' }}>
                                            <div className="h-full" style={{ width: `${val}%`, background: 'var(--text-prime)' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-36 px-6 border-y" style={{ background: 'var(--surface-1)', borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="max-w-7xl mx-auto space-y-28">
                    <div className="max-w-3xl">
                        <span className="text-[10px] uppercase tracking-[0.5em] font-bold block mb-3" style={{ color: 'var(--text-muted)' }}>
                            The Moat Strategy
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-7">Institutional Grade<br />Infrastructure</h2>
                        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-sec)' }}>
                            We provide the analytical depth required for complex brand scaling.
                            Move beyond vanity metrics into real audience sentiment and conversion parity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { title: 'Audience Integrity', desc: 'Hardware-level detection of synthetic clusters and engagement manipulation.' },
                            { title: 'Conversion Parity', desc: 'Historical data mapping to predict actual purchase intent across verticals.' },
                            { title: 'Secure Escrow', desc: 'Payment protocols that only release capital upon verified milestone completion.' }
                        ].map((item, i) => (
                            <div key={i} className="p-9 rounded-panel transition-all duration-500 group" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                                <span className="text-3xl font-black mb-8 block transition-colors" style={{ color: 'rgba(255,255,255,0.05)' }}>0{i + 1}</span>
                                <h4 className="text-lg font-bold mb-3 tracking-tight" style={{ color: 'var(--text-prime)' }}>{item.title}</h4>
                                <p className="leading-relaxed text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-36 px-6 text-center" style={{ background: 'var(--bg-prime)' }}>
                <div className="max-w-4xl mx-auto space-y-14">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Scale with Authority.</h2>
                    <button
                        onClick={() => navigate('/register?role=seller')}
                        className="btn-executive px-20 py-4 text-[11px] uppercase tracking-[0.3em] font-black focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                    >
                        Open Institutional Account
                    </button>
                    <p className="text-[10px] uppercase tracking-[0.4em] mt-6" style={{ color: 'var(--text-muted)' }}>
                        Verified Brand Access Only.
                    </p>
                </div>
            </section>

            <footer className="py-16 px-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
                    <p className="text-[10px] uppercase tracking-[0.6em] font-bold opacity-30" style={{ color: 'var(--text-muted)' }}>
                        TheCollabify Brand Protocol © 2024. Authority Verified.
                    </p>
                </div>
            </footer>
        </MarketingLayout>
    );
};

export default ForBrands;

