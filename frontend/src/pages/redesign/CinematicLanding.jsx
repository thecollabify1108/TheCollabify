import React, { useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const Scene = ({ children, className = "" }) => (
    <section className={`min-h-screen relative flex flex-col justify-center px-12 ${className}`}>
        {children}
    </section>
);

const CinematicLanding = () => {
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // Scene 1: Hero
    const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
    const heroScale = useTransform(smoothProgress, [0, 0.1], [1, 0.8]);
    const heroZ = useTransform(smoothProgress, [0, 0.1], [0, -500]);

    // Scene 2: Problem
    const problemOpacity = useTransform(smoothProgress, [0.1, 0.2, 0.3], [0, 1, 0]);
    const problemY = useTransform(smoothProgress, [0.1, 0.2, 0.3], [100, 0, -100]);

    // Scene 3: The Engine
    const engineOpacity = useTransform(smoothProgress, [0.35, 0.45, 0.55], [0, 1, 0]);
    const engineZ = useTransform(smoothProgress, [0.35, 0.45, 0.55], [-200, 0, -200]);

    // Scene 4: Feature Morph
    const featureOpacity = useTransform(smoothProgress, [0.55, 0.65, 0.75], [0, 1, 0]);

    const [activeFeature, setActiveFeature] = useState(0);
    const features = [
        { title: 'AI Matching', desc: 'Neural cross-referencing for perfect brand-creator alignment.' },
        { title: 'Smart Messaging', desc: 'Automated negotiation with human-like contextual awareness.' },
        { title: 'Campaign Analytics', desc: 'Predictive ROI modeling for every creator partnership.' },
        { title: 'Predictive Insights', desc: 'Future-proof your strategy with data-driven trend analysis.' }
    ];

    return (
        <div className="relative text-white overflow-hidden bg-transparent">
            {/* SCENE 1: HERO */}
            <motion.div
                style={{ opacity: heroOpacity, scale: heroScale, translateZ: heroZ }}
                className="h-screen flex flex-col items-center justify-center text-center px-4 sticky top-0"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[8vw] md:text-[64px] font-semibold tracking-[-0.02em] leading-tight max-w-4xl"
                >
                    Intelligence decides <br /> the right match.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 text-xl text-dark-300 max-w-2xl text-balance"
                >
                    A data-driven engine connecting brands and creators with precision.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-12 flex space-x-6"
                >
                    <button className="btn-primary-spatial">Start Matching</button>
                    <button className="text-dark-300 hover:text-white transition-colors">Login to Lab</button>
                </motion.div>
            </motion.div>

            {/* SCENE 2: PROBLEM */}
            <motion.div
                style={{ opacity: problemOpacity, y: problemY }}
                className="h-screen flex flex-col items-center justify-center text-center px-4 sticky top-0"
            >
                <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-5">
                    <span className="text-[25vw] font-bold uppercase select-none">Guesswork.</span>
                </div>
                <h2 className="text-5xl font-semibold leading-snug max-w-3xl text-balance">
                    Most collaborations rely on chance.<br />
                    <span className="text-primary-accent text-6xl mt-4 block">We rely on data.</span>
                </h2>
            </motion.div>

            {/* SCENE 3: THE ENGINE */}
            <motion.div
                style={{ opacity: engineOpacity, translateZ: engineZ }}
                className="h-screen flex items-center justify-center px-12 sticky top-0"
            >
                <div className="floating-slab p-16 max-w-6xl w-full grid grid-cols-2 gap-24 items-center">
                    <div>
                        <h3 className="text-5xl font-semibold mb-8">The Engine</h3>
                        <p className="text-xl text-dark-300 leading-relaxed">
                            Our core processing unit transforms chaotic creator data into structured partnership insights. Every match is intentional.
                        </p>
                        <div className="mt-12 space-y-4">
                            {['99.2% Accuracy', 'Real-time Processing', 'Multi-vector Matching'].map(tag => (
                                <div key={tag} className="flex items-center text-sm font-medium text-primary-accent">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-accent mr-3" />
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="aspect-square bg-dark-800 rounded-2xl border border-border-subtle overflow-hidden relative shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/40 to-transparent blur-3xl scale-150 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 rounded-full border border-primary-accent/30 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-primary-accent/20 blur-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* SCENE 4: FEATURE MORPH */}
            <motion.div
                style={{ opacity: featureOpacity }}
                className="h-[150vh] flex items-center justify-center px-12 relative"
            >
                <div className="sticky top-1/4 grid grid-cols-2 gap-24 w-full max-w-6xl">
                    <div className="space-y-4">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                onMouseEnter={() => setActiveFeature(i)}
                                className={`p-8 rounded-2xl border transition-all cursor-pointer ${activeFeature === i
                                        ? 'bg-primary-accent/5 border-primary-accent/50 translate-x-4'
                                        : 'bg-transparent border-transparent text-dark-400'
                                    }`}
                            >
                                <h4 className={`text-2xl font-semibold mb-2 ${activeFeature === i ? 'text-white' : ''}`}>{f.title}</h4>
                                {activeFeature === i && <p className="text-dark-300 text-sm">{f.desc}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="relative flex items-center justify-center">
                        <motion.div
                            key={activeFeature}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full aspect-video floating-slab overflow-hidden flex items-center justify-center border-2 border-primary-accent/20"
                        >
                            <span className="text-sm font-mono tracking-widest text-primary-accent opacity-50 uppercase">
                                Initializing {features[activeFeature].title}
                            </span>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* SCENE 5: DUAL PATH */}
            <div className="min-h-screen py-48 px-12 flex flex-col justify-center">
                <h2 className="text-5xl font-semibold text-center mb-24">Choose your protocol.</h2>
                <div className="grid grid-cols-2 gap-8 h-[60vh] max-w-7xl mx-auto w-full">
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-bg-radial border border-border-subtle hover:border-primary-accent transition-all p-16 flex flex-col justify-end group rounded-3xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 select-none">01</div>
                        <span className="text-sm uppercase tracking-widest text-primary-accent mb-2">Enterprise</span>
                        <h4 className="text-5xl font-semibold">For Brands</h4>
                        <p className="mt-6 text-xl text-dark-400 group-hover:text-dark-100 transition-colors max-w-md">Scale your influence with neural matching and predictive analytics.</p>
                        <button className="mt-12 btn-primary-spatial w-fit">Get Started</button>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-bg-radial border border-border-subtle hover:border-secondary-accent transition-all p-16 flex flex-col justify-end group rounded-3xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 select-none">02</div>
                        <span className="text-sm uppercase tracking-widest text-secondary-accent mb-2">Talent</span>
                        <h4 className="text-5xl font-semibold">For Creators</h4>
                        <p className="mt-6 text-xl text-dark-400 group-hover:text-dark-100 transition-colors max-w-md">Unlock opportunities matched to your content soul and growth goals.</p>
                        <button className="mt-12 btn-primary-spatial w-fit !bg-secondary-accent">Join the Lab</button>
                    </motion.div>
                </div>
            </div>

            <Scene className="items-center py-48">
                <h2 className="text-4xl font-semibold mb-24 opacity-50 uppercase tracking-[.5em]">The Network</h2>
                <div className="grid grid-cols-4 gap-8 w-full max-w-7xl">
                    {[
                        { label: 'Intelligence Nodes', value: '12,042' },
                        { label: 'Processing Speed', value: '<250ms' },
                        { label: 'Data Points', value: '1.4B' },
                        { label: 'Active ROI', value: '428%' },
                    ].map((m, i) => (
                        <div key={i} className="floating-slab p-12 text-center border-t-4 border-t-primary-accent/20">
                            <div className="text-5xl font-bold mb-4">{m.value}</div>
                            <div className="text-sm text-dark-400 uppercase tracking-widest font-mono">{m.label}</div>
                        </div>
                    ))}
                </div>
            </Scene>

            <Scene className="items-center min-h-[50vh] pb-48 text-center">
                <h2 className="text-6xl font-semibold mb-8">Build partnerships intelligently.</h2>
                <p className="text-dark-400 text-xl max-w-xl mb-12">The AI Lab is open for pioneering brands and creators.</p>
                <button className="btn-primary-spatial px-12 py-6 text-xl">Initialize Access</button>
            </Scene>

            <div className="h-[20vh]" />
        </div>
    );
};

export default CinematicLanding;
