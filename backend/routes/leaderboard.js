const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

/**
 * @route   GET /api/leaderboard
 * @desc    Get top creators for leaderboard
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { period = 'allTime', category, limit = 10 } = req.query;

        const where = { isAvailable: true };

        if (category && category !== 'All') {
            where.category = category;
        }

        // Fetch creators with their user data
        // We fetch more than limit to allow for accurate in-memory scoring if ranking fluctuates
        const creators = await prisma.creatorProfile.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        createdAt: true
                    }
                }
            },
            take: 100 // Fetch a reasonable pool for scoring
        });

        // Calculate scores in-memory
        const scoredCreators = creators.map(profile => {
            // Legacy formula: (Engagement * 10) + (SuccessfulPromotions * 50) + (Followers/10000 * 5)
            const engagementScore = (profile.engagementRate || 0) * 10;
            const promoScore = (profile.successfulPromotions || 0) * 50;
            const followerScore = ((profile.followerCount || 0) / 10000) * 5;

            const calculatedScore = engagementScore + promoScore + followerScore;

            return {
                ...profile,
                calculatedScore
            };
        });

        // Sort and limit
        const topCreators = scoredCreators
            .sort((a, b) => b.calculatedScore - a.calculatedScore)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: {
                creators: topCreators,
                period
            }
        });

    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get leaderboard'
        });
    }
});

module.exports = router;
