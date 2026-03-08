import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

// Layout
import AdminLayout from '../components/admin/AdminLayout';

// Sub Components
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers'; // Will extract this next
import AdminRequests from '../components/admin/AdminRequests'; // Will extract this next

const PlatformSettingsPanel = () => {
    const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        adminAPI.getSettings()
            .then(res => setEarlyBirdEnabled(res.data?.data?.earlyBirdMode === true))
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = async () => {
        const newValue = !earlyBirdEnabled;
        const label = newValue ? 'Early Bird Mode' : 'Marketplace Mode';
        if (!window.confirm(`Switch platform to ${label}? This affects all users immediately.`)) return;
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-1">Platform Settings</h3>
                <p className="text-dark-400 text-sm">Control platform-wide feature flags and modes.</p>
            </div>

            {/* Early Bird Toggle */}
            <div className="glass-card p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🎉</span>
                            <h4 className="text-white font-semibold">Early Bird Mode</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                earlyBirdEnabled
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-dark-700 text-dark-400 border border-dark-600'
                            }`}>
                                {earlyBirdEnabled ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>
                        <p className="text-dark-400 text-sm">
                            When enabled, all collaboration payments and escrow are bypassed. Users see early bird messaging. 
                            Disable to switch to standard paid marketplace mode.
                        </p>
                    </div>
                    <button
                        onClick={handleToggle}
                        disabled={saving}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-200 flex-shrink-0 mt-1 ${
                            earlyBirdEnabled ? 'bg-amber-500' : 'bg-dark-600'
                        } disabled:opacity-50`}
                        aria-label="Toggle Early Bird Mode"
                    >
                        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                            earlyBirdEnabled ? 'translate-x-7' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>

                <div className={`mt-4 p-3 rounded-xl text-sm ${
                    earlyBirdEnabled
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                        : 'bg-dark-800 border border-dark-700 text-dark-400'
                }`}>
                    {earlyBirdEnabled
                        ? '🟡 Platform is in Early Bird Mode — collaborations are free, no payments required.'
                        : '⚫ Platform is in Marketplace Mode — payments and escrow are enabled.'}
                </div>
            </div>

            {/* Future settings placeholder */}
            <div className="glass-card p-6 opacity-50">
                <h4 className="text-white font-semibold mb-1">Payment Settings</h4>
                <p className="text-dark-400 text-sm">Stripe keys, commission rates, and payout settings. Available when Early Bird Mode is disabled.</p>
            </div>
        </div>
    );
};

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Initial Data Fetch for Dashboard
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
