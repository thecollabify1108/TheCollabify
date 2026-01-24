import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaChartPie,
    FaUsers,
    FaBriefcase,
    FaCog,
    FaSignOutAlt,
    FaSearch,
    FaBell,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: <FaChartPie /> },
        { id: 'users', label: 'User Management', icon: <FaUsers /> },
        { id: 'requests', label: 'Campaign Requests', icon: <FaBriefcase /> },
        { id: 'settings', label: 'Platform Settings', icon: <FaCog /> },
    ];

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="font-bold text-white text-lg">A</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-dark-400">
                        AdminPanel
                    </span>
                </Link>
                {/* Close Button for Mobile */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden text-dark-400 hover:text-white"
                >
                    <FaTimes size={24} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-4 px-2">Menu</div>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                            : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
                            }`}
                    >
                        <span className={`text-lg group-hover:scale-110 transition-transform ${activeTab === item.id ? 'text-white' : 'text-dark-400 group-hover:text-primary-400'}`}>
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-dark-800">
                <div className="bg-dark-800/50 rounded-xl p-3 flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-dark-100 truncate">{user?.name || 'Admin'}</div>
                        <div className="text-xs text-dark-400 truncate">{user?.email || 'admin@collabify.com'}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                >
                    <FaSignOutAlt />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-dark-950 flex transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-dark-900 border-r border-dark-800 flex-shrink-0 fixed h-full z-30 hidden lg:flex flex-col transition-colors duration-300">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-64 bg-dark-900 border-r border-dark-800 z-50 flex flex-col lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden text-dark-400 hover:text-white"
                        >
                            <FaBars size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-dark-100 lg:hidden">Admin</h2>

                        {/* Search Bar */}
                        <div className="hidden md:flex relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="bg-dark-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 w-64 text-dark-100 placeholder-dark-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <button className="relative p-2 text-dark-400 hover:text-primary-400 transition-colors rounded-full hover:bg-dark-800">
                            <FaBell className="text-lg" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-900"></span>
                        </button>
                        <ThemeToggle />
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
                    {/* Background decoration */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
