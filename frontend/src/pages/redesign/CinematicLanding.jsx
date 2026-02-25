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
    const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.8]);
    const heroZ = useTransform(smoothProgress, [0, 0.15], [0, -500]);

    // Scene 2: Problem
    const problemOpacity = useTransform(smoothProgress, [0.1, 0.2, 0.3], [0, 1, 0]);
    const problemY = useTransform(smoothProgress, [0.1, 0.2, 0.3], [100, 0, -100]);

    return (
        <div className="relative text-white overflow-hidden">
            {/* SCENE 1: HERO */}
            <motion.div
                style={{ opacity: heroOpacity, scale: heroScale, translateZ: heroZ }}
                className="h-screen flex flex-col items-center justify-center text-center px-4"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[64px] font-semibold tracking-[-0.02em] leading-tight max-w-4xl"
                >
                    Intelligence decides the right match.
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
                    <button className="text-dark-300 hover:text-white transition-colors">Learn more</button>
                </motion.div>
            </motion.div>

            {/* SCENE 2: PROBLEM */}
            <motion.div
                style={{ opacity: problemOpacity, y: problemY }}
                className="h-screen flex flex-col items-center justify-center text-center px-4 sticky top-0"
            >
                <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-5">
                    <span className="text-[20vw] font-bold uppercase">Guesswork.</span>
                </div>
                <h2 className="text-5xl font-semibold leading-snug max-w-3xl">
                    Most collaborations rely on chance.<br />
                    <span className="text-primary-accent text-6xl mt-4 block">We rely on data.</span>
                </h2>
            </motion.div>

            {/* SCENE 3: THE ENGINE (Placeholder for now) */}
            <div className="h-[200vh] pointer-events-none" />

            {/* Additional scenes will be expanded here */}
            <Scene className="items-center">
                <div className="floating-slab p-12 max-w-6xl w-full grid grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-4xl font-semibold mb-6">The Engine</h3>
                        <p className="text-lg text-dark-300">
                            Our core processing unit transforms chaotic creator data into structured partnership insights.
                        </p>
                    </div>
                    <div className="aspect-square bg-dark-800 rounded-lg border border-border-subtle overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-accent/20 to-secondary-accent/20 blur-2xl" />
                    </div>
                </div>
            </Scene>

            {/* SCENE 5: DUAL PATH */}
            <Scene>
                <div className="grid grid-cols-2 gap-px bg-border-subtle h-[60vh] rounded-2xl overflow-hidden border border-border-subtle">
                    <div className="bg-bg-base hover:bg-bg-radial transition-colors p-12 flex flex-col justify-end group">
                        <span className="text-sm uppercase tracking-widest text-primary-accent mb-2">Enterprise</span>
                        <h4 className="text-4xl font-semibold">For Brands</h4>
                        <p className="mt-4 text-dark-400 group-hover:text-dark-100 transition-colors">Scale your influence with intelligence.</p>
                    </div>
                    <div className="bg-bg-base hover:bg-bg-radial transition-colors p-12 flex flex-col justify-end group">
                        <span className="text-sm uppercase tracking-widest text-secondary-accent mb-2">Talent</span>
                        <h4 className="text-4xl font-semibold">For Creators</h4>
                        <p className="mt-4 text-dark-400 group-hover:text-dark-100 transition-colors">Unlock opportunities matched to your soul.</p>
                    </div>
                </div>
            </Scene>

            <Scene className="items-center py-24">
                <h2 className="text-4xl font-semibold mb-16 underline decoration-primary-accent underline-offset-8">Metrics That Matter</h2>
                <div className="grid grid-cols-4 gap-12 w-full max-w-6xl">
                    {[
                        { label: 'Matches', value: '12K+' },
                        { label: 'Retention', value: '94%' },
                        { label: 'Accuracy', value: '99.2%' },
                        { label: 'ROI', value: '4.2x' },
                    ].map((m, i) => (
                        <div key={i} className="floating-slab p-8 text-center">
                            <div className="text-4xl font-bold mb-2">{m.value}</div>
                            <div className="text-sm text-dark-400 uppercase tracking-widest">{m.label}</div>
                        </div>
                    ))}
                </div>
            </Scene>

            <div className="h-[20vh]" />
        </div>
    );
};

export default CinematicLanding;
