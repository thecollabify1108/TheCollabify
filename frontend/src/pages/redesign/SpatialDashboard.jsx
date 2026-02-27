import React from 'react';
import { motion } from 'framer-motion';

const SpatialDashboard = () => {
    return (
        <div className="flex min-h-screen bg-transparent p-8">
            {/* Sidebar Placeholder */}
            <aside className="w-64 flex flex-col space-y-4 pr-12">
                <div className="text-xl font-bold mb-12 flex items-center">
                    <div className="w-2 h-8 bg-primary-accent mr-3" />
                    AI LAB
                </div>
                {['Overview', 'Matches', 'Analytics', 'Settings'].map((item, i) => (
                    <div
                        key={item}
                        className={`py-3 px-6 rounded-xl cursor-pointer transition-all ${i === 0 ? 'text-primary-accent bg-primary-accent/10 font-bold' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
                    >
                        {item}
                    </div>
                ))}
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-8">
                <header className="flex justify-between items-center mb-16">
                    <h1 className="text-4xl font-semibold tracking-tight">Welcome back, Director.</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-bold">Admin Authority</div>
                            <div className="text-xs text-primary-accent uppercase tracking-widest">Level 04 Access</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-dark-800 border border-border-subtle shadow-lg" />
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-8">
                    {[
                        { label: 'Active Matches', value: '1,284', trend: '+12%' },
                        { label: 'Creator Reach', value: '4.2M', trend: '+5.4%' },
                        { label: 'Intelligence Score', value: '98.4%', trend: 'OPTIMAL' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ rotateX: 2, rotateY: 2, y: -5 }}
                            className="floating-slab p-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 text-xs font-mono text-primary-accent opacity-50">{stat.trend}</div>
                            <div className="text-sm text-dark-400 uppercase tracking-[0.2em] mb-4">{stat.label}</div>
                            <div className="text-5xl font-bold tracking-tight">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Panel */}
                <motion.div
                    whileHover={{ rotateX: 1, rotateY: 1 }}
                    className="floating-slab p-12 h-[500px] flex flex-col"
                >
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-2xl font-semibold mb-2">Real-time Intelligence Stream</h3>
                            <p className="text-dark-400 text-sm">Monitoring multi-vector alignment protocols.</p>
                        </div>
                        <div className="text-xs text-primary-accent flex items-center font-bold tracking-widest">
                            <span className="w-2 h-2 bg-primary-accent rounded-full mr-3 animate-pulse" />
                            LIVE FEED
                        </div>
                    </div>
                    <div className="flex-1 space-y-6 opacity-40">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-dark-800 rounded-2xl flex items-center px-8 border border-white/5">
                                <div className="w-10 h-10 rounded-lg bg-dark-700 mr-6" />
                                <div className="h-2 bg-dark-700 w-1/4 rounded-full" />
                                <div className="ml-auto h-2 bg-dark-700 w-24 rounded-full" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SpatialDashboard;
