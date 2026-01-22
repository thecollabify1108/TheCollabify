import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSearch, FaFilter } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import campaignTemplates, { getCategories } from '../../data/campaignTemplates';
import toast from 'react-hot-toast';

/**
 * Campaign Template Selector
 * Allows sellers to choose from pre-built campaign templates
 */
const CampaignTemplateSelector = ({ onSelect, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const categories = ['All', ...getCategories()];

    // Filter templates based on search and category
    const filteredTemplates = campaignTemplates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
    };

    const handleUseTemplate = () => {
        if (selectedTemplate) {
            onSelect(selectedTemplate.template);
            toast.success(`Template "${selectedTemplate.name}" applied!`);
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
                <div className="bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl m-4">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <FaTimes className="text-white" />
                        </button>
                        <div className="flex items-center gap-3">
                            <HiSparkles className="text-3xl text-white" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Campaign Templates</h2>
                                <p className="text-white/80 mt-1">Choose a template to get started quickly</p>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="p-6 border-b border-dark-800 space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-dark-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="p-6 overflow-y-auto max-h-96">
                        {filteredTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTemplates.map(template => (
                                    <motion.div
                                        key={template.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleSelectTemplate(template)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                                ? 'border-primary-500 bg-primary-500/10'
                                                : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                                            }`}
                                    >
                                        <div className="text-4xl mb-3">{template.icon}</div>
                                        <h3 className="font-bold text-dark-100 mb-2">{template.name}</h3>
                                        <p className="text-sm text-dark-400 mb-3">{template.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs px-2 py-1 bg-dark-700 text-dark-300 rounded">
                                                {template.category}
                                            </span>
                                            <span className="text-xs text-primary-400">
                                                ₹{template.template.budget.toLocaleString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-dark-400">No templates found</p>
                            </div>
                        )}
                    </div>

                    {/* Template Preview & Actions */}
                    {selectedTemplate && (
                        <div className="p-6 border-t border-dark-800 bg-dark-800/30">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-dark-100 mb-2">
                                    {selectedTemplate.name} Preview
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-dark-500">Type:</span>
                                        <span className="text-dark-200 ml-2">{selectedTemplate.template.promotionType}</span>
                                    </div>
                                    <div>
                                        <span className="text-dark-500">Budget:</span>
                                        <span className="text-primary-400 ml-2 font-semibold">
                                            ₹{selectedTemplate.template.budget.toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-dark-500">Duration:</span>
                                        <span className="text-dark-200 ml-2">{selectedTemplate.template.duration} days</span>
                                    </div>
                                    <div>
                                        <span className="text-dark-500">Followers:</span>
                                        <span className="text-dark-200 ml-2">
                                            {selectedTemplate.template.minFollowers.toLocaleString()} - {selectedTemplate.template.maxFollowers.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUseTemplate}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity"
                                >
                                    Use This Template
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default CampaignTemplateSelector;
