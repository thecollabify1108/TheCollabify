/**
 * Team Collaboration Service
 * Multi-user workspace management for enterprise accounts
 */

/**
 * Team roles and permissions
 */
export const teamRoles = {
    owner: {
        id: 'owner',
        name: 'Owner',
        level: 100,
        permissions: {
            campaigns: { create: true, edit: true, delete: true, view: true, approve: true },
            creators: { search: true, invite: true, message: true, review: true },
            analytics: { view: true, export: true, customize: true },
            billing: { view: true, edit: true, manage: true },
            team: { invite: true, remove: true, editRoles: true },
            settings: { edit: true }
        },
        badge: '👑',
        color: '#EC4899'
    },
    admin: {
        id: 'admin',
        name: 'Admin',
        level: 80,
        permissions: {
            campaigns: { create: true, edit: true, delete: false, view: true, approve: true },
            creators: { search: true, invite: true, message: true, review: true },
            analytics: { view: true, export: true, customize: false },
            billing: { view: true, edit: false, manage: false },
            team: { invite: true, remove: false, editRoles: false },
            settings: { edit: false }
        },
        badge: '⚡',
        color: '#8B5CF6'
    },
    manager: {
        id: 'manager',
        name: 'Campaign Manager',
        level: 60,
        permissions: {
            campaigns: { create: true, edit: true, delete: false, view: true, approve: false },
            creators: { search: true, invite: true, message: true, review: false },
            analytics: { view: true, export: true, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        },
        badge: '📊',
        color: '#10B981'
    },
    contributor: {
        id: 'contributor',
        name: 'Contributor',
        level: 40,
        permissions: {
            campaigns: { create: false, edit: false, delete: false, view: true, approve: false },
            creators: { search: true, invite: false, message: true, review: false },
            analytics: { view: true, export: false, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        },
        badge: '✏️',
        color: '#6B7280'
    },
    viewer: {
        id: 'viewer',
        name: 'Viewer',
        level: 20,
        permissions: {
            campaigns: { create: false, edit: false, delete: false, view: true, approve: false },
            creators: { search: false, invite: false, message: false, review: false },
            analytics: { view: true, export: false, customize: false },
            billing: { view: false, edit: false, manage: false },
            team: { invite: false, remove: false, editRoles: false },
            settings: { edit: false }
        },
        badge: '👀',
        color: '#9CA3AF'
    }
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, resource, action) => {
    const role = teamRoles[userRole];
    if (!role) return false;

    return role.permissions[resource]?.[action] || false;
};

/**
 * Create team invitation
 */
export const createInvitation = (inviterData) => {
    const {
        email,
        role = 'contributor',
        invitedBy,
        workspace,
        message = ''
    } = inviterData;

    return {
        id: `invite_${Date.now()}`,
        email,
        role,
        invitedBy,
        workspace,
        message,
        status: 'pending',
        token: generateInviteToken(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        acceptedAt: null
    };
};

/**
 * Workspace activity log
 */
export const logActivity = (activity) => {
    const {
        userId,
        userName,
        action,
        resource,
        resourceId,
        details = {}
    } = activity;

    return {
        id: `activity_${Date.now()}`,
        userId,
        userName,
        action, // created, updated, deleted, invited, etc.
        resource, // campaign, creator, team_member, etc.
        resourceId,
        details,
        timestamp: new Date(),
        readBy: []
    };
};

/**
 * Get team activity feed
 */
export const getActivityFeed = (activities, filters = {}) => {
    const {
        userId,
        resource,
        startDate,
        endDate,
        limit = 50
    } = filters;

    let filtered = activities;

    if (userId) {
        filtered = filtered.filter(a => a.userId === userId);
    }

    if (resource) {
        filtered = filtered.filter(a => a.resource === resource);
    }

    if (startDate) {
        filtered = filtered.filter(a => new Date(a.timestamp) >= new Date(startDate));
    }

    if (endDate) {
        filtered = filtered.filter(a => new Date(a.timestamp) <= new Date(endDate));
    }

    return filtered
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
};

/**
 * Approval workflow
 */
export const createApprovalRequest = (request) => {
    const {
        type, // campaign_launch, budget_increase, creator_invite
        requestedBy,
        approvers = [],
        item,
        reason,
        priority = 'normal' // low, normal, high, urgent
    } = request;

    return {
        id: `approval_${Date.now()}`,
        type,
        requestedBy,
        approvers: approvers.map(approverId => ({
            userId: approverId,
            status: 'pending', // pending, approved, rejected
            respondedAt: null,
            comments: ''
        })),
        item,
        reason,
        priority,
        status: 'pending', // pending, approved, rejected, cancelled
        createdAt: new Date(),
        resolvedAt: null
    };
};

/**
 * Process approval response
 */
export const processApproval = (approvalRequest, approverId, response) => {
    const {
        status, // approved, rejected
        comments = ''
    } = response;

    const updated = { ...approvalRequest };
    const approverIndex = updated.approvers.findIndex(a => a.userId === approverId);

    if (approverIndex === -1) {
        throw new Error('Approver not found');
    }

    updated.approvers[approverIndex] = {
        ...updated.approvers[approverIndex],
        status,
        respondedAt: new Date(),
        comments
    };

    // Check if all approvers have responded
    const allResponded = updated.approvers.every(a => a.status !== 'pending');
    const allApproved = updated.approvers.every(a => a.status === 'approved');
    const anyRejected = updated.approvers.some(a => a.status === 'rejected');

    if (allResponded) {
        if (anyRejected) {
            updated.status = 'rejected';
        } else if (allApproved) {
            updated.status = 'approved';
        }
        updated.resolvedAt = new Date();
    }

    return updated;
};

/**
 * Team notifications
 */
export const createTeamNotification = (notification) => {
    const {
        type, // mention, assignment, approval_request, comment
        fromUser,
        toUsers = [],
        message,
        link,
        priority = 'normal'
    } = notification;

    return {
        id: `notif_${Date.now()}`,
        type,
        fromUser,
        toUsers,
        message,
        link,
        priority,
        createdAt: new Date(),
        readBy: []
    };
};

/**
 * Workspace analytics
 */
export const getWorkspaceAnalytics = (teamData) => {
    const {
        members = [],
        campaigns = [],
        activities = []
    } = teamData;

    const activeMembersByRole = {};
    members.forEach(member => {
        if (member.lastActive && isWithinDays(member.lastActive, 7)) {
            activeMembersByRole[member.role] = (activeMembersByRole[member.role] || 0) + 1;
        }
    });

    const activityByMember = {};
    activities.forEach(activity => {
        activityByMember[activity.userId] = (activityByMember[activity.userId] || 0) + 1;
    });

    const topContributors = Object.entries(activityByMember)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([userId, count]) => {
            const member = members.find(m => m.id === userId);
            return {
                userId,
                name: member?.name || 'Unknown',
                activities: count,
                role: member?.role
            };
        });

    const campaignsByMember = {};
    campaigns.forEach(campaign => {
        campaignsByMember[campaign.createdBy] = (campaignsByMember[campaign.createdBy] || 0) + 1;
    });

    return {
        team: {
            totalMembers: members.length,
            activeMembers: Object.values(activeMembersByRole).reduce((a, b) => a + b, 0),
            byRole: activeMembersByRole
        },
        campaigns: {
            total: campaigns.length,
            active: campaigns.filter(c => c.status === 'active').length,
            perMember: campaigns.length / members.length
        },
        activity: {
            last7Days: activities.filter(a => isWithinDays(a.timestamp, 7)).length,
            last30Days: activities.filter(a => isWithinDays(a.timestamp, 30)).length,
            topContributors
        },
        collaboration: {
            averageResponseTime: calculateAvgResponseTime(activities),
            collaborationScore: calculateCollaborationScore(teamData)
        }
    };
};

/**
 * Task assignment
 */
export const createTask = (taskData) => {
    const {
        title,
        description,
        assignedTo,
        assignedBy,
        dueDate,
        priority = 'normal',
        relatedTo, // campaign, creator, etc.
        checklist = []
    } = taskData;

    return {
        id: `task_${Date.now()}`,
        title,
        description,
        assignedTo,
        assignedBy,
        dueDate: new Date(dueDate),
        priority,
        status: 'todo', // todo, in_progress, review, done
        relatedTo,
        checklist: checklist.map(item => ({
            text: item,
            completed: false
        })),
        createdAt: new Date(),
        completedAt: null,
        comments: []
    };
};

// Helper Functions

function generateInviteToken() {
    return `invite_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

function isWithinDays(date, days) {
    const diffTime = Math.abs(new Date() - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
}

function calculateAvgResponseTime(activities) {
    // Simplified calculation - in production, would track actual response times
    const recentActivities = activities.filter(a => isWithinDays(a.timestamp, 7));
    if (recentActivities.length < 2) return 0;

    // Mock calculation - would be based on actual message/response pairs
    return 4.5; // hours
}

function calculateCollaborationScore(teamData) {
    let score = 50; // Base score

    const { members = [], activities = [], campaigns = [] } = teamData;

    // Active members score
    const activeCount = members.filter(m => isWithinDays(m.lastActive, 7)).length;
    const activeRatio = activeCount / members.length;
    score += activeRatio * 20;

    // Activity score
    const avgActivityPerMember = activities.length / members.length;
    if (avgActivityPerMember > 10) score += 15;
    else if (avgActivityPerMember > 5) score += 10;

    // Cross-campaign collaboration
    const uniqueContributors = new Set(campaigns.map(c => c.createdBy));
    const collaborationRatio = uniqueContributors.size / members.length;
    score += collaborationRatio * 15;

    return Math.min(100, Math.round(score));
}

export default {
    teamRoles,
    hasPermission,
    createInvitation,
    logActivity,
    getActivityFeed,
    createApprovalRequest,
    processApproval,
    createTeamNotification,
    getWorkspaceAnalytics,
    createTask
};
