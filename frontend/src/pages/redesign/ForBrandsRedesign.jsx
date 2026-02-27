import React from 'react';
import { motion } from 'framer-motion';

const ForBrandsRedesign = () => {
    return (
        <div className="min-h-screen py-32 px-12 max-w-7xl mx-auto">
            <header className="max-w-4xl mb-32">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-primary-accent font-mono tracking-[0.5em] uppercase text-xs mb-6"
                >
                    Protocol: Enterprise
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[5vw] font-semibold mb-8 leading-tight"
                >
                    Scale with Intelligence.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl text-dark-300 max-w-3xl leading-relaxed"
                >
                    Deploy your brand strategy across a network of creators matched to your specific ROI objectives using neural alignment.
                </motion.p>
            </header>

            <div className="grid grid-cols-2 gap-12">
                {[
                    { title: 'Campaign Intelligence', desc: 'Predict campaign performance before you spend a single dollar with 94% confidence.' },
                    { title: 'Smart Discovery', desc: 'Auto-filter creators who actually overlap with your target demographic through deep data mining.' },
                    { title: 'ROI Tracking', desc: 'A unified dashboard for all your conversion and engagement data, processed in real-time.' },
                    { title: 'Portfolio Management', desc: 'Manage hundreds of creator relationships effortlessly with AI-powered contextual messaging.' }
                ].map((feat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -10, rotateX: 1, rotateY: 1 }}
                        className="floating-slab p-16"
                    >
                        <h3 className="text-3xl font-bold mb-6 tracking-tight">{feat.title}</h3>
                        <p className="text-xl text-dark-400 leading-relaxed">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-48 text-center pb-32">
                <h2 className="text-5xl font-semibold mb-12">Ready to evolve?</h2>
                <button className="btn-primary-spatial px-16 py-8 text-2xl">Request Enterprise Access</button>
            </div>
        </div>
    );
};

export default ForBrandsRedesign;
