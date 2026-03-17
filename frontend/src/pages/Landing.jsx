import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/common/ThemeToggle';
import QuickTourGuide from '../components/common/QuickTourGuide';
import AnimatedCounter from '../components/common/AnimatedCounter';
// import TestimonialsCarousel from '../components/common/TestimonialsCarousel';
import FAQAccordion from '../components/common/FAQAccordion';
import Leaderboard from '../components/common/Leaderboard';
import SocialProofWidget from '../components/common/SocialProofWidget';
import Icon from '../components/common/Icon';
import Logo from '../components/common/Logo';

// TIER 1: Premium Visual Effects
import ParallaxSection from '../components/effects/ParallaxSection';
import MorphingLogo from '../components/effects/MorphingLogo';

const Landing = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(null);
    const toggleAccordion = (id) => setOpenAccordion(prev => prev === id ? null : id);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    // Typing animation effect
    const phrases = ['Verified Creators', 'Predictive Matches', 'Fraud-Free Campaigns', 'Data-Driven ROI'];
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex];
        const typingSpeed = isDeleting ? 50 : 100;
        const pauseTime = 2000;

        const timer = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentPhrase.length) {
                    setDisplayText(currentPhrase.slice(0, displayText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(currentPhrase.slice(0, displayText.length - 1));
                } else {
                    setIsDeleting(false);
                    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                }
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [displayText, isDeleting, currentPhraseIndex]);

    // AI Status Cycle
    const aiStatuses = [
        "Computing Creator Quality Index...",
        "Running Fraud Detection Scan...",
        "Analyzing Audience Authenticity...",
        "Predicting Campaign Performance...",
        "Optimizing Match Confidence Score..."
    ];
    const [aiStatusIndex, setAiStatusIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAiStatusIndex((prev) => (prev + 1) % aiStatuses.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getLogoLink = () => {
        if (isAuthenticated && user) {
            if (user.role === 'creator') return '/creator/dashboard';
            if (user.role === 'seller') return '/seller/dashboard';
            if (user.role === 'admin') return '/admin';
        }
        return '/';
    };

    // Bento-box style feature cards
    const features = [
        {
            icon: <Icon name="sparkles" size={40} />,
            title: 'Collaboration Intelligence',
            description: 'Proprietary scoring engine with CQI, fraud detection, and predictive modeling — not just keyword matching.',
            badge: 'AI Engine v2',
            badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        },
        {
            icon: <Icon name="chart" size={40} />,
            title: 'Predictive Analytics',
            description: 'Campaign ROI predictions, engagement forecasts, and performance benchmarks powered by real collaboration data.',
            badge: 'Predictive',
            badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        },
        {
            icon: <Icon name="shield" size={40} />,
            title: 'Fraud Detection',
            description: 'Multi-signal authenticity scoring catches fake followers, engagement manipulation, and suspicious growth patterns.',
            badge: 'Protected',
            badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
        },
        {
            icon: <Icon name="wallet" size={40} />,
            title: 'Secure Payments',
            description: 'Set your budget and find creators that match. No hidden fees, transparent negotiations.',
            badge: 'Safe & Secure',
            badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        }
    ];

    const [stats, setStats] = useState({
        totalCreators: '500+',
        totalBrands: '100+',
        activeCampaigns: '1000+',
        successRate: '98%'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('public/stats', { timeout: 8000 });
                const result = response.data;
                if (result.success) {
                    setStats({
                        totalCreators: result.data.totalCreators > 0 ? `${result.data.totalCreators}+` : '100+',
                        totalBrands: result.data.totalBrands > 0 ? `${result.data.totalBrands}+` : '50+',
                        activeCampaigns: result.data.activeCampaigns > 0 ? `${result.data.activeCampaigns}+` : '100+',
                        successRate: `${result.data.successRate}%`
                    });
                }
            } catch (error) {
                // Silently use fallback stats — landing page works fine with defaults
            }
        };
        fetchStats();
    }, []);

    // How it works steps with large numbers
    const steps = [
        {
            number: '01',
            title: 'Creator Onboards',
            icon: 'user',
            points: ['Upload creator profile information', 'Connect social media account', 'Set collaboration preferences']
        },
        {
            number: '02',
            title: 'Authenticity Verification',
            icon: 'shield-check',
            points: ['Follower legitimacy analysis', 'Engagement pattern verification', 'Creator trust score generated']
        },
        {
            number: '03',
            title: 'AI Engagement Analysis',
            icon: 'sparkles',
            points: ['Audience alignment detection', 'Fraud signal identification', 'Campaign compatibility scoring']
        },
        {
            number: '04',
            title: 'Brand Discovery',
            icon: 'search',
            points: ['Brands explore verified creators', 'Filter by niche, budget, and campaign goals', 'View AI confidence score for matches']
        },
        {
            number: '05',
            title: 'Campaign Insights',
            icon: 'chart',
            points: ['Estimated engagement potential', 'Risk indicators highlighted', 'Data-driven creator selection']
        }
    ];

    return (
        <>
            <div className="min-h-screen bg-dark-950 overflow-hidden relative">
                {/* Original floating orbs replaced by LiquidBackground */}
                <div className="grid-pattern"></div>

                {/* Centered Watermark */}
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
                    <img
                        src="/favicon.png"
                        alt="TheCollabify Logo - Smart Influencer Marketing Platform"
                        loading="eager"
                        className="w-96 h-auto opacity-10"
                    />
                </div>

                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
                    <div className="max-w-7xl mx-auto px-s2 sm:px-s3 lg:px-s4">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo — centered on mobile, left on desktop */}
                            <Link to="/" className="flex items-center gap-2 group relative lg:relative lg:left-auto lg:translate-x-0">
                                <Logo className="h-7 w-7 object-contain transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 flex-shrink-0" />
                                <div className="flex items-baseline leading-none">
                                    <span className="text-small italic text-dark-100">The</span>
                                    <span className="text-body font-bold text-dark-100 ml-0.5">Collabify</span>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex items-center space-x-2 xl:space-x-s3">
                                <Link to="/for-brands" className="text-dark-400 hover:text-dark-200 transition text-xs xl:text-small font-medium whitespace-nowrap">For Brands</Link>
                                <Link to="/for-creators" className="text-dark-400 hover:text-dark-200 transition text-xs xl:text-small font-medium whitespace-nowrap">For Influencers</Link>
                                <a href="#how-it-works" className="text-dark-400 hover:text-dark-200 transition text-xs xl:text-small font-medium whitespace-nowrap">How It Works</a>
                                <a href="#features" className="text-dark-400 hover:text-dark-200 transition text-xs xl:text-small font-medium whitespace-nowrap">Features</a>
                                <a href="#about" className="text-dark-400 hover:text-dark-200 transition text-xs xl:text-small font-medium whitespace-nowrap">About Us</a>
                            </div>

                            {/* Desktop Right Side */}
                            <div className="hidden lg:flex items-center space-x-s2">
                                <ThemeToggle />
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-dark-300 hover:text-dark-100 transition text-small font-bold"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn-3d text-small"
                                >
                                    Get Started
                                </button>
                            </div>

                            {/* Mobile Right Side */}
                            <div className="flex lg:hidden items-center space-x-s1 ml-auto relative z-10">
                                <div className="scale-90 origin-right">
                                    <ThemeToggle />
                                </div>
                                {/* Hamburger Menu Button */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-dark-800 hover:bg-dark-700 transition border border-dark-700"
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? (
                                        <Icon name="close" size={20} className="text-dark-100" />
                                    ) : (
                                        <Icon name="menu" size={20} className="text-dark-100" />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <>
                                {/* Backdrop to close menu */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm lg:hidden"
                                />
                                <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="fixed top-24 right-5 z-[100] w-72 bg-dark-950/98 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col p-6 lg:hidden"
                            >
                                {/* Decorative Background Elements */}
                                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
                                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary-500/10 blur-[120px] rounded-full pointer-events-none" />
                                
                                {/* Menu Header (Logo + Close) */}
                                <div className="absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between border-b border-white/5 bg-dark-950/50 backdrop-blur-md">
                                    <Logo className="h-8 w-8" />
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10"
                                    >
                                        <Icon name="close" size={24} className="text-white" />
                                    </motion.button>
                                </div>

                                {/* Navigation Links */}
                                <div className="flex flex-col space-y-6 mt-8">
                                    {[
                                        { label: 'For Brands', to: '/for-brands' },
                                        { label: 'For Influencers', to: '/for-creators' },
                                        { label: 'How It Works', to: '#how-it-works' },
                                        { label: 'Features', to: '#features' },
                                        { label: 'About Us', to: '#about' }
                                    ].map((item, i) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 100 }}
                                        >
                                            {item.to.startsWith('#') ? (
                                                <a
                                                    href={item.to}
                                                    className="text-4xl font-black text-white hover:text-primary-400 transition-colors tracking-tighter"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {item.label}
                                                </a>
                                            ) : (
                                                <Link
                                                    to={item.to}
                                                    className="text-4xl font-black text-white hover:text-primary-400 transition-colors tracking-tighter"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {item.label}
                                                </Link>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-auto mb-12 flex flex-col gap-4"
                                >
                                    <button
                                        onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                                    >
                                        Get Started
                                    </button>
                                </motion.div>

                                {/* Footer Info */}
                                <div className="mb-8 border-t border-white/5 pt-6 flex justify-between items-center opacity-40">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">© 2026 TheCollabify</span>
                                    <div className="flex gap-4">
                                        <Icon name="twitter" size={16} />
                                        <Icon name="instagram" size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                {/* Hero Section - VRInfluence Style */}
                <section className="relative pt-32 pb-s8 px-s2">
                    <div className="max-w-5xl mx-auto relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-flex items-center px-s2.5 py-s1 rounded-full text-xs-pure font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-s4">
                                <Icon name="sparkles" size={16} className="mr-2" />
                                AI Collaboration Intelligence Platform
                            </span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="h-8 mb-s2 flex items-center justify-center overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={aiStatusIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-xs-pure font-mono text-primary-400/80 tracking-widest uppercase flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                                    {aiStatuses[aiStatusIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </motion.div>

                        <motion.h1
                            className="text-h1 md:text-[3.5rem] lg:text-[4.5rem] font-extrabold mb-s4 leading-tight min-h-[120px] md:min-h-[180px]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <span className="text-dark-100">Creator Intelligence</span>
                            <br />
                            <span className="text-dark-100">Built for </span>
                            <span className="gradient-text">{displayText}</span>
                            <span className="typing-cursor"></span>
                        </motion.h1>

                        <motion.p
                            className="text-sm md:text-body lg:text-h3 text-dark-400 max-w-2xl mx-auto mb-s6 leading-relaxed px-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            AI-driven creator verification and brand collaboration intelligence. Discover authentic creators, predict campaign performance, and eliminate fraud — all in one platform.
                        </motion.p>

                        {/* CTA Buttons — hidden on mobile (sticky bar handles it), shown on desktop */}
                        <motion.div
                            className="hidden sm:flex flex-col sm:flex-row items-center justify-center gap-s3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <button
                                onClick={() => navigate('/register?role=seller')}
                                className="group flex items-center gap-s2 px-s4 py-s2.5 rounded-premium-2xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold text-body shadow-premium hover:shadow-glow transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-white/20 rounded-premium-xl flex items-center justify-center">
                                    <Icon name="building" size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs-pure opacity-80">I'm a</div>
                                    <div className="text-h3 font-bold">Brand</div>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/register?role=creator')}
                                className="group flex items-center gap-s2 px-s4 py-s2.5 rounded-premium-2xl bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-dark-500 text-dark-100 font-semibold text-body shadow-md hover:shadow-premium transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-primary-500/20 rounded-premium-xl flex items-center justify-center text-primary-400">
                                    <Icon name="user" size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs-pure text-dark-400">I'm a</div>
                                    <div className="text-h3 font-bold">Creator</div>
                                </div>
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-s4"
                        >
                            <button
                                onClick={() => navigate('/demo')}
                                className="text-dark-400 hover:text-primary-400 transition-colors flex items-center justify-center gap-s1 mx-auto text-xs-pure font-bold border-b border-transparent hover:border-primary-400 pb-0.5"
                            >
                                <Icon name="zap" size={14} />
                                Explore the platform without signing up
                            </button>
                        </motion.div>

                        {/* Social Proof Widget - Consolidated Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="mt-16 w-full max-w-4xl mx-auto"
                        >
                            <SocialProofWidget />
                        </motion.div>
                    </div>
                </section>

                {/* AI Transparency - Trust & Learning Loop */}
                <section className="pt-8 pb-16 px-s2 relative bg-dark-900 border-t border-dark-800/50">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-s12">
                            <span className="text-emerald-400 text-xs-pure font-bold tracking-widest uppercase mb-s3 block">Transparency First</span>
                            <motion.h2
                                className="text-h2 md:text-h1 font-bold mb-s6 text-dark-100"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                How Our AI <span className="gradient-text">Actually Works</span>
                            </motion.h2>
                            <p className="text-body text-dark-300 max-w-2xl mx-auto">
                                Full transparency into how every match score is calculated. No proprietary black boxes — just a documented scoring system designed to improve with every collaboration.
                            </p>
                        </div>

                        {/* --- Mobile: Accordion cards for the 3 subsections --- */}
                        <div className="lg:hidden space-y-3 mt-6">
                            {/* 1. The 3 Core Signals */}
                            <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => toggleAccordion('signals')}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <span className="text-body font-bold text-dark-100">The 3 Core Signals</span>
                                    <span className={`text-dark-400 transition-transform duration-200 ${openAccordion === 'signals' ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                <AnimatePresence>
                                    {openAccordion === 'signals' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 space-y-4">
                                                {[{ n: '1', title: 'Deep Relevance', desc: 'Semantic embeddings analyze content style, brand values, and audience overlap — not just keyword matching.' }, { n: '2', title: 'Creator Quality Index', desc: 'Composite CQI score from content quality, engagement authenticity, delivery reliability, and collaboration history.' }, { n: '3', title: 'Fraud Detection', desc: 'Multi-signal fraud scoring detects fake followers, engagement manipulation, and suspicious growth patterns in real time.' }].map(sig => (
                                                    <div key={sig.n} className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-primary-400 font-bold border border-dark-600 flex-shrink-0 text-sm">{sig.n}</div>
                                                        <div>
                                                            <h4 className="text-small font-bold text-dark-100">{sig.title}</h4>
                                                            <p className="text-dark-400 text-xs leading-relaxed mt-0.5">{sig.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 2. The Learning Loop */}
                            <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => toggleAccordion('loop')}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <span className="text-body font-bold text-dark-100">The Learning Loop</span>
                                    <span className={`text-dark-400 transition-transform duration-200 ${openAccordion === 'loop' ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                <AnimatePresence>
                                    {openAccordion === 'loop' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 space-y-2 text-dark-300 text-sm">
                                                <div className="flex items-center gap-2"><span className="text-primary-400 font-bold text-xs">01</span> <span>Match Confirmed</span></div>
                                                <div className="flex items-center gap-2"><span className="text-primary-400 font-bold text-xs">02</span> <span>Campaign Data Collected</span></div>
                                                <div className="flex items-center gap-2"><span className="text-primary-400 font-bold text-xs">03</span> <span>Outcome Feedback Recorded</span></div>
                                                <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold text-xs">04</span> <span>AI Improves Next Prediction</span></div>
                                                <p className="text-dark-400 text-xs mt-3">It's a decision <strong className="text-white">assistant</strong>, not a replacement. You always have the final say.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* --- Desktop: Original 2-column layout --- */}
                        <div className="hidden lg:grid grid-cols-2 gap-s12 items-center">
                            {/* Left: The Signals */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-h2 font-bold text-dark-100 mb-s6">The 3 Core Signals</h3>
                                <div className="space-y-s6">
                                    <div className="flex gap-s4">
                                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-primary-400 font-bold border border-dark-700">1</div>
                                        <div>
                                            <h4 className="text-body font-bold text-dark-100">Deep Relevance</h4>
                                            <p className="text-dark-400 text-small">Semantic embeddings analyze content style, brand values, and audience overlap — not just keyword matching.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-s4">
                                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-primary-400 font-bold border border-dark-700">2</div>
                                        <div>
                                            <h4 className="text-body font-bold text-dark-100">Creator Quality Index</h4>
                                            <p className="text-dark-400 text-small">Composite CQI score from content quality, engagement authenticity, delivery reliability, and collaboration history.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-s4">
                                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-primary-400 font-bold border border-dark-700">3</div>
                                        <div>
                                            <h4 className="text-body font-bold text-dark-100">Fraud Detection</h4>
                                            <p className="text-dark-400 text-small">Multi-signal fraud scoring detects fake followers, engagement manipulation, and suspicious growth patterns in real time.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right: The Learning Loop Visual */}
                            <motion.div
                                className="relative p-8 rounded-3xl bg-dark-800/40 border border-dark-700/50"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className="text-xl font-bold text-center text-dark-100 mb-8">The Learning Loop</h3>

                                <div className="relative h-64 w-full">
                                    {/* Central AI Node */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center z-10 shadow-lg shadow-primary-500/20">
                                        <span className="font-bold text-white text-xl">AI</span>
                                    </div>

                                    {/* Orbital Nodes */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center w-32">
                                        <div className="w-10 h-10 mx-auto bg-dark-700 rounded-full flex items-center justify-center border border-dark-600 mb-2">
                                            <Icon name="check" size={18} className="text-primary-400" />
                                        </div>
                                        <span className="text-xs text-dark-300 font-medium">Match Confirmed</span>
                                    </div>

                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-32">
                                        <span className="text-xs text-dark-300 font-medium block mb-2">AI Improves</span>
                                        <div className="w-10 h-10 mx-auto bg-emerald-900/30 rounded-full flex items-center justify-center border border-emerald-500/30">
                                            <Icon name="chart" size={18} className="text-emerald-400" />
                                        </div>
                                    </div>

                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 text-center w-24">
                                        <div className="w-10 h-10 mx-auto bg-dark-700 rounded-full flex items-center justify-center border border-dark-600 mb-2">
                                            <Icon name="sparkles" size={18} className="text-primary-400" />
                                        </div>
                                        <span className="text-xs text-dark-300 font-medium">Data</span>
                                    </div>

                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 text-center w-24">
                                        <div className="w-10 h-10 mx-auto bg-dark-700 rounded-full flex items-center justify-center border border-dark-600 mb-2">
                                            <Icon name="bell" size={18} className="text-primary-400" />
                                        </div>
                                        <span className="text-xs text-dark-300 font-medium">Feedback</span>
                                    </div>

                                    {/* Connecting Lines (SVG overlay could go here, simplifying with CSS borders for now) */}
                                    <div className="absolute inset-4 border-2 border-dashed border-dark-700/50 rounded-full -z-0 animate-spin-slow"></div>
                                </div>

                                <p className="text-center text-dark-400 text-sm mt-4">
                                    It's a decision <span className="text-white font-semibold">assistant</span>, not a replacement. You always have the final say.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Why We Built This - Founder Note Style */}
                <section className="py-s12 px-s2 relative bg-dark-900/30 border-y border-dark-800/50">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-h2 md:text-h1 font-bold mb-s8">
                                <span className="text-dark-100">The Problem with </span>
                                <span className="gradient-text">Modern Collaborations</span>
                            </h2>

                            <p className="text-body md:text-h3 text-dark-300 font-medium leading-relaxed mb-s12">
                                "We built Collabify because brands and creators were wasting weeks on outreach, guesswork, and unverified data. There had to be a better way."
                            </p>
                        </motion.div>

                        {/* Mobile accordion for the 3 problems */}
                        <div className="md:hidden space-y-2 text-left mt-4">
                            {[
                                { id: 'broken', emoji: 'X', emojiColor: 'text-red-400', title: 'Manual Discovery is Broken', desc: 'Scrolling through hashtags and DMing creators is a full-time job. You need instant, data-backed matches, not a lucky guess.' },
                                { id: 'trust', emoji: '!', emojiColor: 'text-amber-400', title: 'Trust is Hard to Verify', desc: "Fake followers and inflated numbers are everywhere. We verify every single datapoint so you don't have to worry about fraud." },
                                { id: 'ai', emoji: '//', emojiColor: 'text-primary-400', title: 'AI is the Natural Step', desc: 'Technology should handle the logistics—contracts, payments, and matching—so you can focus on creating the actual content.' },
                            ].map(item => (
                                <div key={item.id} className="bg-dark-800/30 border border-dark-700/50 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleAccordion(`prob-${item.id}`)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold text-base ${item.emojiColor}`}>{item.emoji}</span>
                                            <span className="text-small font-bold text-dark-100">{item.title}</span>
                                        </div>
                                        <span className={`text-dark-400 text-xs transition-transform duration-200 ${openAccordion === `prob-${item.id}` ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    <AnimatePresence>
                                        {openAccordion === `prob-${item.id}` && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="px-4 pb-3 text-dark-400 text-xs leading-relaxed">{item.desc}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: original 3-column grid */}
                        <div className="hidden md:grid grid-cols-3 gap-s8 text-left">
                            <motion.div
                                className="p-s6 rounded-premium-2xl bg-dark-800/20 border border-dark-700/50"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="text-red-400 mb-s4 text-h2 font-bold">X</div>
                                <h3 className="text-body font-bold text-dark-100 mb-s2">Manual Discovery is Broken</h3>
                                <p className="text-dark-400 text-small leading-relaxed">
                                    Scrolling through hashtags and DMing creators is a full-time job. You need instant, data-backed matches, not a lucky guess.
                                </p>
                            </motion.div>

                            <motion.div
                                className="p-s6 rounded-premium-2xl bg-dark-800/20 border border-dark-700/50"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="text-amber-400 mb-s4 text-h2 font-bold">!</div>
                                <h3 className="text-body font-bold text-dark-100 mb-s2">Trust is Hard to Verify</h3>
                                <p className="text-dark-400 text-small leading-relaxed">
                                    Fake followers and inflated numbers are everywhere. We verify every single datapoint so you don't have to worry about fraud.
                                </p>
                            </motion.div>

                            <motion.div
                                className="p-s6 rounded-premium-2xl bg-primary-900/10 border border-primary-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="text-primary-400 mb-s4 text-h2 font-bold">//</div>
                                <h3 className="text-body font-bold text-dark-100 mb-s2">AI is the Natural Step</h3>
                                <p className="text-dark-400 text-small leading-relaxed">
                                    Technology should handle the logistics—contracts, payments, and matching—so you can focus on creating the actual content.
                                </p>
                            </motion.div>
                        </div>

                    </div>
                </section>

                {/* Early Insights - Qualitative Traction */}
                <section className="pt-6 pb-10 px-s2 relative bg-dark-950 border-b border-dark-800/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-6">
                            <span className="text-primary-400 text-xs-pure font-bold tracking-widest uppercase mb-1 block">Real Insights</span>
                            <motion.h2
                                className="text-xl md:text-h1 font-bold mb-2 text-dark-100"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                What We're Hearing
                            </motion.h2>
                            <p className="text-dark-400 text-xs md:text-small max-w-xl mx-auto">
                                We spoke to over <span className="text-white font-semibold">500+ creators and brands</span> before writing a single line of code.
                            </p>
                        </div>

                        {/* Mobile: accordion cards */}
                        <div className="md:hidden space-y-2">
                            {[
                                { id: 'ghost', accent: 'border-l-red-500', badge: '80%', badgeColor: 'bg-red-500/20 text-red-400', badgeLabel: 'Non-response rate', title: 'The "Ghosting" Epidemic', quote: '"I send 50 DMs, get 2 replies, and 0 contracts. It feels like I\'m shouting into a void."' },
                                { id: 'niche', accent: 'border-l-emerald-500', badge: '10x', badgeColor: 'bg-emerald-500/20 text-emerald-400', badgeLabel: 'Higher ROI', title: 'Niche Power > Fame', quote: '"My 10k followers are die-hard fans. The guy with 1M followers gets likes, but I get sales."' },
                                { id: 'pay', accent: 'border-l-amber-500', badge: '#1', badgeColor: 'bg-amber-500/20 text-amber-400', badgeLabel: 'Escrow Request', title: 'Payment Anxiety', quote: '"Brand deals are great until you have to chase the invoice for 3 months. I just want to be safe."' },
                            ].map(item => (
                                <div key={item.id} className={`glass-card border-l-4 ${item.accent} overflow-hidden`}>
                                    <button
                                        onClick={() => toggleAccordion(`ins-${item.id}`)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full ${item.badgeColor} flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>{item.badge}</div>
                                            <span className="text-small font-bold text-dark-100">{item.title}</span>
                                        </div>
                                        <span className={`text-dark-400 text-xs transition-transform duration-200 flex-shrink-0 ${openAccordion === `ins-${item.id}` ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    <AnimatePresence>
                                        {openAccordion === `ins-${item.id}` && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="px-4 pb-3 text-dark-300 italic text-xs leading-relaxed">{item.quote}</p>
                                                <div className="px-4 pb-3 flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${item.badgeColor.split(' ')[1]}`}>{item.badgeLabel}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: 3-col grid */}
                        <div className="hidden md:grid grid-cols-3 gap-s6">
                            <motion.div className="glass-card p-s8 border-l-4 border-l-red-500 relative overflow-hidden" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                                <div className="absolute top-s4 right-s4 text-h1 text-dark-800/50 font-serif">"</div>
                                <h3 className="text-h3 font-bold text-dark-100 mb-s4">The "Ghosting" Epidemic</h3>
                                <p className="text-dark-300 italic mb-s6 text-small">"I send 50 DMs, get 2 replies, and 0 contracts. It feels like I'm shouting into a void."</p>
                                <div className="flex items-center gap-s3 mt-auto pt-s4 border-t border-dark-800/50">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs-pure font-bold">80%</div>
                                    <span className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Non-response rate</span>
                                </div>
                            </motion.div>
                            <motion.div className="glass-card p-s8 border-l-4 border-l-emerald-500 relative overflow-hidden" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                                <div className="absolute top-s4 right-s4 text-h1 text-dark-800/50 font-serif">"</div>
                                <h3 className="text-h3 font-bold text-dark-100 mb-s4">Niche Power &gt; Fame</h3>
                                <p className="text-dark-300 italic mb-s6 text-small">"My 10k followers are die-hard fans. The guy with 1M followers gets likes, but I get sales."</p>
                                <div className="flex items-center gap-s3 mt-auto pt-s4 border-t border-dark-800/50">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs-pure font-bold">10x</div>
                                    <span className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Higher ROI</span>
                                </div>
                            </motion.div>
                            <motion.div className="glass-card p-s8 border-l-4 border-l-amber-500 relative overflow-hidden" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                                <div className="absolute top-s4 right-s4 text-h1 text-dark-800/50 font-serif">"</div>
                                <h3 className="text-h3 font-bold text-dark-100 mb-s4">Payment Anxiety</h3>
                                <p className="text-dark-300 italic mb-s6 text-small">"Brand deals are great until you have to chase the invoice for 3 months. I just want to be safe."</p>
                                <div className="flex items-center gap-s3 mt-auto pt-s4 border-t border-dark-800/50">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs-pure font-bold">#1</div>
                                    <span className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Escrow Request</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-10 md:py-14 px-s2 relative">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-5">
                            <motion.h2 className="text-xl md:text-h1 font-bold mb-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <span className="gradient-text">How It Works</span>
                            </motion.h2>
                            <motion.p className="text-dark-400 text-xs md:text-small max-w-xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                                Simple, streamlined process to connect brands with creators
                            </motion.p>
                        </div>

                        {/* Mobile: accordion steps */}
                        <div className="md:hidden space-y-2">
                            {steps.map((step, index) => (
                                <div key={index} className="glass-card overflow-hidden">
                                    <button
                                        onClick={() => toggleAccordion(`step-${index}`)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                    >
                                        <div className="w-7 h-7 rounded-md bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                                            <Icon name={step.icon} size={13} className="text-primary-400" />
                                        </div>
                                        <span className="text-small font-bold text-dark-100 flex-1">{step.title}</span>
                                        <span className={`text-dark-400 text-xs transition-transform duration-200 flex-shrink-0 ${openAccordion === `step-${index}` ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    <AnimatePresence>
                                        {openAccordion === `step-${index}` && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                                                <ul className="px-4 pb-3 space-y-1.5">
                                                    {step.points.map((point, i) => (
                                                        <li key={i} className="flex items-start text-dark-400 text-xs">
                                                            <Icon name="check" size={13} className="text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: 5-col grid */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-s6">
                            {steps.map((step, index) => (
                                <motion.div key={index} className="glass-card p-s6 relative overflow-hidden group hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -5 }}>
                                    <div className="absolute -top-4 -right-4 text-[100px] font-extrabold text-primary-500/5 leading-none select-none">{step.number}</div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-s3">
                                            <div className="w-7 h-7 rounded-md bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                                                <Icon name={step.icon} size={14} className="text-primary-400" />
                                            </div>
                                            <span className="text-small font-extrabold text-primary-500/60 tracking-wider">{step.number}</span>
                                        </div>
                                        <h3 className="text-h3 font-bold mb-s3 text-dark-100">{step.title}</h3>
                                        <ul className="space-y-1.5">
                                            {step.points.map((point, i) => (
                                                <li key={i} className="flex items-start text-dark-400 text-small">
                                                    <Icon name="check" size={13} className="text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features - Why Choose Us */}
                <section id="features" className="py-10 md:py-14 px-s2 relative bg-dark-900/50">
                    <div className="max-w-6xl mx-auto relative z-10">
                        <div className="text-center mb-5">
                            <motion.h2 className="text-xl md:text-h1 font-bold mb-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <span className="gradient-text">Why Choose Us</span>
                            </motion.h2>
                            <motion.p className="text-dark-400 text-xs md:text-small max-w-xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                                Everything you need to run successful influencer campaigns
                            </motion.p>
                        </div>

                        {/* Mobile: accordion */}
                        <div className="md:hidden space-y-2">
                            {features.map((feature, index) => (
                                <div key={index} className="glass-card overflow-hidden">
                                    <button
                                        onClick={() => toggleAccordion(`feat-${index}`)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white flex-shrink-0 text-sm">
                                            {feature.icon}
                                        </div>
                                        <span className="text-small font-bold text-dark-100 flex-1 truncate">{feature.title}</span>
                                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full border ${feature.badgeColor} uppercase tracking-wider flex-shrink-0 hidden xs:inline`}>{feature.badge}</span>
                                        <span className={`text-dark-400 text-xs transition-transform duration-200 flex-shrink-0 ${openAccordion === `feat-${index}` ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    <AnimatePresence>
                                        {openAccordion === `feat-${index}` && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                                                <p className="px-4 pb-3 text-dark-400 text-xs leading-relaxed">{feature.description}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: Bento Grid */}
                        <div className="hidden md:grid grid-cols-2 gap-s6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="glass-card p-s6 hover:border-primary-500/30 transition-all duration-300 group"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="flex items-start gap-s4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                            {feature.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="text-body font-bold text-dark-100">{feature.title}</h3>
                                                <span className={`px-2 py-0.5 text-xs-pure font-bold rounded-full border ${feature.badgeColor} uppercase tracking-wider`}>{feature.badge}</span>
                                            </div>
                                            <p className="text-dark-400 text-small leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Product Roadmap Section */}
                <section id="roadmap" className="py-10 md:py-14 px-s2 relative bg-dark-900/30 border-t border-dark-800/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <span className="text-primary-400 text-xs-pure font-bold tracking-widest uppercase mb-2 block">What's Coming</span>
                            <motion.h2 className="text-xl md:text-h1 font-bold mb-2 text-dark-100" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                Platform <span className="gradient-text">Roadmap</span>
                            </motion.h2>
                            <p className="text-dark-400 text-xs md:text-small max-w-xl mx-auto">
                                A clear path from MVP to a full-scale creator intelligence platform.
                            </p>
                        </div>
                        <div className="relative">
                            {/* Vertical line on desktop */}
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-dark-700/60"></div>
                            <div className="space-y-6">
                                {[
                                    { phase: 'Now', label: 'Live', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30', title: 'Automated Creator Verification', desc: 'Real-time fraud detection, Creator Quality Index, and audience authenticity scoring for every creator on the platform.', side: 'left' },
                                    { phase: 'Q3 2025', label: 'Building', color: 'text-primary-400', bgColor: 'bg-primary-500/10 border-primary-500/30', title: 'Campaign ROI Prediction Engine', desc: 'Pre-launch AI forecasting that predicts engagement rates, estimated reach, and conversion potential before a brand spends a dollar.', side: 'right' },
                                    { phase: 'Q4 2025', label: 'Planned', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30', title: 'Advanced Brand Analytics Dashboard', desc: 'Full campaign reporting suite: performance benchmarks, creator comparison, audience overlap analysis, and attribution modeling.', side: 'left' },
                                    { phase: 'Q1 2026', label: 'Planned', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/30', title: 'Multi-Platform Engagement Scoring', desc: 'Cross-platform scoring across Instagram, YouTube, TikTok, and LinkedIn. Unified creator profile with platform-specific risk indicators.', side: 'right' },
                                    { phase: 'Q2 2026', label: 'Vision', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30', title: 'Brand Campaign Intelligence Suite', desc: 'Automated brief generation, contract templates, milestone tracking, and post-campaign AI debrief with optimization recommendations.', side: 'left' },
                                ].map((item, index) => (
                                    <motion.div key={index} className={`md:w-[46%] ${item.side === 'right' ? 'md:ml-auto' : ''} relative`}
                                        initial={{ opacity: 0, x: item.side === 'left' ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className={`glass-card p-s6 border ${item.bgColor}`}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`text-xs-pure font-bold uppercase tracking-wider ${item.color}`}>{item.phase}</span>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${item.bgColor} ${item.color} uppercase tracking-wider`}>{item.label}</span>
                                            </div>
                                            <h3 className="text-body font-bold text-dark-100 mb-2">{item.title}</h3>
                                            <p className="text-dark-400 text-small leading-relaxed">{item.desc}</p>
                                        </div>
                                        {/* Dot on the center line */}
                                        <div className={`hidden md:block absolute top-6 ${item.side === 'left' ? '-right-[27px]' : '-left-[27px]'} w-3 h-3 rounded-full bg-dark-700 border-2 ${item.bgColor.split(' ')[0].replace('bg-', 'border-').replace('/10', '/60')}`}></div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Leaderboard Section Removed */}

                {/* Testimonials Carousel - Hidden until real testimonials are collected */}
                {/* <TestimonialsCarousel /> */}

                {/* FAQ Accordion */}
                <FAQAccordion />

                {/* Final CTA Section */}
                <section className="py-10 md:py-14 px-s2 relative">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            className="glass-card p-8 md:p-12 text-center relative overflow-hidden shadow-premium"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="relative z-10">
                                <Icon name="handshake" size={44} className="text-primary-400 mx-auto mb-4" />
                                <h2 className="text-xl md:text-h2 font-bold mb-3 text-dark-100">
                                    Ready to Start Collaborating?
                                </h2>
                                <p className="text-dark-400 text-xs md:text-small mb-8 max-w-md mx-auto">
                                    Join the intelligence layer powering creator commerce.
                                </p>
                                <div className="flex flex-row items-center justify-center gap-3">
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="flex-1 max-w-[180px] py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/25 transition-all active:scale-95 hover:shadow-xl hover:shadow-primary-500/30"
                                    >
                                        Create Free Account
                                    </button>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="flex-1 max-w-[180px] py-3 rounded-xl bg-gradient-to-r from-dark-700 to-dark-600 border border-dark-500 text-dark-100 text-sm font-bold transition-all active:scale-95 hover:border-primary-500/50 hover:from-dark-600 hover:to-dark-500"
                                    >
                                        Login
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-10 md:py-14 px-s2 relative">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                        >
                            {/* Image Side */}
                            <div className="relative hidden md:block">
                                <div className="relative rounded-premium-2xl overflow-hidden">
                                    <img
                                        src="/favicon.png"
                                        alt="About The Collabify"
                                        className="w-full h-auto max-w-md mx-auto opacity-80"
                                    />
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-xl"></div>
                                <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-secondary-500/20 to-violet-500/20 rounded-full blur-xl"></div>
                            </div>

                            {/* Content Side */}
                            <div>
                                <span className="text-primary-400 text-xs-pure font-bold tracking-widest uppercase mb-2 block">About</span>
                                <h2 className="text-xl md:text-h2 font-bold text-dark-100 mb-4">
                                    The Collabify
                                </h2>
                                <p className="text-dark-300 text-xs md:text-small leading-relaxed mb-4">
                                    The Collabify is an AI collaboration intelligence platform. We provide predictive analytics, quality scoring, fraud detection, and adaptive
                                    learning — infrastructure that gets smarter with every collaboration.
                                </p>
                                <p className="text-dark-400 text-xs md:text-small leading-relaxed mb-6">
                                    Our self-improving AI engine processes real collaboration outcomes to continuously
                                    refine match quality and surface authentic creators.
                                </p>
                                {/* Stats — all 3 on one row */}
                                <div className="flex flex-row items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-xl md:text-h2 font-extrabold text-primary-400">{stats.totalCreators}</div>
                                        <div className="text-dark-400 text-[10px] font-bold uppercase tracking-wider">Creators</div>
                                    </div>
                                    <div className="w-px h-8 bg-dark-700 flex-shrink-0"></div>
                                    <div className="text-center">
                                        <div className="text-xl md:text-h2 font-extrabold text-secondary-400">{stats.totalBrands}</div>
                                        <div className="text-dark-400 text-[10px] font-bold uppercase tracking-wider">Brands</div>
                                    </div>
                                    <div className="w-px h-8 bg-dark-700 flex-shrink-0"></div>
                                    <div className="text-center">
                                        <div className="text-xl md:text-h2 font-extrabold text-pink-400">{stats.activeCampaigns}</div>
                                        <div className="text-dark-400 text-[10px] font-bold uppercase tracking-wider">Campaigns</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 px-s2 border-t border-dark-800 bg-dark-950/50 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto">
                        {/* Top: Logo + 2-col link area */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            {/* Logo & Description */}
                            <div>
                                <Link to="/" className="flex items-center gap-2 mb-4 group">
                                    <img src="/favicon.png" alt="" className="w-7 h-7 object-contain transition-transform group-hover:rotate-12" />
                                    <div className="flex items-baseline">
                                        <span className="text-small italic text-dark-100 mr-0.5">The</span>
                                        <span className="text-body font-bold text-dark-100">Collabify</span>
                                    </div>
                                </Link>
                                <p className="text-dark-400 text-xs leading-relaxed">
                                    The intelligence layer for creator commerce. Predictive matching, fraud detection, and adaptive learning.
                                </p>
                            </div>

                            {/* Solutions + Legal side by side on mobile, separate on desktop */}
                            <div className="grid grid-cols-2 md:contents gap-6">
                                {/* Solutions */}
                                <div>
                                    <h4 className="text-small font-bold text-dark-100 mb-3">Solutions</h4>
                                    <ul className="space-y-2">
                                        <li><Link to="/for-brands" className="text-dark-400 hover:text-dark-200 transition text-xs">For Brands</Link></li>
                                        <li><Link to="/for-creators" className="text-dark-400 hover:text-dark-200 transition text-xs">For Influencers</Link></li>
                                        <li><Link to="/why-collabify" className="text-dark-400 hover:text-dark-200 transition text-xs">Why Collabify</Link></li>
                                        <li><Link to="/roadmap" className="text-dark-400 hover:text-dark-200 transition text-xs">AI Roadmap</Link></li>
                                        <li><Link to="/register" className="text-dark-400 hover:text-dark-200 transition text-xs">Get Started</Link></li>
                                    </ul>
                                </div>

                                {/* Legal */}
                                <div>
                                    <h4 className="text-small font-bold text-dark-100 mb-3">Legal</h4>
                                    <ul className="space-y-2">
                                        <li><Link to="/terms" className="text-dark-400 hover:text-dark-200 transition text-xs">Terms & Conditions</Link></li>
                                        <li><Link to="/privacy" className="text-dark-400 hover:text-dark-200 transition text-xs">Privacy Policy</Link></li>
                                    </ul>
                                    <div className="mt-4">
                                        <h5 className="text-dark-200 font-medium mb-1 text-xs">Contact</h5>
                                        <a href="mailto:support@thecollabify.ai" className="text-primary-400 hover:text-primary-300 transition text-xs">support@thecollabify.ai</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="border-t border-dark-800 pt-4 text-center">
                            <p className="text-dark-500 text-xs">© {new Date().getFullYear()} The Collabify. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

                {/* Compact Sticky Mobile CTA Bar */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.4 }}
                    className="fixed bottom-0 left-0 right-0 md:hidden z-50"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    <div className="bg-dark-950/95 backdrop-blur-xl border-t border-dark-800/80 px-4 py-2.5 flex gap-2">
                        <Link
                            to="/register?role=creator"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-800 border border-dark-600 text-dark-100 text-sm font-semibold transition-all active:scale-95"
                        >
                            <Icon name="user" size={14} className="text-primary-400" />
                            Creator
                        </Link>
                        <Link
                            to="/register?role=seller"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 transition-all active:scale-95"
                        >
                            <Icon name="building" size={14} />
                            Brand
                        </Link>
                    </div>
                </motion.div>

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-24 md:bottom-8 right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-500/80 hover:bg-primary-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110 active:scale-95"
                        aria-label="Scroll to top"
                    >
                        <span className="text-lg md:text-xl">↑</span>
                    </button>
                )}

                {/* Quick Tour Guide — shows once per session to first-time visitors */}
                <QuickTourGuide />
            </div>
        </>
    );
};

export default Landing;

