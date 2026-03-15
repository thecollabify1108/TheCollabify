import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Layout
import AdminLayout from '../components/admin/AdminLayout';

// Sub Components
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminRequests from '../components/admin/AdminRequests';
import ConfirmModal from '../components/common/ConfirmModal';
import Icon from '../components/common/Icon';

const PlatformSettingsPanel = () => {
    const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {},
        title: '',
        message: '',
        variant: 'warning'
    });

    useEffect(() => {
        adminAPI.getSettings()
            .then(res => setEarlyBirdEnabled(res.data?.data?.earlyBirdMode === true))
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = () => {
        const newValue = !earlyBirdEnabled;
        const label = newValue ? 'Early Bird Mode' : 'Marketplace Mode';
        
        setConfirmModal({
            isOpen: true,
            title: `Switch to ${label}?`,
            message: `This will immediately affect all users and change the platform's core behavior regarding payments.`,
            variant: newValue ? 'warning' : 'info',
            onConfirm: () => performToggle(newValue, label)
        });
    };

    const performToggle = async (newValue, label) => {
        setSaving(true);
        try {
            await adminAPI.toggleEarlyBirdMode(newValue);
            setEarlyBirdEnabled(newValue);
            toast.success(`Platform switched to ${label} ✓`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update setting');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-3xl">
            <ConfirmModal 
                {...confirmModal}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-s8 rounded-premium-2xl border border-white/5 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Icon name="settings" size={120} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-h3 font-black text-white mb-1 uppercase tracking-tight">Platform Configuration</h3>
                    <p className="text-dark-400 text-body">Advanced controls for the technical behavior of the marketplace.</p>
                </div>
            </motion.div>

            {/* Early Bird Toggle - Modernized Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`glass-card p-s6 rounded-premium-2xl border transition-all duration-500 ${
                    earlyBirdEnabled 
                        ? 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]' 
                        : 'border-dark-700/50 bg-dark-900/40'
                }`}
            >
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-s3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-glow border ${
                                earlyBirdEnabled 
                                    ? 'bg-amber-500/20 border-amber-500/30' 
                                    : 'bg-dark-800 border-dark-700'
                            }`}>
                                {earlyBirdEnabled ? '🐣' : '🏬'}
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-wider">Early Bird Mode</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${earlyBirdEnabled ? 'bg-amber-500' : 'bg-dark-400'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${earlyBirdEnabled ? 'text-amber-400' : 'text-dark-500'}`}>
                                        {earlyBirdEnabled ? 'System Active' : 'Marketplace Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-dark-300 text-small leading-relaxed">
                            When <span className="text-white font-bold">Enabled</span>, we bypass the escrow system. Collaborations are free.
                            Users see exclusive "Early Bird" branding across the platform. Perfect for initial growth phases.
                        </p>
                    </div>
                    
                    <button
                        onClick={handleToggle}
                        disabled={saving}
                        className={`relative w-[68px] h-[34px] rounded-full transition-all duration-300 flex-shrink-0 mt-2 p-1 ${
                            earlyBirdEnabled ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-dark-700'
                        } disabled:opacity-50 group hover:scale-105 active:scale-95`}
                    >
                        <div className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-xl transition-all duration-500 transform ${
                            earlyBirdEnabled ? 'translate-x-[34px] rotate-180' : 'translate-x-0'
                        } flex items-center justify-center`}>
                           {earlyBirdEnabled ? '☀️' : '🔒'}
                        </div>
                    </button>
                </div>

                <div className={`mt-s6 p-4 rounded-premium-xl border flex items-center gap-4 transition-all duration-500 ${
                    earlyBirdEnabled
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                        : 'bg-dark-950/40 border-dark-700/50 text-dark-400'
                }`}>
                    <Icon name={earlyBirdEnabled ? 'info' : 'lock'} size={20} className={earlyBirdEnabled ? 'text-amber-400' : 'text-dark-500'} />
                    <p className="text-xs font-bold uppercase tracking-wide">
                        {earlyBirdEnabled
                            ? 'Collaborations are currently FREE for all users.'
                            : 'Standard Revenue Model is ACTIVE. Payments required.'}
                    </p>
                </div>
            </motion.div>

            {/* Locked Settings Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-40 grayscale-[0.5]">
                <div className="glass-card p-s6 rounded-premium-xl border border-dark-700/50 relative group">
                    <div className="absolute top-4 right-4"><Icon name="lock" size={14} className="text-dark-500" /></div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs-pure mb-1">Financial Gate</h4>
                    <p className="text-dark-500 text-[11px]">Commission rates & Stripe keys.</p>
                </div>
                <div className="glass-card p-s6 rounded-premium-xl border border-dark-700/50 relative group">
                    <div className="absolute top-4 right-4"><Icon name="lock" size={14} className="text-dark-500" /></div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs-pure mb-1">Moderation AI</h4>
                    <p className="text-dark-500 text-[11px]">Auto-ban thresholds & Filtering.</p>
                </div>
            </div>
        </div>
    );
};

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const res = await adminAPI.getStats();
            setStats(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard stats');
        } finally {
            setStatsLoading(false);
        }
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'dashboard' && <AdminDashboard stats={stats} loading={statsLoading} />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'requests' && <AdminRequests />}
            {activeTab === 'settings' && <PlatformSettingsPanel />}
        </AdminLayout>
    );
};

export default AdminPanel;
