const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const prisma = require('../config/prisma');

/**
 * Helper to get default permissions based on role
 */
const getDefaultPermissions = (role) => {
    const rolePermissions = {
        OWNER: {
            campaigns: { create: true, edit: true, delete: true, view: true, approve: true },
            creators: { search: true, invite: true, message: true, review: true },
            analytics: { view: true, export: true, customize: true },
            billing: { view: true, edit: true, manage: true },
            team: { invite: true, remove: true, editRoles: true },
            settings: { edit: true }
        },
        ADMIN: {
            campaigns: { create: true, edit: true, delete: false, view: true, approve: true },
            creators: { search: true, invite: true, message: true, review: true },
            analytics: { view: true, export: true, customize: false },
            billing: { view: true, edit: false, manage: false },
            team: { invite: true, remove: false, editRoles: false },
            settings: { edit: false }
        },
        MANAGER: {
            campaigns: { create: true, edit: true, delete: false, view: true, approve: false },
            creators: { search: true, invite: true, message: true, review: false },
            analytics: { view: true, export: true, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        },
        CONTRIBUTOR: {
            campaigns: { create: false, edit: false, delete: false, view: true, approve: false },
            creators: { search: true, invite: false, message: true, review: false },
            analytics: { view: true, export: false, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        },
        VIEWER: {
            campaigns: { create: false, edit: false, delete: false, view: true, approve: false },
            creators: { search: false, invite: false, message: false, review: false },
            analytics: { view: true, export: false, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        }
    };

    return rolePermissions[role.toUpperCase()] || rolePermissions.VIEWER;
};

/**
 * Helper to check permission
 */
const hasPermission = async (userId, organizationId, resource, action) => {
    const member = await prisma.teamMember.findFirst({
        where: { userId, organizationId, status: 'ACTIVE' }
    });
    if (!member) return false;

    const permissions = member.permissions;
    return permissions[resource]?.[action] || false;
};

/**
 * @route   GET /api/team
 * @desc    Get team members
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const { status = 'ACTIVE' } = req.query;

        const team = await prisma.teamMember.findMany({
            where: {
                organizationId: req.user.id,
                status: status.toUpperCase()
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true }
                },
                organization: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: { team }
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team members'
        });
    }
});

/**
 * @route   POST /api/team/invite
 * @desc    Invite team member
 * @access  Private
 */
router.post('/invite', auth, async (req, res) => {
    try {
        const { email, role = 'CONTRIBUTOR' } = req.body;

        // Check permission
        const canInvite = await hasPermission(
            req.user.id,
            req.user.id,
            'team',
            'invite'
        );

        if (!canInvite && req.user.role !== 'seller') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to invite team members'
            });
        }

        // Find user by email
        const userToInvite = await prisma.user.findUnique({ where: { email } });
        if (!userToInvite) {
            return res.status(404).json({
                success: false,
                message: 'User with this email not found'
            });
        }

        // Check if already invited or member
        const existing = await prisma.teamMember.findFirst({
            where: {
                organizationId: req.user.id,
                userId: userToInvite.id
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'User already invited or is a team member'
            });
        }

        const member = await prisma.teamMember.create({
            data: {
                organizationId: req.user.id,
                userId: userToInvite.id,
                role: role.toUpperCase(),
                invitedByUserId: req.user.id,
                invitedAt: new Date(),
                status: 'PENDING',
                permissions: getDefaultPermissions(role),
                notificationPrefs: { email: true, push: true, sms: false }
            }
        });

        // TODO: Send invitation email

        res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: { member }
        });
    } catch (error) {
        console.error('Error inviting member:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending invitation'
        });
    }
});

/**
 * @route   PUT /api/team/:id/role
 * @desc    Update team member role
 * @access  Private
 */
router.put('/:id/role', auth, async (req, res) => {
    try {
        const { role } = req.body;

        // Check permission
        const canEdit = await hasPermission(
            req.user.id,
            req.user.id,
            'team',
            'editRoles'
        );

        if (!canEdit) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to edit roles'
            });
        }

        const member = await prisma.teamMember.findFirst({
            where: {
                id: req.params.id,
                organizationId: req.user.id
            }
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found'
            });
        }

        const updatedMember = await prisma.teamMember.update({
            where: { id: req.params.id },
            data: {
                role: role.toUpperCase(),
                permissions: getDefaultPermissions(role)
            }
        });

        res.json({
            success: true,
            data: { member: updatedMember }
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating role'
        });
    }
});

/**
 * @route   DELETE /api/team/:id
 * @desc    Remove team member
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check permission
        const canRemove = await hasPermission(
            req.user.id,
            req.user.id,
            'team',
            'remove'
        );

        if (!canRemove) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to remove team members'
            });
        }

        const member = await prisma.teamMember.findFirst({
            where: {
                id: req.params.id,
                organizationId: req.user.id
            }
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found'
            });
        }

        const updatedMember = await prisma.teamMember.update({
            where: { id: req.params.id },
            data: { status: 'REMOVED' }
        });

        res.json({
            success: true,
            message: 'Team member removed successfully',
            data: { member: updatedMember }
        });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing member'
        });
    }
});

/**
 * @route   GET /api/team/permissions/check
 * @desc    Check user permission
 * @access  Private
 */
router.get('/permissions/check', auth, async (req, res) => {
    try {
        const { organizationId, resource, action } = req.query;

        const permissionGranted = await hasPermission(
            req.user.id,
            organizationId,
            resource,
            action
        );

        res.json({
            success: true,
            data: { hasPermission: permissionGranted }
        });
    } catch (error) {
        console.error('Error checking permission:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking permission'
        });
    }
});

module.exports = router;
