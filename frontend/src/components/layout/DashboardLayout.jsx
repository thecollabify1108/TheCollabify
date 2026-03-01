import { motion } from 'framer-motion';
import Navbar from '../common/Navbar';
import Sidebar from './Sidebar';
import QuickActionsFAB from '../common/QuickActionsFAB';
import Icon from '../common/Icon';

const DashboardLayout = ({
    children,
    user,
    tabs,
    activeTab,
    setActiveTab,
    showGuide, // For GuidedAIMode
    setShowGuide
}) => {

    // QuickActionsFAB Handlers (Placeholder - passed from parent usually, but simplifying for layout)
    // In a real refactor, these might be context or props

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
            <main className={`transition-all duration-300 ${'lg:pl-64' /* Add padding for sidebar on desktop */
                } pt-0 pb-20 lg:pb-8`}>

                <div className="max-w-7xl mx-auto px-s2 sm:px-s4 lg:px-s6 pt-s1 md:pt-s6">
                    {children}
                </div>

            </main>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-t border-dark-800 z-50 lg:hidden pb-[env(safe-area-inset-bottom)] shadow-premium">
                <div className="max-w-lg mx-auto px-s1 md:px-s2 py-s1 md:py-s2">
                    <div className="flex items-center justify-around">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex flex-col items-center gap-s1 px-s2 md:px-s3 py-s1.5 md:py-s2 rounded-premium-lg transition-all ${activeTab === tab.id
                                    ? 'text-primary-400'
                                    : 'text-dark-400 hover:text-dark-200'
                                    }`}
                            >
                                <Icon name={tab.iconName || 'grid'} size={20} />
                                <span className="text-xs-pure font-bold uppercase tracking-wider">{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                                        {tab.badge > 9 ? '9+' : tab.badge}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* AI Assistant handled by pages for specific context */}
        </div>
    );
};

export default DashboardLayout;
