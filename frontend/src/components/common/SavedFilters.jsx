import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSave, FaTrash, FaStar, FaEdit } from 'react-icons/fa';
import { HiFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';

/**
 * Saved Filters Component
 * Allows users to save and quickly apply filter combinations
 */
const SavedFilters = ({ currentFilters, onApplyFilter }) => {
    const [savedFilters, setSavedFilters] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        // Load saved filters from localStorage
        const saved = localStorage.getItem('savedFilters');
        if (saved) {
            setSavedFilters(JSON.parse(saved));
        }
    }, []);

    const saveFilter = () => {
        if (!filterName.trim()) {
            toast.error('Please enter a filter name');
            return;
        }

        const newFilter = {
            id: editingId || Date.now(),
            name: filterName,
            filters: currentFilters,
            createdAt: editingId ? savedFilters.find(f => f.id === editingId).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let updatedFilters;
        if (editingId) {
            updatedFilters = savedFilters.map(f => f.id === editingId ? newFilter : f);
            toast.success('Filter updated successfully!');
        } else {
            updatedFilters = [...savedFilters, newFilter];
            toast.success('Filter saved successfully!');
        }

        setSavedFilters(updatedFilters);
        localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));

        setShowSaveModal(false);
        setFilterName('');
        setEditingId(null);
    };

    const deleteFilter = (id) => {
        const updatedFilters = savedFilters.filter(f => f.id !== id);
        setSavedFilters(updatedFilters);
        localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));
        toast.success('Filter deleted');
    };

    const editFilter = (filter) => {
        setEditingId(filter.id);
        setFilterName(filter.name);
        setShowSaveModal(true);
    };

    const applyFilter = (filter) => {
        onApplyFilter(filter.filters);
        toast.success(`Applied filter: ${filter.name}`);
    };

    const hasActiveFilters = Object.values(currentFilters || {}).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return value !== null && value !== undefined && value !== '';
    });

    return (
        <div className="space-y-4">
            {/* Save Current Filters Button */}
            {hasActiveFilters && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSaveModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                >
                    <FaSave />
                    <span>Save Current Filters</span>
                </motion.button>
            )}

            {/* Saved Filters List */}
            {savedFilters.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-dark-400 flex items-center gap-2">
                        <HiFilter />
                        <span>Saved Filters ({savedFilters.length})</span>
                    </h3>

                    <div className="space-y-2">
                        {savedFilters.map(filter => (
                            <motion.div
                                key={filter.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-dark-900 border border-dark-800 rounded-xl p-3 hover:border-primary-500/50 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => applyFilter(filter)}
                                        className="flex-1 text-left"
                                    >
                                        <h4 className="text-dark-100 font-medium flex items-center gap-2">
                                            <FaStar className="text-primary-400 text-sm" />
                                            {filter.name}
                                        </h4>
                                        <p className="text-xs text-dark-500 mt-1">
                                            Last used: {new Date(filter.updatedAt).toLocaleDateString()}
                                        </p>
                                    </button>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => editFilter(filter)}
                                            className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-primary-400"
                                            title="Edit filter"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => deleteFilter(filter.id)}
                                            className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-red-400"
                                            title="Delete filter"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Filter Modal */}
            <AnimatePresence>
                {showSaveModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowSaveModal(false);
                                setFilterName('');
                                setEditingId(null);
                            }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                        >
                            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-2xl">
                                <h3 className="text-xl font-bold text-dark-100 mb-4">
                                    {editingId ? 'Edit Filter' : 'Save Filter'}
                                </h3>

                                <input
                                    type="text"
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    placeholder="e.g., Tech Creators 50K+"
                                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:outline-none transition-colors"
                                    autoFocus
                                    onKeyPress={(e) => e.key === 'Enter' && saveFilter()}
                                />

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowSaveModal(false);
                                            setFilterName('');
                                            setEditingId(null);
                                        }}
                                        className="flex-1 py-3 px-4 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveFilter}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity"
                                    >
                                        {editingId ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SavedFilters;
