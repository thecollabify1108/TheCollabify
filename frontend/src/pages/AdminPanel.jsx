import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaUsers,
    FaBriefcase,
    FaChartLine,
    FaTrash,
    FaToggleOn,
    FaToggleOff,
    FaSearch,
    FaUserShield,
    FaCheckSquare,
    FaSquare
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);

            if (activeTab === 'dashboard') {
                const res = await adminAPI.getStats();
                setStats(res.data.data);
            } else if (activeTab === 'users') {
                const res = await adminAPI.getUsers({ page: 1, limit: 20, role: roleFilter !== 'all' ? roleFilter : undefined });
                setUsers(res.data.data.users);
                setPagination(res.data.data.pagination);
            } else if (activeTab === 'requests') {
                const res = await adminAPI.getRequests({ page: 1, limit: 20 });
                setRequests(res.data.data.requests);
                setPagination(res.data.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUserStatus = async (userId, isActive) => {
        try {
            await adminAPI.updateUserStatus(userId, !isActive);
            toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await adminAPI.deleteUser(userId);
            toast.success('User deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) {
            toast.error('No users selected');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) return;

        try {
            await adminAPI.bulkDeleteUsers(selectedUsers);
            toast.success(`${selectedUsers.length} user(s) deleted successfully`);
            setSelectedUsers([]);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete users');
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;

        try {
            await adminAPI.deleteRequest(requestId);
            toast.success('Request deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete request');
        }
    };

    const toggleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        const filteredUsers = users.filter(user =>
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            user.role !== 'admin'
        );

        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u._id));
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
        { id: 'users', label: 'Users', icon: <FaUsers /> },
        { id: 'requests', label: 'Requests', icon: <FaBriefcase /> }
    ];

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <FaUserShield className="w-8 h-8 text-primary-500 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Admin Panel</h1>
                        <p className="text-dark-400">Manage users and platform content</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide mb-8 pb-2">
                    <div className="flex space-x-2 bg-dark-800/50 p-1 rounded-xl">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Dashboard View */}
                        {activeTab === 'dashboard' && stats && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    <div className="glass-card p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-dark-400">Total Users</span>
                                            <FaUsers className="text-primary-400 text-xl" />
                                        </div>
                                        <div className="text-3xl font-bold text-dark-100">{stats.users.total}</div>
                                        <div className="flex gap-4 mt-2 text-sm text-dark-400">
                                            <span>Creators: {stats.users.creators}</span>
                                            <span>Sellers: {stats.users.sellers}</span>
                                        </div>
                                    </div>

                                    <div className="glass-card p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-dark-400">Total Requests</span>
                                            <FaBriefcase className="text-amber-400 text-xl" />
                                        </div>
                                        <div className="text-3xl font-bold text-dark-100">{stats.requests.total}</div>
                                        <div className="flex gap-4 mt-2 text-sm text-dark-400">
                                            <span>Active: {stats.requests.active}</span>
                                            <span>Completed: {stats.requests.completed}</span>
                                        </div>
                                    </div>

                                    <div className="glass-card p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-dark-400">Success Rate</span>
                                            <HiSparkles className="text-emerald-400 text-xl" />
                                        </div>
                                        <div className="text-3xl font-bold text-dark-100">
                                            {stats.requests.total > 0
                                                ? Math.round((stats.requests.completed / stats.requests.total) * 100)
                                                : 0}%
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Users View */}
                        {activeTab === 'users' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {/* Filters */}
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="input-field pl-11"
                                        />
                                    </div>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="select-field w-full md:w-48"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="creator">Creators</option>
                                        <option value="seller">Sellers</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                </div>

                                {/* Bulk Actions */}
                                {selectedUsers.length > 0 && (
                                    <div className="mb-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-between">
                                        <span className="text-dark-200 font-medium">
                                            {selectedUsers.length} user(s) selected
                                        </span>
                                        <button
                                            onClick={handleBulkDelete}
                                            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition"
                                        >
                                            <FaTrash />
                                            Delete Selected
                                        </button>
                                    </div>
                                )}

                                {/* Users Table */}
                                <div className="glass-card overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-dark-800">
                                                <tr>
                                                    <th className="px-6 py-4 text-center text-sm font-medium text-dark-300">
                                                        <button
                                                            onClick={toggleSelectAll}
                                                            className="text-dark-300 hover:text-dark-100 transition"
                                                        >
                                                            {selectedUsers.length > 0 && selectedUsers.length === users.filter(u => u.role !== 'admin').length ?
                                                                <FaCheckSquare className="text-xl" /> :
                                                                <FaSquare className="text-xl" />
                                                            }
                                                        </button>
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">User</th>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Role</th>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Status</th>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Joined</th>
                                                    <th className="px-6 py-4 text-right text-sm font-medium text-dark-300">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-dark-700">
                                                {users
                                                    .filter(user =>
                                                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((user) => (
                                                        <tr key={user._id} className="hover:bg-dark-800/50 transition">
                                                            <td className="px-6 py-4 text-center">
                                                                {user.role !== 'admin' && (
                                                                    <button
                                                                        onClick={() => toggleSelectUser(user._id)}
                                                                        className="text-dark-400 hover:text-primary-400 transition"
                                                                    >
                                                                        {selectedUsers.includes(user._id) ?
                                                                            <FaCheckSquare className="text-xl" /> :
                                                                            <FaSquare className="text-xl" />
                                                                        }
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div>
                                                                    <div className="text-dark-100 font-medium">{user.name}</div>
                                                                    <div className="text-dark-400 text-sm">{user.email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`badge ${user.role === 'admin' ? 'badge-danger' :
                                                                    user.role === 'creator' ? 'badge-info' : 'badge-neutral'
                                                                    }`}>
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-dark-400 text-sm">
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                                                        className="p-2 text-dark-400 hover:text-primary-400 transition"
                                                                        title={user.isActive ? 'Deactivate' : 'Activate'}
                                                                    >
                                                                        {user.isActive ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                                                                    </button>
                                                                    {user.role !== 'admin' && (
                                                                        <button
                                                                            onClick={() => handleDeleteUser(user._id)}
                                                                            className="p-2 text-dark-400 hover:text-red-400 transition"
                                                                            title="Delete"
                                                                        >
                                                                            <FaTrash />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Requests View */}
                        {activeTab === 'requests' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="glass-card overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-dark-800">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Title</th>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Seller</th>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Type</th>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Status</th>
                                                    <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Created</th>
                                                    <th className="px-6 py-4 text-right text-sm font-medium text-dark-300">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-dark-700">
                                                {requests.map((request) => (
                                                    <tr key={request._id} className="hover:bg-dark-800/50 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="text-dark-100 font-medium">{request.title}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-dark-400">
                                                            {request.sellerId?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="badge badge-info">{request.promotionType}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`badge ${request.status === 'Completed' ? 'badge-success' :
                                                                request.status === 'Cancelled' ? 'badge-danger' : 'badge-neutral'
                                                                }`}>
                                                                {request.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-dark-400 text-sm">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteRequest(request._id)}
                                                                className="p-2 text-dark-400 hover:text-red-400 transition"
                                                                title="Delete"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
