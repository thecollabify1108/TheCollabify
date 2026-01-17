import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTimes,
    FaArrowRight,
    FaArrowLeft,
    FaCheck,
    FaImage,
    FaVideo,
    FaBookOpen,
    FaInstagram
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const RequestWizard = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        promotionType: initialData.promotionType || '',
        budget: initialData.budget || '',
        description: initialData.description || '',
        requirements: initialData.requirements || '',
        targetNiche: initialData.targetNiche || [],
        minFollowers: initialData.minFollowers || 1000,
        maxFollowers: initialData.maxFollowers || 100000
    });

    const niches = [
        'Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness',
        'Lifestyle', 'Gaming', 'Education', 'Finance', 'Entertainment', 'Health'
    ];

    const promotionTypes = [
        { id: 'Story', label: 'Story', icon: <FaBookOpen />, desc: '24-hour visibility' },
        { id: 'Reel', label: 'Reel', icon: <FaVideo />, desc: 'Short video content' },
        { id: 'Post', label: 'Post', icon: <FaImage />, desc: 'Permanent feed post' }
    ];

    // Pre-populate form data when initialData changes
    useEffect(() => {
        if (initialData && isOpen) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData, isOpen]);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        // Transform data to match backend expectations
        const payload = {
            title: formData.title,
            description: formData.description,
            promotionType: formData.promotionType === 'Story' ? 'Stories' :
                formData.promotionType === 'Reel' ? 'Reels' : 'Posts',
            targetCategory: formData.targetNiche.join(', '),
            budgetRange: {
                min: Number(formData.budget) * 0.8, // 80% of budget as min
                max: Number(formData.budget)
            },
            followerRange: {
                min: Number(formData.minFollowers),
                max: Number(formData.maxFollowers)
            },
            campaignGoal: 'Reach', // Default goal
            requirements: formData.requirements || undefined
        };

        onSubmit(payload);
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            title: '',
            promotionType: '',
            budget: '',
            description: '',
            requirements: '',
            targetNiche: [],
            minFollowers: 1000,
            maxFollowers: 100000
        });
    };

    const toggleNiche = (niche) => {
        setFormData(prev => ({
            ...prev,
            targetNiche: prev.targetNiche.includes(niche)
                ? prev.targetNiche.filter(n => n !== niche)
                : [...prev.targetNiche, niche]
        }));
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return formData.title && formData.promotionType;
            case 2: return formData.budget && formData.targetNiche.length > 0;
            case 3: return formData.description;
            case 4: return true;
            default: return false;
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-dark-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-dark-100">Create Campaign</h2>
                            <p className="text-sm text-dark-400">Step {step} of 4</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-dark-200 transition-all"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 py-3 bg-dark-800/50">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-dark-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[50vh]">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Campaign Type */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-dark-200 mb-2">
                                            Campaign Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., Summer Collection Promotion"
                                            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-200 mb-3">
                                            Promotion Type
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {promotionTypes.map((type) => (
                                                <motion.button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, promotionType: type.id })}
                                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${formData.promotionType === type.id
                                                        ? 'border-primary-500 bg-primary-500/10'
                                                        : 'border-dark-700 hover:border-dark-600'
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className={`text-2xl mb-2 ${formData.promotionType === type.id ? 'text-primary-400' : 'text-dark-400'
                                                        }`}>
                                                        {type.icon}
                                                    </span>
                                                    <span className="font-medium text-dark-200">{type.label}</span>
                                                    <span className="text-xs text-dark-500">{type.desc}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Budget & Audience */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-dark-200 mb-2">
                                            Budget (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            placeholder="e.g., 5000"
                                            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-200 mb-3">
                                            Target Niche (Select multiple)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {niches.map((niche) => (
                                                <motion.button
                                                    key={niche}
                                                    type="button"
                                                    onClick={() => toggleNiche(niche)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.targetNiche.includes(niche)
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                                        }`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {niche}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-200 mb-2">
                                            Follower Range
                                        </label>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={formData.minFollowers}
                                                    onChange={(e) => setFormData({ ...formData, minFollowers: e.target.value })}
                                                    placeholder="Min"
                                                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                                                />
                                                <span className="text-xs text-dark-500">Min followers</span>
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={formData.maxFollowers}
                                                    onChange={(e) => setFormData({ ...formData, maxFollowers: e.target.value })}
                                                    placeholder="Max"
                                                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                                                />
                                                <span className="text-xs text-dark-500">Max followers</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Description */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-dark-200 mb-2">
                                            Campaign Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe your campaign, what you're promoting, and what you expect from creators..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-200 mb-2">
                                            Special Requirements (Optional)
                                        </label>
                                        <textarea
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            placeholder="Any specific hashtags, mentions, or content guidelines..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Review */}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <HiSparkles className="text-4xl text-primary-400 mx-auto mb-2" />
                                        <h3 className="text-lg font-semibold text-dark-100">Review Your Campaign</h3>
                                        <p className="text-sm text-dark-400">Make sure everything looks good</p>
                                    </div>

                                    <div className="bg-dark-800/50 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-dark-400">Title</span>
                                            <span className="text-dark-200 font-medium">{formData.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-dark-400">Type</span>
                                            <span className="text-dark-200 font-medium">{formData.promotionType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-dark-400">Budget</span>
                                            <span className="text-primary-400 font-medium">₹{formData.budget}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-dark-400">Niches</span>
                                            <span className="text-dark-200 font-medium">{formData.targetNiche.join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-dark-400">Followers</span>
                                            <span className="text-dark-200 font-medium">{formData.minFollowers.toLocaleString()} - {formData.maxFollowers.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-dark-800/50 rounded-xl p-4">
                                        <span className="text-dark-400 text-sm">Description</span>
                                        <p className="text-dark-200 mt-1">{formData.description}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-dark-700 flex justify-between">
                        <button
                            onClick={step === 1 ? onClose : handleBack}
                            className="px-6 py-3 rounded-xl border border-dark-700 text-dark-300 hover:bg-dark-800 transition-all flex items-center gap-2"
                        >
                            <FaArrowLeft /> {step === 1 ? 'Cancel' : 'Back'}
                        </button>

                        {step < 4 ? (
                            <motion.button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Next <FaArrowRight />
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={handleSubmit}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium flex items-center gap-2"
                            >
                                <FaCheck /> Create Campaign
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RequestWizard;
