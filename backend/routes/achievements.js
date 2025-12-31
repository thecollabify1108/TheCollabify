const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isCreator } = require('../middleware/roleCheck');
const CreatorProfile = require('../models/CreatorProfile');

// Badge Definitions
const BADGES = [
    {
        id: 'first_campaign',
        name: 'First Campaign',
        description: 'Completed your first promotion',
        icon: 'stars',
        color: 'from-blue-400 to-blue-600',
        criteria: '1 successful promotion'
    },
    {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Reached 50K followers',
        icon: 'trending_up',
        color: 'from-amber-400 to-amber-600',
        criteria: '50K+ followers'
    },
    {
        id: 'top_performer',
        name: 'Top Performer',
        description: 'Completed 5 successful campaigns',
        icon: 'trophy',
        color: 'from-emerald-400 to-emerald-600',
        criteria: '5 successful promotions'
    },
    {
        id: 'elite_creator',
        name: 'Elite Creator',
        description: 'High engagement and 10+ campaigns',
        icon: 'crown',
        color: 'from-purple-400 to-purple-600',
        criteria: '10+ promotions & high rating'
    },
    {
        id: 'perfect_match',
        name: 'Perfect Match',
        description: 'Achieved 100% match score',
        icon: 'heart',
        color: 'from-pink-400 to-pink-600',
        criteria: '100% match score on a campaign'
    },
    {
        id: 'content_pro',
        name: 'Content Pro',
        description: 'Mastered all promotion types',
        icon: 'video_camera',
        color: 'from-cyan-400 to-cyan-600',
        criteria: 'All promotion types offered'
    }
];

/**
 * @route   GET /api/achievements
 * @desc    Get all badges and user's progress
 * @access  Private (Creator)
 */
router.get('/', auth, isCreator, async (req, res) => {
    try {
        const profile = await CreatorProfile.findOne({ userId: req.userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Map badges to include 'earned' status
        const achievements = BADGES.map(badge => {
            const earned = profile.achievements.find(a => a.badgeId === badge.id);
            return {
                ...badge,
                earned: !!earned,
                earnedAt: earned ? earned.earnedAt : null
            };
        });

        // Calculate progress towards next badge (mock logic for demo)
        // In real app, we'd check stats against criteria
        const totalEarned = achievements.filter(a => a.earned).length;
        const completionPercentage = Math.round((totalEarned / BADGES.length) * 100);

        res.json({
            success: true,
            data: {
                achievements,
                stats: {
                    totalEarned,
                    totalBadges: BADGES.length,
                    completionPercentage
                }
            }
        });

    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get achievements'
        });
    }
});

/**
 * @route   POST /api/achievements/check
 * @desc    Check and award new badges based on current stats
 * @access  Private (Creator)
 */
router.post('/check', auth, isCreator, async (req, res) => {
    try {
        const profile = await CreatorProfile.findOne({ userId: req.userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        const newBadges = [];
        const currentBadges = profile.achievements.map(a => a.badgeId);

        // Check logic
        // 1. First Campaign
        if (profile.successfulPromotions >= 1 && !currentBadges.includes('first_campaign')) {
            newBadges.push('first_campaign');
        }

        // 2. Rising Star (Mocked limit for ease of testing: 1000)
        if (profile.followerCount >= 50000 && !currentBadges.includes('rising_star')) {
            newBadges.push('rising_star');
        }

        // 3. Top Performer
        if (profile.successfulPromotions >= 5 && !currentBadges.includes('top_performer')) {
            newBadges.push('top_performer');
        }

        // 4. Content Pro (Mock: if they selected all 4 types)
        if (profile.promotionTypes && profile.promotionTypes.length >= 4 && !currentBadges.includes('content_pro')) {
            newBadges.push('content_pro');
        }

        if (newBadges.length > 0) {
            newBadges.forEach(id => {
                profile.achievements.push({ badgeId: id });
            });
            await profile.save();
        }

        res.json({
            success: true,
            data: {
                newBadges,
                totalNew: newBadges.length
            }
        });

    } catch (error) {
        console.error('Check achievements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check achievements'
        });
    }
});

module.exports = router;
