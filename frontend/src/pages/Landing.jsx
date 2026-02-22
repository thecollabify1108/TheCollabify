import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
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
    const phrases = ['Perfect Creators', 'Ideal Influencers', 'Amazing Partners', 'Top Talent'];
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
        "Analyzing Creator Relevance...",
        "Matching Brand Intent...",
        "Verifying Audience Quality...",
        "Predicting Campaign ROI...",
        "Optimizing Collaboration Fit..."
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
            title: 'AI-Powered Matching',
            description: 'Smart algorithm connects you with the perfect creators based on engagement, niche, and campaign goals.',
            badge: 'AI Powered',
            badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        },
        {
            icon: <Icon name="chart" size={40} />,
            title: 'Real Analytics',
            description: 'Get detailed insights on creator performance, audience authenticity, and engagement quality.',
            badge: 'Real ROI',
            badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        },
        {
            icon: <Icon name="shield" size={40} />,
            title: 'Verified Creators',
            description: 'All creators are verified with authentic engagement metrics and transparent pricing.',
            badge: 'Trusted',
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
                const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.thecollabify.tech' : '');
                const response = await fetch(`${apiUrl}/api/public/stats`);
                const result = await response.json();
                if (result.success) {
                    setStats({
                        totalCreators: result.data.totalCreators > 0 ? `${result.data.totalCreators}+` : '100+',
                        totalBrands: result.data.totalBrands > 0 ? `${result.data.totalBrands}+` : '50+',
                        activeCampaigns: result.data.activeCampaigns > 0 ? `${result.data.activeCampaigns}+` : '100+',
                        successRate: `${result.data.successRate}%`
                    });
                }
            } catch (error) {
                console.error('Failed to fetch public stats:', error);
            }
        };
        fetchStats();
    }, []);

    // How it works steps with large numbers
    const steps = [
        {
            number: '01',
            title: 'Brand Creates Campaign',
            points: ['Set your budget', 'Define target audience', 'Specify promotion type']
        },
        {
            number: '02',
            title: 'AI Matches Creators',
            points: ['Algorithm analyzes profiles', 'Scores compatibility', 'Suggests best matches']
        },
        {
            number: '03',
            title: 'Creators Apply',
            points: ['Review opportunities', 'Submit applications', 'Showcase their style']
        },
        {
            number: '04',
            title: 'Connect & Collaborate',
            points: ['Accept best fits', 'Chat directly', 'Start the campaign']
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
                            {/* Logo */}
                            <Link to="/" className="flex items-center space-x-s2 md:space-x-s3 group">
                                <Logo className="h-8 w-8 object-contain transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                                <div className="flex flex-col">
                                    <div className="flex items-baseline">
                                        <span className="text-small italic text-dark-100 mr-1">The</span>
                                        <span className="text-body font-bold text-dark-100">Collabify</span>
                                    </div>
                                    <span className="text-xs-pure text-dark-400 -mt-1 tracking-wide hidden sm:block">Empowering Influencer Partnerships</span>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center space-x-s3">
                                <Link to="/for-brands" className="text-dark-400 hover:text-dark-200 transition text-small font-medium">For Brands</Link>
                                <Link to="/for-creators" className="text-dark-400 hover:text-dark-200 transition text-small font-medium">For Influencers</Link>
                                <a href="#how-it-works" className="text-dark-400 hover:text-dark-200 transition text-small font-medium">How It Works</a>
                                <a href="#features" className="text-dark-400 hover:text-dark-200 transition text-small font-medium">Features</a>
                                <a href="#about" className="text-dark-400 hover:text-dark-200 transition text-small font-medium">About Us</a>
                            </div>

                            {/* Desktop Right Side */}
                            <div className="hidden md:flex items-center space-x-s2">
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
                            <div className="flex md:hidden items-center space-x-s1">
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

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-dark-900/95 backdrop-blur-xl border-t border-dark-800">
                            <div className="px-4 py-4 space-y-3">
                                {/* Top Actions - Better centered for mobile */}
                                <div className="flex flex-col sm:flex-row gap-3 px-4 pb-4 border-b border-dark-700">
                                    <button
                                        onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                        className="w-full py-3 rounded-xl btn-secondary text-sm font-medium"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                                        className="w-full py-3 rounded-xl btn-3d text-sm font-medium"
                                    >
                                        Get Started
                                    </button>
                                </div>
                                {/* Navigation Links */}
                                <Link
                                    to="/for-brands"
                                    className="block py-3 px-4 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    For Brands
                                </Link>
                                <Link
                                    to="/for-creators"
                                    className="block py-3 px-4 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    For Influencers
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="block py-3 px-4 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    How It Works
                                </a>
                                <a
                                    href="#features"
                                    className="block py-3 px-4 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </a>
                                <a
                                    href="#about"
                                    className="block py-3 px-4 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About Us
                                </a>
                            </div>
                        </div>
                    )}
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
                                Smart Influencer Marketing Platform
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
                            <span className="text-dark-100">Connect </span>
                            <span className="gradient-text">Brands</span>
                            <span className="text-dark-100"> with</span>
                            <br />
                            <span className="gradient-text">{displayText}</span>
                            <span className="typing-cursor"></span>
                        </motion.h1>

                        <motion.p
                            className="text-h2 text-dark-400 max-w-3xl mx-auto mb-s6 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            AI-powered influencer marketing made simple. Find the perfect creators for your brand,
                            or discover exciting brand partnerships as a creator.
                        </motion.p>

                        {/* Two CTA Buttons - VRInfluence Style */}
                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-s3"
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
                                Not ready to join? Try the Interactive Demo
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
                <section className="py-24 px-s2 relative bg-dark-900 border-t border-dark-800/50">
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
                                No black boxes. No magic tricks. Just a system designed to learn what successful partnerships look like for YOU.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-s12 items-center">
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
                                            <p className="text-dark-400 text-small">We don't just match keywords. We analyze content style, tone, and audience values to find brand-safe fits.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-s4">
                                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-primary-400 font-bold border border-dark-700">2</div>
                                        <div>
                                            <h4 className="text-body font-bold text-dark-100">Performance History</h4>
                                            <p className="text-dark-400 text-small">Creators with a track record of on-time delivery and high engagement get priority visibility.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-s4">
                                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-primary-400 font-bold border border-dark-700">3</div>
                                        <div>
                                            <h4 className="text-body font-bold text-dark-100">Audience Authenticity</h4>
                                            <p className="text-dark-400 text-small">We flag suspicious follower spikes instantly. Quality always beats quantity.</p>
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
                                        <div className="w-10 h-10 mx-auto bg-dark-700 rounded-full flex items-center justify-center border border-dark-600 mb-2 text-xl">🤝</div>
                                        <span className="text-xs text-dark-300 font-medium">Match Made</span>
                                    </div>

                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-32">
                                        <span className="text-xs text-dark-300 font-medium block mb-2">Smarter Next Time</span>
                                        <div className="w-10 h-10 mx-auto bg-emerald-900/30 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-400 text-xl">📈</div>
                                    </div>

                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 text-center w-24">
                                        <div className="w-10 h-10 mx-auto bg-dark-700 rounded-full flex items-center justify-center border border-dark-600 mb-2 text-xl">📊</div>
                                        <span className="text-xs text-dark-300 font-medium">Data</span>
                                    </div>

                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 text-center w-24">
                                        <div className="w-10 h-10 mx-auto bg-dark-700 rounded-full flex items-center justify-center border border-dark-600 mb-2 text-xl">💬</div>
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
                                "We built Collabify because the old way of spreadsheets, cold emails, and guessing games just doesn't scale."
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-s8 text-left">
                            <motion.div
                                className="p-s6 rounded-premium-2xl bg-dark-800/20 border border-dark-700/50"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="text-red-400 mb-s4 text-h2">❌</div>
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
                                <div className="text-amber-400 mb-s4 text-h2">⚠️</div>
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
                                <div className="text-primary-400 mb-s4 text-h2">⚡</div>
                                <h3 className="text-body font-bold text-dark-100 mb-s2">AI is the Natural Step</h3>
                                <p className="text-dark-400 text-small leading-relaxed">
                                    Technology should handle the logistics—contracts, payments, and matching—so you can focus on creating the actual content.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Early Insights - Qualitative Traction */}
                <section className="py-s12 px-s2 relative bg-dark-950 border-b border-dark-800/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-s12">
                            <span className="text-primary-400 text-xs-pure font-bold tracking-widest uppercase mb-s2 block">Real Insights</span>
                            <motion.h2
                                className="text-h2 md:text-h1 font-bold mb-s4 text-dark-100"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                What We're Hearing
                            </motion.h2>
                            <p className="text-dark-400 text-body max-w-2xl mx-auto">
                                We spoke to over <span className="text-white font-semibold">500+ creators and brands</span> before writing a single line of code. Here is the reality.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-s6">
                            {/* Insight 1 */}
                            <motion.div
                                className="glass-card p-s8 border-l-4 border-l-red-500 relative overflow-hidden"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="absolute top-s4 right-s4 text-h1 text-dark-800/50 font-serif">"</div>
                                <h3 className="text-h3 font-bold text-dark-100 mb-s4">The "Ghosting" Epidemic</h3>
                                <p className="text-dark-300 italic mb-s6 text-small">
                                    "I send 50 DMs, get 2 replies, and 0 contracts. It feels like I'm shouting into a void."
                                </p>
                                <div className="flex items-center gap-s3 mt-auto pt-s4 border-t border-dark-800/50">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs-pure font-bold">80%</div>
                                    <span className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Non-response rate</span>
                                </div>
                            </motion.div>

                            {/* Insight 2 */}
                            <motion.div
                                className="glass-card p-s8 border-l-4 border-l-emerald-500 relative overflow-hidden"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="absolute top-s4 right-s4 text-h1 text-dark-800/50 font-serif">"</div>
                                <h3 className="text-h3 font-bold text-dark-100 mb-s4">Niche Power &gt; Fame</h3>
                                <p className="text-dark-300 italic mb-s6 text-small">
                                    "My 10k followers are die-hard fans. The guy with 1M followers gets likes, but I get sales."
                                </p>
                                <div className="flex items-center gap-s3 mt-auto pt-s4 border-t border-dark-800/50">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs-pure font-bold">10x</div>
                                    <span className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Higher ROI</span>
                                </div>
                            </motion.div>

                            {/* Insight 3 */}
                            <motion.div
                                className="glass-card p-s8 border-l-4 border-l-amber-500 relative overflow-hidden"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="absolute top-s4 right-s4 text-h1 text-dark-800/50 font-serif">"</div>
                                <h3 className="text-h3 font-bold text-dark-100 mb-s4">Payment Anxiety</h3>
                                <p className="text-dark-300 italic mb-s6 text-small">
                                    "Brand deals are great until you have to chase the invoice for 3 months. I just want to be safe."
                                </p>
                                <div className="flex items-center gap-s3 mt-auto pt-s4 border-t border-dark-800/50">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs-pure font-bold">#1</div>
                                    <span className="text-xs-pure text-dark-400 font-bold uppercase tracking-wider">Escrow Request</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* How It Works - Large Numbers Style */}
                <section id="how-it-works" className="py-28 md:py-32 px-s2 relative">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-s12">
                            <motion.h2
                                className="text-h2 md:text-h1 font-bold mb-s4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="gradient-text">How It Works</span>
                            </motion.h2>
                            <motion.p
                                className="text-dark-400 text-body max-w-2xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                Simple, streamlined process to connect brands with creators
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-s6">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="glass-card p-s8 relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    {/* Large Number Background */}
                                    <div className="absolute -top-4 -right-4 text-[120px] font-extrabold text-primary-500/5 leading-none select-none">
                                        {step.number}
                                    </div>

                                    <div className="relative z-10">
                                        <div className="text-h1 font-bold text-primary-500/40 mb-s4">{step.number}</div>
                                        <h3 className="text-h3 font-bold mb-s4 text-dark-100">{step.title}</h3>
                                        <ul className="space-y-s2">
                                            {step.points.map((point, i) => (
                                                <li key={i} className="flex items-center text-dark-400 text-small">
                                                    <Icon name="check" size={16} className="text-emerald-400 mr-2 flex-shrink-0" />
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

                {/* Features - Bento Box Style */}
                <section id="features" className="py-28 md:py-32 px-s2 relative bg-dark-900/50">
                    <div className="max-w-6xl mx-auto relative z-10">
                        <div className="text-center mb-s12">
                            <motion.h2
                                className="text-h2 md:text-h1 font-bold mb-s4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="gradient-text">Why Choose Us</span>
                            </motion.h2>
                            <motion.p
                                className="text-dark-400 text-body max-w-2xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                Everything you need to run successful influencer campaigns
                            </motion.p>
                        </div>

                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-s6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="glass-card p-s8 hover:border-primary-500/30 transition-all duration-300 group"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="flex items-start gap-s6">
                                        <div className="w-16 h-16 rounded-premium-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-glow">
                                            {feature.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-s3 mb-s2">
                                                <h3 className="text-h3 font-bold text-dark-100">{feature.title}</h3>
                                                <span className={`px-s2 py-0.5 text-xs-pure font-bold rounded-full border ${feature.badgeColor} uppercase tracking-wider`}>
                                                    {feature.badge}
                                                </span>
                                            </div>
                                            <p className="text-dark-400 text-body leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Leaderboard Section */}
                <Leaderboard />

                {/* Testimonials Carousel - Hidden until real testimonials are collected */}
                {/* <TestimonialsCarousel /> */}

                {/* FAQ Accordion */}
                <FAQAccordion />

                {/* Final CTA Section */}
                <section className="py-28 md:py-32 px-s2 relative">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            className="glass-card p-s12 md:p-s12 text-center relative overflow-hidden shadow-premium"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="relative z-10">
                                <FaHandshake className="w-16 h-16 text-primary-400 mx-auto mb-s6" />
                                <h2 className="text-h2 md:text-h1 font-bold mb-s6 text-dark-100">
                                    Ready to Start Collaborating?
                                </h2>
                                <p className="text-dark-400 text-body md:text-h3 mb-s12 max-w-xl mx-auto font-medium">
                                    Join thousands of brands and creators already growing together on our platform.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-s4">
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="btn-3d text-body px-s8 py-s4"
                                    >
                                        Create Free Account
                                    </button>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="btn-secondary text-body px-s8 py-s4"
                                    >
                                        Login
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-28 md:py-32 px-s2 relative">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-s12 items-center"
                        >
                            {/* Image Side */}
                            <div className="relative">
                                <div className="relative rounded-premium-2xl overflow-hidden">
                                    <img
                                        src="/favicon.png"
                                        alt="About The Collabify"
                                        className="w-full h-auto max-w-md mx-auto opacity-80"
                                    />
                                </div>
                                {/* Decorative Elements */}
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-xl"></div>
                                <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-secondary-500/20 to-pink-500/20 rounded-full blur-xl"></div>
                            </div>

                            {/* Content Side */}
                            <div>
                                <span className="text-primary-400 text-xs-pure font-bold tracking-widest uppercase mb-s2 block">About</span>
                                <h2 className="text-h2 md:text-h1 font-bold text-dark-100 mb-s6">
                                    The Collabify
                                </h2>
                                <p className="text-dark-300 text-body leading-relaxed mb-s8">
                                    The Collabify is an AI-powered influencer marketing platform designed to connect brands
                                    with the right creators seamlessly. We simplify campaign management by automating
                                    influencer discovery, performance tracking, and payouts—all in one dashboard.
                                </p>
                                <p className="text-dark-400 text-body leading-relaxed mb-s8">
                                    With data-driven insights and transparent processes, we empower brands to maximize
                                    ROI and help influencers grow through genuine collaborations.
                                </p>
                                <div className="flex flex-wrap gap-s12">
                                    <div className="text-center">
                                        <div className="text-h1 font-bold text-primary-400">{stats.totalCreators}</div>
                                        <div className="text-dark-400 text-xs-pure font-bold uppercase tracking-wider">Creators</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-h1 font-bold text-secondary-400">{stats.totalBrands}</div>
                                        <div className="text-dark-400 text-xs-pure font-bold uppercase tracking-wider">Brands</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-h1 font-bold text-pink-400">{stats.activeCampaigns}</div>
                                        <div className="text-dark-400 text-xs-pure font-bold uppercase tracking-wider">Campaigns</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer - VRInfluence Style */}
                <footer className="py-s12 px-s2 border-t border-dark-800 bg-dark-950/50 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-s12">
                            {/* Logo & Description */}
                            <div>
                                <Link to="/" className="flex items-center space-x-s3 mb-s6 group">
                                    <img src="/favicon.png" alt="" className="w-8 h-8 object-contain transition-transform group-hover:rotate-12" />
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline">
                                            <span className="text-body italic text-dark-100 mr-1">The</span>
                                            <span className="text-h3 font-bold text-dark-100">Collabify</span>
                                        </div>
                                    </div>
                                </Link>
                                <p className="text-dark-400 text-small leading-relaxed mb-s4">
                                    Empowering brands and creators to build authentic partnerships.
                                    Our AI-powered platform streamlines influencer discovery, campaign
                                    management, and performance tracking.
                                </p>
                                <p className="text-dark-400 text-small leading-relaxed">
                                    Join thousands of successful collaborations and grow your business
                                    with data-driven influencer marketing.
                                </p>
                            </div>

                            {/* Solutions */}
                            <div>
                                <h4 className="text-body font-bold text-dark-100 mb-s6">Solutions</h4>
                                <ul className="space-y-s4">
                                    <li>
                                        <Link to="/for-brands" className="text-dark-400 hover:text-dark-200 transition text-small">
                                            For Brands
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/for-creators" className="text-dark-400 hover:text-dark-200 transition text-small">
                                            For Influencers
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/register" className="text-dark-400 hover:text-dark-200 transition text-small">
                                            Get Started
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/login" className="text-dark-400 hover:text-dark-200 transition text-small">
                                            Sign In
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal & Contact */}
                            <div>
                                <h4 className="text-lg font-bold text-dark-100 mb-4">Legal</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <Link to="/terms" className="text-dark-400 hover:text-dark-200 transition text-sm">
                                            Terms & Conditions
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/privacy" className="text-dark-400 hover:text-dark-200 transition text-sm">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                </ul>
                                <div className="mt-6">
                                    <h5 className="text-dark-200 font-medium mb-2 text-sm">Contact Us</h5>
                                    <a
                                        href="mailto:support@thecollabify.ai"
                                        className="text-primary-400 hover:text-primary-300 transition text-sm"
                                    >
                                        support@thecollabify.ai
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="border-t border-dark-800 mt-12 pt-8 text-center">
                            <p className="text-dark-400 text-sm">
                                © {new Date().getFullYear()} The Collabify. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>

                {/* Floating Mobile CTA Bar - High Conversion */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="fixed bottom-0 left-0 right-0 md:hidden bg-dark-900/95 backdrop-blur-xl border-t border-dark-700 p-4 z-50"
                >
                    <div className="flex gap-3">
                        <Link
                            to="/register?role=creator"
                            className="flex-1 text-center py-3 px-4 rounded-xl bg-dark-800 border border-dark-600 hover:border-primary-500 text-dark-100 font-semibold transition-all"
                        >
                            I'm a Creator
                        </Link>
                        <Link
                            to="/register?role=seller"
                            className="flex-1 text-center py-3 px-4 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition shadow-lg shadow-primary-500/30"
                        >
                            I'm a Brand
                        </Link>
                    </div>
                </motion.div>

                {/* Scroll to Top Button - Optimized for Mobile */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-24 md:bottom-8 right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-500/80 hover:bg-primary-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110 active:scale-95"
                        aria-label="Scroll to top"
                    >
                        <span className="text-lg md:text-xl">↑</span>
                    </button>
                )}
            </div >
        </>
    );
};

export default Landing;
