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
                <Link to="/" className="flex items-center gap-2">
                    <img src="/favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg tracking-tight">TheCollabify</span>
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
            <footer className={`mt-auto px-6 py-8 border-t ${isDark ? 'border-dark-800 bg-dark-950/50' : 'border-dark-200 bg-[#FDFBF7]/50'}`}>
                <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">

                    {/* Trust Badges - Horizontal */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="flex items-center gap-3 text-dark-500">
                            <FaLock className="text-xl opacity-70" />
                            <span className="text-xs font-bold tracking-wider uppercase">Secure & Private</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-500">
                            <FaHandshake className="text-xl opacity-70" />
                            <span className="text-xs font-bold tracking-wider uppercase">Verified Partners</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-500">
                            <FaHeadset className="text-xl opacity-70" />
                            <span className="text-xs font-bold tracking-wider uppercase">24/7 Support</span>
                        </div>
                    </div>

                    {/* Logo & Description */}
                    <div className="text-center max-w-lg">
                        <div className="mx-auto w-8 h-8 flex items-center justify-center mb-3">
                            <img src="/favicon.png" alt="" className="w-full h-full opacity-40 grayscale" />
                        </div>
                        <p className="text-xs text-dark-400">
                            TheCollabify is an AI-powered influencer marketing platform connecting brands with the right influencers.
                        </p>
                    </div>

                    {/* Links & Socials - Horizontal Row */}
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full justify-center text-sm font-medium text-dark-500">
                        <div className="flex gap-6">
                            <Link to="/for-brands" className="hover:text-primary-500 transition-colors">For Brands</Link>
                            <Link to="/for-creators" className="hover:text-primary-500 transition-colors">For Influencers</Link>
                            <Link to="/terms" className="hover:text-primary-500 transition-colors">Terms</Link>
                            <Link to="/privacy" className="hover:text-primary-500 transition-colors">Privacy</Link>
                        </div>

                        <div className="hidden md:block w-px h-4 bg-dark-300"></div>

                        <div className="flex gap-6 text-dark-400">
                            <a href="#" className="hover:text-primary-500 transition-colors"><FaLinkedin size={18} /></a>
                            <a href="#" className="hover:text-primary-500 transition-colors"><FaInstagram size={18} /></a>
                            <a href="#" className="hover:text-primary-500 transition-colors"><FaTwitter size={18} /></a>
                            <a href="#" className="hover:text-primary-500 transition-colors"><FaFacebook size={18} /></a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Support Bar */}
            <div className="bg-dark-900 text-dark-400 py-2 text-[10px] text-center uppercase tracking-widest font-semibold">
                24x7 Customer Support support@thecollabify.com
            </div>
        </div>
    );
};

export default AuthLayout;
