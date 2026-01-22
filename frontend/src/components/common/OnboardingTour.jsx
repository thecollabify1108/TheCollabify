import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaArrowRight, FaCheck } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const OnboardingTour = ({ userRole }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [hasCompletedTour, setHasCompletedTour] = useState(false);

    // Define tour steps based on user role
    const creatorSteps = [
        {
            title: '👋 Welcome to Your Dashboard!',
            description: 'This is your command center. Track promotions, earnings, and manage your profile all in one place.',
            target: null,
            position: 'center'
        },
        {
            title: '📊 Track Your Progress',
            description: 'Complete your profile to unlock AI-powered campaign matching. The progress ring shows how much is left!',
            target: '.profile-progress',
            position: 'bottom'
        },
        {
            title: '💰 View Your Earnings',
            description: 'Monitor your active promotions, total earnings, and success rate in real-time.',
            target: '.quick-stats',
            position: 'bottom'
        },
        {
            title: '🎯 Discover Campaigns',
            description: 'Browse AI-matched campaigns perfect for your profile. The higher the match score, the better!',
            target: '.available-promotions',
            position: 'top'
        },
        {
            title: '📬 Manage Applications',
            description: 'Track all your campaign applications and their status in one place.',
            target: '.my-applications',
            position: 'top'
        },
        {
            title: '⭐ Earn Badges',
            description: 'Complete campaigns to earn achievement badges and increase your match scores!',
            target: '.badges-section',
            position: 'top'
        }
    ];

    const sellerSteps = [
        {
            title: '👋 Welcome to Your Brand Dashboard!',
            description: 'Manage campaigns, discover creators, and track ROI all from this central hub.',
            target: null,
            position: 'center'
        },
        {
            title: '🚀 Quick Actions',
            description: 'Create new campaigns, browse creators, or check analytics with one click.',
            target: '.quick-actions',
            position: 'bottom'
        },
        {
            title: '📊 Campaign Overview',
            description: 'View your active campaigns, total reach, investment, and ROI at a glance.',
            target: '.campaign-summary',
            position: 'bottom'
        },
        {
            title: '🔍 Discover Creators',
            description: 'Use AI-powered search to find creators that perfectly match your brand.',
            target: '.creator-discovery',
            position: 'top'
        },
        {
            title: '📬 Review Applications',
            description: 'Manage incoming applications from interested creators efficiently.',
            target: '.applications-tab',
            position: 'top'
        },
        {
            title: '💬 Direct Messaging',
            description: 'Communicate instantly with creators to discuss campaign details.',
            target: '.messages-tab',
            position: 'top'
        }
    ];

    const steps = userRole === 'creator' ? creatorSteps : sellerSteps;

    useEffect(() => {
        // Check if user has completed tour
        const tourCompleted = localStorage.getItem(`onboarding_tour_${userRole}_completed`);

        if (!tourCompleted) {
            // Start tour after 1 second delay
            setTimeout(() => {
                setIsActive(true);
            }, 1000);
        } else {
            setHasCompletedTour(true);
        }
    }, [userRole]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        setIsActive(false);
        localStorage.setItem(`onboarding_tour_${userRole}_skipped`, 'true');
    };

    const completeTour = () => {
        setIsActive(false);
        setHasCompletedTour(true);
        localStorage.setItem(`onboarding_tour_${userRole}_completed`, 'true');
    };

    // Restart tour function (can be called from a button in settings)
    const restartTour = () => {
        localStorage.removeItem(`onboarding_tour_${userRole}_completed`);
        localStorage.removeItem(`onboarding_tour_${userRole}_skipped`);
        setCurrentStep(0);
        setIsActive(true);
        setHasCompletedTour(false);
    };

    // Expose restart function globally
    useEffect(() => {
        window.restartOnboardingTour = restartTour;
        return () => {
            delete window.restartOnboardingTour;
        };
    }, []);

    if (!isActive) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            {isActive && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                        onClick={handleSkip}
                    />

                    {/* Tour Card */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className={`fixed z-[9999] ${step.position === 'center'
                                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                                : 'bottom-8 right-8 max-w-md'
                            }`}
                    >
                        <div className="bg-dark-900 border-2 border-primary-500 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-5 relative">
                                <button
                                    onClick={handleSkip}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    aria-label="Skip tour"
                                >
                                    <FaTimes className="text-white" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                        <HiSparkles className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                                        <p className="text-sm text-white/80">
                                            Step {currentStep + 1} of {steps.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-dark-200 text-base leading-relaxed mb-6">
                                    {step.description}
                                </p>

                                {/* Progress Dots */}
                                <div className="flex justify-center gap-2 mb-6">
                                    {steps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-2 rounded-full transition-all ${index === currentStep
                                                    ? 'w-8 bg-primary-500'
                                                    : index < currentStep
                                                        ? 'w-2 bg-primary-400'
                                                        : 'w-2 bg-dark-700'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Navigation */}
                                <div className="flex gap-3">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={handlePrevious}
                                            className="flex-1 py-3 px-4 rounded-xl bg-dark-800 text-dark-200 font-medium hover:bg-dark-700 transition-colors"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        {isLastStep ? (
                                            <>
                                                <FaCheck />
                                                <span>Got it!</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Next</span>
                                                <FaArrowRight />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Skip Option */}
                                {currentStep === 0 && (
                                    <button
                                        onClick={handleSkip}
                                        className="w-full mt-3 text-sm text-dark-500 hover:text-dark-400 transition-colors"
                                    >
                                        Skip tour
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OnboardingTour;
