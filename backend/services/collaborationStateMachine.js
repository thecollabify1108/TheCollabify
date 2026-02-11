/**
 * Collaboration Lifecycle State Machine
 * 
 * Enforces valid status transitions and prevents backward/skip transitions.
 * This is the ONLY authority on what transitions are legal.
 */

const STAGE_ORDER = [
    'REQUESTED',
    'ACCEPTED',
    'IN_DISCUSSION',
    'AGREED',
    'IN_PROGRESS',
    'COMPLETED'
];

const VALID_TRANSITIONS = {
    REQUESTED: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['IN_DISCUSSION', 'CANCELLED'],
    IN_DISCUSSION: ['AGREED', 'CANCELLED'],
    AGREED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],   // Terminal state
    CANCELLED: []    // Terminal state
};

const STAGE_LABELS = {
    REQUESTED: 'Requested',
    ACCEPTED: 'Accepted',
    IN_DISCUSSION: 'In Discussion',
    AGREED: 'Agreed',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

/**
 * Validate whether a transition from currentStatus to newStatus is allowed.
 * @param {string} currentStatus 
 * @param {string} newStatus 
 * @returns {{ valid: boolean, error?: string }}
 */
function validateTransition(currentStatus, newStatus) {
    // Check current status exists in our map
    if (!VALID_TRANSITIONS[currentStatus]) {
        return { valid: false, error: `Unknown current status: ${currentStatus}` };
    }

    // Check new status is a known value
    if (!VALID_TRANSITIONS.hasOwnProperty(newStatus)) {
        return { valid: false, error: `Unknown target status: ${newStatus}` };
    }

    // Check if we're in a terminal state
    if (VALID_TRANSITIONS[currentStatus].length === 0) {
        return { valid: false, error: `Cannot transition from terminal state: ${currentStatus}` };
    }

    // Check if the transition is allowed
    if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
        const allowed = VALID_TRANSITIONS[currentStatus].join(', ');
        return {
            valid: false,
            error: `Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed}`
        };
    }

    return { valid: true };
}

/**
 * Build a status history entry for audit logging.
 */
function buildHistoryEntry(from, to, userId) {
    return {
        from,
        to,
        at: new Date().toISOString(),
        userId
    };
}

/**
 * Check if a collaboration is in an editable state.
 * Deliverables/milestones can only be edited in active working states.
 */
function isEditable(status) {
    return ['ACCEPTED', 'IN_DISCUSSION', 'AGREED', 'IN_PROGRESS'].includes(status);
}

/**
 * Get the next valid actions for a given status.
 */
function getValidNextStatuses(currentStatus) {
    return VALID_TRANSITIONS[currentStatus] || [];
}

module.exports = {
    STAGE_ORDER,
    VALID_TRANSITIONS,
    STAGE_LABELS,
    validateTransition,
    buildHistoryEntry,
    isEditable,
    getValidNextStatuses
};
