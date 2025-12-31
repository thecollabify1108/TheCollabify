const express = require('express');
const router = express.Router();
const CreatorProfile = require('../models/CreatorProfile');

/**
 * @route   GET /api/leaderboard
 * @desc    Get top creators for leaderboard
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { period = 'allTime', category, limit = 10 } = req.query;

        const query = { isAvailable: true };

        if (category && category !== 'All') {
            query.category = category;
        }

        // Calculate scores dynamically if needed, or rely on stored score.
        // For MVP, since we just added the field and it's 0 for everyone,
        // we should probably populate it or sort by a derived value.
        // Let's use an aggregation to calculate it on the fly if 0, or just use existing metrics for now.
        // Better: sort by a mix of followerCount and successfulPromotions

        // Aggregation to get top creators
        const creators = await CreatorProfile.aggregate([
            { $match: query },
            {
                $addFields: {
                    // Simple score formula: (Engagement * 10) + (SuccessfulPromotions * 50) + (log10(Followers) * 20)
                    // If leaderboardScore is already set/updated, we could use that. 
                    // But for now let's compute a 'displayScore' for the response.
                    calculatedScore: {
                        $add: [
                            { $multiply: ["$engagementRate", 10] },
                            { $multiply: ["$successfulPromotions", 50] },
                            // Logarithm of followers (to avoid millions skewing it too much, but give weight)
                            // MongoDB doesn't have simple log10 in older versions, so let's simplify:
                            // Just use raw follower count scaled down? No.
                            // Let's simply weight engagement heavily.
                            { $multiply: [{ $divide: ["$followerCount", 10000] }, 5] } // 5 points per 10k followers
                        ]
                    }
                }
            },
            { $sort: { calculatedScore: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    'user.password': 0,
                    'user.role': 0
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                creators: creators,
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
