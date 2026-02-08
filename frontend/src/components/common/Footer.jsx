import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaInstagram, FaTwitter, FaLinkedinIn, FaFacebookF,
    FaShieldAlt, FaHandshake, FaHeadset, FaEnvelope,
    FaArrowRight
} from 'react-icons/fa';
import NewsletterSignup from './NewsletterSignup';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
    const { isDark } = useTheme();

    const trustBadges = [
        {
            icon: <FaShieldAlt className="text-blue-400" />,
            title: "SECURE & PRIVATE",
            description: "Enterprise-grade encryption for all your data and transactions."
        },
        {
            icon: <FaHandshake className="text-purple-400" />,
            title: "VERIFIED PARTNERS",
            description: "Every creator and brand is thoroughly vetted for authenticity."
        },
        {
            icon: <FaHeadset className="text-pink-400" />,
            title: "24/7 SUPPORT",
            description: "Our dedicated team is always here to help you succeed."
        }
    ];

    const socialLinks = [
        { icon: <FaLinkedinIn />, href: "#", color: "hover:bg-[#0077b5]", label: "LinkedIn" },
        { icon: <FaInstagram />, href: "#", color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]", label: "Instagram" },
        { icon: <FaTwitter />, href: "#", color: "hover:bg-[#1DA1F2]", label: "Twitter" },
        { icon: <FaFacebookF />, href: "#", color: "hover:bg-[#1877F2]", label: "Facebook" }
    ];

    return (
        <footer className={`relative overflow-hidden pt-20 pb-10 px-6 border-t ${isDark ? 'border-dark-800 bg-dark-950' : 'border-gray-200 bg-[#FDFBF7]'} transition-colors duration-300`}>
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
            <div className={`absolute -top-24 left-1/4 w-96 h-96 blur-[120px] rounded-full ${isDark ? 'bg-primary-900/20' : 'bg-primary-200/30'} pointer-events-none`} />
            <div className={`absolute -bottom-24 right-1/4 w-96 h-96 blur-[120px] rounded-full ${isDark ? 'bg-secondary-900/20' : 'bg-secondary-200/30'} pointer-events-none`} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Trust Badges - Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {trustBadges.map((badge, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`group p-6 rounded-2xl border ${isDark ? 'border-dark-800 bg-dark-900/50 hover:border-primary-500/50' : 'border-gray-200 bg-white/50 hover:border-primary-400'} backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${isDark ? 'bg-dark-800' : 'bg-gray-100'}`}>
                                {badge.icon}
                            </div>
                            <h4 className="text-sm font-bold tracking-wider mb-2">{badge.title}</h4>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                {badge.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-dark-800/50">
                    {/* Branding Section */}
                    <div className="md:col-span-4">
                        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                            <motion.div
                                className="w-10 h-10 relative"
                                whileHover={{ rotate: 180 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" />
                            </motion.div>
                            <div className="flex flex-col">
                                <span className={`text-2xl font-black italic tracking-tighter bg-gradient-to-r from-primary-400 via-secondary-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]`}>
                                    TheCollabify
                                </span>
                                <span className="text-[10px] text-dark-400 uppercase tracking-[0.2em] font-bold -mt-1 hidden md:block">
                                    Marketing Ecosystem
                                </span>
                            </div>
                        </Link>
                        <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-dark-400' : 'text-gray-600'}`}>
                            TheCollabify is an AI-powered influencer marketing platform that bridges the gap between ambitious brands and talented creators, making authentic growth effortless.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    whileHover={{ y: -4 }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all duration-300 ${social.color} hover:text-white hover:border-transparent ${isDark ? 'border-dark-800 bg-dark-900' : 'border-gray-200 bg-white'}`}
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2">
                        <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary-400">Platform</h4>
                        <ul className="space-y-4">
                            {['For Brands', 'For Influencers'].map((link) => (
                                <li key={link}>
                                    <Link to={`/${link.toLowerCase().replace(/ /g, '-')}`} className={`text-sm flex items-center group transition-colors ${isDark ? 'text-dark-400 hover:text-primary-400' : 'text-gray-600 hover:text-primary-600'}`}>
                                        <FaArrowRight className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2 text-xs" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="md:col-span-2">
                        <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-secondary-400">Company</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Contact', 'Terms'].map((link) => (
                                <li key={link}>
                                    <Link to={`/${link.toLowerCase().replace(/ /g, '-')}`} className={`text-sm flex items-center group transition-colors ${isDark ? 'text-dark-400 hover:text-secondary-400' : 'text-gray-600 hover:text-secondary-600'}`}>
                                        <FaArrowRight className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2 text-xs" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                            {/* Privacy Policy Link */}
                            <li>
                                <Link to="/privacy" className={`text-sm flex items-center group transition-colors ${isDark ? 'text-dark-400 hover:text-secondary-400' : 'text-gray-600 hover:text-secondary-600'}`}>
                                    <FaArrowRight className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2 text-xs" />
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="md:col-span-4">
                        <NewsletterSignup />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className={`text-sm ${isDark ? 'text-dark-500' : 'text-gray-500'}`}>
                        © {new Date().getFullYear()} TheCollabify. Built with passion for creators world.
                    </p>

                    <div className="flex items-center gap-6">
                        <a href="mailto:support@thecollabify.com" className={`flex items-center gap-2 group text-sm font-medium transition-colors ${isDark ? 'text-dark-300 hover:text-primary-400' : 'text-gray-700 hover:text-primary-600'}`}>
                            <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                <FaEnvelope className="text-xs" />
                            </div>
                            SUPPORT@THECOLLABIFY.COM
                        </a>
                    </div>
                </div>
            </div>

            {/* Decorative Grid Line */}
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20`} />
        </footer>
    );
};

export default Footer;
