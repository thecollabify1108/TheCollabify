import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaBuilding, FaLock, FaHandshake, FaClock, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForBrands = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

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
                                <span className="text-lg font-bold text-dark-100">The Collabify.ai</span>
                                <span className="text-xs text-dark-400 -mt-1">AI-powered influencer marketing platform</span>
                            </div>
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-500 text-white rounded-full">
                                BETA
                            </span>
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

            {/* Footer */}
            <footer className="py-16 px-4 border-t border-dark-800 mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Logo & Description */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <FaInstagram className="w-8 h-8 text-primary-500" />
                            </div>
                            <p className="text-dark-400 text-sm leading-relaxed">
                                The Collabify.ai is an AI-powered influencer marketing platform connecting brands
                                with the right influencers to drive authentic engagement.
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
                                        For Influencer
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Social & Contact */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition">
                                    <FaInstagram className="w-5 h-5" />
                                </a>
                            </div>
                            <a
                                href="mailto:support@thecollabify.ai"
                                className="inline-block px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 text-sm"
                            >
                                24X7 Customer Support support@thecollabify.ai
                            </a>
                            <ul className="mt-6 space-y-2">
                                <li>
                                    <a href="#" className="text-dark-400 hover:text-dark-200 transition text-sm">
                                        Terms & Conditions
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-dark-400 hover:text-dark-200 transition text-sm">
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ForBrands;
