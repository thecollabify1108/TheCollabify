import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../common/ThemeToggle';
import { FaLock, FaHandshake, FaHeadset, FaInstagram, FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-dark-950 text-dark-900 dark:text-dark-100 transition-colors duration-300 flex flex-col font-sans">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#FDFBF7]/80 dark:bg-dark-950/80 backdrop-blur-md z-50">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg tracking-tight">TheCollabify</span>
                </Link>
                <ThemeToggle />
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col">
                {/* Hero / Title Section */}
                <div className="mb-10 mt-4">
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

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 mt-16 mb-12 border-t border-b border-dark-200 dark:border-dark-800 py-8">
                    <div className="flex flex-col items-center text-center gap-2">
                        <FaLock className="text-2xl text-dark-400" />
                        <span className="text-xs font-semibold text-dark-500 uppercase tracking-wide">Secure &<br />Private</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2 border-l border-r border-dark-200 dark:border-dark-800">
                        <FaHandshake className="text-2xl text-dark-400" />
                        <span className="text-xs font-semibold text-dark-500 uppercase tracking-wide">Verified<br />Partners</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                        <FaHeadset className="text-2xl text-dark-400" />
                        <span className="text-xs font-semibold text-dark-500 uppercase tracking-wide">24/7<br />Support</span>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center space-y-8 pb-8">
                    <div className="space-y-4">
                        <div className="mx-auto w-10 h-10 flex items-center justify-center">
                            <img src="/favicon.png" alt="" className="w-full h-full opacity-50 grayscale" />
                        </div>
                        <p className="text-xs text-dark-400 leading-relaxed max-w-xs mx-auto">
                            TheCollabify is an AI-powered influencer marketing platform connecting brands with the right influencers to drive authentic engagement.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 text-sm font-medium text-dark-500">
                        <Link to="/for-brands" className="hover:text-primary-500 transition-colors">For Brands</Link>
                        <Link to="/for-creators" className="hover:text-primary-500 transition-colors">For Influencers</Link>
                        <Link to="/terms" className="hover:text-primary-500 transition-colors">Terms & Conditions</Link>
                        <Link to="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link>
                    </div>

                    <div className="flex justify-center gap-6 text-dark-400">
                        <a href="#" className="hover:text-primary-500 transition-colors"><FaLinkedin size={20} /></a>
                        <a href="#" className="hover:text-primary-500 transition-colors"><FaInstagram size={20} /></a>
                        <a href="#" className="hover:text-primary-500 transition-colors"><FaTwitter size={20} /></a>
                        <a href="#" className="hover:text-primary-500 transition-colors"><FaFacebook size={20} /></a>
                    </div>
                </div>
            </main>

            {/* Support Bar */}
            <div className="bg-dark-900 text-dark-400 py-3 text-[10px] text-center uppercase tracking-widest font-semibold">
                24x7 Customer Support support@thecollabify.com
            </div>
        </div>
    );
};

export default AuthLayout;
