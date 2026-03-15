import { useState } from 'react';
import { createPortal } from 'react-dom';
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

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 shadow-2xl">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md z-0"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative z-10 w-full max-w-4xl bg-dark-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10 max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-700 to-indigo-800 p-4 border-b border-white/10 shrink-0 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-white/10 shadow-lg backdrop-blur-md border border-white/20">
                                <HiSparkles className="text-xl text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white tracking-tight uppercase">Templates</h2>
                                <p className="text-primary-100/80 text-[9px] font-bold tracking-widest uppercase mt-0.5">Quick Start Library</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 bg-dark-800/50 hover:bg-dark-700/80 rounded-lg transition-all text-white/80 hover:text-white border border-white/5"
                        >
                            <FaTimes className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="p-4 border-b border-white/5 space-y-3 bg-dark-900/60 shrink-0">
                    <div className="relative group max-w-lg">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-400 transition-colors text-xs" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 bg-dark-800/60 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500/80 focus:ring-1 focus:ring-primary-500/50 focus:outline-none transition-all shadow-inner text-[13px]"
                        />
                    </div>
 
                    <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border shrink-0 ${selectedCategory === category
                                    ? 'bg-primary-600/20 text-primary-400 border-primary-500/50'
                                    : 'bg-dark-800/40 text-dark-400 border-dark-700 hover:bg-dark-700/80 hover:border-dark-600'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-dark-950/40 custom-scrollbar">
                    {filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredTemplates.map(template => (
                                <motion.div
                                    key={template.id}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => handleSelectTemplate(template)}
                                    className={`p-3.5 rounded-xl border border-white/5 cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                        ? 'bg-primary-600/10 border-primary-500/50 shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)]'
                                        : 'bg-dark-800/40 hover:bg-dark-800 hover:border-dark-600'
                                        }`}
                                >
                                    <div className="text-2xl mb-2.5">{template.icon}</div>
                                    <h3 className="text-[13px] font-bold text-white mb-1.5 tracking-tight">{template.name}</h3>
                                    <p className="text-[11px] text-dark-400 mb-3 line-clamp-2 leading-relaxed">{template.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-dark-700 text-dark-300 rounded-md border border-dark-600 uppercase tracking-widest">
                                            {template.category}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
                                            ₹{template.template.budget.toLocaleString()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-dark-400 text-sm">No templates found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Template Preview & Actions */}
                <AnimatePresence>
                    {selectedTemplate && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="p-5 border-t border-white/5 bg-dark-900 shrink-0"
                        >
                            <div className="mb-4">
                                <h3 className="text-xs font-bold text-white tracking-wide mb-3 flex items-center gap-2">
                                    <HiSparkles className="text-primary-400" />
                                    {selectedTemplate.name} Highlights
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                                    <div>
                                        <span className="block text-[8px] font-bold text-dark-500 uppercase tracking-widest mb-0.5">Content</span>
                                        <span className="text-dark-200 font-semibold">{selectedTemplate.template.promotionType}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-bold text-dark-500 uppercase tracking-widest mb-0.5">Budget</span>
                                        <span className="text-emerald-400 font-bold">
                                            ₹{selectedTemplate.template.budget.toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-bold text-dark-500 uppercase tracking-widest mb-0.5">Duration</span>
                                        <span className="text-dark-200 font-semibold">{selectedTemplate.template.duration} days</span>
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-bold text-dark-500 uppercase tracking-widest mb-0.5">Audience</span>
                                        <span className="text-dark-200 font-semibold">
                                            {(selectedTemplate.template.minFollowers / 1000).toFixed(0)}k-{(selectedTemplate.template.maxFollowers / 1000).toFixed(0)}k
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="px-4 py-2 bg-dark-800/60 hover:bg-dark-700/80 text-dark-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUseTemplate}
                                    className="flex-1 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 border border-white/10"
                                >
                                    Apply Template
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );

    // Render directly to document.body to escape any parent CSS transforms/overflow limits
    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default CampaignTemplateSelector;
