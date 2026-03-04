import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

/**
 * Quick Tour Guide
 * Shows once per browser session for first-time visitors.
 * Lets users choose Brand or Creator, then walks through the 4-step flow.
 */

const BRAND_STEPS = [
    {
        emoji: '📋',
        title: 'Create Your Campaign',
        desc: 'Tell us about your product, target audience, and campaign goals. Takes 2 minutes.',
        tip: 'The more detail you give, the better the AI matches.'
    },
    {
        emoji: '🤖',
        title: 'AI Finds Creators',
        desc: 'Our AI scores thousands of creators using CQI (Creator Quality Index), semantic matching, and fraud detection — instantly.',
        tip: 'No more sifting through spreadsheets.'
    },
    {
        emoji: '👀',
        title: 'Review & Pick',
        desc: 'See ranked creators with match %, engagement stats, and audience quality. Approve or reject with a single tap.',
        tip: 'You always have the final say — AI is your assistant, not your boss.'
    },
    {
        emoji: '🤝',
        title: 'Collaborate & Pay Safely',
        desc: 'Contracts, deliverables, and payments are handled via escrow. You only release funds when you\'re satisfied.',
        tip: 'Zero ghost risk — creators are incentivised to deliver.'
    },
];

const CREATOR_STEPS = [
    {
        emoji: '✨',
        title: 'Complete Your Profile',
        desc: 'Connect your social channels, add niche/categories, and set your content rates. Takes 5 minutes.',
        tip: 'A complete profile gets 3× more matches.'
    },
    {
        emoji: '🧠',
        title: 'AI Matches You to Brands',
        desc: 'The engine analyses your content style, audience quality, and past performance to find brands that are the right fit.',
        tip: 'No more cold DMing — brands come to you.'
    },
    {
        emoji: '📩',
        title: 'Apply or Get Invited',
        desc: 'Browse opportunities or receive private invites from brands who want you specifically. Accept what fits.',
        tip: 'Your acceptance rate matters — only accept what you can deliver.'
    },
    {
        emoji: '💳',
        title: 'Create & Get Paid',
        desc: 'Submit deliverables through the platform. Funds are held in escrow and released instantly on approval.',
        tip: 'No more chasing invoices. Guaranteed payment.'
    },
];

const QuickTourGuide = () => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [role, setRole] = useState(null); // 'brand' | 'creator'
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeen = sessionStorage.getItem('tc_tour_seen');
        if (!hasSeen) {
            // Delay a bit to let page load first
            const timer = setTimeout(() => setVisible(true), 1800);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        sessionStorage.setItem('tc_tour_seen', '1');
        setVisible(false);
    };

    const steps = role === 'brand' ? BRAND_STEPS : CREATOR_STEPS;
    const currentStep = steps[step];
    const isLast = step === steps.length - 1;

    const handleNext = () => {
        if (isLast) {
            dismiss();
            navigate(`/register?role=${role === 'brand' ? 'seller' : 'creator'}`);
        } else {
            setStep(s => s + 1);
        }
    };

    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="tour-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-dark-950/80 backdrop-blur-sm px-3 pb-4 sm:p-4"
            >
                <motion.div
                    initial={{ y: 60, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 60, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="w-full max-w-sm bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl relative"
                >
                    {/* Close */}
                    <button
                        onClick={dismiss}
                        className="absolute top-3 right-3 text-dark-500 hover:text-dark-200 transition-colors z-10"
                        aria-label="Close tour"
                    >
                        <Icon name="x" size={18} />
                    </button>

                    {/* Role selection screen */}
                    {!role && (
                        <div className="p-6">
                            <div className="text-center mb-5">
                                <span className="text-2xl">👋</span>
                                <h2 className="text-base font-bold text-dark-100 mt-2">Welcome to TheCollabify</h2>
                                <p className="text-dark-400 text-xs mt-1">How does the matchmaking work? We'll show you in 4 quick steps.</p>
                                <p className="text-dark-500 text-[11px] mt-1">Are you a Brand or a Creator?</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setRole('brand'); setStep(0); }}
                                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 hover:bg-dark-750 transition-all group"
                                >
                                    <span className="text-2xl">🏢</span>
                                    <span className="text-sm font-bold text-dark-100 group-hover:text-primary-300 transition-colors">Brand</span>
                                    <span className="text-[10px] text-dark-400 text-center">Running campaigns, looking for creators</span>
                                </button>
                                <button
                                    onClick={() => { setRole('creator'); setStep(0); }}
                                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-secondary-500/50 hover:bg-dark-750 transition-all group"
                                >
                                    <span className="text-2xl">🎨</span>
                                    <span className="text-sm font-bold text-dark-100 group-hover:text-secondary-300 transition-colors">Creator</span>
                                    <span className="text-[10px] text-dark-400 text-center">Content creator, looking for brand deals</span>
                                </button>
                            </div>
                            <button onClick={dismiss} className="w-full mt-4 text-center text-[11px] text-dark-500 hover:text-dark-300 transition-colors">
                                Skip — I'll explore on my own
                            </button>
                        </div>
                    )}

                    {/* Step screens */}
                    {role && currentStep && (
                        <div>
                            {/* Progress bar */}
                            <div className="h-1 bg-dark-800 flex">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 transition-all duration-500 ${i <= step ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-5"
                                >
                                    {/* Step header */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-dark-500 uppercase tracking-widest">
                                            Step {step + 1} of {steps.length}
                                        </span>
                                        <span className="text-xs font-bold text-primary-400 uppercase tracking-widest ml-auto">
                                            {role === 'brand' ? '🏢 Brand' : '🎨 Creator'} flow
                                        </span>
                                    </div>

                                    <div className="text-3xl mb-3">{currentStep.emoji}</div>
                                    <h3 className="text-base font-bold text-dark-100 mb-2">{currentStep.title}</h3>
                                    <p className="text-dark-300 text-xs leading-relaxed mb-3">{currentStep.desc}</p>

                                    {/* Tip */}
                                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg px-3 py-2 flex items-start gap-2 mb-4">
                                        <span className="text-sm mt-0.5">💡</span>
                                        <p className="text-primary-300 text-[11px] leading-relaxed">{currentStep.tip}</p>
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex items-center gap-2">
                                        {step > 0 && (
                                            <button
                                                onClick={() => setStep(s => s - 1)}
                                                className="px-3 py-2 rounded-lg text-dark-400 hover:text-dark-200 text-xs transition-colors border border-dark-700"
                                            >
                                                ←
                                            </button>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-primary-500/20"
                                        >
                                            {isLast ? `Get Started as ${role === 'brand' ? 'Brand' : 'Creator'} →` : 'Next →'}
                                        </button>
                                    </div>

                                    {/* Step dots */}
                                    <div className="flex justify-center gap-1.5 mt-3">
                                        {steps.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setStep(i)}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-primary-400 w-4' : 'bg-dark-700'}`}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuickTourGuide;
