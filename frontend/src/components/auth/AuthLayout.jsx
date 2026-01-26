import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { FaLock, FaHandshake, FaHeadset, FaInstagram, FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';

const AuthLayout = ({ children, title, subtitle }) => {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen ${isDark ? 'bg-dark-950 text-dark-100' : 'bg-[#FDFBF7] text-dark-900'} transition-colors duration-300 flex flex-col font-sans`}>
            {/* Header */}
            <header className={`px-6 py-4 flex items-center justify-between sticky top-0 ${isDark ? 'bg-dark-950/80' : 'bg-[#FDFBF7]/80'} backdrop-blur-md z-50`}>
                <Link to="/" className="flex items-center gap-2 group">
                    <img src="/favicon.png" alt="Logo" className="w-8 h-8 object-contain transition-transform group-hover:rotate-12" />
                    <span className="font-black text-xl tracking-tighter bg-gradient-to-r from-primary-400 via-secondary-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                        TheCollabify
                    </span>
                </Link>
                <ThemeToggle />
            </header>

            {/* Main Content - Centered */}
            <main className="flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col justify-center">
                {/* Hero / Title Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-3 leading-tight">{title}</h1>
                    <p className="text-dark-500 text-base leading-relaxed">
                        {subtitle}
                    </p>
                    <div className="w-12 h-1 bg-primary-500 mt-4 rounded-full"></div>
                </div>

                {/* Form Injection */}
                <div className="flex-1">
                    {children}
                </div>
            </main>

            {/* Horizontal Footer Section */}
            <footer className={`mt-auto px-6 py-12 border-t ${isDark ? 'border-dark-800 bg-dark-950/50' : 'border-dark-200 bg-[#FDFBF7]/50'} relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent`} />

                <div className="max-w-5xl mx-auto flex flex-col items-center gap-10 relative z-10">

                    {/* Trust Badges - Horizontal */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                        <motion.div whileHover={{ y: -2 }} className="flex items-center gap-3 group">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-dark-800' : 'bg-white shadow-sm'} transition-colors group-hover:bg-blue-500/10`}>
                                <FaLock className="text-blue-500 text-lg" />
                            </div>
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-dark-400' : 'text-gray-500'} group-hover:text-blue-500 transition-colors`}>Secure & Private</span>
                        </motion.div>
                        <motion.div whileHover={{ y: -2 }} className="flex items-center gap-3 group">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-dark-800' : 'bg-white shadow-sm'} transition-colors group-hover:bg-purple-500/10`}>
                                <FaHandshake className="text-purple-500 text-xl" />
                            </div>
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-dark-400' : 'text-gray-500'} group-hover:text-purple-500 transition-colors`}>Verified Partners</span>
                        </motion.div>
                        <motion.div whileHover={{ y: -2 }} className="flex items-center gap-3 group">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-dark-800' : 'bg-white shadow-sm'} transition-colors group-hover:bg-pink-500/10`}>
                                <FaHeadset className="text-pink-500 text-lg" />
                            </div>
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-dark-400' : 'text-gray-500'} group-hover:text-pink-500 transition-colors`}>24/7 Support</span>
                        </motion.div>
                    </div>

                    {/* Logo & Description */}
                    <div className="text-center max-w-lg">
                        <Link to="/" className="mx-auto w-10 h-10 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                            <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" />
                        </Link>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-dark-400' : 'text-gray-600'}`}>
                            TheCollabify is an <span className="text-primary-400 font-semibold">AI-powered</span> influencer marketing platform bridging brands with top-tier creators.
                        </p>
                    </div>

                    {/* Links & Socials - Horizontal Row */}
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full justify-center">
                        <div className="flex gap-8 text-xs font-bold tracking-wide uppercase">
                            <Link to="/for-brands" className={`transition-colors ${isDark ? 'text-dark-400 hover:text-primary-400' : 'text-gray-600 hover:text-primary-600'}`}>For Brands</Link>
                            <Link to="/for-creators" className={`transition-colors ${isDark ? 'text-dark-400 hover:text-primary-400' : 'text-gray-600 hover:text-primary-600'}`}>For Influencers</Link>
                            <Link to="/terms" className={`transition-colors ${isDark ? 'text-dark-400 hover:text-primary-400' : 'text-gray-600 hover:text-primary-600'}`}>Terms</Link>
                            <Link to="/privacy" className={`transition-colors ${isDark ? 'text-dark-400 hover:text-primary-400' : 'text-gray-600 hover:text-primary-600'}`}>Privacy</Link>
                        </div>

                        <div className={`hidden md:block w-px h-6 ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}></div>

                        <div className="flex gap-6">
                            {[
                                { icon: <FaLinkedin size={18} />, color: "hover:text-[#0077b5]" },
                                { icon: <FaInstagram size={18} />, color: "hover:text-[#E4405F]" },
                                { icon: <FaTwitter size={18} />, color: "hover:text-[#1DA1F2]" },
                                { icon: <FaFacebook size={18} />, color: "hover:text-[#1877F2]" }
                            ].map((social, idx) => (
                                <a key={idx} href="#" className={`text-dark-400 transition-all duration-300 hover:scale-110 ${social.color}`}>
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Support Bar */}
            <div className={`${isDark ? 'bg-dark-900 text-dark-400' : 'bg-gray-100 text-gray-500'} py-3 text-[10px] text-center uppercase tracking-widest font-bold border-t ${isDark ? 'border-dark-800' : 'border-gray-200'}`}>
                <span className="text-primary-500 mr-2">●</span> 24x7 Customer Support: <a href="mailto:support@thecollabify.com" className="hover:text-primary-500 transition-colors">support@thecollabify.com</a>
            </div>
        </div>
    );
};

export default AuthLayout;
