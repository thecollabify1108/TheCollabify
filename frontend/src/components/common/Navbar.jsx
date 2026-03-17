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
        <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled
            ? 'bg-dark-950/95 backdrop-blur-2xl border-dark-700 shadow-lg shadow-primary-500/5 py-1'
            : 'bg-dark-950/80 backdrop-blur-xl border-dark-800/50 py-3'
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
                    <div className="flex md:hidden items-center space-x-2 ml-auto">
                        <ThemeToggle />
                        <LiveNotificationBell userId={user?.id} />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl bg-dark-800 text-dark-200 hover:bg-dark-700 transition-colors"
                        >
                            {isMobileMenuOpen ? <Icon name="close" size={20} /> : <Icon name="menu" size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop to close menu */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm md:hidden"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="fixed top-24 right-5 z-[100] w-72 bg-dark-950/98 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col p-5 md:hidden"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full pointer-events-none" />
                            
                            {/* User Profile Hook - More compact */}
                            <div className="mb-6 flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-glow">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white truncate max-w-[150px]">{user?.name}</span>
                                    <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">{user?.role}</span>
                                </div>
                            </div>

                            {/* Navigation Links - Reduced size and spacing */}
                            <div className="flex flex-col space-y-2">
                                <Link
                                    to={getDashboardLink()}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all uppercase tracking-tight"
                                >
                                    <Icon name="user" size={18} className="text-primary-400" />
                                    <span>Dashboard</span>
                                </Link>

                                <Link
                                    to="/messages"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all uppercase tracking-tight"
                                >
                                    <Icon name="chat" size={18} className="text-primary-400" />
                                    <span>Messages</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all uppercase tracking-tight"
                                >
                                    <Icon name="settings" size={18} className="text-primary-400" />
                                    <span>Settings</span>
                                </Link>
                            </div>

                            {/* Logout Section */}
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all"
                                >
                                    <Icon name="logout" size={14} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;


