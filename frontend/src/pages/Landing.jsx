import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiSparkles,
    HiUserGroup,
    HiChartBar,
    HiLightningBolt,
    HiShieldCheck,
    HiCash
} from 'react-icons/hi';
import { FaInstagram, FaRocket, FaHandshake, FaStar } from 'react-icons/fa';

const Landing = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <HiSparkles className="w-8 h-8" />,
            title: 'AI-Powered Matching',
            description: 'Our smart algorithm connects you with the perfect creators based on engagement, niche, and campaign goals.'
        },
        {
            icon: <HiChartBar className="w-8 h-8" />,
            title: 'Deep Analytics',
            description: 'Get detailed insights on creator performance, audience authenticity, and engagement quality.'
        },
        {
            icon: <HiShieldCheck className="w-8 h-8" />,
            title: 'Verified Profiles',
            description: 'All creators are verified with authentic engagement metrics and transparent pricing.'
        },
        {
            icon: <HiCash className="w-8 h-8" />,
            title: 'Fair Pricing',
            description: 'Set your budget and find creators that match. No hidden fees, transparent negotiations.'
        }
    ];

    const steps = [
        { number: '01', title: 'Create Account', desc: 'Sign up as a brand or creator in seconds' },
        { number: '02', title: 'Set Preferences', desc: 'Define your goals, budget, and target audience' },
        { number: '03', title: 'Get Matched', desc: 'AI finds the perfect creator-brand pairs' },
        { number: '04', title: 'Connect', desc: 'Review matches and start collaborating' },
        { number: '05', title: 'Grow Together', desc: 'Track campaigns and build lasting partnerships' }
    ];

    return (
        <div className="min-h-screen bg-dark-950 overflow-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <FaInstagram className="w-8 h-8 text-primary-500" />
                            <span className="text-xl font-bold gradient-text">The Collabify.ai</span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="btn-outline text-sm"
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

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4">
                {/* Floating orbs */}
                <div className="floating-orb w-96 h-96 -top-48 -left-48" />
                <div className="floating-orb w-72 h-72 top-1/3 -right-36 from-secondary-500 to-pink-500" style={{ animationDelay: '-2s' }} />
                <div className="floating-orb w-48 h-48 bottom-20 left-1/4 from-cyan-500 to-primary-500" style={{ animationDelay: '-4s' }} />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-6">
                                <HiSparkles className="w-4 h-4 mr-2" />
                                AI-Powered Influencer Marketing
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-5xl md:text-7xl font-extrabold mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <span className="text-dark-100">Connect Brands with</span>
                            <br />
                            <span className="gradient-text">Perfect Creators</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl text-dark-400 max-w-2xl mx-auto mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Discover and collaborate with Instagram creators that match your brand perfectly.
                            Our AI finds the best matches based on engagement, audience, and content style.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <button
                                onClick={() => navigate('/register?role=seller')}
                                className="btn-3d text-lg px-8 py-4 flex items-center"
                            >
                                <FaRocket className="mr-2" />
                                I'm a Brand
                            </button>
                            <button
                                onClick={() => navigate('/register?role=creator')}
                                className="btn-secondary text-lg px-8 py-4 flex items-center"
                            >
                                <FaStar className="mr-2" />
                                I'm a Creator
                            </button>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {[
                            { value: '10K+', label: 'Creators' },
                            { value: '5K+', label: 'Brands' },
                            { value: '50K+', label: 'Campaigns' },
                            { value: '98%', label: 'Success Rate' }
                        ].map((stat, index) => (
                            <div key={index} className="glass-card p-6 text-center card-hover">
                                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                                <div className="text-dark-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">How It Works</span>
                        </h2>
                        <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                            Get started in minutes with our simple, streamlined process
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="relative"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="glass-card p-6 h-full card-hover text-center">
                                    <div className="text-5xl font-bold text-primary-500/20 mb-4">{step.number}</div>
                                    <h3 className="text-lg font-semibold mb-2 text-dark-100">{step.title}</h3>
                                    <p className="text-sm text-dark-400">{step.desc}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-2 transform translate-x-1/2 -translate-y-1/2">
                                        <div className="w-4 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4 relative bg-dark-900/50">
                <div className="floating-orb w-64 h-64 top-1/4 -left-32 from-primary-500/50 to-cyan-500/50" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Platform Features</span>
                        </h2>
                        <p className="text-dark-400 text-lg max-w-2xl mx-auto">
                            Everything you need to run successful influencer campaigns
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="glass-card p-6 card-hover"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4 text-white">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-dark-100">{feature.title}</h3>
                                <p className="text-dark-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 relative">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="glass-card p-12 text-center relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="floating-orb w-48 h-48 -top-24 -right-24 from-secondary-500 to-pink-500" />
                        <div className="floating-orb w-32 h-32 -bottom-16 -left-16 from-primary-500 to-cyan-500" style={{ animationDelay: '-3s' }} />

                        <div className="relative z-10">
                            <FaHandshake className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark-100">
                                Ready to Start Collaborating?
                            </h2>
                            <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
                                Join thousands of brands and creators already growing together on our platform.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn-3d text-lg px-10 py-4"
                            >
                                Create Free Account
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-dark-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <FaInstagram className="w-6 h-6 text-primary-500" />
                                <span className="text-lg font-bold gradient-text">The Collabify.ai</span>
                            </div>
                            <p className="text-sm text-dark-400">
                                Connecting brands with perfect creators through AI-powered matching.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-dark-200 mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-dark-400">
                                <li><Link to="/register?role=seller" className="hover:text-primary-400 transition">For Brands</Link></li>
                                <li><Link to="/register?role=creator" className="hover:text-primary-400 transition">For Creators</Link></li>
                                <li><span className="hover:text-primary-400 transition cursor-pointer">Pricing</span></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-dark-200 mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-dark-400">
                                <li><span className="hover:text-primary-400 transition cursor-pointer">About Us</span></li>
                                <li><span className="hover:text-primary-400 transition cursor-pointer">Blog</span></li>
                                <li><span className="hover:text-primary-400 transition cursor-pointer">Careers</span></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-dark-200 mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-dark-400">
                                <li><span className="hover:text-primary-400 transition cursor-pointer">Help Center</span></li>
                                <li><span className="hover:text-primary-400 transition cursor-pointer">Terms of Service</span></li>
                                <li><span className="hover:text-primary-400 transition cursor-pointer">Privacy Policy</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-dark-800 text-center text-sm text-dark-500">
                        © 2024 The Collabify.ai. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
