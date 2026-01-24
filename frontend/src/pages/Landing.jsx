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
import Leaderboard from '../components/common/Leaderboard';
import SocialProofWidget from '../components/common/SocialProofWidget';

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

                {/* Minimalist Header */}
                <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[#FDFBF7]/80 dark:bg-dark-950/80 backdrop-blur-md transition-colors duration-300">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-xl tracking-tight text-dark-900 dark:text-dark-100">TheCollabify</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-dark-900 dark:text-dark-100 p-2"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-[#FDFBF7] dark:bg-dark-950 flex flex-col pt-24 px-6 space-y-6">
                        <Link to="/login" className="text-2xl font-bold text-dark-900 dark:text-dark-100">Login</Link>
                        <Link to="/register" className="text-2xl font-bold text-dark-900 dark:text-dark-100">Sign Up</Link>
                        <div className="h-px bg-dark-200 dark:bg-dark-800 my-4" />
                        <Link to="/for-brands" className="text-lg text-dark-500">For Brands</Link>
                        <Link to="/for-creators" className="text-lg text-dark-500">For Influencers</Link>
                    </div>
                )}

                {/* Hero Section - Minimalist Beige */}
                <section className="relative pt-32 pb-20 px-6 bg-[#FDFBF7] dark:bg-dark-950 transition-colors duration-300 min-h-screen flex flex-col justify-center">

                    {/* Background Grid - Subtle */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    ></div>

                    <div className="max-w-md mx-auto relative z-10 w-full">
                        {/* Logo Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start mb-8"
                        >
                            {/* Optional small logo badge if needed, skipping to match text focus of reference */}
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-5xl font-extrabold mb-6 leading-[1.15] text-dark-900 dark:text-dark-100 text-left font-sans tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            Smart Influencer Campaigns That <br /> Deliver Real Results
                        </motion.h1>

                        <motion.p
                            className="text-lg text-dark-500 dark:text-dark-400 mb-10 leading-relaxed text-left"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            AI-powered influencer matchmaking, secure wallet payouts, and performance-based campaigns for brands and creators
                        </motion.p>

                        {/* Two CTA Buttons - Stacked & Dark */}
                        <motion.div
                            className="flex flex-col gap-4 mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <button
                                onClick={() => navigate('/register?role=seller')}
                                className="w-full py-4 px-6 bg-[#2A2A2A] hover:bg-black text-white rounded-lg font-medium flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                            >
                                <FaBuilding className="text-lg" />
                                <span>Signup as Brand</span>
                            </button>

                            <button
                                onClick={() => navigate('/register?role=creator')}
                                className="w-full py-4 px-6 bg-[#2A2A2A] hover:bg-black text-white rounded-lg font-medium flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                            >
                                <FaUserAlt className="text-lg" />
                                <span>Signup as Influencer</span>
                            </button>
                        </motion.div>

                        {/* Image Grid */}
                        <motion.div
                            className="grid grid-cols-3 gap-3 mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop" alt="Influencer" className="w-full h-full object-cover" />
                            </div>
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200 translate-y-4">
                                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop" alt="Influencer" className="w-full h-full object-cover" />
                            </div>
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200">
                                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop" alt="Influencer" className="w-full h-full object-cover" />
                            </div>
                        </motion.div>

                        {/* Supported By */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-6">Supported by Early Partner Brands</h3>
                            <div className="flex justify-center items-center gap-8 grayscale opacity-70">
                                <span className="font-bold text-xl text-dark-400">E&FISH</span>
                                <span className="font-bold text-xl text-dark-400">JACOB DELAFON</span>
                                <span className="font-bold text-xl text-dark-400">AROMA-ZONE</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Floating Chat Bubble */}
                <div className="fixed bottom-6 right-6 z-50">
                    <button className="w-14 h-14 bg-[#75847b] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#75847b]/40 hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#fff]"></div>
                    </button>
                </div>
                {/* How It Works */}
                <section id="how-it-works" className="py-28 md:py-32 px-4 relative">
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
                < section id="features" className="py-28 md:py-32 px-4 relative bg-dark-900/50" >
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
                </section >

                {/* Leaderboard Section */}
                < Leaderboard />

                {/* Testimonials Carousel */}
                < TestimonialsCarousel />

                {/* FAQ Accordion */}
                < FAQAccordion />

                {/* Final CTA Section */}
                < section className="py-28 md:py-32 px-4 relative" >
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
                </section >

                {/* About Section */}
                < section id="about" className="py-28 md:py-32 px-4 relative" >
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
                </section >

                {/* Footer - VRInfluence Style */}
                < footer className="py-16 px-4 border-t border-dark-800" >
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Logo & Description */}
                            <div>
                                <Link to="/" className="flex items-center space-x-3 mb-4">
                                    <img src="/favicon.png" alt="" className="w-8 h-8 object-contain" />
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
                </footer >

                {/* Floating Mobile CTA Bar - High Conversion */}
                < motion.div
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
                </motion.div >

                {/* Scroll to Top Button - Optimized for Mobile */}
                {
                    showScrollTop && (
                        <button
                            onClick={scrollToTop}
                            className="fixed bottom-24 md:bottom-8 right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-500/80 hover:bg-primary-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110 active:scale-95"
                            aria-label="Scroll to top"
                        >
                            <span className="text-lg md:text-xl">↑</span>
                        </button>
                    )
                }
            </div >
        </>
    );
};

export default Landing;
