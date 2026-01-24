import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaEllipsisV, FaTrash, FaToggleOn, FaToggleOff, FaCheckCircle } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

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

    const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-dark-100">User Management</h2>
                <div className="flex gap-3 w-full md:w-auto">
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
                                    <td colSpan="5" className="px-6 py-8 text-center text-dark-400">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-dark-400">No users found.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-dark-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-dark-100">{user.name}</div>
                                                <div className="text-sm text-dark-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                user.role === 'creator' ? 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20' :
                                                    'bg-primary-500/10 text-primary-400 border-primary-500/20'
                                            }`}>
                                            {user.role}
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
                                            <button
                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                className="p-2 text-dark-400 hover:text-emerald-400 transition-colors bg-dark-800 hover:bg-dark-700 rounded-lg"
                                                title={user.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {user.isActive ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-dark-400 hover:text-red-400 transition-colors bg-dark-800 hover:bg-dark-700 rounded-lg"
                                                title="Delete User"
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
        </div>
    );
};

export default AdminUsers;
