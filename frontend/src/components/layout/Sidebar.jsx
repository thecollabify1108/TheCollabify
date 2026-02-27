import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Sidebar = ({ tabs, activeTab, setActiveTab, user }) => {
    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 bg-dark-950 border-r border-dark-800 z-40 pt-20">
            {/* Navigation Links */}
            <div className="flex-1 px-s4 py-s6 space-y-s2 overflow-y-auto custom-scrollbar">
                <div className="mb-s6 px-s4">
                    <p className="text-xs-pure font-bold text-dark-500 uppercase tracking-widest">Menu</p>
                </div>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-s3 px-s4 py-s3 rounded-premium-xl transition-all duration-200 group ${activeTab === tab.id
                            ? 'bg-primary-500/10 text-primary-400'
                            : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                            }`}
                    >
                        <Icon
                            name={tab.iconName || 'grid'}
                            size={20}
                            className={activeTab === tab.id ? 'text-primary-500' : 'text-dark-400 group-hover:text-dark-300'}
                        />
                        <span className="text-body font-bold uppercase tracking-wider">{tab.label}</span>

                        {/* Badges */}
                        {tab.badge > 0 && (
                            <span className="ml-auto bg-primary-500 text-white text-xs-pure font-bold px-s2 py-0.5 rounded-full shadow-glow">
                                {tab.badge > 9 ? '9+' : tab.badge}
                            </span>
                        )}

                        {/* Active Indicator */}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeSidebar"
                                className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* User Profile Snippet (Bottom) */}
            <div className="p-s4 border-t border-dark-800 bg-dark-900/50">
                <div className="flex items-center gap-s3 p-s2 rounded-premium-xl hover:bg-dark-800 transition cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-premium">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-small font-bold text-dark-100 truncate">{user?.name}</p>
                        <p className="text-xs-pure font-bold text-dark-500 truncate uppercase tracking-widest">{user?.activeRole?.toLowerCase() || 'Creator'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
