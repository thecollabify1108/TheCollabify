const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

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
            prisma.user.count({ where: { role: 'CREATOR', isActive: true } }),
            prisma.user.count({ where: { role: 'SELLER', isActive: true } }),
            prisma.promotionRequest.count({ where: { status: 'OPEN' } }),
            prisma.user.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { name: true, role: true, createdAt: true }
            })
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
