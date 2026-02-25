import React from 'react';
import { motion } from 'framer-motion';

const ForCreatorsRedesign = () => {
    return (
        <div className="min-h-screen py-24 px-12">
            <header className="max-w-4xl mb-24">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-semibold mb-8"
                >
                    Be discovered by the <span className="text-secondary-accent">right</span> brands.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-dark-300"
                >
                    Stop chasing algorithms. Start building partnerships that align with your creative vision.
                </motion.p>
            </header>

            <div className="grid grid-cols-2 gap-12">
                {[
                    { title: 'AI Profile Intelligence', desc: 'Your profile is automatically optimized for brand search queries.' },
                    { title: 'Opportunity Matching', desc: 'Receive pings from brands that truly match your content style.' },
                    { title: 'Earnings Tracking', desc: 'Transparent revenue streams and performance-based bonus tracking.' },
                    { title: 'Growth Insights', desc: 'AI-generated tips on how to increase your market value.' }
                ].map((feat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -10 }}
                        className="floating-slab p-12"
                    >
                        <h3 className="text-2xl font-bold mb-4 text-secondary-accent">{feat.title}</h3>
                        <p className="text-dark-400">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ForCreatorsRedesign;
