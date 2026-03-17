import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../common/Navbar';
import Sidebar from './Sidebar';
import Icon from '../common/Icon';
import { HiSparkles } from 'react-icons/hi';
import AIAssistantPanel from '../common/AIAssistantPanel';

const DashboardLayout = ({
    children,
    user,
    tabs,
    activeTab,
    setActiveTab,
    showGuide, // For GuidedAIMode
    setShowGuide
}) => {
    const [showAI, setShowAI] = useState(false);

    // Split tabs to put AI button in the centre
    const midpoint = Math.ceil(tabs.length / 2);
    const leftTabs = tabs.slice(0, midpoint);
    const rightTabs = tabs.slice(midpoint);

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
            <main className={`transition-all duration-300 pt-24 pb-32 lg:pb-8 lg:pl-56`}>

                <div className="max-w-7xl mx-auto px-s2 sm:px-s4 lg:px-s6 pt-s1 md:pt-s6">
                    {children}
                </div>

            </main>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/98 backdrop-blur-2xl border-t border-dark-800/80 z-50 lg:hidden shadow-2xl shadow-black/50"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="flex items-end justify-around px-1 py-1 max-w-lg mx-auto relative">
                    {/* Left tabs */}
                    {leftTabs.map(tab => (
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

                    {/* Centre AI Button */}
                    <div className="flex flex-col items-center -mt-4 px-1">
                        <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={() => setShowAI(true)}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/40 flex items-center justify-center text-white border-2 border-dark-900"
                        >
                            <HiSparkles className="text-xl" />
                        </motion.button>
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-indigo-400 mt-0.5">AI</span>
                    </div>

                    {/* Right tabs */}
                    {rightTabs.map(tab => (
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

            {/* AI Assistant Panel (triggered from nav) */}
            {showAI && (
                <AIAssistantPanel onClose={() => setShowAI(false)} />
            )}
        </div>
    );
};

export default DashboardLayout;
