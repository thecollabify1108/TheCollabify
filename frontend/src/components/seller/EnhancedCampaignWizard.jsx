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
        { id: 'basics', title: 'Campaign Basics', icon: '' },
        { id: 'targeting', title: 'Target Audience', icon: '' },
        { id: 'requirements', title: 'Requirements', icon: '' },
        { id: 'budget', title: 'Budget & Timeline', icon: '' },
        { id: 'review', title: 'Review & Launch', icon: '' }
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
            campaignGoal: 'Reach',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm z-0"
            />

            {/* Wizard Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative z-10 w-full max-w-4xl bg-dark-950/98 backdrop-blur-2xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col border border-white/10 max-h-[92vh] sm:max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-700 to-indigo-800 p-5 border-b border-white/10 relative shrink-0">
                    <div className="flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-white/10 shadow-lg backdrop-blur-md border border-white/20">
                                <HiSparkles className="text-xl text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">Create Campaign</h2>
                                <p className="text-primary-100 text-[10px] font-bold tracking-widest uppercase opacity-80">AI-Powered Strategy</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowTemplates(true)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-white/20 shadow-sm flex items-center gap-1.5"
                            >
                                Templates
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 bg-dark-800/50 hover:bg-dark-700/80 rounded-lg transition-all text-white/80 hover:text-white border border-white/5"
                            >
                                <FaTimes className="text-sm" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-1.5 mt-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1">
                                <div className={`h-1 rounded-full transition-all duration-500 ${index <= currentStep ? 'bg-primary-400 shadow-[0_0_8px_rgba(var(--color-primary-400),0.6)]' : 'bg-white/10'}`} />
                                <div className={`text-[9px] mt-1.5 font-bold tracking-widest uppercase truncate ${index === currentStep ? 'text-white' : 'text-white/40'}`}>
                                    {step.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {/* Step 0: Basics */}
                        {currentStep === 0 && (
                            <motion.div
                                key="basics"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                className="space-y-6 max-w-2xl mx-auto"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wider">
                                        Campaign Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Summer Fashion Collection"
                                        className="w-full px-4 py-2.5 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500/80 focus:ring-1 focus:ring-primary-500/50 focus:outline-none transition-all shadow-inner text-sm"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wider">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Outline your vision and goals..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500/80 focus:ring-1 focus:ring-primary-500/50 focus:outline-none transition-all resize-none shadow-inner text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 mb-2.5 uppercase tracking-widest">
                                        Content Type
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {['Post', 'Story', 'Reel', 'Video', 'IGTV', 'Live'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, promotionType: type })}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${formData.promotionType === type
                                                    ? 'bg-primary-600/20 text-primary-400 border-primary-500/50 shadow-sm'
                                                    : 'bg-dark-800/40 text-dark-400 border-dark-700 hover:bg-dark-700/80 hover:border-dark-600'
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
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                className="space-y-8 max-w-2xl mx-auto"
                            >
                                <div>
                                    <label className="block text-[10px] font-bold text-dark-400 mb-2.5 uppercase tracking-widest">
                                        Target Categories
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => toggleCategory(category)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${formData.targetNiche.includes(category)
                                                    ? 'bg-primary-600/20 text-primary-400 border-primary-500/50 shadow-sm'
                                                    : 'bg-dark-800/40 text-dark-400 border-dark-700 hover:bg-dark-700/80 hover:border-dark-600'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-dark-800/30 border border-dark-700/50 rounded-xl space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-dark-300 uppercase tracking-wider">Follower Range</label>
                                            <span className="text-xs font-mono text-primary-400">{formData.minFollowers.toLocaleString()} - {formData.maxFollowers.toLocaleString()}</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] uppercase font-bold text-dark-500 w-8">Min</span>
                                                <input
                                                    type="range"
                                                    min="1000"
                                                    max="1000000"
                                                    step="1000"
                                                    value={formData.minFollowers}
                                                    onChange={(e) => setFormData({ ...formData, minFollowers: parseInt(e.target.value) })}
                                                    className="w-full accent-primary-500"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] uppercase font-bold text-dark-500 w-8">Max</span>
                                                <input
                                                    type="range"
                                                    min="1000"
                                                    max="1000000"
                                                    step="1000"
                                                    value={formData.maxFollowers}
                                                    onChange={(e) => setFormData({ ...formData, maxFollowers: parseInt(e.target.value) })}
                                                    className="w-full accent-primary-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-dark-300 uppercase tracking-wider">Min Engagement Rate</label>
                                            <span className="text-xs font-mono text-primary-400">{formData.minEngagement}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            step="0.5"
                                            value={formData.minEngagement}
                                            onChange={(e) => setFormData({ ...formData, minEngagement: parseFloat(e.target.value) })}
                                            className="w-full accent-primary-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-dark-300 mb-3 uppercase tracking-wider">
                                        Location Requirements
                                    </label>
                                    <div className="flex gap-2 mb-4">
                                        {['REMOTE', 'HYBRID', 'ONSITE'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, locationType: type })}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all border ${formData.locationType === type
                                                    ? 'bg-primary-600/20 text-primary-400 border-primary-500/50 shadow-sm'
                                                    : 'bg-dark-800/40 text-dark-400 border-dark-700 hover:bg-dark-700'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    {formData.locationType !== 'REMOTE' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4">
                                            <input
                                                type="text"
                                                value={formData.location.city}
                                                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                                placeholder="City"
                                                className="w-full px-4 py-2.5 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={formData.location.district}
                                                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, district: e.target.value } })}
                                                placeholder="District"
                                                className="w-full px-4 py-2.5 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={formData.location.state}
                                                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                                                placeholder="State/Region"
                                                className="w-full px-4 py-2.5 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none text-sm md:col-span-2"
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
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                className="space-y-6 max-w-2xl mx-auto"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-dark-300 mb-3 uppercase tracking-wider">
                                        Campaign Requirements & Deliverables
                                    </label>
                                    <textarea
                                        value={formData.requirements}
                                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                        placeholder="List specific brand guidelines, do's and don'ts, required tags, or deliverables..."
                                        rows={6}
                                        className="w-full px-4 py-3 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500/80 focus:ring-1 focus:ring-primary-500/50 focus:outline-none transition-all shadow-inner text-sm resize-none"
                                    />
                                    <p className="text-[10px] text-dark-400 mt-2 ml-1">Example: "Must feature product within first 3 seconds, tag @brandname..."</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Budget */}
                        {currentStep === 3 && (
                            <motion.div
                                key="budget"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                className="space-y-8 max-w-2xl mx-auto"
                            >
                                <div className="p-5 bg-dark-800/30 border border-dark-700/50 rounded-xl space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-dark-300 mb-3 uppercase tracking-wider">
                                            Total Budget Range (₹) <span className="text-red-400">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    value={formData.minBudget}
                                                    onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
                                                    placeholder="Min Budget"
                                                    className="w-full pl-8 pr-4 py-2.5 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none text-sm"
                                                />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    value={formData.maxBudget}
                                                    onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                                                    placeholder="Max Budget"
                                                    className="w-full pl-8 pr-4 py-2.5 bg-dark-800/80 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-3">
                                            <label className="text-xs font-bold text-dark-300 uppercase tracking-wider">Est. Duration</label>
                                            <span className="text-xs font-mono text-primary-400">{formData.duration} days</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="3"
                                            max="90"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="w-full accent-primary-500"
                                        />
                                    </div>
                                </div>

                                {formData.maxBudget && (
                                    <div className="border border-indigo-500/20 rounded-xl overflow-hidden shadow-lg">
                                        <PredictiveAnalyticsWidget
                                            campaignData={{
                                                budget: parseInt(formData.maxBudget),
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
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                className="space-y-6 max-w-2xl mx-auto"
                            >
                                <div className="bg-dark-800/40 backdrop-blur-md rounded-2xl p-6 border border-dark-700/50 shadow-inner">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <FaRocket className="text-primary-500" /> Confirm & Launch
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-5 text-sm">
                                            <div>
                                                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block mb-0.5">Campaign Title</span>
                                                <p className="font-semibold text-white">{formData.title || 'Untitled Campaign'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block mb-0.5">Content Type</span>
                                                <p className="font-semibold text-primary-400">{formData.promotionType}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block mb-0.5">Budget Allocation</span>
                                                <p className="font-bold text-emerald-400 text-base">
                                                    ₹{parseInt(formData.minBudget || 0).toLocaleString()} - ₹{parseInt(formData.maxBudget || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-5 text-sm">
                                            <div>
                                                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block mb-0.5">Project Duration</span>
                                                <p className="font-semibold text-white">{formData.duration} Days</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block mb-1">Target Niche</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {formData.targetNiche.slice(0, 3).map(cat => (
                                                        <span key={cat} className="px-2 py-0.5 bg-dark-700 text-dark-300 border border-dark-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                    {formData.targetNiche.length > 3 && (
                                                        <span className="px-2 py-0.5 bg-dark-700 text-dark-400 border border-dark-600 rounded-md text-[10px] font-bold">+{formData.targetNiche.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block mb-0.5">Collaboration</span>
                                                <p className="font-semibold text-indigo-400 text-xs tracking-wider">
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

                {/* Footer Controls */}
                <div className="border-t border-white/5 p-4 sm:p-5 flex items-center justify-between bg-dark-900/40 backdrop-blur-md shrink-0">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="px-5 py-2 bg-dark-800/60 hover:bg-dark-700/80 border border-dark-700 disabled:opacity-20 disabled:cursor-not-allowed text-dark-200 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        Back
                    </button>
 
                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-gradient-to-r from-primary-600/90 to-indigo-600/90 hover:from-primary-600 hover:to-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 border border-white/10"
                        >
                            Next Step
                            <FaChevronRight className="text-[9px]" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-7 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 border border-white/10"
                        >
                            <FaRocket className="text-xs" />
                            Launch Campaign
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Template Selector - Embedded outside the inner modal wrapper */}
            {
                showTemplates && (
                    <CampaignTemplateSelector
                        onSelect={applyTemplate}
                        onClose={() => setShowTemplates(false)}
                    />
                )
            }

            {/* Intelligence Copilot */}
            <AIAssistantPanel
                campaign={formData}
                onUse={(content) => {
                    if (content.type === 'caption') {
                        setFormData({ ...formData, description: content.content });
                    }
                }}
            />
        </div>
    );
};

export default EnhancedCampaignWizard;
