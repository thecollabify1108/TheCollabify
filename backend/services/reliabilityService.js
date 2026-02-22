const prisma = require('../config/prisma');
const { createNotification } = require('./notificationService');

/**
 * Reliability Score Adjustments
 */
const SCORE_CHANGES = {
    COLLABORATION_COMPLETED: 0.05,
    POSITIVE_FEEDBACK: 0.02,
    COLLABORATION_CANCELLED: -0.10,
    DECLINED_INVITE: -0.03,
    REJECTED_APPLICATION: -0.01
};

const MIN_SCORE = 0.5;
const MAX_SCORE = 5.0;

/**
 * Update the reliability score for a Creator or Brand
 * @param {string} userId - The user ID
 * @param {string} role - 'CREATOR' or 'SELLER'
 * @param {string} action - The action type (key from SCORE_CHANGES)
 * @param {string} contextId - Optional ID for logging (e.g. collaboration ID)
 */
async function updateReliabilityScore(userId, role, action, contextId = '') {
    const change = SCORE_CHANGES[action];
    if (!change) return;

    try {
        if (role === 'CREATOR') {
            const profile = await prisma.creatorProfile.findUnique({
                where: { userId },
                select: { id: true, reliabilityScore: true }
            });

            if (profile) {
                const newScore = Math.min(MAX_SCORE, Math.max(MIN_SCORE, profile.reliabilityScore + change));

                await prisma.creatorProfile.update({
                    where: { id: profile.id },
                    data: { reliabilityScore: newScore }
                });

                // Check for level milestones
                const oldLevel = getReliabilityLevel(profile.reliabilityScore).label;
                const newLevelLabel = getReliabilityLevel(newScore).label;

                if (oldLevel !== newLevelLabel && newScore > profile.reliabilityScore) {
                    await createNotification({
                        userId,
                        type: 'MILESTONE',
                        title: 'Trust Milestone Reached! 🚀',
                        message: `Congratulations! Your reliability has increased to "${newLevelLabel}". This will boost your ranking in AI recommendations.`,
                        data: { level: newLevelLabel, score: newScore }
                    });
                }

            }
        } else if (role === 'SELLER') {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { reliabilityScore: true }
            });

            if (user) {
                const newScore = Math.min(MAX_SCORE, Math.max(MIN_SCORE, user.reliabilityScore + change));

                await prisma.user.update({
                    where: { id: userId },
                    data: { reliabilityScore: newScore }
                });

            }
        }
    } catch (error) {
        console.error(`[Reliability] Failed to update score for ${userId}:`, error);
    }
}

/**
 * Get human-readable reliability level based on score
 */
function getReliabilityLevel(score) {
    if (score >= 4.0) return { label: 'Elite', color: 'text-purple-400', icon: 'crown' };
    if (score >= 3.0) return { label: 'Reliable', color: 'text-emerald-400', icon: 'check_circle' };
    if (score >= 2.0) return { label: 'Rising Star', color: 'text-blue-400', icon: 'stars' };
    if (score >= 1.2) return { label: 'Standard', color: 'text-dark-400', icon: 'shield' };
    return { label: 'Building Trust', color: 'text-amber-400', icon: 'clock' };
}

module.exports = {
    updateReliabilityScore,
    getReliabilityLevel,
    SCORE_CHANGES
};
