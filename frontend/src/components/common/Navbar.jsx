import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
        <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={getDashboardLink()} className="flex items-center space-x-2">
                        <FaInstagram className="w-8 h-8 text-primary-500" />
                        <span className="text-xl font-bold gradient-text">The Collabify.ai</span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <NotificationBell />

                        {/* User Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-dark-800 transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden md:block text-dark-200 font-medium">{user?.name}</span>
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-56 glass-card py-2 shadow-xl"
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
                                                <FaUser className="mr-3" />
                                                Dashboard
                                            </Link>
                                            <Link
                                                to={`${getDashboardLink()}?tab=edit`}
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center px-4 py-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition"
                                            >
                                                <FaCog className="mr-3" />
                                                Edit Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700 transition"
                                            >
                                                <FaSignOutAlt className="mr-3" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
