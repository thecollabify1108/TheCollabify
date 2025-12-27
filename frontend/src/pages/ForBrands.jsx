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

    const benefits = [
        'Find verified influencers across categories',
        'Manage campaigns easily in one dashboard',
        'Access performance insights and ROI metrics',
        'Flexible budgets, real results'
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
                            <img src="/star-logo.png" alt="" className="h-8 w-8 object-contain" />
                            <div className="flex flex-col">
                                <div className="flex items-baseline">
                                    <span className="text-lg italic text-dark-100 mr-1">The</span>
                                    <span className="text-xl font-bold text-dark-100">Collabify</span>
                                </div>
                                <span className="text-xs text-dark-400 -mt-1 tracking-wide">Empowering Influencer Partnerships</span>
                            </div>
                        </Link>

                        <div className="flex items-center space-x-8">
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
                                For Influencer
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
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
                                For Brands: Collaborate with the Right Voices
                            </h1>
                            <p className="text-dark-400 text-lg mb-8">
                                Build authentic connections with influencers who share your values.
                                Launch campaigns, track performance, and watch your brand grow.
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

                        {/* Right Side - Hero Image */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/10">
                                <img
                                    src="/brands-hero.png"
                                    alt="Brand marketing with influencers"
                                    className="w-full h-auto rounded-3xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 to-transparent rounded-3xl" />
                            </div>
                        </motion.div>
                    </div>
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
