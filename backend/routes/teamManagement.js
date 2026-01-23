const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const TeamMember = require('../models/TeamMember');

/**
 * @route   GET /api/team
 * @desc    Get team members
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const { status = 'active' } = req.query;

        const team = await TeamMember.getTeamMembers(req.user.id, status);

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
        const { email, role = 'contributor' } = req.body;

        // Check permission
        const canInvite = await TeamMember.hasPermission(
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

        // Check if already invited
        const existing = await TeamMember.findOne({
            organizationId: req.user.id,
            'userId.email': email
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'User already invited or is a team member'
            });
        }

        const member = new TeamMember({
            organizationId: req.user.id,
            userId: null, // Will be set when user accepts
            role,
            invitedBy: req.user.id,
            invitedAt: new Date(),
            status: 'pending'
        });

        await member.save();

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
        const canEdit = await TeamMember.hasPermission(
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

        const member = await TeamMember.findOne({
            _id: req.params.id,
            organizationId: req.user.id
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found'
            });
        }

        member.role = role;
        await member.save();

        res.json({
            success: true,
            data: { member }
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
        const canRemove = await TeamMember.hasPermission(
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

        const member = await TeamMember.findOne({
            _id: req.params.id,
            organizationId: req.user.id
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found'
            });
        }

        member.status = 'removed';
        await member.save();

        res.json({
            success: true,
            message: 'Team member removed successfully'
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

        const hasPermission = await TeamMember.hasPermission(
            req.user.id,
            organizationId,
            resource,
            action
        );

        res.json({
            success: true,
            data: { hasPermission }
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
