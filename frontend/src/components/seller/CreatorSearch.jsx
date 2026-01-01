import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaRedo, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { HiSparkles, HiUsers, HiTrendingUp, HiCash } from 'react-icons/hi';
import { sellerAPI } from '../../services/api';
import CreatorCard from './CreatorCard';

const CreatorSearch = () => {
    const [loading, setLoading] = useState(false);
    const [creators, setCreators] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 1
    });

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        category: 'All',
        minFollowers: '',
        maxFollowers: '',
        minEngagement: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'matchScore'
    });

    const categories = [
        'All', 'Fashion', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle',
        'Beauty', 'Gaming', 'Education', 'Entertainment', 'Health', 'Business'
    ];

    const fetchCreators = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === 'All') {
                    delete params[key];
                }
            });

            const response = await sellerAPI.searchCreators(params);
            if (response.data.success) {
                setCreators(response.data.data.creators);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch creators:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timeout = setTimeout(() => {
            fetchCreators();
        }, 500);

        return () => clearTimeout(timeout);
    }, [filters, pagination.page]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            category: 'All',
            minFollowers: '',
            maxFollowers: '',
            minEngagement: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'matchScore'
        });
        setShowFilters(false);
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Count active filters
    const activeFiltersCount = Object.values(filters).filter(
        (val, idx) => val !== '' && val !== 'All' && val !== 'matchScore'
    ).length;

    return (
        <div className="space-y-4">
            {/* Header with Search & Filter Toggle */}
            <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-4 text-dark-400" />
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search creators by name or bio..."
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-100 placeholder-dark-500 focus:border-primary-500/50 focus:outline-none transition"
                    />
                </div>

                {/* Filter Toggle & Sort */}
                <div className="flex items-center gap-2">
                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition ${showFilters || activeFiltersCount > 0
                                ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                                : 'bg-dark-800/50 border-dark-700/50 text-dark-300 hover:border-dark-600'
                            }`}
                    >
                        <FaFilter className="text-sm" />
                        <span className="font-medium">Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                        {showFilters ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </button>

                    {/* Sort Dropdown */}
                    <select
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        className="flex-1 px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-100 focus:border-primary-500/50 focus:outline-none transition"
                    >
                        <option value="matchScore">Best Match</option>
                        <option value="followers_desc">Most Followers</option>
                        <option value="engagement">Top Engagement</option>
                        <option value="price_asc">Lowest Price</option>
                    </select>
                </div>
            </div>

            {/* Collapsible Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-dark-100">Filter Creators</h3>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                >
                                    <FaRedo className="text-xs" />
                                    Reset All
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="text-xs font-medium text-dark-400 mb-2 block">CATEGORY</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categories.slice(0, 9).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filters.category === cat
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-700/50 text-dark-300 hover:bg-dark-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Followers Range */}
                            <div>
                                <label className="text-xs font-medium text-dark-400 mb-2 block">FOLLOWERS</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        name="minFollowers"
                                        value={filters.minFollowers}
                                        onChange={handleFilterChange}
                                        placeholder="Min (e.g. 10000)"
                                        className="px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600/50 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none"
                                    />
                                    <input
                                        type="number"
                                        name="maxFollowers"
                                        value={filters.maxFollowers}
                                        onChange={handleFilterChange}
                                        placeholder="Max (e.g. 100000)"
                                        className="px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600/50 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Engagement */}
                            <div>
                                <label className="text-xs font-medium text-dark-400 mb-2 block">MIN ENGAGEMENT RATE (%)</label>
                                <input
                                    type="number"
                                    name="minEngagement"
                                    value={filters.minEngagement}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. 2.5"
                                    className="w-full px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600/50 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none"
                                    step="0.1"
                                />
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="text-xs font-medium text-dark-400 mb-2 block">PRICE RANGE (₹)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        name="minPrice"
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                        placeholder="Min"
                                        className="px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600/50 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none"
                                    />
                                    <input
                                        type="number"
                                        name="maxPrice"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                        placeholder="Max"
                                        className="px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600/50 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Apply Button */}
                            <button
                                onClick={() => setShowFilters(false)}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:from-primary-500 hover:to-secondary-500 transition"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Summary */}
            {!loading && creators.length > 0 && (
                <div className="flex items-center justify-between text-sm text-dark-400 px-1">
                    <span>{pagination.total} creators found</span>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                </div>
            )}

            {/* Results Grid */}
            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50 animate-pulse">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-16 h-16 rounded-full bg-dark-700/50" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-dark-700/50 rounded w-1/3" />
                                    <div className="h-3 bg-dark-700/50 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="h-16 bg-dark-700/50 rounded-lg" />
                                <div className="h-16 bg-dark-700/50 rounded-lg" />
                                <div className="h-16 bg-dark-700/50 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : creators.length === 0 ? (
                <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
                        <FaSearch className="text-3xl text-dark-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-200 mb-2">No creators found</h3>
                    <p className="text-dark-400 text-sm mb-4">Try adjusting your filters or search terms</p>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="px-6 py-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/30 hover:bg-primary-500/20 transition"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        {creators.map(creator => (
                            <CreatorCard
                                key={creator._id}
                                creator={creator}
                                matchScore={creator.insights?.score || 50}
                                viewMode="discovery"
                                onViewProfile={() => console.log('View profile', creator._id)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-dark-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-700 transition"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium transition ${pagination.page === pageNum
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-dark-800/50 border border-dark-700/50 text-dark-300 hover:bg-dark-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-dark-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-700 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CreatorSearch;
