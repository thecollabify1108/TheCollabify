import Icon from '../common/Icon';

const DashboardSidebar = ({ activeSection, setActiveSection, unreadMessages = 0 }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <Icon name="grid" />, gradient: 'from-violet-500 to-purple-500' },
        { id: 'campaigns', label: 'Campaigns', icon: <Icon name="rocket" />, gradient: 'from-amber-500 to-orange-500' },
        { id: 'creators', label: 'Discover', icon: <Icon name="users" />, gradient: 'from-emerald-500 to-teal-500' },
        { id: 'messages', label: 'Messages', icon: <Icon name="message-square" />, gradient: 'from-blue-500 to-cyan-500', badge: unreadMessages },
        { id: 'create', label: 'New Request', icon: <Icon name="plus" />, gradient: 'from-pink-500 to-rose-500' }
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="relative h-[calc(100vh-64px)] bg-gradient-to-b from-dark-900/95 via-dark-900/90 to-dark-950 backdrop-blur-xl border-r border-dark-700/50 flex flex-col overflow-hidden"
        >
            {/* Decorative Elements */}
            <div className="absolute top-20 -left-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 -right-20 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Sidebar Header */}
            <div className="relative p-4 border-b border-dark-700/50">
                <div className="flex items-center justify-between">
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-3"
                            >
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20">
                                    <Icon name="sparkles" size={18} className="text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-lg text-dark-100">Seller Hub</span>
                                    <div className="flex items-center gap-1 text-xs text-amber-400">
                                        <Icon name="crown" size={10} />
                                        <span>Pro Account</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2.5 rounded-xl bg-dark-800/80 hover:bg-dark-700 text-dark-400 hover:text-dark-200 transition-all border border-dark-700/50"
                    >
                        {isCollapsed ? <Icon name="chevron-right" size={14} /> : <Icon name="chevron-left" size={14} />}
                    </motion.button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                {menuItems.map((item, index) => (
                    <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setActiveSection(item.id)}
                        className={`group w-full flex items-center gap-3 p-3.5 rounded-xl transition-all relative overflow-hidden ${activeSection === item.id
                            ? 'bg-dark-800/80 border border-dark-700/50 shadow-lg'
                            : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                            }`}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Active indicator */}
                        {activeSection === item.id && (
                            <motion.div
                                layoutId="activeIndicator"
                                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.gradient} rounded-full`}
                            />
                        )}

                        {/* Icon with gradient when active */}
                        <div className={`p-2 rounded-lg ${activeSection === item.id
                            ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg`
                            : 'bg-dark-800/50 text-dark-400 group-hover:text-dark-200'
                            }`}>
                            <span className="text-sm">{item.icon}</span>
                        </div>

                        {/* Label */}
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`font-medium text-sm ${activeSection === item.id ? 'text-dark-100' : ''
                                    }`}
                            >
                                {item.label}
                            </motion.span>
                        )}

                        {/* Badge */}
                        {item.badge > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`absolute ${isCollapsed ? 'top-1 right-1' : 'right-3'} bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg shadow-red-500/30`}
                            >
                                {item.badge > 9 ? '9+' : item.badge}
                            </motion.span>
                        )}
                    </motion.button>
                ))}
            </nav>

            {/* Quick Action Card */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-4 border-t border-dark-700/50"
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-500/10 border border-primary-500/20 p-5">
                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary-500/20 rounded-full blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon name="zap" size={16} className="text-amber-400" />
                                    <span className="text-sm font-semibold text-dark-200">Quick Action</span>
                                </div>
                                <p className="text-xs text-dark-400 mb-4">
                                    Launch a new campaign and connect with creators
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveSection('create')}
                                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white text-sm font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2"
                                >
                                    <Icon name="plus" size={12} /> Create Campaign
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    );
};

export default DashboardSidebar;
