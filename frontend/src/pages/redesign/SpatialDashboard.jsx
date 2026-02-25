import React from 'react';
import { motion } from 'framer-motion';

const SpatialDashboard = () => {
    return (
        <div className="flex min-h-screen bg-transparent p-8">
            {/* Sidebar Placeholder */}
            <aside className="w-64 flex flex-col space-y-4 pr-12">
                <div className="text-xl font-bold mb-8">AI LAB</div>
                {['Overview', 'Matches', 'Analytics', 'Settings'].map((item, i) => (
                    <div
                        key={item}
                        className={`py-2 px-4 rounded-lg cursor-pointer transition-all ${i === 0 ? 'text-primary-accent border-l-4 border-primary-accent bg-primary-accent/5' : 'text-dark-400 hover:text-white'}`}
                    >
                        {item}
                    </div>
                ))}
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-8">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-semibold">Welcome back, Director.</h1>
                    <div className="flex space-x-4">
                        <div className="w-10 h-10 rounded-full bg-dark-800 border border-border-subtle" />
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { label: 'Active Matches', value: '1,284' },
                        { label: 'Creator Reach', value: '4.2M' },
                        { label: 'Intelligence Score', value: '98.4%' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ rotateX: 2, rotateY: 2, y: -5 }}
                            className="floating-slab p-8"
                        >
                            <div className="text-sm text-dark-400 uppercase tracking-widest mb-2">{stat.label}</div>
                            <div className="text-4xl font-bold">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Panel */}
                <motion.div
                    whileHover={{ rotateX: 1, rotateY: 1 }}
                    className="floating-slab p-8 h-[400px]"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-semibold">Real-time Intelligence Stream</h3>
                        <div className="text-xs text-primary-accent flex items-center">
                            <span className="w-2 h-2 bg-primary-accent rounded-full mr-2 animate-pulse" />
                            LIVE FEED
                        </div>
                    </div>
                    <div className="space-y-4 opacity-50">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-dark-800 rounded-lg flex items-center px-4">
                                <div className="w-8 h-8 rounded bg-dark-700 mr-4" />
                                <div className="h-4 bg-dark-700 w-1/3 rounded" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SpatialDashboard;
