import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ tabs, activeTab, setActiveTab }) => {
    const { logout } = useAuth();

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-bg-prime border-r border-white/5 z-[90] hidden lg:flex flex-col px-6 py-12">
            <div className="flex-1 space-y-12">
                <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold px-4">Navigation</span>
                    <nav className="space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full group relative flex items-center gap-4 px-4 py-3 rounded-soft transition-all duration-500 ${activeTab === tab.id
                                        ? 'bg-white/5 text-text-prime border border-white/5'
                                        : 'text-text-muted hover:text-text-sec hover:bg-white/[0.02]'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeTab === tab.id ? 'bg-text-prime scale-100' : 'bg-transparent scale-0 group-hover:scale-50 group-hover:bg-text-muted'
                                    }`} />
                                <span className="text-[11px] uppercase tracking-[0.2em] font-black">{tab.label}</span>

                                {tab.badge > 0 && (
                                    <span className="ml-auto text-[10px] bg-white text-black px-1.5 py-0.5 rounded font-black">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold px-4">Workspace</span>
                    <div className="space-y-2">
                        {['Security', 'Status', 'Archives'].map(item => (
                            <button key={item} className="w-full flex items-center gap-4 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-text-sec transition-colors font-bold">
                                <div className="w-1 h-1 bg-surface-3 rounded-full" />
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-white/5 space-y-6">
                <button
                    onClick={logout}
                    className="w-full text-left px-4 text-[10px] uppercase tracking-[0.4em] text-text-muted hover:text-red-400 transition-colors font-bold"
                >
                    Terminate Session
                </button>
                <div className="px-4">
                    <div className="h-[1px] w-full bg-white/5 mb-4" />
                    <span className="text-[8px] uppercase tracking-[0.4em] text-text-muted font-bold opacity-30">Authority Verified</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
