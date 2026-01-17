import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

/**
 * OnboardingChecklist - Progress checklist for new users
 * Shows tasks to complete for full platform access
 */
const OnboardingChecklist = ({ userRole, profile, onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [dismissed, setDismissed] = useState(false);

    // Check localStorage for dismissal
    useEffect(() => {
        const isDismissed = localStorage.getItem('onboarding-checklist-dismissed');
        if (isDismissed) {
            setDismissed(true);
            setIsVisible(false);
        }
    }, []);

    const creatorSteps = [
        {
            id: 'profile',
            text: 'Complete your profile',
            done: profile?.category && profile?.followerCount && profile?.bio,
            action: 'Go to Profile'
        },
        {
            id: 'browse',
            text: 'Browse 3 opportunities',
            done: profile?.browsedCount >= 3,
            action: 'Browse Now'
        },
        {
            id: 'apply',
            text: 'Apply to first campaign',
            done: profile?.appliedCount > 0,
            action: 'Find Opportunities'
        }
    ];

    const sellerSteps = [
        {
            id: 'profile',
            text: 'Set up your brand profile',
            done: profile?.companyName && profile?.industry,
            action: 'Complete Profile'
        },
        {
            id: 'campaign',
            text: 'Create your first campaign',
            done: profile?.campaignsCount > 0,
            action: 'Create Campaign'
        },
        {
            id: 'search',
            text: 'Search for creators',
            done: profile?.searchedCount > 0,
            action: 'Search Creators'
        }
    ];

    const steps = userRole === 'creator' ? creatorSteps : sellerSteps;
    const completedSteps = steps.filter(s => s.done).length;
    const progress = (completedSteps / steps.length) * 100;
    const isComplete = completedSteps === steps.length;

    const handleDismiss = () => {
        localStorage.setItem('onboarding-checklist-dismissed', 'true');
        setIsVisible(false);
        setDismissed(true);
    };

    useEffect(() => {
        if (isComplete && onComplete) {
            onComplete();
        }
    }, [isComplete, onComplete]);

    if (dismissed || !isVisible || isComplete) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-6 mb-6 border-l-4 border-primary-500 relative"
            >
                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-dark-400 hover:text-dark-200 transition"
                >
                    <FaTimes />
                </button>

                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-dark-100 mb-2">
                        Welcome! Get Started 🚀
                    </h3>
                    <p className="text-dark-400 text-sm">
                        Complete these steps to unlock the full platform
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-dark-300">{completedSteps} of {steps.length} completed</span>
                        <span className="text-primary-400 font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done
                                        ? 'bg-emerald-500'
                                        : 'bg-dark-700 border-2 border-dark-600'
                                    }`}>
                                    {step.done && (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`${step.done
                                        ? 'text-dark-300 line-through'
                                        : 'text-dark-200 font-medium'
                                    }`}>
                                    {step.text}
                                </span>
                            </div>
                            {!step.done && (
                                <button className="text-xs text-primary-400 hover:text-primary-300 hover:underline">
                                    {step.action} →
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingChecklist;
