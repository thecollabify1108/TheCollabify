import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaChartPie,
    FaRocket,
    FaUsers,
    FaComments,
    FaPlus,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const DashboardSidebar = ({ activeSection, setActiveSection, unreadMessages = 0 }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaChartPie />, color: 'from-primary-500 to-purple-500' },
        { id: 'campaigns', label: 'Campaigns', icon: <FaRocket />, color: 'from-amber-500 to-orange-500' },
        { id: 'creators', label: 'Discover', icon: <FaUsers />, color: 'from-emerald-500 to-teal-500' },
        { id: 'messages', label: 'Messages', icon: <FaComments />, color: 'from-blue-500 to-cyan-500', badge: unreadMessages },
        { id: 'create', label: 'New Request', icon: <FaPlus />, color: 'from-pink-500 to-rose-500' }
    ];

    return (
        <motion.aside
            className={`bg-dark-900/80 backdrop-blur-xl border-r border-dark-700 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
            initial={false}
        >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <HiSparkles className="text-primary-400 text-xl" />
                        <span className="font-bold text-dark-100">Seller Hub</span>
                    </motion.div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-dark-200 transition-all"
                >
                    {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2">
                {menuItems.map((item) => (
                    <motion.button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all relative ${activeSection === item.id
                                ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="text-lg">{item.icon}</span>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-medium"
                            >
                                {item.label}
                            </motion.span>
                        )}
                        {item.badge > 0 && (
                            <span className={`absolute ${isCollapsed ? 'top-0 right-0' : 'right-3'} bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        )}
                    </motion.button>
                ))}
            </nav>

            {/* Quick Action */}
            {!isCollapsed && (
                <div className="p-4 border-t border-dark-700">
                    <div className="glass-card p-4 bg-gradient-to-br from-primary-500/10 to-secondary-500/10">
                        <p className="text-sm text-dark-300 mb-3">
                            Need help finding creators?
                        </p>
                        <button
                            onClick={() => setActiveSection('create')}
                            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                        >
                            Create Request
                        </button>
                    </div>
                </div>
            )}
        </motion.aside>
    );
};

export default DashboardSidebar;
