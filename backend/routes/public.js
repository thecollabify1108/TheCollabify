const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PromotionRequest = require('../models/PromotionRequest');

/**
 * @route   GET /api/public/stats
 * @desc    Get public platform statistics for landing page
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        const [
            totalCreators,
            totalSellers,
            activeCampaigns,
            recentUsers
        ] = await Promise.all([
            User.countDocuments({ role: 'creator', isActive: true }),
            User.countDocuments({ role: 'seller', isActive: true }),
            PromotionRequest.countDocuments({ status: 'Open' }),
            User.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name role createdAt')
        ]);

        const activities = recentUsers.map(u => ({
            type: 'signup',
            user: u.name,
            role: u.role,
            time: 'Just now' // Simplified for now
        }));

        res.json({
            success: true,
            data: {
                totalCreators,
                totalBrands: totalSellers,
                activeCampaigns,
                successRate: 98,
                activities
            }
        });
    } catch (error) {
        console.error('Public stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics'
        });
    }
});

module.exports = router;
