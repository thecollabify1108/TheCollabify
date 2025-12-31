import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaRedo } from 'react-icons/fa';
import { sellerAPI } from '../../services/api';
import CreatorCard from './CreatorCard';
import SkeletonLoader from '../common/SkeletonLoader';

const CreatorSearch = () => {
    const [loading, setLoading] = useState(false);
    const [creators, setCreators] = useState([]);
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
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-dark-100 flex items-center">
                            <FaFilter className="mr-2 text-primary-500" /> Filters
                        </h3>
                        <button
                            onClick={resetFilters}
                            className="text-sm text-primary-400 hover:text-primary-300 flex items-center"
                        >
                            <FaRedo className="mr-1" /> Reset
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Search */}
                        <div className="form-group">
                            <label className="text-sm font-medium text-dark-300 mb-1 block">Search</label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-dark-500" />
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Username or Bio..."
                                    className="input-field pl-10 w-full"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label className="text-sm font-medium text-dark-300 mb-1 block">Category</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="input-field w-full"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Followers Range */}
                        <div className="form-group">
                            <label className="text-sm font-medium text-dark-300 mb-1 block">Followers</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    name="minFollowers"
                                    value={filters.minFollowers}
                                    onChange={handleFilterChange}
                                    placeholder="Min"
                                    className="input-field"
                                />
                                <input
                                    type="number"
                                    name="maxFollowers"
                                    value={filters.maxFollowers}
                                    onChange={handleFilterChange}
                                    placeholder="Max"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Engagement */}
                        <div className="form-group">
                            <label className="text-sm font-medium text-dark-300 mb-1 block">Min Engagement (%)</label>
                            <input
                                type="number"
                                name="minEngagement"
                                value={filters.minEngagement}
                                onChange={handleFilterChange}
                                placeholder="e.g. 2.5"
                                className="input-field w-full"
                                step="0.1"
                            />
                        </div>

                        {/* Price Range */}
                        <div className="form-group">
                            <label className="text-sm font-medium text-dark-300 mb-1 block">Price ($)</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                    placeholder="Min"
                                    className="input-field"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    placeholder="Max"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="form-group">
                            <label className="text-sm font-medium text-dark-300 mb-1 block">Sort By</label>
                            <select
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={handleFilterChange}
                                className="input-field w-full"
                            >
                                <option value="matchScore">Best Match</option>
                                <option value="followers_desc">Most Followers</option>
                                <option value="followers_asc">Least Followers</option>
                                <option value="engagement">Highest Engagement</option>
                                <option value="price_asc">Lowest Price</option>
                                <option value="price_desc">Highest Price</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="glass-card p-4 h-96 animate-pulse">
                                <div className="h-20 bg-dark-700/50 rounded-lg mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-dark-700/50 rounded w-3/4"></div>
                                    <div className="h-4 bg-dark-700/50 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : creators.length === 0 ? (
                    <div className="text-center py-20 bg-dark-800/20 rounded-2xl border border-dark-700 border-dashed">
                        <FaSearch className="mx-auto text-4xl text-dark-500 mb-4" />
                        <h3 className="text-xl font-semibold text-dark-300 mb-2">No creators found</h3>
                        <p className="text-dark-400">Try adjusting your filters to find more results</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 disabled:opacity-50 hover:bg-dark-700 transition"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 disabled:opacity-50 hover:bg-dark-700 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CreatorSearch;
