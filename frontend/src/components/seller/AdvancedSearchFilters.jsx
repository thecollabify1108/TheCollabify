import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';
import { HiAdjustments } from 'react-icons/hi';
import SavedFilters from '../common/SavedFilters';

/**
 * Advanced Search Filters
 * Comprehensive filtering system for creator discovery
 */
const AdvancedSearchFilters = ({ onApplyFilters, initialFilters = {} }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        categories: initialFilters.categories || [],
        followerRange: initialFilters.followerRange || { min: 1000, max: 1000000 },
        engagementRange: initialFilters.engagementRange || { min: 0, max: 100 },
        priceRange: initialFilters.priceRange || { min: 0, max: 50000 },
        location: initialFilters.location || [],
        verified: initialFilters.verified || false,
        languages: initialFilters.languages || [],
        promotionTypes: initialFilters.promotionTypes || [],
        availability: initialFilters.availability || 'all', // 'all', 'available', 'busy'
        sortBy: initialFilters.sortBy || 'relevance' // 'relevance', 'followers', 'engagement', 'price-low', 'price-high'
    });

    const categories = [
        'Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Food', 'Travel',
        'Fitness', 'Gaming', 'Music', 'Art', 'Sports', 'Business'
    ];

    const locations = [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
        'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
    ];

    const languages = [
        'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali',
        'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
    ];

    const promotionTypes = [
        'Post', 'Story', 'Reel', 'Video', 'IGTV', 'Live'
    ];

    const handleApply = () => {
        onApplyFilters(filters);
        setShowFilters(false);
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            categories: [],
            followerRange: { min: 1000, max: 1000000 },
            engagementRange: { min: 0, max: 100 },
            priceRange: { min: 0, max: 50000 },
            location: [],
            verified: false,
            languages: [],
            promotionTypes: [],
            availability: 'all',
            sortBy: 'relevance'
        };
        setFilters(resetFilters);
        onApplyFilters(resetFilters);
    };

    const toggleArrayFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter(item => item !== value)
                : [...prev[key], value]
        }));
    };

    const activeFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.categories.length > 0) count++;
        if (filters.location.length > 0) count++;
        if (filters.languages.length > 0) count++;
        if (filters.promotionTypes.length > 0) count++;
        if (filters.verified) count++;
        if (filters.availability !== 'all') count++;
        return count;
    };

    return (
        <div>
            {/* Filter Toggle Button */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleApply()}
                        placeholder="Search creators..."
                        className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative px-6 py-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-200 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                    <HiAdjustments className="text-xl" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFiltersCount() > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {activeFiltersCount()}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                    >
                        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-6">
                            {/* Saved Filters */}
                            <SavedFilters
                                currentFilters={filters}
                                onApplyFilter={(savedFilters) => {
                                    setFilters(savedFilters);
                                    onApplyFilters(savedFilters);
                                }}
                            />

                            {/* Categories */}
                            <div>
                                <label className="block text-sm font-semibold text-dark-200 mb-3">
                                    Categories
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => toggleArrayFilter('categories', category)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.categories.includes(category)
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Follower Range */}
                            <div>
                                <label className="block text-sm font-semibold text-dark-200 mb-3">
                                    Followers: {filters.followerRange.min.toLocaleString()} - {filters.followerRange.max.toLocaleString()}
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="1000"
                                        max="1000000"
                                        step="1000"
                                        value={filters.followerRange.min}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            followerRange: { ...filters.followerRange, min: parseInt(e.target.value) }
                                        })}
                                        className="w-full"
                                    />
                                    <input
                                        type="range"
                                        min="1000"
                                        max="1000000"
                                        step="1000"
                                        value={filters.followerRange.max}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            followerRange: { ...filters.followerRange, max: parseInt(e.target.value) }
                                        })}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Engagement Rate */}
                            <div>
                                <label className="block text-sm font-semibold text-dark-200 mb-3">
                                    Engagement Rate: {filters.engagementRange.min}% - {filters.engagementRange.max}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={filters.engagementRange.max}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        engagementRange: { ...filters.engagementRange, max: parseInt(e.target.value) }
                                    })}
                                    className="w-full"
                                />
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-semibold text-dark-200 mb-3">
                                    Budget: ₹{filters.priceRange.min.toLocaleString()} - ₹{filters.priceRange.max.toLocaleString()}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50000"
                                    step="500"
                                    value={filters.priceRange.max}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        priceRange: { ...filters.priceRange, max: parseInt(e.target.value) }
                                    })}
                                    className="w-full"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-dark-200 mb-3">
                                    Location
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {locations.map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => toggleArrayFilter('location', loc)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.location.includes(loc)
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                                }`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Languages */}
                            <div>
                                <label className="block text-sm font-semibold text-dark-200 mb-3">
                                    Languages
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => toggleArrayFilter('languages', lang)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.languages.includes(lang)
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Promotion Types */}
                            <div>
                                <label className="block text-sm font-semibold text-dark-200 mb-3">
                                    Promotion Types
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {promotionTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleArrayFilter('promotionTypes', type)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.promotionTypes.includes(type)
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Options */}
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.verified}
                                        onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                                        className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-dark-300">Verified Only</span>
                                </label>

                                <select
                                    value={filters.availability}
                                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                                    className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 focus:border-primary-500 focus:outline-none"
                                >
                                    <option value="all">All Availability</option>
                                    <option value="available">Available Only</option>
                                    <option value="busy">Busy</option>
                                </select>

                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 focus:border-primary-500 focus:outline-none"
                                >
                                    <option value="relevance">Most Relevant</option>
                                    <option value="followers">Most Followers</option>
                                    <option value="engagement">Highest Engagement</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-dark-800">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-3 px-4 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-xl font-medium transition-colors"
                                >
                                    Reset All
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedSearchFilters;
