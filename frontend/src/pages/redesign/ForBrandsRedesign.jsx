import React from 'react';
import { motion } from 'framer-motion';

const ForBrandsRedesign = () => {
    return (
        <div className="min-h-screen py-24 px-12">
            <header className="max-w-4xl mb-24">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-semibold mb-8"
                >
                    Scale with Intelligence.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-dark-300"
                >
                    Deploy your brand strategy across a network of creators matched to your specific ROI objectives.
                </motion.p>
            </header>

            <div className="grid grid-cols-2 gap-12">
                {[
                    { title: 'Campaign Intelligence', desc: 'Predict campaign performance before you spend a single dollar.' },
                    { title: 'Smart Discovery', desc: 'Find creators who actually overlap with your target demographic.' },
                    { title: 'ROI Tracking', desc: 'Unified dashboard for all your conversion and engagement data.' },
                    { title: 'Portfolio Management', desc: 'Manage hundreds of creator relationships with AI-powered messaging.' }
                ].map((feat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -10 }}
                        className="floating-slab p-12"
                    >
                        <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
                        <p className="text-dark-400">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ForBrandsRedesign;
