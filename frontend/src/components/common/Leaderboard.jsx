import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCrown, FaTrophy, FaMedal, FaStar } from 'react-icons/fa';
import { publicAPI } from '../../services/api';

const Leaderboard = () => {
    const [period, setPeriod] = useState('allTime');
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);

    const periods = [
        { id: 'weekly', label: 'This Week' },
        { id: 'monthly', label: 'This Month' },
        { id: 'allTime', label: 'All Time' }
    ];

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await publicAPI.getLeaderboard({ period, limit: 10 });
                if (response.data.success) {
                    setCreators(response.data.data.creators);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [period]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 0: return <FaCrown className="w-8 h-8 text-yellow-400" />; // 1st
            case 1: return <FaMedal className="w-8 h-8 text-slate-300" />; // 2nd (Silver)
            case 2: return <FaMedal className="w-8 h-8 text-amber-600" />; // 3rd (Bronze)
            default: return <span className="text-xl font-bold text-dark-400 font-mono">#{rank + 1}</span>;
        }
    };

    if (loading) {
        return (
            <div className="py-24 px-4 bg-dark-900/30">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-dark-800 rounded w-1/3 mx-auto"></div>
                        <div className="h-96 bg-dark-800 rounded-3xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    const topThree = creators.slice(0, 3);
    const others = creators.slice(3);

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center p-3 rounded-full bg-yellow-500/10 mb-4"
                    >
                        <FaTrophy className="w-8 h-8 text-yellow-500" />
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Top Creators</span>
                    </h2>
                    <p className="text-dark-400 text-lg mb-8">
                        Celebrating our most successful and influential partners
                    </p>

                    {/* Period Selector */}
                    <div className="inline-flex bg-dark-800 rounded-xl p-1 mb-8">
                        {periods.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${period === p.id
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'text-dark-400 hover:text-dark-200'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12 max-w-3xl mx-auto">
                    {/* 2nd Place */}
                    {topThree[1] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6 text-center order-2 md:order-1 transform md:translate-y-8 relative"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                {getRankIcon(1)}
                            </div>
                            <div className="w-20 h-20 mx-auto rounded-full border-4 border-slate-300 overflow-hidden mb-4 bg-dark-700">
                                {topThree[1].user.avatar ? (
                                    <img src={topThree[1].user.avatar} alt={topThree[1].user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl text-slate-300 font-bold bg-dark-800">
                                        {topThree[1].user.name[0]}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-dark-100 truncate">{topThree[1].user.name}</h3>
                            <p className="text-sm text-dark-400 mb-2">@{topThree[1].instagramUsername}</p>
                            <div className="inline-flex items-center px-2 py-1 rounded bg-slate-500/10 text-slate-300 text-xs font-bold">
                                {topThree[1].calculatedScore?.toFixed(0) || '968'} pts
                            </div>
                        </motion.div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="glass-card p-8 text-center order-1 md:order-2 transform scale-110 border-yellow-500/30 shadow-yellow-500/10 relative z-10"
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                {getRankIcon(0)}
                            </div>
                            <div className="w-24 h-24 mx-auto rounded-full border-4 border-yellow-400 overflow-hidden mb-4 bg-dark-700 ring-4 ring-yellow-500/20">
                                {topThree[0].user.avatar ? (
                                    <img src={topThree[0].user.avatar} alt={topThree[0].user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl text-yellow-400 font-bold bg-dark-800">
                                        {topThree[0].user.name[0]}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-dark-100 truncate">{topThree[0].user.name}</h3>
                            <p className="text-dark-400 mb-3">@{topThree[0].instagramUsername}</p>
                            <div className="flex justify-center items-center gap-2 mb-2">
                                <span className="badge badge-warning">{topThree[0].category}</span>
                            </div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-bold">
                                {topThree[0].calculatedScore?.toFixed(0) || '1250'} pts
                            </div>
                        </motion.div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6 text-center order-3 md:order-3 transform md:translate-y-12 relative"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                {getRankIcon(2)}
                            </div>
                            <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-600 overflow-hidden mb-4 bg-dark-700">
                                {topThree[2].user.avatar ? (
                                    <img src={topThree[2].user.avatar} alt={topThree[2].user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl text-amber-600 font-bold bg-dark-800">
                                        {topThree[2].user.name[0]}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-dark-100 truncate">{topThree[2].user.name}</h3>
                            <p className="text-sm text-dark-400 mb-2">@{topThree[2].instagramUsername}</p>
                            <div className="inline-flex items-center px-2 py-1 rounded bg-amber-600/10 text-amber-600 text-xs font-bold">
                                {topThree[2].calculatedScore?.toFixed(0) || '850'} pts
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* List View for Others */}
                {others.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="glass-card divide-y divide-dark-700 max-w-3xl mx-auto overflow-hidden"
                    >
                        {others.map((creator, index) => (
                            <div
                                key={creator._id}
                                className="flex items-center p-4 hover:bg-dark-800/50 transition duration-200"
                            >
                                <div className="w-12 flex-shrink-0 text-center font-bold text-dark-400 text-lg">
                                    #{index + 4}
                                </div>
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-dark-700 mr-4 overflow-hidden">
                                    {creator.user.avatar ? (
                                        <img src={creator.user.avatar} alt={creator.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-dark-300 font-bold">
                                            {creator.user.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-semibold text-dark-100 truncate">{creator.user.name}</h4>
                                    <p className="text-sm text-dark-400 truncate">@{creator.instagramUsername} • {creator.category}</p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <div className="font-bold text-primary-400">{creator.calculatedScore?.toFixed(0) || '0'}</div>
                                    <div className="text-xs text-dark-500">points</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default Leaderboard;
