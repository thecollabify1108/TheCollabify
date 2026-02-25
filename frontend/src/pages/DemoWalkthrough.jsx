import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiSparkles, HiCheck, HiArrowRight, HiLightningBolt,
    HiChartBar, HiUserGroup, HiShieldCheck
} from 'react-icons/hi';
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import CollabifyCore from '../components/effects/CollabifyCore';
import MarketingLayout from '../components/layout/MarketingLayout';

// Mock Data for the Demo
const MOCK_CREATORS = [
    {
        id: 1,
        name: "Sarah Jenkins",
        handle: "@sarah.creates",
        platform: "instagram",
        niche: "Sustainable Fashion",
        followers: "45K",
        engagement: "4.8%",
        matchScore: 98,
        image: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random",
        tags: ["Eco-friendly", "Gen Z", "Styling"]
    },
    {
        id: 2,
        name: "Tech with Tom",
        handle: "@tomtechreviews",
        platform: "youtube",
        niche: "Tech Reviews",
        followers: "120K",
        engagement: "3.2%",
        matchScore: 95,
        image: "https://ui-avatars.com/api/?name=Tom+Tech&background=random",
        tags: ["Gadgets", "Deep Dive", "Professional"]
    },
    {
        id: 3,
        name: "EcoLiving Daily",
        handle: "@ecoliving",
        platform: "tiktok",
        niche: "Lifestyle",
        followers: "85K",
        engagement: "5.5%",
        matchScore: 92,
        image: "https://ui-avatars.com/api/?name=Eco+Living&background=random",
        tags: ["Daily Vlogs", "Tips", "Viral"]
    }
];

const DemoWalkthrough = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [analyzingIndex, setAnalyzingIndex] = useState(0);

    // Step 0: Intro
    // Step 1: Campaign Input (Simulation)
    // Step 2: AI Analysis (Visual)
    // Step 3: Matches Revealed
    // Step 4: Final ROI View

    const startDemo = () => setStep(1);

    const runAnalysis = () => {
        setStep(2);
        // Simulate analysis steps
        let interval = setInterval(() => {
            setAnalyzingIndex(prev => {
                if (prev >= 3) {
                    clearInterval(interval);
                    setTimeout(() => setStep(3), 800);
                    return prev;
                }
                return prev + 1;
            });
        }, 1200);
    };

    const showROI = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(4);
        }, 1500);
    };

    return (
        <MarketingLayout>
            <CollabifyCore mode="demo" />

            {/* Demo mode banner */}
            <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: 'rgba(18,20,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-prime)' }}>Demo Mode</span>
                <button onClick={() => navigate('/register')} className="hover:opacity-100 opacity-60 transition-opacity" style={{ color: 'var(--text-sec)' }}>
                    Skip to Sign Up →
                </button>
            </div>

            {/* Progress Bar */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                {[0, 1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        className="h-1.5 w-8 rounded-full transition-all duration-300"
                        style={{ background: s <= step ? 'var(--text-prime)' : 'var(--surface-3)' }}
                    />
                ))}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-4 relative z-10 pt-32 min-h-screen">
                <AnimatePresence mode="wait">

                    {/* STEP 0: WELCOME */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center max-w-2xl"
                        >
                            <div className="w-20 h-20 bg-primary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary-500/30">
                                <HiLightningBolt className="w-10 h-10 text-primary-400" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">See the Future of <br /><span className="gradient-text">Creator Collaborations</span></h1>
                            <p className="text-xl text-dark-400 mb-10 leading-relaxed">
                                Experience how Collabify matches you with the perfect creators in seconds, not weeks. No credit card required.
                            </p>
                            <button onClick={startDemo} className="btn-3d text-lg px-10 py-4 flex items-center gap-3 mx-auto">
                                Start Interactive Demo <HiArrowRight />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: CAMPAIGN SETUP */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="glass-card p-8 md:p-12 w-full max-w-2xl relative"
                        >
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center border border-dark-700 font-bold text-dark-300">1</div>
                            <h2 className="text-2xl font-bold mb-6">Imagine you are a brand...</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-dark-400 mb-2">Campaign Goal</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-primary-500/20 border border-primary-500 text-primary-300 font-medium text-center cursor-pointer ring-2 ring-primary-500/50">
                                            Brand Awareness
                                        </div>
                                        <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 text-dark-400 font-medium text-center opacity-50">
                                            Sales Conversions
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-400 mb-2">Target Audience</label>
                                    <div className="p-4 rounded-xl bg-dark-800 border border-dark-700 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full bg-dark-700 text-sm text-dark-200">Gen Z</span>
                                        <span className="px-3 py-1 rounded-full bg-dark-700 text-sm text-dark-200">Sustainable</span>
                                        <span className="px-3 py-1 rounded-full bg-dark-700 text-sm text-dark-200">Fashion</span>
                                        <span className="animate-pulse text-primary-400">|</span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button onClick={runAnalysis} className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2">
                                        Find Creators with AI <HiSparkles />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: AI ANALYSIS */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center w-full max-w-3xl"
                        >
                            <div className="relative w-48 h-48 mx-auto mb-10">
                                <div className="absolute inset-0 border-4 border-dark-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <HiSparkles className="w-16 h-16 text-primary-400 animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-4 max-w-md mx-auto">
                                <AnimatePresence mode="wait">
                                    {analyzingIndex === 0 && (
                                        <motion.div
                                            key="a1"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl"
                                        >
                                            <HiChartBar className="text-blue-400 w-6 h-6" />
                                            <span>Scanning 50,000+ creator profiles...</span>
                                        </motion.div>
                                    )}
                                    {analyzingIndex === 1 && (
                                        <motion.div
                                            key="a2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl"
                                        >
                                            <HiShieldCheck className="text-emerald-400 w-6 h-6" />
                                            <span>Verifying audience authenticity...</span>
                                        </motion.div>
                                    )}
                                    {analyzingIndex >= 2 && (
                                        <motion.div
                                            key="a3"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl"
                                        >
                                            <HiLightningBolt className="text-purple-400 w-6 h-6" />
                                            <span>Ranking best matches for ROI...</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: MATCHES REVEALED */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-4xl"
                        >
                            <div className="text-center mb-10">
                                <span className="text-emerald-400 font-bold tracking-widest text-sm uppercase mb-2 block animate-pulse">Analysis Complete</span>
                                <h2 className="text-3xl font-bold">We found 3 perfect matches</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                {MOCK_CREATORS.map((creator, i) => (
                                    <motion.div
                                        key={creator.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-6 flex flex-col relative group hover:border-primary-500/50 transition-colors"
                                    >
                                        <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg border border-emerald-500/30">
                                            {creator.matchScore}% Match
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-dark-700 overflow-hidden">
                                                <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-dark-100">{creator.name}</h3>
                                                <p className="text-xs text-dark-400">{creator.handle}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4 text-xs text-dark-300">
                                            {creator.platform === 'instagram' && <FaInstagram className="text-pink-500" />}
                                            {creator.platform === 'tiktok' && <FaTiktok className="text-cyan-500" />}
                                            {creator.platform === 'youtube' && <FaYoutube className="text-red-500" />}
                                            <span>{creator.followers} Followers</span>
                                            <span className="w-1 h-1 bg-dark-600 rounded-full"></span>
                                            <span>{creator.engagement} Eng.</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {creator.tags.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-dark-800 text-dark-400">{tag}</span>
                                            ))}
                                        </div>

                                        <button className="mt-auto w-full py-2 rounded-lg bg-dark-800 hover:bg-primary-600 hover:text-white text-primary-400 border border-dark-700 hover:border-primary-500 transition-all text-sm font-medium">
                                            View Profile
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="text-center">
                                <button onClick={showROI} className="btn-3d px-10 py-3 flex items-center gap-2 mx-auto">
                                    Simulate Campaign Launch <HiArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: FINAL STATS */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-3xl text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                                <HiCheck className="w-10 h-10 text-emerald-400" />
                            </div>

                            <h2 className="text-4xl font-bold mb-4">You just saved 12 hours of work.</h2>
                            <p className="text-xl text-dark-400 mb-10 max-w-xl mx-auto">
                                In a real campaign, you would now be reviewing contracts and approving content. This is the power of Collabify.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                <div className="p-4 bg-dark-800/50 rounded-2xl border border-dark-700">
                                    <div className="text-3xl font-bold text-white mb-1">12h</div>
                                    <div className="text-xs text-dark-400 uppercase tracking-wider">Time Saved</div>
                                </div>
                                <div className="p-4 bg-dark-800/50 rounded-2xl border border-dark-700">
                                    <div className="text-3xl font-bold text-white mb-1">$0</div>
                                    <div className="text-xs text-dark-400 uppercase tracking-wider">Upfront Cost</div>
                                </div>
                                <div className="p-4 bg-dark-800/50 rounded-2xl border border-dark-700">
                                    <div className="text-3xl font-bold text-white mb-1">3</div>
                                    <div className="text-xs text-dark-400 uppercase tracking-wider">Verified Matches</div>
                                </div>
                                <div className="p-4 bg-dark-800/50 rounded-2xl border border-dark-700">
                                    <div className="text-3xl font-bold text-emerald-400 mb-1">10x</div>
                                    <div className="text-xs text-dark-400 uppercase tracking-wider">Potential ROI</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button onClick={() => navigate('/register')} className="btn-3d px-8 py-4 w-full sm:w-auto text-lg">
                                    Create Real Account
                                </button>
                                <button onClick={() => setStep(0)} className="text-dark-400 hover:text-white px-8 py-4 w-full sm:w-auto">
                                    Replay Demo
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </MarketingLayout>
    );
};

export default DemoWalkthrough;
