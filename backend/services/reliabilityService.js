const prisma = require('../config/prisma');

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

                console.log(`[Reliability] CREATOR ${userId} | Action: ${action} | Score: ${profile.reliabilityScore.toFixed(3)} -> ${newScore.toFixed(3)} | Context: ${contextId}`);
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

                console.log(`[Reliability] BRAND ${userId} | Action: ${action} | Score: ${user.reliabilityScore.toFixed(3)} -> ${newScore.toFixed(3)} | Context: ${contextId}`);
            }
        }
    } catch (error) {
        console.error(`[Reliability] Failed to update score for ${userId}:`, error);
    }
}

module.exports = {
    updateReliabilityScore,
    SCORE_CHANGES
};
