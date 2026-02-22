import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import CampaignTemplateSelector from './CampaignTemplateSelector';
import PredictiveAnalyticsWidget from '../analytics/PredictiveAnalyticsWidget';
import AIAssistantPanel from '../common/AIAssistantPanel';
import toast from 'react-hot-toast';
import { trackEvent } from '../../utils/analytics';

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
        minBudget: initialData?.minBudget || '',
        maxBudget: initialData?.maxBudget || '',
        targetNiche: initialData?.targetNiche || [],
        minFollowers: initialData?.minFollowers || 1000,
        maxFollowers: initialData?.maxFollowers || 100000,
        minEngagement: 2.0,
        duration: 14,
        requirements: initialData?.requirements || '',
        platforms: ['instagram'],
        location: {
            district: initialData?.location?.district || '',
            city: initialData?.location?.city || '',
            state: initialData?.location?.state || ''
        },
        locationType: initialData?.locationType || 'REMOTE'
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
        if (!formData.title || !formData.minBudget || !formData.maxBudget) {
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
                min: Number(formData.minBudget),
                max: Number(formData.maxBudget)
            },
            followerRange: {
                min: Number(formData.minFollowers),
                max: Number(formData.maxFollowers)
            },
            campaignGoal: 'Reach', // Default goal
            requirements: formData.requirements || undefined,
            deadline: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toISOString(),
            location: formData.locationType !== 'REMOTE' ? formData.location : undefined,
            locationType: formData.locationType
        };

        onSubmit?.(payload);
        onClose?.();
        trackEvent('campaign_created');
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
                className="fixed inset-4 md:inset-10 bg-dark-900/90 backdrop-blur-2xl rounded-premium-2xl shadow-premium z-50 overflow-hidden flex flex-col border border-dark-700/50"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-s6 border-b border-white/10 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-s4">
                            <div className="p-s3 rounded-premium-xl bg-white/20 shadow-glow backdrop-blur-md border border-white/20">
                                <HiSparkles className="text-3xl text-white" />
                            </div>
                            <div>
                                <h2 className="text-h2 font-black text-white uppercase tracking-widest leading-tight">Create Campaign</h2>
                                <p className="text-white/80 text-xs-pure font-bold uppercase tracking-widest">AI-Powered Campaign Builder</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-s3">
                            <button
                                onClick={() => setShowTemplates(true)}
                                className="px-s4 py-s2 bg-white/10 hover:bg-white/20 text-white rounded-premium-xl text-xs-pure font-black uppercase tracking-widest transition-all border border-white/20 shadow-sm"
                            >
                                Use Template
                            </button>
                            <button
                                onClick={onClose}
                                className="p-s2 hover:bg-white/20 rounded-premium-lg transition-all"
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
                                    <label className="block text-xs-pure font-black text-dark-400 mb-s2 uppercase tracking-widest">
                                        Campaign Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Summer Fashion Collection Launch"
                                        className="w-full px-s4 py-s3.5 bg-dark-800/40 border border-dark-700/50 rounded-premium-xl text-dark-100 placeholder-dark-500 focus:border-primary-500/50 focus:outline-none transition-all shadow-inner"
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
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-s3">
                                        {['Post', 'Story', 'Reel', 'Video', 'IGTV', 'Live'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, promotionType: type })}
                                                className={`py-s3 rounded-premium-xl text-xs-pure font-black uppercase tracking-widest transition-all border ${formData.promotionType === type
                                                    ? 'bg-primary-600 text-white border-primary-500 shadow-glow'
                                                    : 'bg-dark-800/40 text-dark-300 border-dark-700/50 hover:bg-dark-700'
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
                                    <div className="flex flex-wrap gap-s2">
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => toggleCategory(category)}
                                                className={`px-s4 py-s2 rounded-premium-lg text-xs-pure font-black uppercase tracking-widest transition-all border ${formData.targetNiche.includes(category)
                                                    ? 'bg-primary-600 text-white border-primary-500 shadow-glow'
                                                    : 'bg-dark-800/40 text-dark-300 border-dark-700/50 hover:bg-dark-700'
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

                                {/* Location Settings */}
                                <div>
                                    <label className="block text-sm font-semibold text-dark-200 mb-3">
                                        Location Requirements
                                    </label>
                                    <div className="flex gap-4 mb-4">
                                        {['REMOTE', 'HYBRID', 'ONSITE'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, locationType: type })}
                                                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${formData.locationType === type
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    {formData.locationType !== 'REMOTE' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                                            <input
                                                type="text"
                                                value={formData.location.city}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    location: { ...formData.location, city: e.target.value }
                                                })}
                                                placeholder="City"
                                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={formData.location.district}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    location: { ...formData.location, district: e.target.value }
                                                })}
                                                placeholder="District"
                                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={formData.location.state}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    location: { ...formData.location, state: e.target.value }
                                                })}
                                                placeholder="State"
                                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none md:col-span-2"
                                            />
                                        </div>
                                    )}
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
                                        Budget Range (₹) *
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-dark-500 mb-1 block">Minimum</span>
                                            <input
                                                type="number"
                                                value={formData.minBudget}
                                                onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
                                                placeholder="Min"
                                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-dark-500 mb-1 block">Maximum</span>
                                            <input
                                                type="number"
                                                value={formData.maxBudget}
                                                onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                                                placeholder="Max"
                                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
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
                                <div className="bg-dark-800/40 backdrop-blur-md rounded-premium-2xl p-s6 space-y-s6 border border-dark-700/50 shadow-inner">
                                    <h3 className="text-h3 font-black text-dark-100 uppercase tracking-widest">Campaign Summary</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-s6">
                                        <div className="space-y-s4">
                                            <div>
                                                <span className="text-xs-pure font-black text-dark-500 uppercase tracking-widest block mb-1">Campaign Title</span>
                                                <p className="text-body font-black text-dark-100 uppercase tracking-tight">{formData.title || 'Not set'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs-pure font-black text-dark-500 uppercase tracking-widest block mb-1">Content Type</span>
                                                <p className="text-body font-black text-primary-400 uppercase tracking-widest">{formData.promotionType}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs-pure font-black text-dark-500 uppercase tracking-widest block mb-1">Budget Allocation</span>
                                                <p className="text-h3 font-black text-emerald-400">
                                                    ₹{parseInt(formData.minBudget || 0).toLocaleString()} - ₹{parseInt(formData.maxBudget || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-s4">
                                            <div>
                                                <span className="text-xs-pure font-black text-dark-500 uppercase tracking-widest block mb-1">Project Duration</span>
                                                <p className="text-body font-black text-dark-100 uppercase tracking-widest">{formData.duration} DAYS</p>
                                            </div>
                                            <div>
                                                <span className="text-xs-pure font-black text-dark-500 uppercase tracking-widest block mb-1">Target Niche</span>
                                                <div className="flex flex-wrap gap-s2 mt-2">
                                                    {formData.targetNiche.map(cat => (
                                                        <span key={cat} className="px-s3 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-premium-full text-[10px] font-black uppercase tracking-widest">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs-pure font-black text-dark-500 uppercase tracking-widest block mb-1">Collaboration Type</span>
                                                <p className="text-body font-black text-indigo-400 uppercase tracking-widest">
                                                    {formData.locationType}
                                                    {formData.locationType !== 'REMOTE' && formData.location?.city && ` • ${formData.location.city.toUpperCase()}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-dark-700/50 p-s6 flex items-center justify-between bg-dark-900/50">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="px-s6 py-s3 bg-dark-800/40 hover:bg-dark-800 border border-dark-700/50 disabled:opacity-30 disabled:cursor-not-allowed text-dark-300 rounded-premium-xl text-xs-pure font-black uppercase tracking-widest transition-all shadow-md"
                    >
                        Back
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-s8 py-s3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white rounded-premium-xl text-xs-pure font-black uppercase tracking-widest transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-s2"
                        >
                            Next
                            <FaChevronRight />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-s8 py-s3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-premium-xl text-xs-pure font-black uppercase tracking-widest transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-s2"
                        >
                            <FaRocket />
                            Launch Campaign
                        </button>
                    )}
                </div>
            </motion.div >

            {/* Template Selector */}
            {
                showTemplates && (
                    <CampaignTemplateSelector
                        onSelect={applyTemplate}
                        onClose={() => setShowTemplates(false)}
                    />
                )
            }

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
