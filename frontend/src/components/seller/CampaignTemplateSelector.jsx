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
                <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 rounded-premium-2xl shadow-premium m-s4 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-s6 relative border-b border-white/10">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-s2 hover:bg-white/20 rounded-premium-lg transition-all"
                        >
                            <FaTimes className="text-white" />
                        </button>
                        <div className="flex items-center gap-s4">
                            <div className="p-s3 rounded-premium-xl bg-white/20 shadow-glow backdrop-blur-md border border-white/20">
                                <HiSparkles className="text-3xl text-white" />
                            </div>
                            <div>
                                <h2 className="text-h2 font-black text-white uppercase tracking-widest leading-tight">Campaign Templates</h2>
                                <p className="text-white/80 text-xs-pure font-bold uppercase tracking-widest mt-1">Choose a template to get started quickly</p>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="p-s6 border-b border-dark-700/50 space-y-s4 bg-dark-900/40">
                        {/* Search */}
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full pl-12 pr-s4 py-s3.5 bg-dark-800/40 backdrop-blur-md border border-dark-700/50 rounded-premium-xl text-dark-100 placeholder-dark-500 focus:border-primary-500/50 focus:outline-none transition-all shadow-inner"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-s2 overflow-x-auto pb-s2 custom-scrollbar">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-s4 py-s2 rounded-premium-xl text-xs-pure font-black uppercase tracking-widest transition-all border ${selectedCategory === category
                                        ? 'bg-primary-600 text-white border-primary-500 shadow-glow'
                                        : 'bg-dark-800/40 text-dark-400 border-dark-700/50 hover:bg-dark-700'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="p-s6 overflow-y-auto max-h-96 bg-dark-900/20">
                        {filteredTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-s4">
                                {filteredTemplates.map(template => (
                                    <motion.div
                                        key={template.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleSelectTemplate(template)}
                                        className={`p-s4 rounded-premium-xl border-2 cursor-pointer transition-all shadow-md hover:shadow-premium ${selectedTemplate?.id === template.id
                                            ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                                            : 'border-dark-700/50 bg-dark-800/40 backdrop-blur-sm hover:border-dark-600'
                                            }`}
                                    >
                                        <div className="text-4xl mb-s3 filter drop-shadow-md">{template.icon}</div>
                                        <h3 className="text-body font-black text-dark-100 mb-s2 uppercase tracking-tight">{template.name}</h3>
                                        <p className="text-small text-dark-400 mb-s4 line-clamp-2">{template.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-[10px] font-black px-s2.5 py-1 bg-dark-700/50 text-dark-300 rounded-premium-full border border-dark-600/30 uppercase tracking-widest">
                                                {template.category}
                                            </span>
                                            <span className="text-xs-pure font-black text-primary-400 uppercase tracking-widest">
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
