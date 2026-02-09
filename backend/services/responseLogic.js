const prisma = require('../config/prisma');

/**
 * Service to calculate response likelihood for creators.
 * Derived from:
 * 1. Recent activity (lastLogin)
 * 2. Interaction history (MatchedCreator)
 */

/**
 * Calculate the response likelihood for a creator.
 * @param {string} creatorId - The ID of the creator profile
 * @param {string} userId - The ID of the user record (for login activity)
 * @returns {Promise<Object>} - The qualitative label and metadata
 */
const calculateResponseLikelihood = async (creatorId, userId) => {
    try {
        // 1. Check Activity Status First
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { lastLogin: true }
        });

        if (!user || !user.lastLogin) {
            return {
                label: 'Limited recent activity',
                type: 'LOW',
                color: 'amber',
                icon: 'clock',
                description: 'Has not been active recently. Response may be delayed.'
            };
        }

        const daysSinceLogin = (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24);

        if (daysSinceLogin > 30) {
            return {
                label: 'Limited recent activity',
                type: 'LOW',
                color: 'amber',
                icon: 'clock',
                description: 'Has not been active recently. Response may be delayed.'
            };
        }

        // 2. Check Interaction History
        // We look at the last 20 invites or matched states
        const interactions = await prisma.matchedCreator.findMany({
            where: {
                creatorId: creatorId,
                status: {
                    in: ['INVITED', 'MATCHED', 'ACCEPTED', 'REJECTED']
                }
            },
            orderBy: {
                appliedAt: 'desc' // or createdAt if appliedAt is null for some
            },
            take: 20
        });

        if (interactions.length < 3) {
            // Not enough data to judge
            return {
                label: 'New to platform',
                type: 'NEUTRAL',
                color: 'blue',
                icon: 'sparkles',
                description: 'New creator. Be their first collaboration!'
            };
        }

        // 3. Calculate Response Rate
        // A "Response" is defined as:
        // - status is ACCEPTED
        // - status is REJECTED
        // - OR respondedAt is NOT NULL
        let respondedCount = 0;
        let totalConsidered = interactions.length;

        interactions.forEach(interaction => {
            const hasResponded =
                interaction.respondedAt !== null ||
                interaction.status === 'ACCEPTED' ||
                interaction.status === 'REJECTED';

            if (hasResponded) {
                respondedCount++;
            }
        });

        const responseRate = (respondedCount / totalConsidered) * 100;

        // 4. Determine Label
        if (responseRate >= 70) {
            return {
                label: 'Usually responds',
                type: 'HIGH',
                color: 'emerald',
                icon: 'check',
                description: 'Highly responsive to collaboration requests.'
            };
        } else if (responseRate >= 40) {
            return {
                label: 'Responds sometimes',
                type: 'MEDIUM',
                color: 'gray',
                icon: 'dash',
                description: 'Sometimes responds to relevant campaigns.'
            };
        } else {
            return {
                label: 'Selective',
                type: 'LOW',
                color: 'orange',
                icon: 'filter',
                description: 'Very selective with collaborations.'
            };
        }

    } catch (error) {
        console.error('Error calculating response likelihood:', error);
        return {
            label: 'Unknown',
            type: 'NEUTRAL',
            color: 'gray'
        };
    }
};

module.exports = {
    calculateResponseLikelihood
};
