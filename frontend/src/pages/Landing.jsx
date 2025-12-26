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

const Landing = () => {
    const navigate = useNavigate();

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
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <FaInstagram className="w-8 h-8 text-primary-500" />
                            <span className="text-xl font-bold gradient-text">The Collabify.ai</span>
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-500/20 text-primary-400 rounded-full border border-primary-500/30">
                                BETA
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            <a href="#how-it-works" className="text-dark-400 hover:text-dark-200 transition">How It Works</a>
                            <a href="#features" className="text-dark-400 hover:text-dark-200 transition">Features</a>
                        </div>

                        <div className="flex items-center space-x-4">
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
                    </div>
                </div>
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
                        className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className="text-dark-100">Connect </span>
                        <span className="gradient-text">Brands</span>
                        <span className="text-dark-100"> with</span>
                        <br />
                        <span className="gradient-text">Perfect Creators</span>
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
                        { value: '10K+', label: 'Creators', icon: <HiUserGroup className="w-5 h-5" /> },
                        { value: '5K+', label: 'Brands', icon: <FaBuilding className="w-4 h-4" /> },
                        { value: '50K+', label: 'Campaigns', icon: <FaChartLine className="w-4 h-4" /> },
                        { value: '98%', label: 'Success Rate', icon: <HiBadgeCheck className="w-5 h-5" /> }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            className="glass-card p-6 text-center hover:border-primary-500/30 transition-all duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-center gap-2 text-primary-400 mb-2">
                                {stat.icon}
                            </div>
                            <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
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

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-dark-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-2">
                            <FaInstagram className="w-6 h-6 text-primary-500" />
                            <span className="text-lg font-bold gradient-text">The Collabify.ai</span>
                        </div>
                        <div className="flex items-center gap-6 text-dark-400 text-sm">
                            <a href="#" className="hover:text-dark-200 transition">Privacy Policy</a>
                            <a href="#" className="hover:text-dark-200 transition">Terms of Service</a>
                            <a href="#" className="hover:text-dark-200 transition">Contact</a>
                        </div>
                        <div className="text-dark-500 text-sm">
                            © 2024 The Collabify.ai. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
