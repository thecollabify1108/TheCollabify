import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from '../common/ThemeToggle';
import Logo from '../common/Logo';

const DashboardLayout = ({
    children,
    user,
    tabs,
    activeTab,
    setActiveTab
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-prime text-text-prime selection:bg-white selection:text-black">
            {/* BACKGROUND INFRASTRUCTURE */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.01] blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full" />
            </div>

            {/* SHARED HEADER - Control Bar */}
            <header className="fixed top-0 left-0 right-0 z-[100] luxury-blur border-b border-white/5 h-16 px-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <Logo className="h-5 w-auto grayscale brightness-150 transition-all group-hover:brightness-200" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] hidden sm:block opacity-50">Protocol</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 px-4 py-1.5 border border-white/5 rounded-full bg-white/[0.02]">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-text-sec">Live Status</span>
                    </div>
                    <ThemeToggle />
                    <div className="h-8 w-8 rounded-full border border-white/10 overflow-hidden bg-surface-2 flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                </div>
            </header>

            {/* SIDEBAR - Institutional Navigation */}
            <Sidebar
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
            />

            {/* MAIN CONTENT AREA */}
            <main className="transition-all duration-700 lg:pl-64 pt-24 pb-32 min-h-screen relative z-10">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* MOBILE NAVIGATION - Executive Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-[110] lg:hidden">
                <div className="luxury-blur border-t border-white/5 px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                    <div className="flex items-center justify-around max-w-lg mx-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === tab.id ? 'text-text-prime' : 'text-text-muted hover:text-text-sec'
                                    }`}
                            >
                                <div className={`p-2 rounded-panel transition-all duration-500 ${activeTab === tab.id ? 'bg-white/5 border border-white/10' : 'bg-transparent border border-transparent'
                                    }`}>
                                    {/* Simplified icon rendering or use tab.icon */}
                                    {tab.label === 'Home' || tab.id === 'dashboard' ? '⌂' : '⠿'}
                                </div>
                                <span className="text-[8px] uppercase tracking-[0.2em] font-black">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default DashboardLayout;
