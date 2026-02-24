import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUsers,
    FaPlus,
    FaTimes,
    FaEdit,
    FaTrash,
    FaCrown,
    FaUserShield,
    FaUser,
    FaEnvelope,
    FaCheck,
    FaClock,
    FaExclamationCircle
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

/**
 * Team Management Component
 * Manage team members, roles, and permissions for enterprise sellers
 */
const TeamManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const res = await api.get('team');
            setMembers(res.data.data.members || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleInviteMember = async (email, role) => {
        try {
            await api.post('team/invite', { email, role });
            toast.success(`Invitation sent to ${email}!`);
            setShowInviteModal(false);
            fetchTeamMembers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        }
    };

    const handleUpdateRole = async (memberId, newRole) => {
        try {
            await api.put(`team/${memberId}/role`, { role: newRole });
            toast.success('Role updated successfully!');
            fetchTeamMembers();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Remove this team member?')) return;

        try {
            await api.delete(`team/${memberId}`);
            toast.success('Member removed');
            fetchTeamMembers();
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    const getRoleInfo = (role) => {
        const roles = {
            Owner: {
                icon: FaCrown,
                color: 'from-yellow-500 to-orange-500',
                bgColor: 'bg-yellow-500/10',
                textColor: 'text-yellow-400',
                description: 'Full access to all features'
            },
            Admin: {
                icon: FaUserShield,
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-500/10',
                textColor: 'text-purple-400',
                description: 'Manage campaigns and team'
            },
            Manager: {
                icon: FaUsers,
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-500/10',
                textColor: 'text-blue-400',
                description: 'Manage campaigns only'
            },
            Analyst: {
                icon: FaUser,
                color: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-500/10',
                textColor: 'text-green-400',
                description: 'View analytics and reports'
            },
            Viewer: {
                icon: FaUser,
                color: 'from-gray-500 to-slate-500',
                bgColor: 'bg-gray-500/10',
                textColor: 'text-gray-400',
                description: 'View-only access'
            }
        };
        return roles[role] || roles.Viewer;
    };

    const activeMembers = members.filter(m => m.status === 'Active');
    const pendingMembers = members.filter(m => m.status === 'Pending');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
                        <FaUsers className="text-primary-400" />
                        Team Management
                    </h2>
                    <p className="text-dark-400 text-sm">
                        Manage your team members and their permissions
                    </p>
                </div>

                <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <FaPlus /> Invite Member
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <FaUsers className="text-green-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Active Members</p>
                            <p className="text-2xl font-bold text-dark-100">{activeMembers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <FaClock className="text-amber-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Pending Invites</p>
                            <p className="text-2xl font-bold text-dark-100">{pendingMembers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <FaUserShield className="text-purple-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Total Roles</p>
                            <p className="text-2xl font-bold text-dark-100">5</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Members */}
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-dark-100 mb-4">Active Team Members</h3>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-dark-700/50 rounded-lg animate-pulse shimmer" />
                        ))}
                    </div>
                ) : activeMembers.length === 0 ? (
                    <div className="text-center py-8">
                        <FaUsers className="text-5xl text-dark-600 mx-auto mb-3" />
                        <p className="text-dark-400">No active team members yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeMembers.map(member => {
                            const roleInfo = getRoleInfo(member.role);
                            const RoleIcon = roleInfo.icon;

                            return (
                                <motion.div
                                    key={member._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-dark-700/30 border border-dark-600 rounded-lg p-4 hover:border-dark-500 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${roleInfo.color} flex items-center justify-center text-white font-bold`}>
                                                {member.userId?.name?.[0]?.toUpperCase() || 'U'}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-dark-100">
                                                    {member.userId?.name || 'Team Member'}
                                                </h4>
                                                <p className="text-sm text-dark-400">
                                                    {member.userId?.email || member.email}
                                                </p>
                                            </div>

                                            {/* Role Badge */}
                                            <div className={`px-3 py-1 rounded-full ${roleInfo.bgColor} ${roleInfo.textColor} flex items-center gap-2`}>
                                                <RoleIcon />
                                                <span className="text-sm font-medium">{member.role}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {member.role !== 'Owner' && (
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => setSelectedMember(member)}
                                                    className="p-2 rounded-lg bg-dark-600 text-dark-300 hover:bg-dark-500 transition-colors"
                                                    title="Edit Role"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                    title="Remove Member"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pending Invitations */}
            {pendingMembers.length > 0 && (
                <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                        <FaClock className="text-amber-400" />
                        Pending Invitations
                    </h3>

                    <div className="space-y-3">
                        {pendingMembers.map(member => (
                            <div
                                key={member._id}
                                className="bg-dark-700/30 border border-amber-500/20 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                            <FaEnvelope className="text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-dark-100">{member.email}</p>
                                            <p className="text-sm text-dark-400">Invited as {member.role}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                                        Pending
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Role Permissions Guide */}
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-dark-100 mb-4">Role Permissions</h3>

                <div className="space-y-3">
                    {['Owner', 'Admin', 'Manager', 'Analyst', 'Viewer'].map(role => {
                        const roleInfo = getRoleInfo(role);
                        const RoleIcon = roleInfo.icon;

                        return (
                            <div key={role} className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/30 border border-dark-600">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleInfo.color} flex items-center justify-center`}>
                                    <RoleIcon className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-dark-100">{role}</p>
                                    <p className="text-sm text-dark-400">{roleInfo.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <InviteModal
                        onClose={() => setShowInviteModal(false)}
                        onInvite={handleInviteMember}
                    />
                )}
            </AnimatePresence>

            {/* Edit Role Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <EditRoleModal
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                        onUpdate={handleUpdateRole}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Invite Member Modal
 */
const InviteModal = ({ onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Viewer');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await onInvite(email, role);
            setEmail('');
            setRole('Viewer');
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                        <HiSparkles className="text-primary-400" />
                        Invite Team Member
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-100 focus:border-primary-500 focus:outline-none"
                            placeholder="member@company.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Role *
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-100 focus:border-primary-500 focus:outline-none"
                        >
                            <option value="Viewer">Viewer - View only</option>
                            <option value="Analyst">Analyst - View analytics</option>
                            <option value="Manager">Manager - Manage campaigns</option>
                            <option value="Admin">Admin - Full access</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

/**
 * Edit Role Modal
 */
const EditRoleModal = ({ member, onClose, onUpdate }) => {
    const [role, setRole] = useState(member.role);
    const [updating, setUpdating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await onUpdate(member._id, role);
            onClose();
        } finally {
            setUpdating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-dark-100">Update Role</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                        <p className="text-sm text-dark-400 mb-1">Member</p>
                        <p className="font-medium text-dark-100">{member.userId?.name || member.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            New Role *
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-100 focus:border-primary-500 focus:outline-none"
                        >
                            <option value="Viewer">Viewer</option>
                            <option value="Analyst">Analyst</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {updating ? 'Updating...' : 'Update Role'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default TeamManagement;
