import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaUser, FaLock, FaHandshake, FaClock, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import ThemeToggle from '../components/common/ThemeToggle';

const ForCreators = () => {
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

    const benefits = [
        'Connect with brands you love',
        'Earn through paid partnerships',
        'Showcase your audience and engagement',
        'Stay in control of your collaborations'
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
                        <Link to="/" className="flex items-center space-x-3">
                            <img src="/favicon.png" alt="" className="h-8 w-8 object-contain" />
                            <div className="flex flex-col">
                                <div className="flex items-baseline">
                                    <span className="text-lg italic text-dark-100 mr-1">The</span>
                                    <span className="text-xl font-bold text-dark-100">Collabify</span>
                                </div>
                                <span className="text-xs text-dark-400 -mt-1 tracking-wide hidden sm:block">Empowering Influencer Partnerships</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/for-brands"
                                className="text-dark-400 hover:text-dark-200 transition"
                            >
                                For Brands
                            </Link>
                            <Link
                                to="/for-creators"
                                className="text-dark-100 font-medium border-b-2 border-primary-500 pb-1"
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
                                className="block py-3 px-4 rounded-xl text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                For Brands
                            </Link>
                            <Link
                                to="/for-creators"
                                className="block py-3 px-4 rounded-xl text-dark-100 bg-dark-800 font-medium"
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
                            <h1 className="text-4xl md:text-5xl font-bold text-dark-100 mb-6 leading-tight">
                                For Influencers: Turn Your Influence Into Income
                            </h1>
                            <p className="text-dark-400 text-lg mb-8">
                                Get discovered by top brands, receive tailored collaboration offers,
                                and grow your personal brand—all in one place.
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
                                onClick={() => navigate('/register?role=creator')}
                                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-dark-800 border border-dark-600 hover:border-dark-500 text-dark-100 font-semibold text-lg transition-all duration-300 hover:bg-dark-700"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaUser className="w-5 h-5 text-primary-400" />
                                Signup as Influencer
                            </motion.button>
                        </motion.div>

                        {/* Right Side - Hero Image */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/10">
                                <img
                                    src="/creators-hero.png"
                                    alt="Influencer creators grid"
                                    className="w-full h-auto rounded-3xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 to-transparent rounded-3xl" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 px-4 bg-dark-900/30">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-dark-100">
                        Why Creators Love <span className="gradient-text">TheCollabify</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6 hover:border-secondary-500/50 transition"
                        >
                            <div className="w-12 h-12 rounded-full bg-secondary-500/20 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-dark-100 mb-2">Fair Compensation</h3>
                            <p className="text-dark-400">Set your own rates and get paid what you're worth. Direct collaboration with verified brands.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6 hover:border-secondary-500/50 transition"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-dark-100 mb-2">Verified Opportunities</h3>
                            <p className="text-dark-400">All brands are verified. Work with legitimate businesses and grow your portfolio safely.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6 hover:border-secondary-500/50 transition"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-dark-100 mb-2">Grow Your Influence</h3>
                            <p className="text-dark-400">Track your performance, earn badges, and climb the leaderboard. Build your reputation.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-dark-100">
                        Start Earning in <span className="gradient-text">3 Simple Steps</span>
                    </h2>
                    <div className="space-y-8">
                        {[
                            { step: '01', title: 'Create Profile', desc: 'Set up your creator profile with your Instagram stats and preferred collaboration types' },
                            { step: '02', title: 'Browse & Apply', desc: 'Discover campaigns that match your niche and apply to opportunities you love' },
                            { step: '03', title: 'Collaborate & Earn', desc: 'Connect with brands, deliver quality content, and get paid directly' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-6"
                            >
                                <div className="text-5xl font-bold gradient-text opacity-30">{item.step}</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-dark-100 mb-2">{item.title}</h3>
                                    <p className="text-dark-400">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-secondary-500/10 to-primary-500/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark-100">
                        Ready to Monetize Your Influence?
                    </h2>
                    <p className="text-dark-400 text-lg mb-8">
                        Join thousands of creators already earning on TheCollabify
                    </p>
                    <motion.button
                        onClick={() => navigate('/register?role=creator')}
                        className="px-8 py-4 bg-secondary-500 text-white rounded-xl font-semibold text-lg hover:bg-secondary-600 transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start as Creator
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

export default ForCreators;
