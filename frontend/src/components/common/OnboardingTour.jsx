import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaTimes, FaRocket } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';

/**
 * Onboarding Tour Component
 * Interactive guide for new users with step-by-step tooltips
 */
const OnboardingTour = ({ role = 'creator', onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Check if user has seen the tour
    useEffect(() => {
        const tourSeen = localStorage.getItem(`onboardingTour_${role}`);
        if (!tourSeen) {
            // Small delay before showing tour
            setTimeout(() => setIsVisible(true), 1500);
        }
    }, [role]);

    const creatorSteps = [
        {
            title: "Welcome to TheCollabify! 🎉",
            description: "We'll help you connect with amazing brands and grow your influence.",
            icon: HiSparkles,
            color: "from-primary-500 to-secondary-500"
        },
        {
            title: "Complete Your Profile 📝",
            description: "Add your follower count, engagement rate, and niche to attract more brands.",
            icon: HiLightningBolt,
            color: "from-amber-500 to-orange-500"
        },
        {
            title: "Browse Opportunities 🔍",
            description: "Check the 'Opportunities' tab to find promotions that match your profile.",
            icon: FaRocket,
            color: "from-green-500 to-emerald-500"
        },
        {
            title: "Apply to Promotions ✨",
            description: "Like what you see? Apply with one click and wait for brand approval!",
            icon: HiSparkles,
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Get Matched & Earn 💰",
            description: "Once accepted, chat with brands and complete promotions to earn!",
            icon: FaRocket,
            color: "from-purple-500 to-pink-500"
        }
    ];

    const sellerSteps = [
        {
            title: "Welcome to TheCollabify! 🎉",
            description: "We'll help you find the perfect creators for your brand campaigns.",
            icon: HiSparkles,
            color: "from-primary-500 to-secondary-500"
        },
        {
            title: "Create a Campaign 📢",
            description: "Click the + button to create your first promotion request.",
            icon: HiLightningBolt,
            color: "from-amber-500 to-orange-500"
        },
        {
            title: "AI Matches Creators 🤖",
            description: "Our AI finds creators that perfectly match your campaign requirements.",
            icon: HiSparkles,
            color: "from-green-500 to-emerald-500"
        },
        {
            title: "Swipe to Review 👆",
            description: "In 'Discover' tab, swipe right to accept or left to reject applicants.",
            icon: FaRocket,
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Chat & Collaborate 💬",
            description: "Message creators directly to discuss campaign details and finalize!",
            icon: HiSparkles,
            color: "from-purple-500 to-pink-500"
        }
    ];

    const steps = role === 'creator' ? creatorSteps : sellerSteps;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem(`onboardingTour_${role}`, 'true');
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isVisible) return null;

    const step = steps[currentStep];
    const StepIcon = step.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleSkip}
                    />

                    {/* Tour Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col">
                            {/* Header with gradient */}
                            <div className={`bg-gradient-to-r ${step.color} p-6 text-center flex-shrink-0`}>
                                <motion.div
                                    key={currentStep}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4"
                                >
                                    <StepIcon className="text-white text-4xl" />
                                </motion.div>

                                {/* Progress dots */}
                                <div className="flex justify-center gap-2">
                                    {steps.map((_, index) => (
                                        <motion.div
                                            key={index}
                                            className={`h-2 rounded-full transition-all ${index === currentStep
                                                ? 'w-6 bg-white'
                                                : index < currentStep
                                                    ? 'w-2 bg-white/60'
                                                    : 'w-2 bg-white/30'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>


                            {/* Content - Scrollable */}
                            <div className="p-6 flex-1 overflow-y-auto">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-xl font-bold text-dark-100 mb-3 text-center">
                                        {step.title}
                                    </h3>
                                    <p className="text-base text-dark-400 text-center mb-6 leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Navigation - Fixed at bottom */}
                            <div className="p-6 border-t border-dark-700 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={handlePrev}
                                        disabled={currentStep === 0}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${currentStep === 0
                                            ? 'text-dark-600 cursor-not-allowed'
                                            : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700'
                                            }`}
                                    >
                                        <FaArrowLeft className="text-sm" />
                                        <span className="hidden sm:inline">Back</span>
                                    </button>

                                    <button
                                        onClick={handleSkip}
                                        className="text-dark-400 hover:text-dark-200 text-sm px-2"
                                    >
                                        Skip tour
                                    </button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNext}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r ${step.color} text-white font-medium text-sm`}
                                    >
                                        {currentStep === steps.length - 1 ? (
                                            <>
                                                <span>Get Started</span>
                                                <FaRocket className="text-sm" />
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <FaArrowRight className="text-sm" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OnboardingTour;
