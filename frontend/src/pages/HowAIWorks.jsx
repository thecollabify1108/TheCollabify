import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiSparkles,
    HiShieldCheck,
    HiLightningBolt,
    HiChartBar,
    HiUserGroup,
    HiChevronDown
} from 'react-icons/hi';
import { FaRobot, FaBrain, FaBalanceScale, FaLock } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

const HowAIWorks = () => {
    // State for interactive sections
    const [activeSignal, setActiveSignal] = useState(0);
    const [activeLoopStep, setActiveLoopStep] = useState(0);
    const [activeConfidence, setActiveConfidence] = useState('high');

    const signals = [
        {
            id: 0,
            title: "Core Relevance (80%)",
            icon: HiUserGroup,
            color: "text-primary-400",
            desc: "The 'Must-Haves': We analyze budget fit, niche similarity, engagement rates, and audience demographics to ensure the foundation is solid.",
            metric: "Base Compatibility",
            value: "High",
            metricColor: "text-emerald-400"
        },
        {
            id: 1,
            title: "Short-Term Intent (5%)",
            icon: HiLightningBolt,
            color: "text-secondary-400",
            desc: "Context matters. If you've been browsing 'Tech Reviews' all morning, we prioritize tech creators for that specific session.",
            metric: "Intent Signal",
            value: "Active",
            metricColor: "text-amber-400"
        },
        {
            id: 2,
            title: "Personal History (15%)",
            icon: FaBrain,
            color: "text-pink-400",
            desc: "Your taste profile. We learn from who you've hired, rejected, or saved in the past to refine our recommendations.",
            metric: "History Match",
            value: "98%",
            metricColor: "text-pink-400"
        }
    ];

    const loopSteps = [
        {
            id: 0,
            title: "1. Recommendation",
            icon: FaRobot,
            color: "text-blue-400",
            desc: "AI suggests a creator based on your campaign brief and historical data."
        },
        {
            id: 1,
            title: "2. Your Action",
            icon: FaBalanceScale,
            color: "text-purple-400",
            desc: "You Accept, Reject, or Save the profile. This is the critical feedback signal."
        },
        {
            id: 2,
            title: "3. Refinement",
            icon: HiChartBar,
            color: "text-emerald-400",
            desc: "We immediately weight similar profiles higher (or lower) for next time."
        }
    ];

    const confidenceLevels = {
        high: {
            label: "High Confidence",
            range: "85%+",
            color: "emerald",
            desc: "We are very sure this is a great fit. Matches all your core criteria.",
            shadow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        },
        medium: {
            label: "Good Match",
            range: "65-84%",
            color: "blue",
            desc: "Solid option. Meets most criteria but might vary on budget or niche.",
            shadow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        },
        experimental: {
            label: "Experimental",
            range: "<65%",
            color: "purple",
            desc: "Wildcard option. Might be a hidden gem or outside your usual style.",
            shadow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 relative overflow-hidden font-sans">
            <SEO
                title="How Our AI Works - Transparent Matchmaking"
                description="Understand the intelligence behind TheCollabify's AI. No black boxes, just smarter connections."
            />

            {/* Background Effects */}
            <div className="grid-pattern fixed inset-0 z-0 opacity-40"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary-900/10 blur-[120px] rounded-full pointer-events-none"></div>

            <Navbar />

            <main className="relative z-10 pt-32 pb-24 px-4">
                {/* Hero Section - Compacted */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                            <HiShieldCheck className="mr-2" />
                            Explicable AI
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-dark-100">
                            No Magic. <span className="gradient-text">Just Logic.</span>
                        </h1>
                        <p className="text-lg text-dark-300 max-w-xl mx-auto leading-relaxed">
                            We believe you deserve to know exactly why a match was recommended.
                        </p>
                    </motion.div>
                </div>

                {/* Section 1: The Signals (Accordion Pattern) */}
                <section className="max-w-5xl mx-auto mb-32">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-dark-100">
                            <span className="text-primary-400">01.</span> What We Analyze
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        {/* Accordion List */}
                        <div className="space-y-4">
                            {signals.map((signal, index) => (
                                <motion.div
                                    key={signal.id}
                                    className={`p-4 rounded-xl cursor-pointer transition-colors ${activeSignal === index ? 'bg-dark-800 border border-dark-700' : 'bg-transparent border border-transparent hover:bg-dark-800/50'}`}
                                    onClick={() => setActiveSignal(index)}
                                    layout
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${activeSignal === index ? 'bg-dark-900 ' + signal.color : 'bg-dark-800 text-dark-400'}`}>
                                            <signal.icon />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold ${activeSignal === index ? 'text-dark-100' : 'text-dark-300'}`}>
                                                {signal.title}
                                            </h3>
                                        </div>
                                        {activeSignal === index && (
                                            <HiChevronDown className="text-primary-400 rotate-180 transition-transform" />
                                        )}
                                    </div>
                                    <AnimatePresence>
                                        {activeSignal === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pt-4 pl-14 text-sm text-dark-300 leading-relaxed">
                                                    {signal.desc}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        {/* Dynamic Visualization */}
                        <div className="hidden md:block">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSignal}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-secondary-500/10 blur-[60px] rounded-full"></div>
                                    <div className="relative glass-card p-8 border border-dark-700/50 min-h-[300px] flex flex-col justify-center">
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="text-dark-400 text-sm uppercase tracking-wider">Analysis Focus</span>
                                            <div className="px-3 py-1 rounded-full bg-dark-800 border border-dark-700 text-xs font-mono text-primary-400">
                                                Active
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-dark-100">{signals[activeSignal].metric}</span>
                                                <span className={`text-3xl font-black ${signals[activeSignal].metricColor}`}>
                                                    {signals[activeSignal].value}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full ${signals[activeSignal].metricColor.replace('text-', 'bg-')}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: activeSignal === 1 ? '100%' : '80%' }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                />
                                            </div>
                                            <p className="text-sm text-dark-400">
                                                Real-time calculation based on your campaign parameters.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* Section 2: The Loop (Stepper Pattern) */}
                <section className="max-w-4xl mx-auto mb-32">
                    <h2 className="text-2xl font-bold text-dark-100 mb-8 text-center">
                        <span className="text-secondary-400">02.</span> The Learning Loop
                    </h2>

                    <div className="glass-card p-1 rounded-xl flex mb-8 bg-dark-900/50">
                        {loopSteps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => setActiveLoopStep(index)}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeLoopStep === index ? 'bg-dark-800 text-white shadow-lg' : 'text-dark-400 hover:text-dark-200'}`}
                            >
                                {step.title}
                            </button>
                        ))}
                    </div>

                    <div className="relative min-h-[180px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeLoopStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-center p-8 rounded-2xl bg-dark-800/30 border border-dark-700/50"
                            >
                                <div className={`w-16 h-16 mx-auto rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-3xl mb-6 ${loopSteps[activeLoopStep].color}`}>
                                    <step.icon />
                                </div>
                                <p className="text-lg text-dark-200 max-w-lg mx-auto leading-relaxed">
                                    {loopSteps[activeLoopStep].desc}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* Section 3: Confidence (Interactive Pills) */}
                <section className="max-w-4xl mx-auto mb-32">
                    <h2 className="text-2xl font-bold text-dark-100 mb-8 text-center">
                        <span className="text-amber-400">03.</span> Honest Confidence
                    </h2>

                    <div className="flex justify-center gap-4 mb-10 flex-wrap">
                        {Object.entries(confidenceLevels).map(([key, level]) => (
                            <button
                                key={key}
                                onClick={() => setActiveConfidence(key)}
                                className={`px-6 py-2 rounded-full border text-sm font-bold transition-all ${activeConfidence === key
                                    ? `bg-${level.color}-500/10 border-${level.color}-500 text-${level.color}-400 shadow-[0_0_15px_rgba(0,0,0,0.2)]`
                                    : 'bg-transparent border-dark-700 text-dark-400 hover:border-dark-600'
                                    }`}
                            >
                                {level.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeConfidence}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`glass-card p-8 border border-${confidenceLevels[activeConfidence].color}-500/30 text-center relative overflow-hidden`}
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full bg-${confidenceLevels[activeConfidence].color}-500`}></div>
                            <h3 className={`text-4xl font-black text-${confidenceLevels[activeConfidence].color}-400 mb-2`}>
                                {confidenceLevels[activeConfidence].range}
                            </h3>
                            <p className="text-dark-200 text-lg">
                                "{confidenceLevels[activeConfidence].desc}"
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </section>

                {/* Section 4: Trust (Collapsible Details) */}
                <section className="max-w-3xl mx-auto mb-20">
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 mx-auto rounded-full bg-dark-800 flex items-center justify-center text-xl mb-4 text-dark-300">
                            <FaLock />
                        </div>
                        <h2 className="text-2xl font-bold text-dark-100">Trust & Boundaries</h2>
                    </div>

                    <div className="grid gap-4">
                        <TrustItem
                            title="No Black Boxes"
                            desc="We explain 'Why' for every match. You are never left guessing why a creator was recommended."
                        />
                        <TrustItem
                            title="Human Control"
                            desc="AI suggests; You decide. We never automate contracts or payments without your explicit approval."
                        />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

const TrustItem = ({ title, desc }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-xl bg-dark-900/50 border border-dark-800 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-dark-800/50 transition-colors"
            >
                <span className="font-bold text-dark-200">{title}</span>
                <HiChevronDown className={`text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="p-5 pt-0 text-sm text-dark-400 leading-relaxed">
                            {desc}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HowAIWorks;
