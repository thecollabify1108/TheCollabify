import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiLocationMarker, HiCurrencyRupee, HiCalendar, HiChat, HiSparkles } from 'react-icons/hi';
import { availabilityAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../common/EmptyState';
import { SkeletonList } from '../common/Skeleton';
import toast from 'react-hot-toast';

const CreatorLeads = ({ brandLocation = '' }) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        location: brandLocation || '',
        niche: ''
    });
    const navigate = useNavigate();

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await availabilityAPI.getNearby({ 
                city: filter.location,
                niche: filter.niche 
            });
            setLeads(res.data.data.campaigns || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Failed to load creator leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [filter.location, filter.niche]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <HiSparkles className="text-primary-400" />
                        Creator Leads
                    </h2>
                    <p className="text-dark-400 text-sm font-medium">Discover creators actively looking for collaborations near you.</p>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        placeholder="Filter by city..."
                        value={filter.location}
                        onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-dark-800/50 border border-dark-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/50 w-40"
                    />
                    <select 
                        value={filter.niche}
                        onChange={(e) => setFilter(prev => ({ ...prev, niche: e.target.value }))}
                        className="bg-dark-800/50 border border-dark-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/50"
                    >
                        <option value="">All Categories</option>
                        {['Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <SkeletonList count={3} />
            ) : leads.length === 0 ? (
                <EmptyState 
                    icon="search-off"
                    title="No Leads Found"
                    description="No creators have raised requests in this area yet. Try adjusting your filters or search a nearby city."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leads.map((lead, index) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-5 rounded-premium-2xl border border-white/5 hover:border-primary-500/30 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-primary-500/10 text-primary-400 text-[10px] font-black px-2 py-1 rounded-full border border-primary-500/20 uppercase tracking-widest">
                                    {lead.niche}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                    {lead.creator?.user?.name?.charAt(0) || 'C'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold truncate">{lead.creator?.user?.name}</h3>
                                    <div className="flex items-center text-dark-400 text-[10px] font-bold uppercase tracking-widest">
                                        <HiLocationMarker className="mr-1 text-primary-500" />
                                        {lead.locationCity}, {lead.locationState}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-dark-800/30 rounded-xl mb-4 border border-white/5">
                                <p className="text-sm text-dark-300 italic line-clamp-2">"{lead.description}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                    <HiCurrencyRupee />
                                    ₹{lead.collaborationBudgetMin} - ₹{lead.collaborationBudgetMax}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                                    <HiCalendar />
                                    {lead.durationDays} Days Active
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/messages?user=${lead.creator.userId}&name=${lead.creator?.user?.name}`)}
                                className="w-full bg-white/5 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-primary-600 border border-white/10"
                            >
                                <HiChat />
                                Contact Creator
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreatorLeads;
