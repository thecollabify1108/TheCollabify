const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The seller/brand account
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Role and permissions
    role: {
        type: String,
        enum: ['owner', 'admin', 'manager', 'contributor', 'viewer'],
        default: 'contributor'
    },

    permissions: {
        campaigns: {
            create: { type: Boolean, default: false },
            edit: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            view: { type: Boolean, default: true },
            approve: { type: Boolean, default: false }
        },
        creators: {
            search: { type: Boolean, default: true },
            invite: { type: Boolean, default: false },
            message: { type: Boolean, default: false },
            review: { type: Boolean, default: false }
        },
        analytics: {
            view: { type: Boolean, default: true },
            export: { type: Boolean, default: false },
            customize: { type: Boolean, default: false }
        },
        billing: {
            view: { type: Boolean, default: false },
            edit: { type: Boolean, default: false },
            manage: { type: Boolean, default: false }
        },
        team: {
            invite: { type: Boolean, default: false },
            remove: { type: Boolean, default: false },
            editRoles: { type: Boolean, default: false }
        },
        settings: {
            edit: { type: Boolean, default: false }
        }
    },

    // Invitation details
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    invitedAt: Date,
    acceptedAt: Date,

    // Status
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'removed'],
        default: 'pending'
    },

    // Activity tracking
    lastActive: Date,
    loginCount: { type: Number, default: 0 },

    // Notification preferences
    notificationPreferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Indexes
teamMemberSchema.index({ organizationId: 1, status: 1 });
teamMemberSchema.index({ userId: 1 });
teamMemberSchema.index({ role: 1 });

// Static method to get team members
teamMemberSchema.statics.getTeamMembers = async function (organizationId, status = 'active') {
    return await this.find({ organizationId, status })
        .populate('userId', 'name email profilePicture')
        .populate('invitedBy', 'name')
        .sort({ createdAt: -1 });
};

// Static method to check permission
teamMemberSchema.statics.hasPermission = async function (userId, organizationId, resource, action) {
    const member = await this.findOne({ userId, organizationId, status: 'active' });
    if (!member) return false;

    return member.permissions[resource]?.[action] || false;
};

// Method to set default permissions based on role
teamMemberSchema.methods.setDefaultPermissions = function () {
    const rolePermissions = {
        owner: {
            campaigns: { create: true, edit: true, delete: true, view: true, approve: true },
            creators: { search: true, invite: true, message: true, review: true },
            analytics: { view: true, export: true, customize: true },
            billing: { view: true, edit: true, manage: true },
            team: { invite: true, remove: true, editRoles: true },
            settings: { edit: true }
        },
        admin: {
            campaigns: { create: true, edit: true, delete: false, view: true, approve: true },
            creators: { search: true, invite: true, message: true, review: true },
            analytics: { view: true, export: true, customize: false },
            billing: { view: true, edit: false, manage: false },
            team: { invite: true, remove: false, editRoles: false },
            settings: { edit: false }
        },
        manager: {
            campaigns: { create: true, edit: true, delete: false, view: true, approve: false },
            creators: { search: true, invite: true, message: true, review: false },
            analytics: { view: true, export: true, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        },
        contributor: {
            campaigns: { create: false, edit: false, delete: false, view: true, approve: false },
            creators: { search: true, invite: false, message: true, review: false },
            analytics: { view: true, export: false, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        },
        viewer: {
            campaigns: { create: false, edit: false, delete: false, view: true, approve: false },
            creators: { search: false, invite: false, message: false, review: false },
            analytics: { view: true, export: false, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        }
    };

    this.permissions = rolePermissions[this.role] || rolePermissions.viewer;
};

// Pre-save hook to set default permissions
teamMemberSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('role')) {
        this.setDefaultPermissions();
    }
    next();
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);
