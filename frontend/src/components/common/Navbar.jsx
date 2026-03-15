import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import LiveNotificationBell from '../realtime/LiveNotificationBell';
import ThemeToggle from './ThemeToggle';
import Icon from './Icon';
import Logo from './Logo';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);
    const notifRef = useRef(null);

    // Close profile menu when clicking outside (but not on notification bell)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle scroll for glassmorphism effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (user?.role === 'creator') return '/creator/dashboard';
        if (user?.role === 'seller') return '/seller/dashboard';
        if (user?.role === 'admin') return '/admin';
        return '/';
    };

    return (
        <nav className={`sticky top-3 z-50 mx-3 sm:mx-4 lg:mx-6 rounded-2xl border transition-all duration-300 ${scrolled
            ? 'bg-dark-950/95 backdrop-blur-2xl border-dark-700 shadow-lg shadow-primary-500/5'
            : 'bg-dark-950/70 backdrop-blur-xl border-dark-800'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
                        <Logo className="h-8 w-8 md:h-9 md:w-9 object-contain transition-all duration-300 group-hover:scale-110" />
                        <div className="flex flex-col">
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter gradient-text">
                                TheCollabify
                            </span>
                            <span className="text-[10px] text-dark-400 uppercase tracking-[0.2em] font-bold -mt-1 hidden md:block">
                                Marketing Ecosystem
                            </span>
                        </div>
                    </Link>

                    {/* Right side (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        <LiveNotificationBell userId={user?.id} />
                        <ThemeToggle />

                        <div className="relative" ref={menuRef}>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-dark-800 transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium text-sm border-2 border-dark-950 ring-2 ring-transparent hover:ring-primary-500/50 transition-all">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-dark-200 font-medium">{user?.name}</span>
                            </motion.button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <>
                                        {/* Click-outside backdrop */}
                                        <div
                                            className="fixed inset-0 z-[55]"
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-56 bg-dark-900 border border-dark-700 rounded-premium-2xl py-2 shadow-xl z-[60]"
                                        >
                                        <div className="px-4 py-3 border-b border-dark-700">
                                            <p className="text-sm text-dark-200 font-medium">{user?.name}</p>
                                            <p className="text-xs text-dark-400">{user?.email}</p>
                                            <span className={`inline-block mt-1 badge ${user?.role === 'admin' ? 'badge-danger' :
                                                user?.role === 'creator' ? 'badge-info' : 'badge-neutral'
                                                }`}>
                                                {user?.role}
                                            </span>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to={getDashboardLink()}
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center px-4 py-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition"
                                            >
                                                <Icon name="user" size={16} className="mr-3" />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700 transition"
                                            >
                                                <Icon name="logout" size={16} className="mr-3" />
                                                Sign Out
                                            </button>
                                        </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right side (Mobile) */}
                    <div className="flex md:hidden items-center space-x-2">
                        <LiveNotificationBell userId={user?.id} />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl bg-dark-800 text-dark-200 hover:bg-dark-700 transition-colors"
                        >
                            {isMobileMenuOpen ? <Icon name="close" size={24} /> : <Icon name="menu" size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-dark-950 flex flex-col pt-24 px-8 md:hidden"
                    >
                        {/* Decorative background */}
                        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary-500/10 blur-[100px] rounded-full" />
                        
                        {/* Menu Header */}
                        <div className="absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between border-b border-white/5 bg-dark-950/50 backdrop-blur-md">
                            <Logo className="h-8 w-8" />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10"
                            >
                                <Icon name="close" size={24} className="text-white" />
                            </motion.button>
                        </div>

                        {/* User Profile Hook */}
                        <div className="mb-10 flex items-center gap-4 p-4 rounded-premium-2xl bg-white/5 border border-white/10">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-glow">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-h3 font-black text-white">{user?.name}</span>
                                <span className="text-xs font-bold text-dark-400 uppercase tracking-widest">{user?.role}</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col space-y-4">
                            <Link
                                to={getDashboardLink()}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-xl font-black text-white hover:bg-white/10 transition-all uppercase tracking-tighter"
                            >
                                <Icon name="user" size={24} className="text-primary-400" />
                                <span>Dashboard</span>
                            </Link>

                            <Link
                                to="/messages"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-xl font-black text-white hover:bg-white/10 transition-all uppercase tracking-tighter"
                            >
                                <Icon name="chat" size={24} className="text-primary-400" />
                                <span>Messages</span>
                            </Link>

                            <Link
                                to="/settings"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-xl font-black text-white hover:bg-white/10 transition-all uppercase tracking-tighter"
                            >
                                <Icon name="settings" size={24} className="text-primary-400" />
                                <span>Settings</span>
                            </Link>
                        </div>

                        {/* Logout Section */}
                        <div className="mt-auto mb-10">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-widest text-sm hover:bg-red-500/20 transition-all"
                            >
                                <Icon name="logout" size={18} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;


