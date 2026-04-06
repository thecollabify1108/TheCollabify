import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiLocationMarker, HiCurrencyRupee, HiCalendar, HiChat, HiSparkles } from 'react-icons/hi';
import { availabilityAPI, chatAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../common/EmptyState';
import { SkeletonList } from '../common/Skeleton';
import toast from 'react-hot-toast';

const CreatorLeads = ({ brandLocation = '' }) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contactingId, setContactingId] = useState(null);
    const [requiresLocation, setRequiresLocation] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const [filter, setFilter] = useState({
        location: brandLocation || '',
        niche: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('sellerNearbyCity');
        const initial = (brandLocation || saved || '').trim();

        if (initial) {
            setFilter(prev => ({ ...prev, location: initial }));
            setLocationInput(initial);
            setRequiresLocation(false);
        } else {
            setRequiresLocation(true);
        }
    }, [brandLocation]);

    const fetchLeads = useCallback(async () => {
        const trimmedCity = (filter.location || '').trim();
        if (!trimmedCity) {
            setLeads([]);
            setLoading(false);
            setRequiresLocation(true);
            return;
        }

        setLoading(true);
        try {
            const res = await availabilityAPI.getNearby({ 
                city: trimmedCity,
                niche: filter.niche 
            });
            setLeads(res.data.data.campaigns || []);
            setRequiresLocation(false);
        } catch (error) {
            console.error('Error fetching leads:', error);
            if (error?.response?.data?.errorCode === 'LOCATION_REQUIRED') {
                setRequiresLocation(true);
                setLeads([]);
            } else {
                toast.error('Failed to load creator leads');
            }
        } finally {
            setLoading(false);
        }
    }, [filter.location, filter.niche]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleSetLocation = () => {
        const trimmed = locationInput.trim();
        if (!trimmed) {
            toast.error('Please enter your city to see nearby creators');
            return;
        }

        localStorage.setItem('sellerNearbyCity', trimmed);
        setFilter(prev => ({ ...prev, location: trimmed }));
        setRequiresLocation(false);
    };

    const handleContactCreator = async (lead) => {
        if (contactingId) return; // prevent double-click
        setContactingId(lead.id);
        try {
            // Prefer creator.id (which is creatorProfileId) or creator.userId
            const creatorUserId = lead.creator?.userId || lead.creator?.user?.id;
            
            if (!creatorUserId) {
                toast.error('Unable to contact creator - missing ID');
                setContactingId(null);
                return;
            }
            
            // Try to start a conversation via the chat API
            const res = await chatAPI.sendMessageRequest(creatorUserId);
            const conversationId = res?.data?.data?.conversation?.id || res?.data?.data?.id;
            if (conversationId) {
                navigate(`/messages?c=${conversationId}`);
                toast.success('Conversation started!');
            } else {
                // Fallback: Go to messages with the user
                navigate(`/messages?user=${creatorUserId}&name=${lead.creator?.user?.name}`);
                toast.success('Opening messages...');
            }
        } catch (error) {
            console.error('Error contacting creator:', error);
            // If conversation already exists, try to navigate to messages
            if (error?.response?.status === 409) {
                const creatorUserId = lead.creator?.userId || lead.creator?.user?.id;
                navigate(`/messages?user=${creatorUserId}&name=${lead.creator?.user?.name}`);
                toast.success('Opening existing conversation');
            } else {
                const errorMsg = error?.response?.data?.message || 'Failed to start conversation. Try again.';
                toast.error(errorMsg);
            }
        } finally {
            setContactingId(null);
        }
    };

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
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilter(prev => ({ ...prev, location: value }));
                            setLocationInput(value);
                        }}
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

            {requiresLocation && (
                <div className="glass-card p-5 rounded-premium-2xl border border-amber-500/30 bg-amber-500/5">
                    <h3 className="text-white font-bold mb-2">Set your location to view nearby creators</h3>
                    <p className="text-dark-300 text-sm mb-4">
                        Nearby discovery is location-locked. Enter your city to continue.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Enter seller city"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            className="bg-dark-800/60 border border-dark-700/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/60"
                        />
                        <button
                            onClick={handleSetLocation}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-dark-900 font-bold"
                        >
                            Use this location
                        </button>
                    </div>
                </div>
            )}

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
                                <p className="text-sm text-dark-300 italic line-clamp-2">{lead.description}</p>
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
                                onClick={() => handleContactCreator(lead)}
                                disabled={contactingId === lead.id}
                                className="w-full bg-white/5 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-primary-600 border border-white/10 disabled:opacity-50"
                            >
                                <HiChat />
                                {contactingId === lead.id ? 'Starting...' : 'Contact Creator'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreatorLeads;

