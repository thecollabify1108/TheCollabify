import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import CampaignTemplateSelector from './CampaignTemplateSelector';
import PredictiveAnalyticsWidget from '../analytics/PredictiveAnalyticsWidget';
import AIAssistantPanel from '../common/AIAssistantPanel';
import toast from 'react-hot-toast';

/**
 * Enhanced Campaign Creation Wizard
 * Step-by-step campaign creation with AI assistance
 */
const EnhancedCampaignWizard = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showTemplates, setShowTemplates] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        promotionType: initialData?.promotionType || 'Post',
        budget: initialData?.budget || '',
        targetNiche: initialData?.targetNiche || [],
        minFollowers: initialData?.minFollowers || 1000,
        maxFollowers: initialData?.maxFollowers || 100000,
        minEngagement: 2.0,
        duration: 14,
        requirements: initialData?.requirements || '',
        platforms: ['instagram']
    });

    // Pre-populate form data when initialData changes
    useEffect(() => {
        if (initialData && isOpen) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData, isOpen]);

    const steps = [
        { id: 'basics', title: 'Campaign Basics', icon: '📝' },
        { id: 'targeting', title: 'Target Audience', icon: '🎯' },
        { id: 'requirements', title: 'Requirements', icon: '📋' },
        { id: 'budget', title: 'Budget & Timeline', icon: '💰' },
        { id: 'review', title: 'Review & Launch', icon: '🚀' }
    ];

    const categories = [
        'Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Food',
        'Travel', 'Fitness', 'Gaming', 'Music', 'Art'
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.budget) {
            toast.error('Please fill in required fields');
            return;
        }

        // Transform data to match backend expectations
        const payload = {
            title: formData.title,
            description: formData.description,
            promotionType: formData.promotionType === 'Story' ? 'Stories' :
                formData.promotionType === 'Reel' ? 'Reels' :
                    formData.promotionType === 'Post' ? 'Posts' : formData.promotionType,
            targetCategory: formData.targetNiche.join(', ') || 'Lifestyle',
            budgetRange: {
                min: Number(formData.budget) * 0.8, // 80% of budget as min
                max: Number(formData.budget)
            },
            followerRange: {
                min: Number(formData.minFollowers),
                max: Number(formData.maxFollowers)
            },
            campaignGoal: 'Reach', // Default goal
            requirements: formData.requirements || undefined,
            deadline: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toISOString()
        };

        onSubmit?.(payload);
        onClose?.();
        toast.success('Campaign created successfully!');
    };

    const applyTemplate = (templateData) => {
        setFormData({
            ...formData,
            ...templateData
        });
        setShowTemplates(false);
        toast.success('Template applied!');
    };

    const toggleCategory = (category) => {
        setFormData(prev => ({
            ...prev,
            targetNiche: prev.targetNiche.includes(category)
                ? prev.targetNiche.filter(c => c !== category)
                : [...prev.targetNiche, category]
        }));
    };

    if (!isOpen) return null;

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

            {/* Wizard */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-4 md:inset-10 bg-dark-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <HiSparkles className="text-3xl text-white" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Create Campaign</h2>
                                <p className="text-white/80 text-sm">AI-Powered Campaign Builder</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowTemplates(true)}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
                            >
                                Use Template
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-white text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-6">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1 flex items-center">
                                <div className="flex-1">
                                    <div className={`h-2 rounded-full ${index <= currentStep ? 'bg-white' : 'bg-white/30'
                                        }`} />
                                    <div className={`text-xs mt-1 ${index === currentStep ? 'text-white font-semibold' : 'text-white/60'
                                        }`}>
                                        {step.icon} {step.title}
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <FaChevronRight className="text-white/40 mx-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {/* Step 0: Basics */}
                        {currentStep === 0 && (
                            <motion.div
                                key="basics"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-2">
                                        Campaign Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Summer Fashion Collection Launch"
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe your campaign goals and vision..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-2">
                                        Content Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Post', 'Story', 'Reel', 'Video', 'IGTV', 'Live'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, promotionType: type })}
                                                className={`py-3 rounded-xl font-medium transition-colors ${formData.promotionType === type
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 1: Targeting */}
                        {currentStep === 1 && (
                            <motion.div
                                key="targeting"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-3">
                                        Target Categories
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => toggleCategory(category)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${formData.targetNiche.includes(category)
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-3">
                                        Follower Range: {formData.minFollowers.toLocaleString()} - {formData.maxFollowers.toLocaleString()}
                                    </label>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs text-dark-500">Minimum</span>
                                            <input
                                                type="range"
                                                min="1000"
                                                max="1000000"
                                                step="1000"
                                                value={formData.minFollowers}
                                                onChange={(e) => setFormData({ ...formData, minFollowers: parseInt(e.target.value) })}
                                                className="w-full mt-2"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-dark-500">Maximum</span>
                                            <input
                                                type="range"
                                                min="1000"
                                                max="1000000"
                                                step="1000"
                                                value={formData.maxFollowers}
                                                onChange={(e) => setFormData({ ...formData, maxFollowers: parseInt(e.target.value) })}
                                                className="w-full mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-3">
                                        Minimum Engagement Rate: {formData.minEngagement}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="0.5"
                                        value={formData.minEngagement}
                                        onChange={(e) => setFormData({ ...formData, minEngagement: parseFloat(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Requirements */}
                        {currentStep === 2 && (
                            <motion.div
                                key="requirements"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-2">
                                        Campaign Requirements
                                    </label>
                                    <textarea
                                        value={formData.requirements}
                                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                        placeholder="List your requirements for creators..."
                                        rows={8}
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Budget */}
                        {currentStep === 3 && (
                            <motion.div
                                key="budget"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-2">
                                        Budget (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        placeholder="5000"
                                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-2">
                                        Duration: {formData.duration} days
                                    </label>
                                    <input
                                        type="range"
                                        min="3"
                                        max="90"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>

                                {formData.budget && (
                                    <PredictiveAnalyticsWidget
                                        campaignData={{
                                            budget: parseInt(formData.budget),
                                            creatorFollowers: (formData.minFollowers + formData.maxFollowers) / 2,
                                            creatorEngagementRate: formData.minEngagement,
                                            promotionType: formData.promotionType,
                                            category: formData.targetNiche[0] || 'Lifestyle',
                                            duration: formData.duration
                                        }}
                                        creatorProfile={{
                                            followers: (formData.minFollowers + formData.maxFollowers) / 2,
                                            avgEngagementRate: formData.minEngagement
                                        }}
                                    />
                                )}
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-dark-800 rounded-xl p-6 space-y-4">
                                    <h3 className="text-xl font-bold text-dark-100">Campaign Summary</h3>

                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-dark-500 text-sm">Title:</span>
                                            <p className="text-dark-100 font-semibold">{formData.title || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <span className="text-dark-500 text-sm">Type:</span>
                                            <p className="text-dark-100">{formData.promotionType}</p>
                                        </div>
                                        <div>
                                            <span className="text-dark-500 text-sm">Budget:</span>
                                            <p className="text-dark-100 font-semibold">₹{formData.budget || '0'}</p>
                                        </div>
                                        <div>
                                            <span className="text-dark-500 text-sm">Duration:</span>
                                            <p className="text-dark-100">{formData.duration} days</p>
                                        </div>
                                        <div>
                                            <span className="text-dark-500 text-sm">Target Categories:</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {formData.targetNiche.map(cat => (
                                                    <span key={cat} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-dark-800 p-6 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="px-6 py-3 bg-dark-800 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed text-dark-300 rounded-xl font-medium transition-colors"
                    >
                        Back
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity flex items-center gap-2"
                        >
                            Next
                            <FaChevronRight />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity flex items-center gap-2"
                        >
                            <FaRocket />
                            Launch Campaign
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Template Selector */}
            {showTemplates && (
                <CampaignTemplateSelector
                    onSelect={applyTemplate}
                    onClose={() => setShowTemplates(false)}
                />
            )}

            {/* AI Assistant */}
            <AIAssistantPanel
                campaign={formData}
                onUse={(content) => {
                    if (content.type === 'caption') {
                        setFormData({ ...formData, description: content.content });
                    }
                }}
            />
        </>
    );
};

export default EnhancedCampaignWizard;
