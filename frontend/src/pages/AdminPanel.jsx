import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

// Layout
import AdminLayout from '../components/admin/AdminLayout';

// Sub Components
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers'; // Will extract this next
import AdminRequests from '../components/admin/AdminRequests'; // Will extract this next

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
            {activeTab === 'settings' && (
                <div className="glass-card p-12 text-center text-dark-400">
                    <h3 className="text-xl font-bold mb-2">Platform Settings</h3>
                    <p>Configuration options coming soon.</p>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPanel;
