const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const AnalyticsService = require('../services/analyticsService');
const prisma = require('../config/prisma');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics for user
 * @access  Private
 */
router.get('/dashboard', auth, async (req, res) => {
    try {
        const { period = 'monthly', limit = 12 } = req.query;
        const userType = req.user.activeRole; // 'CREATOR' or 'SELLER'

        const analytics = await AnalyticsService.getDashboardAnalytics(
            req.userId,
            userType,
            period,
            parseInt(limit)
        );

        res.json({
            success: true,
            data: { analytics }
        });
    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
});

/**
 * @route   GET /api/analytics/summary
 * @desc    Get analytics summary with growth
 * @access  Private
 */
router.get('/summary', auth, async (req, res) => {
    try {
        const userType = req.user.activeRole;

        const summary = await AnalyticsService.getAnalyticsSummary(
            req.userId,
            userType
        );

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching summary'
        });
    }
});

/**
 * @route   POST /api/analytics/snapshot
 * @desc    Record analytics snapshot
 * @access  Private
 */
router.post('/snapshot', auth, async (req, res) => {
    try {
        const userType = req.user.activeRole;

        const snapshot = await AnalyticsService.recordDailySnapshot(
            req.userId,
            userType
        );

        res.json({
            success: true,
            data: { snapshot }
        });
    } catch (error) {
        console.error('Error recording snapshot:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording snapshot'
        });
    }
});

/**
 * @route   GET /api/analytics/top-performers
 * @desc    Get top performing creators/sellers
 * @access  Private
 */
router.get('/top-performers', auth, async (req, res) => {
    try {
        const { type = 'creator', limit = 10 } = req.query;

        const topPerformers = await AnalyticsService.getTopPerformers(
            type.toUpperCase(),
            parseInt(limit)
        );

        res.json({
            success: true,
            data: { topPerformers }
        });
    } catch (error) {
        console.error('Error fetching top performers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching top performers'
        });
    }
});

/**
 * @route   GET /api/analytics/range
 * @desc    Get analytics for date range
 * @access  Private
 */
router.get('/range', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userType = req.user.activeRole;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const analytics = await prisma.analytics.findMany({
            where: {
                OR: [
                    { creatorId: req.userId },
                    { sellerId: req.userId }
                ],
                timestamp: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: { timestamp: 'asc' }
        });

        res.json({
            success: true,
            data: { analytics }
        });
    } catch (error) {
        console.error('Error fetching range analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
});

module.exports = router;
