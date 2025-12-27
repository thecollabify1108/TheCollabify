import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiSparkles,
    HiUserGroup,
    HiChartBar,
    HiLightningBolt,
    HiShieldCheck,
    HiCash,
    HiBadgeCheck,
    HiCheck
} from 'react-icons/hi';
import { FaInstagram, FaBuilding, FaUserAlt, FaHandshake, FaChartLine, FaLock, FaWallet } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedCounter from '../components/common/AnimatedCounter';
import TestimonialsCarousel from '../components/common/TestimonialsCarousel';
import FAQAccordion from '../components/common/FAQAccordion';

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
            icon: <HiSparkles className="w-10 h-10" />,
            title: 'AI-Powered Matching',
            description: 'Smart algorithm connects you with the perfect creators based on engagement, niche, and campaign goals.',
            badge: 'AI Powered',
            badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        },
        {
            icon: <HiChartBar className="w-10 h-10" />,
            title: 'Real Analytics',
            description: 'Get detailed insights on creator performance, audience authenticity, and engagement quality.',
            badge: 'Real ROI',
            badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        },
        {
            icon: <HiShieldCheck className="w-10 h-10" />,
            title: 'Verified Creators',
            description: 'All creators are verified with authentic engagement metrics and transparent pricing.',
            badge: 'Trusted',
            badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
        },
        {
            icon: <FaWallet className="w-10 h-10" />,
            title: 'Secure Payments',
            description: 'Set your budget and find creators that match. No hidden fees, transparent negotiations.',
            badge: 'Safe & Secure',
            badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        }
    ];

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
        <div className="min-h-screen bg-dark-950 overflow-hidden relative">
            {/* 3D Animated Background */}
            <div className="floating-orbs">
                <div className="floating-orb orb-1"></div>
                <div className="floating-orb orb-2"></div>
                <div className="floating-orb orb-3"></div>
                <div className="floating-orb orb-4"></div>
                <div className="floating-orb orb-5"></div>
            </div>
            <div className="grid-pattern"></div>

            {/* Centered Watermark */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
                <img
                    src="/star-logo.png"
                    alt=""
                    className="w-96 h-auto opacity-10"
                />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3">
                            <img src="/star-logo.png" alt="" className="h-8 w-8 object-contain" />
                            <div className="flex flex-col">
                                <div className="flex items-baseline">
                                    <span className="text-lg italic text-dark-100 mr-1">The</span>
                                    <span className="text-xl font-bold text-dark-100">Collabify</span>
                                </div>
                                <span className="text-xs text-dark-400 -mt-1 tracking-wide hidden sm:block">Empowering Influencer Partnerships</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/for-brands" className="text-dark-400 hover:text-dark-200 transition">For Brands</Link>
                            <Link to="/for-creators" className="text-dark-400 hover:text-dark-200 transition">For Influencer</Link>
                            <a href="#how-it-works" className="text-dark-400 hover:text-dark-200 transition">How It Works</a>
                            <a href="#features" className="text-dark-400 hover:text-dark-200 transition">Features</a>
                            <a href="#about" className="text-dark-400 hover:text-dark-200 transition">About Us</a>
                        </div>

                        {/* Desktop Right Side */}
                        <div className="hidden md:flex items-center space-x-4">
                            <ThemeToggle />
                            <button
                                onClick={() => navigate('/login')}
                                className="text-dark-300 hover:text-dark-100 transition font-medium"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn-3d text-sm"
                            >
                                Get Started
                            </button>
                        </div>

                        {/* Mobile Right Side */}
                        <div className="flex md:hidden items-center space-x-3">
                            <ThemeToggle />
                            {/* Hamburger Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-10 h-10 rounded-lg flex items-center justify-center bg-dark-800 hover:bg-dark-700 transition"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-6 h-6 text-dark-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-dark-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-dark-900/95 backdrop-blur-xl border-t border-dark-800">
                        <div className="px-4 py-4 space-y-3">
                            {/* Login & Signup at top */}
                            <div className="flex gap-3 pb-3 border-b border-dark-800">
                                <button
                                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                    className="flex-1 py-3 rounded-xl bg-dark-800 text-dark-100 font-medium hover:bg-dark-700 transition"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                                    className="flex-1 py-3 rounded-xl btn-3d text-sm"
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
                                For Influencer
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
            <section className="relative pt-32 pb-24 px-4">
                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-8">
                            <HiSparkles className="w-4 h-4 mr-2" />
                            Smart Influencer Marketing Platform
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-8 leading-tight min-h-[120px] md:min-h-[180px]"
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
                        className="text-xl md:text-2xl text-dark-400 max-w-3xl mx-auto mb-12 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        AI-powered influencer marketing made simple. Find the perfect creators for your brand,
                        or discover exciting brand partnerships as a creator.
                    </motion.p>

                    {/* Two CTA Buttons - VRInfluence Style */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <button
                            onClick={() => navigate('/register?role=seller')}
                            className="group flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold text-lg shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 transform hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FaBuilding className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm opacity-80">I'm a</div>
                                <div className="text-xl font-bold">Brand</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/register?role=creator')}
                            className="group flex items-center gap-4 px-8 py-5 rounded-2xl bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-dark-500 text-dark-100 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-400">
                                <FaUserAlt className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm text-dark-400">I'm a</div>
                                <div className="text-xl font-bold">Creator</div>
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* Stats - Floating cards */}
                <motion.div
                    className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    {[
                        { end: 10, suffix: 'K+', label: 'Creators', icon: <HiUserGroup className="w-5 h-5" /> },
                        { end: 5, suffix: 'K+', label: 'Brands', icon: <FaBuilding className="w-4 h-4" /> },
                        { end: 50, suffix: 'K+', label: 'Campaigns', icon: <FaChartLine className="w-4 h-4" /> },
                        { end: 98, suffix: '%', label: 'Success Rate', icon: <HiBadgeCheck className="w-5 h-5" /> }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            className="glass-card p-6 text-center hover:border-primary-500/30 transition-all duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-center gap-2 text-primary-400 mb-2">
                                {stat.icon}
                            </div>
                            <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                                <AnimatedCounter end={stat.end} suffix={stat.suffix} duration={2000} />
                            </div>
                            <div className="text-dark-400 text-sm">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* How It Works - Large Numbers Style */}
            <section id="how-it-works" className="py-24 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            className="text-4xl md:text-5xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="gradient-text">How It Works</span>
                        </motion.h2>
                        <motion.p
                            className="text-dark-400 text-lg max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Simple, streamlined process to connect brands with creators
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="glass-card p-8 relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300"
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
                                    <div className="text-4xl font-bold text-primary-500/40 mb-4">{step.number}</div>
                                    <h3 className="text-xl font-bold mb-4 text-dark-100">{step.title}</h3>
                                    <ul className="space-y-2">
                                        {step.points.map((point, i) => (
                                            <li key={i} className="flex items-center text-dark-400 text-sm">
                                                <HiCheck className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
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
            <section id="features" className="py-24 px-4 relative bg-dark-900/50">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <motion.h2
                            className="text-4xl md:text-5xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="gradient-text">Why Choose Us</span>
                        </motion.h2>
                        <motion.p
                            className="text-dark-400 text-lg max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Everything you need to run successful influencer campaigns
                        </motion.p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="glass-card p-8 hover:border-primary-500/30 transition-all duration-300 group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-dark-100">{feature.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${feature.badgeColor}`}>
                                                {feature.badge}
                                            </span>
                                        </div>
                                        <p className="text-dark-400 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Carousel */}
            <TestimonialsCarousel />

            {/* FAQ Accordion */}
            <FAQAccordion />

            {/* Final CTA Section */}
            <section className="py-24 px-4 relative">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative z-10">
                            <FaHandshake className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-dark-100">
                                Ready to Start Collaborating?
                            </h2>
                            <p className="text-dark-400 text-lg md:text-xl mb-10 max-w-xl mx-auto">
                                Join thousands of brands and creators already growing together on our platform.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn-3d text-lg px-10 py-4"
                                >
                                    Create Free Account
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn-secondary text-lg px-10 py-4"
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                    >
                        {/* Image Side */}
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden">
                                <img
                                    src="/star-logo.png"
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
                            <span className="text-primary-400 text-sm font-medium tracking-wider uppercase mb-2 block">About</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-dark-100 mb-6">
                                The Collabify
                            </h2>
                            <p className="text-dark-300 text-lg leading-relaxed mb-8">
                                The Collabify is an AI-powered influencer marketing platform designed to connect brands
                                with the right creators seamlessly. We simplify campaign management by automating
                                influencer discovery, performance tracking, and payouts—all in one dashboard.
                            </p>
                            <p className="text-dark-400 text-lg leading-relaxed mb-8">
                                With data-driven insights and transparent processes, we empower brands to maximize
                                ROI and help influencers grow through genuine collaborations.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary-400">500+</div>
                                    <div className="text-dark-400 text-sm">Creators</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-secondary-400">100+</div>
                                    <div className="text-dark-400 text-sm">Brands</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-pink-400">1000+</div>
                                    <div className="text-dark-400 text-sm">Campaigns</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer - VRInfluence Style */}
            <footer className="py-16 px-4 border-t border-dark-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Logo & Description */}
                        <div>
                            <Link to="/" className="flex items-center space-x-3 mb-4">
                                <img src="/star-logo.png" alt="" className="w-8 h-8 object-contain" />
                                <div className="flex flex-col">
                                    <div className="flex items-baseline">
                                        <span className="text-lg italic text-dark-100 mr-1">The</span>
                                        <span className="text-xl font-bold text-dark-100">Collabify</span>
                                    </div>
                                </div>
                            </Link>
                            <p className="text-dark-400 text-sm leading-relaxed mb-4">
                                Empowering brands and creators to build authentic partnerships.
                                Our AI-powered platform streamlines influencer discovery, campaign
                                management, and performance tracking.
                            </p>
                            <p className="text-dark-400 text-sm leading-relaxed">
                                Join thousands of successful collaborations and grow your business
                                with data-driven influencer marketing.
                            </p>
                        </div>

                        {/* Solutions */}
                        <div>
                            <h4 className="text-lg font-bold text-dark-100 mb-4">Solutions</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/for-brands" className="text-dark-400 hover:text-dark-200 transition">
                                        For Brands
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/for-creators" className="text-dark-400 hover:text-dark-200 transition">
                                        For Influencers
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="text-dark-400 hover:text-dark-200 transition">
                                        Get Started
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="text-dark-400 hover:text-dark-200 transition">
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

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center z-50 animate-bounce-slow"
                    aria-label="Scroll to top"
                >
                    <span className="text-xl">↑</span>
                </button>
            )}
        </div>
    );
};

export default Landing;
