import { creatorAPI } from '../../services/api';

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
                        className="bg-dark-900 border border-dark-800 hover:border-purple-500 rounded-xl p-4 cursor-pointer transition-all group"
                    >
                        {/* Avatar */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                {creator.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <h4 className="font-semibold text-dark-100 truncate">
                                        {creator.name}
                                    </h4>
                                    {creator.isVerified && <span className="text-blue-400 text-sm">✓</span>}
                                </div>
                                <p className="text-xs text-dark-500">{creator.category}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-500">Followers</span>
                                <span className="text-dark-100 font-semibold">
                                    {creator.followerCount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-500">Engagement</span>
                                <span className="text-purple-400 font-semibold">
                                    {creator.engagementRate}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-500">Rating</span>
                                <span className="text-yellow-400 font-semibold">
                                    ⭐ {creator.rating}
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="pt-3 border-t border-dark-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-dark-500">Starting from</span>
                                <span className="text-lg font-bold text-dark-100">
                                    ₹{creator.pricing.min.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        {creator.isAvailable && (
                            <div className="mt-3 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium text-center">
                                Available Now
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {results.length === 0 && (
                <div className="text-center py-20">
                    <FaSearch className="text-6xl text-dark-700 mx-auto mb-4" />
                    <p className="text-dark-400 text-lg">No creators found</p>
                    <p className="text-dark-500 text-sm mt-2">Try adjusting your filters</p>
                </div>
            )}
        </div>
    );
};

export default EnhancedCreatorSearch;
