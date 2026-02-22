import { useState } from 'react';
import { motion } from 'framer-motion';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import SmartRecommendationsPanel from './SmartRecommendationsPanel';
import { creatorAPI } from '../../services/api';
import EmptyState from '../common/EmptyState';

/**
 * Enhanced Creator Search Interface
 * Advanced search with filters and AI recommendations
 */
const EnhancedCreatorSearch = ({ onSearch, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [results, setResults] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (newFilters) => {
        setFilters(newFilters);
        setLoading(true);
        try {
            const res = await creatorAPI.searchCreators({
                q: searchQuery,
                ...newFilters
            });
            if (res.data.success) {
                setResults(res.data.data.creators || []);
                onSearch?.(res.data.data.creators || []);
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Filters */}
            <AdvancedSearchFilters
                onApplyFilters={handleSearch}
                initialFilters={filters}
            />

            {/* Toggle Recommendations */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-dark-100">
                    {results.length} Creators Found
                </h3>
                <button
                    onClick={() => setShowRecommendations(!showRecommendations)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                    {showRecommendations ? 'Hide' : 'Show'} AI Recommendations
                </button>
            </div>

            {/* AI Recommendations */}
            {showRecommendations && (
                <SmartRecommendationsPanel
                    campaign={{
                        targetNiche: filters.categories?.[0] || 'Lifestyle',
                        minFollowers: filters.followerRange?.min || 1000,
                        maxFollowers: filters.followerRange?.max || 100000,
                        budget: filters.priceRange?.max || 50000,
                        promotionType: 'Post'
                    }}
                    allCreators={results}
                    onInvite={(creators) => {
                        console.log('Inviting:', creators);
                    }}
                />
            )}

            {/* Search Results Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {results.map((creator, index) => (
                    <motion.div
                        key={creator._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelect?.(creator)}
                        className="bg-dark-800/40 backdrop-blur-md border border-dark-700/50 hover:border-primary-500/30 rounded-premium-xl p-s5 cursor-pointer transition-all group shadow-md hover:shadow-premium"
                    >
                        {/* Avatar */}
                        <div className="flex items-center gap-s3 mb-s4">
                            <div className="w-12 h-12 rounded-premium-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-black shadow-glow border border-white/10">
                                {creator.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <h4 className="text-body font-black text-dark-100 truncate uppercase tracking-tight">
                                        {creator.name}
                                    </h4>
                                    {creator.isVerified && <span className="text-blue-400 text-sm">✓</span>}
                                </div>
                                <p className="text-[10px] font-black text-dark-500 uppercase tracking-widest">{creator.category}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-s2 mb-s4 bg-dark-900/40 p-s3 rounded-premium-lg border border-dark-700/30">
                            <div className="flex justify-between items-center text-xs-pure">
                                <span className="text-dark-400 font-bold uppercase tracking-tighter">Followers</span>
                                <span className="text-dark-100 font-black">
                                    {creator.followerCount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs-pure">
                                <span className="text-dark-400 font-bold uppercase tracking-tighter">Engagement</span>
                                <span className="text-primary-400 font-black">
                                    {creator.engagementRate}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs-pure">
                                <span className="text-dark-400 font-bold uppercase tracking-tighter">Rating</span>
                                <span className="text-amber-400 font-black">
                                    ⭐ {creator.rating}
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="pt-s4 border-t border-dark-700/50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Starting from</span>
                            <span className="text-h3 font-black text-dark-100">
                                ₹{creator.pricing.min.toLocaleString()}
                            </span>
                        </div>

                        {/* Status Badge */}
                        {creator.isAvailable && (
                            <div className="mt-s4 px-s3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-premium-full text-[10px] font-black text-center uppercase tracking-widest shadow-sm">
                                Available Now
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {results.length === 0 && !loading && (
                <EmptyState
                    icon="search-off"
                    title="No Creators Found"
                    description="We couldn't find any creators matching your current filters. Try expanding your search radius or selecting broader categories."
                    actionLabel="Clear Filters"
                    onAction={() => setFilters({})}
                />
            )}
        </div>
    );
};

export default EnhancedCreatorSearch;
