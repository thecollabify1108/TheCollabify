import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaBuilding, FaLock, FaHandshake, FaClock, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import ThemeToggle from '../components/common/ThemeToggle';

const ForBrands = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFeature, setOpenFeature] = useState(null);
    const [openStep, setOpenStep] = useState(null);

    const benefits = [
        'AI-scored creators with fraud detection built in',
        'Predictive ROI before you commit budget',
        'Creator Quality Index ranks reliability and authenticity',
        'Every collaboration makes your next match smarter'
    ];

    const badges = [
        { icon: <FaLock className="w-4 h-4" />, text: 'Secure & Private' },
        { icon: <FaHandshake className="w-4 h-4" />, text: 'Verified Partnerships' },
        { icon: <FaClock className="w-4 h-4" />, text: '24/7 Support' }
    ];

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <motion.img
                                src="/favicon.png"
                                alt=""
                                className="h-8 w-8 object-contain"
                                whileHover={{ rotate: 12, scale: 1.1 }}
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-black italic tracking-tighter gradient-text">
                                    TheCollabify
                                </span>
                                <span className="text-[10px] text-dark-400 uppercase tracking-widest font-bold -mt-0.5 hidden sm:block">
                                    Empowering Partnerships
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/for-brands"
                                className="text-dark-100 font-medium border-b-2 border-primary-500 pb-1"
                            >
                                For Brands
                            </Link>
                            <Link
                                to="/for-creators"
                                className="text-dark-400 hover:text-dark-200 transition"
                            >
                                For Influencers
                            </Link>
                            <ThemeToggle />
                            <Link to="/login" className="px-4 py-2 text-dark-300 hover:text-dark-100 transition">Login</Link>
                            <Link to="/register" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">Get Started</Link>
                        </div>

                        {/* Mobile Right Side */}
                        <div className="flex md:hidden items-center space-x-3">
                            <ThemeToggle />
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
                            <Link
                                to="/for-brands"
                                className="block py-3 px-4 rounded-xl text-dark-100 bg-dark-800 font-medium"
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
                            <Link
                                to="/"
                                className="block py-3 px-4 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                ← Back to Home
                            </Link>
                            <Link
                                to="/login"
                                className="block py-3 px-4 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="block py-3 px-4 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                                Brand Intelligence: <br />
                                <span className="gradient-text">Predictive Partnerships.</span>
                            </h1>
                            <p className="text-dark-400 text-lg mb-8 leading-relaxed">
                                Stop guessing. Our Guided AI scores creator quality in real-time, predicts campaign ROI before you spend,
                                and detects fraud automatically — so you invest in partnerships that actually convert.
                            </p>

                            {/* Benefits List */}
                            <ul className="space-y-4 mb-8">
                                {benefits.map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-center text-dark-300"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <div className="w-3 h-3 rounded-full bg-primary-500 mr-4 flex-shrink-0" />
                                        {benefit}
                                    </motion.li>
                                ))}
                            </ul>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center gap-6 mb-10">
                                {badges.map((badge, index) => (
                                    <div key={index} className="flex items-center text-dark-400 text-sm">
                                        {badge.icon}
                                        <span className="ml-2">{badge.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <motion.button
                                onClick={() => navigate('/register?role=seller')}
                                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-dark-800 border border-dark-600 hover:border-dark-500 text-dark-100 font-semibold text-lg transition-all duration-300 hover:bg-dark-700"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaCheck className="w-5 h-5 text-primary-400" />
                                Signup as Brand
                            </motion.button>
                        </motion.div>

                        {/* Right Side - Stats Visual (no image) */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: 'AI', label: 'Smart Matching', color: 'text-primary-400', bg: 'bg-primary-500/10' },
                                    { value: '0%', label: 'Fake Reach Tolerance', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                    { value: 'CQI', label: 'Creator Quality Score', color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
                                    { value: '24/7', label: 'Platform Support', color: 'text-amber-400', bg: 'bg-amber-500/10' }
                                ].map((stat, i) => (
                                    <div key={i} className={`${stat.bg} border border-dark-800 rounded-2xl p-5 text-center`}>
                                        <p className={`text-2xl font-extrabold ${stat.color} mb-1`}>{stat.value}</p>
                                        <p className="text-xs text-dark-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-10 px-4 bg-dark-900/30">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-5 text-dark-100">
                        Why Brands Choose <span className="gradient-text">TheCollabify</span>
                    </h2>
                    <div className="space-y-2">
                        {[
                            { title: 'Collaboration Intelligence', desc: 'Quality scoring, audience authenticity analysis, and smart matching working together on every search.' },
                            { title: 'Predictive Performance', desc: 'Know expected ROI, engagement rates, and success probability before you launch.' },
                            { title: 'Fraud Protection', desc: 'Multi-signal fraud detection flags fake followers, engagement manipulation, and suspicious growth.' }
                        ].map((item, idx) => (
                            <div key={idx} className="glass-card overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-4 text-left"
                                    onClick={() => setOpenFeature(openFeature === idx ? null : idx)}
                                >
                                    <span className="text-sm font-semibold text-dark-100">{item.title}</span>
                                    <span className={`text-xl text-dark-400 transition-transform duration-200 leading-none ${openFeature === idx ? 'rotate-45' : ''}`}>+</span>
                                </button>
                                {openFeature === idx && (
                                    <div className="px-4 pb-4 text-sm text-dark-400 border-t border-dark-800 pt-3">
                                        {item.desc}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-white">
                        The <span className="gradient-text">Guided AI</span> Experience
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Smart Briefing', desc: 'Use our Enhanced Wizard to define goals. AI immediately begins scoring eligible creators against your specific criteria.' },
                            { step: '02', title: 'AI Matchmaking', desc: 'Review ranked profiles with CQI scores, fraud risk reports, and predictive ROI models for every match.' },
                            { step: '03', title: 'Secure Launch', desc: 'Connect via real-time messaging, secure funds in escrow, and track deliverables with AI-verified milestones.' }
                        ].map((item, idx) => (
                            <div key={idx} className="p-8 rounded-3xl glass-card border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="text-5xl font-black text-white/5 absolute -top-2 -right-2 group-hover:text-primary-500/10 transition-colors uppercase italic">{item.step}</div>
                                <h3 className="text-lg font-bold text-white mb-4 relative z-10">{item.title}</h3>
                                <p className="text-sm text-dark-400 leading-relaxed relative z-10">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-primary-500/10 to-secondary-500/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark-100">
                        Ready for Smarter Partnerships?
                    </h2>
                    <p className="text-dark-400 text-lg mb-8">
                        Join brands using collaboration intelligence to maximize every campaign.
                    </p>
                    <motion.button
                        onClick={() => navigate('/register?role=seller')}
                        className="px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold text-lg hover:bg-primary-600 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Free Campaign
                    </motion.button>
                </div>
            </section>

            {/* Back to Home Button */}
            <div className="py-12 px-4 text-center">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-800 text-dark-100 hover:bg-dark-700 transition"
                >
                    <span>←</span> Back to Home
                </Link>
            </div>

            {/* Footer */}
            <Footer />

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center z-50"
                    aria-label="Scroll to top"
                >
                    <span className="text-xl">↑</span>
                </button>
            )}
        </div>
    );
};

export default ForBrands;
