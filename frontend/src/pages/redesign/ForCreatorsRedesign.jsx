import React from 'react';
import { motion } from 'framer-motion';

const ForCreatorsRedesign = () => {
    return (
        <div className="min-h-screen py-32 px-12 max-w-7xl mx-auto">
            <header className="max-w-4xl mb-32">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-secondary-accent font-mono tracking-[0.5em] uppercase text-xs mb-6"
                >
                    Protocol: Talent
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[5vw] font-semibold mb-8 leading-tight"
                >
                    Be discovered by the <span className="text-secondary-accent">right</span> brands.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl text-dark-300 max-w-3xl leading-relaxed"
                >
                    Stop chasing algorithms. Start building partnerships that align with your creative vision and growth trajectory.
                </motion.p>
            </header>

            <div className="grid grid-cols-2 gap-12">
                {[
                    { title: 'AI Profile Intelligence', desc: 'Your profile is automatically optimized and indexed for high-value brand search queries.' },
                    { title: 'Opportunity Matching', desc: 'Receive secure pings from brands that truly match your content style and audience values.' },
                    { title: 'Earnings Tracking', desc: 'Transparent revenue streams and automated performance-based bonus tracking.' },
                    { title: 'Growth Insights', desc: 'Receive data-driven recommendations on how to increase your market value and reach.' }
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
                        <h3 className="text-3xl font-bold mb-6 tracking-tight text-secondary-accent">{feat.title}</h3>
                        <p className="text-xl text-dark-400 leading-relaxed">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-48 text-center pb-32">
                <h2 className="text-5xl font-semibold mb-12">Claim your identity.</h2>
                <button className="btn-primary-spatial px-16 py-8 text-2xl !bg-secondary-accent">Join the Network</button>
            </div>
        </div>
    );
};

export default ForCreatorsRedesign;
