import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaEllipsisV, FaTrash, FaToggleOn, FaToggleOff, FaCheckCircle, FaClock, FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { HiShieldCheck } from 'react-icons/hi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'verification'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Verification state
    const [creators, setCreators] = useState([]);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedCreator, setExpandedCreator] = useState(null);
    const [verifyForm, setVerifyForm] = useState({ followers: '', engagement: '' });
    const [verifying, setVerifying] = useState(false);
    const [recalculating, setRecalculating] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    useEffect(() => {
        if (activeTab === 'verification') fetchCreators();
    }, [activeTab, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getUsers({ page: 1, limit: 50, role: roleFilter !== 'all' ? roleFilter : undefined });
            setUsers(res.data.data.users);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchCreators = async () => {
        try {
            setVerificationLoading(true);
            const res = await adminAPI.getPendingVerification(statusFilter ? { status: statusFilter } : {});
            setCreators(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch creators');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleVerify = async (creatorId) => {
        const followers = parseInt(verifyForm.followers);
        const engagement = verifyForm.engagement !== '' ? parseFloat(verifyForm.engagement) : null;

        if (isNaN(followers) || followers < 0) {
            toast.error('Enter a valid follower count');
            return;
        }
        if (engagement !== null && (isNaN(engagement) || engagement < 0 || engagement > 100)) {
            toast.error('Engagement must be between 0 and 100');
            return;
        }

        try {
            setVerifying(true);
            const res = await adminAPI.verifyCreator(creatorId, {
                verifiedFollowers: followers,
                verifiedEngagementRate: engagement
            });
            const result = res.data.data;
            const mismatchText = result.followerMismatchPercentage != null ? `${result.followerMismatchPercentage}% deviation` : 'Verified';
            toast.success(
                result.verificationStatus === 'verified'
                    ? 'Creator verified successfully'
                    : `Mismatch flagged (${mismatchText})`
            );
            setExpandedCreator(null);
            setVerifyForm({ followers: '', engagement: '' });
            fetchCreators();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleRecalculateRisk = async (creatorId) => {
        try {
            setRecalculating(creatorId);
            const res = await adminAPI.recalculateRisk(creatorId);
            const r = res.data.data;
            toast.success(`Risk recalculated: ${r.compositeRiskScore} (${r.riskLevel})`);
            fetchCreators();
        } catch (error) {
            toast.error('Recalculation failed');
        } finally {
            setRecalculating(null);
        }
    };

    const handleToggleStatus = async (userId, isActive) => {
        try {
            await adminAPI.updateUserStatus(userId, !isActive);
            toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
            fetchUsers();
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;
        try {
            await adminAPI.deleteUser(userId);
            toast.success('User deleted');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleSetSubscription = async (userId, tier) => {
        try {
            await adminAPI.updateSubscription(userId, tier);
            toast.success(`Subscription set to ${tier}`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Subscription update failed');
        }
    };

    const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Bulk selection logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Do not allow selecting ADMIN users
            setSelectedUsers(filteredUsers.filter(u => u.activeRole !== 'ADMIN').map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This cannot be undone.`)) return;

        try {
            setLoading(true);
            await adminAPI.bulkDeleteUsers(selectedUsers);
            toast.success(`Successfully deleted ${selectedUsers.length} user(s)`);
            setSelectedUsers([]);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bulk delete failed');
        } finally {
            setLoading(false);
        }
    };

    const formatFollowers = (count) => {
        if (!count) return '0';
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <HiShieldCheck className="w-3 h-3" /> Verified
                    </span>
                );
            case 'mismatch_flagged':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                        <FaExclamationTriangle className="w-2.5 h-2.5" /> Mismatch
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <FaClock className="w-2.5 h-2.5" /> Pending
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-dark-900/50 rounded-xl border border-dark-700/50 w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-glow' : 'text-dark-400 hover:text-dark-200'}`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('verification')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'verification' ? 'bg-primary-600 text-white shadow-glow' : 'text-dark-400 hover:text-dark-200'}`}
                >
                    <HiShieldCheck /> Verification
                </button>
            </div>

            {activeTab === 'users' ? (
                <>
                    {/* Header / Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-2xl font-bold text-dark-100">User Management</h2>
                        <div className="flex gap-3 w-full md:w-auto">
                            {selectedUsers.length > 0 && (
                                <button 
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <FaTrash className="text-sm" /> Delete Selected ({selectedUsers.length})
                                </button>
                            )}
                            <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-colors">
                                <span className="text-xl">+</span> Add User
                            </button>
                            <button className="px-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-dark-300 hover:text-white transition-colors">
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <FaFilter className="text-dark-400" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="bg-dark-900/50 border border-dark-700 rounded-xl px-4 py-2.5 text-dark-200 focus:border-primary-500 outline-none cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="creator">Creators</option>
                                <option value="seller">Brands</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-dark-900/50 border-b border-dark-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left w-12">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                                                checked={filteredUsers.filter(u => u.activeRole !== 'ADMIN').length > 0 && selectedUsers.length === filteredUsers.filter(u => u.activeRole !== 'ADMIN').length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-800">
                                    {loading ? (
                                        <tr>
                                            <td colspan="6" className="px-6 py-8 text-center text-dark-400">Loading users...</td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colspan="6" className="px-6 py-8 text-center text-dark-400">No users found.</td>
                                        </tr>
                                    ) : filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-dark-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => handleSelectUser(user.id)}
                                                    disabled={user.activeRole === 'ADMIN'}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-dark-100 flex items-center gap-2">
                                                            {user.name}
                                                            {user.subscriptionTier && user.subscriptionTier !== 'FREE' && (
                                                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                                                                    {user.subscriptionTier === 'CREATOR_PRO' ? 'Creator Pro' : 'Brand Pro'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-dark-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.activeRole === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        user.activeRole === 'CREATOR' ? 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20' :
                                                            'bg-primary-500/10 text-primary-400 border-primary-500/20'
                                                    }`}>
                                                    {user.activeRole?.toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                    <span className={`text-sm ${user.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-dark-400">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        value={user.subscriptionTier || 'FREE'}
                                                        onChange={(e) => handleSetSubscription(user.id, e.target.value)}
                                                        className="bg-dark-800 border border-dark-600 rounded-lg px-2 py-1.5 text-xs text-dark-200 focus:border-primary-500 outline-none cursor-pointer"
                                                        title="Set Subscription Tier"
                                                    >
                                                        <option value="FREE">Free</option>
                                                        {user.activeRole === 'CREATOR' && <option value="CREATOR_PRO">Creator Pro</option>}
                                                        {user.activeRole === 'SELLER' && <option value="BRAND_PRO">Brand Pro</option>}
                                                    </select>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                        className="p-2 text-dark-400 hover:text-emerald-400 transition-colors bg-dark-800 hover:bg-dark-700 rounded-lg"
                                                        title={user.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {user.isActive ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className={`p-2 rounded-lg transition-colors ${user.activeRole === 'ADMIN' ? 'text-dark-600 bg-dark-800/50 cursor-not-allowed' : 'text-dark-400 hover:text-red-400 bg-dark-800 hover:bg-dark-700'}`}
                                                        title={user.activeRole === 'ADMIN' ? "Admins cannot be deleted" : "Delete User"}
                                                        disabled={user.activeRole === 'ADMIN'}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* ─── VERIFICATION PANEL ──────────────────────────── */
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-2xl font-bold text-dark-100">Creator Verification</h2>
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-dark-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-dark-900/50 border border-dark-700 rounded-xl px-4 py-2.5 text-dark-200 focus:border-primary-500 outline-none cursor-pointer text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="mismatch_flagged">Mismatch Flagged</option>
                            </select>
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        {verificationLoading ? (
                            <div className="px-6 py-12 text-center text-dark-400">Loading creators...</div>
                        ) : creators.length === 0 ? (
                            <div className="px-6 py-12 text-center text-dark-400">No creators found.</div>
                        ) : (
                            <div className="divide-y divide-dark-800">
                                {creators.map((creator) => (
                                    <div key={creator.id}>
                                        {/* Creator Row */}
                                        <div
                                            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-dark-800/30 transition-colors"
                                            onClick={() => {
                                                setExpandedCreator(expandedCreator === creator.id ? null : creator.id);
                                                setVerifyForm({ min: '', max: '' });
                                            }}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500/20 to-primary-500/20 flex items-center justify-center text-secondary-400 font-bold border border-secondary-500/30">
                                                    {creator.name?.charAt(0) || 'C'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-dark-100 truncate">{creator.name}</div>
                                                    <div className="text-xs text-dark-400 truncate">{creator.email} &bull; {creator.category}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-sm font-bold text-dark-200">{formatFollowers(creator.followerCount)}</div>
                                                    <div className="text-[10px] text-dark-500 uppercase tracking-wider">Reported</div>
                                                </div>
                                                {getStatusBadge(creator.verificationStatus)}
                                                {expandedCreator === creator.id ? (
                                                    <FaChevronUp className="text-dark-500 w-3 h-3" />
                                                ) : (
                                                    <FaChevronDown className="text-dark-500 w-3 h-3" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Verification Panel */}
                                        <AnimatePresence>
                                            {expandedCreator === creator.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 py-4 bg-dark-900/40 border-t border-dark-700/50">
                                                        {/* Instagram link for manual verification */}
                                                        {creator.instagramProfileUrl && (
                                                            <div className="mb-3 px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/40 flex items-center justify-between gap-3 text-sm text-dark-200">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400">Instagram URL</span>
                                                                <a href={creator.instagramProfileUrl} target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300 font-semibold underline">
                                                                    {creator.instagramProfileUrl}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {/* Current Stats */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                            <div className="p-3 rounded-xl bg-dark-800/60 border border-dark-700/30">
                                                                <div className="text-[10px] text-dark-500 uppercase tracking-wider mb-1">Reported Followers</div>
                                                                <div className="text-lg font-bold text-dark-100">{formatFollowers(creator.followerCount)}</div>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-dark-800/60 border border-dark-700/30">
                                                                <div className="text-[10px] text-dark-500 uppercase tracking-wider mb-1">Engagement Rate</div>
                                                                <div className="text-lg font-bold text-dark-100">{creator.engagementRate || 0}%</div>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-dark-800/60 border border-dark-700/30">
                                                                <div className="text-[10px] text-dark-500 uppercase tracking-wider mb-1">Composite Risk</div>
                                                                <div className={`text-lg font-bold ${creator.riskLevel === 'high' ? 'text-red-400' : creator.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                                    {creator.compositeRiskScore ?? 0}<span className="text-xs opacity-60">/100</span>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-dark-800/60 border border-dark-700/30">
                                                                <div className="text-[10px] text-dark-500 uppercase tracking-wider mb-1">Mismatch</div>
                                                                <div className={`text-lg font-bold ${(creator.followerMismatchPercentage || 0) > 15 ? 'text-red-400' : (creator.followerMismatchPercentage || 0) > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                                    {creator.followerMismatchPercentage != null ? creator.followerMismatchPercentage.toFixed(1) + '%' : 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Risk breakdown removed per request: risk shown only as composite score */}

                                                        {/* Previous verification data */}
                                                        {creator.verifiedFollowerRangeMin != null && (
                                                            <div className="mb-4 px-3 py-2 rounded-lg bg-dark-800/40 border border-dark-700/30 text-xs text-dark-400">
                                                                Previous verified range: <span className="text-dark-200 font-bold">{formatFollowers(creator.verifiedFollowerRangeMin)} — {formatFollowers(creator.verifiedFollowerRangeMax)}</span>
                                                                {creator.verificationLastUpdated && (
                                                                    <span className="ml-2">({new Date(creator.verificationLastUpdated).toLocaleDateString()})</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Verify Form */}
                                                        <div className="flex flex-col sm:flex-row items-end gap-3">
                                                            <div className="flex-1 w-full">
                                                                <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Verified Followers (actual)</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="e.g. 9500"
                                                                    value={verifyForm.followers}
                                                                    onChange={(e) => setVerifyForm(f => ({ ...f, followers: e.target.value }))}
                                                                    className="w-full px-3 py-2 bg-dark-900/60 border border-dark-700 rounded-lg text-dark-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="flex-1 w-full">
                                                                <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Admin Engagement Rate (%)</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.1"
                                                                    placeholder="e.g. 6.5"
                                                                    value={verifyForm.engagement}
                                                                    onChange={(e) => setVerifyForm(f => ({ ...f, engagement: e.target.value }))}
                                                                    className="w-full px-3 py-2 bg-dark-900/60 border border-dark-700 rounded-lg text-dark-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => handleVerify(creator.id)}
                                                                disabled={verifying || !verifyForm.followers}
                                                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold uppercase tracking-wider shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                                            >
                                                                {verifying ? 'Verifying...' : 'Verify'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRecalculateRisk(creator.id)}
                                                                disabled={recalculating === creator.id}
                                                                className="px-4 py-2 rounded-lg bg-dark-700/60 border border-dark-600 text-dark-200 text-sm font-bold uppercase tracking-wider hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                                                title="Recalculate composite risk score"
                                                            >
                                                                {recalculating === creator.id ? 'Calculating...' : 'Recalc Risk'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminUsers;
