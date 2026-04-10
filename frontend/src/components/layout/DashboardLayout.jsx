import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from './Sidebar';
import Icon from '../common/Icon';

const DashboardLayout = ({
    children,
    user,
    tabs,
    activeTab,
    setActiveTab
}) => {
    const isHomeTab = activeTab === 'dashboard';

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            {/* Desktop Sidebar */}
            <Sidebar
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
            />

            {/* Main Content Area */}
            <main className={`transition-all duration-300 pt-24 lg:pl-56 ${isHomeTab ? 'pb-20 lg:pb-6' : 'pb-32 lg:pb-8'}`}>

                <div className="max-w-7xl mx-auto px-s2 sm:px-s4 lg:px-s6 pt-s1 md:pt-s6">
                    {children}

                    {isHomeTab && (
                        <footer className="mt-5 mb-2 border-t border-dark-800/80 py-2">
                            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-dark-500 font-medium">
                                <Link to="/contact" className="hover:text-dark-300 transition-colors">Support</Link>
                                <span className="text-dark-700">|</span>
                                <Link to="/terms-conditions" className="hover:text-dark-300 transition-colors">Terms of Use</Link>
                                <span className="text-dark-700">|</span>
                                <Link to="/privacy" className="hover:text-dark-300 transition-colors">Privacy Policy</Link>
                                <span className="text-dark-700">|</span>
                                <span>© {new Date().getFullYear()} TheCollabify</span>
                            </div>
                        </footer>
                    )}
                </div>

            </main>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/98 backdrop-blur-2xl border-t border-dark-800/80 z-50 lg:hidden shadow-2xl shadow-black/50"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="flex items-end justify-around px-1 py-1 max-w-lg mx-auto relative">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                ? 'text-primary-400'
                                : 'text-dark-500 hover:text-dark-300'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 bg-primary-500/10 rounded-xl"
                                />
                            )}
                            <Icon name={tab.iconName || 'grid'} size={18} className="relative z-10" />
                            <span className="text-[9px] font-semibold uppercase tracking-widest relative z-10">{tab.label}</span>
                            {tab.badge > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] flex items-center justify-center font-bold">
                                    {tab.badge > 9 ? '9+' : tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default DashboardLayout;
