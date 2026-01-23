const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const AnalyticsService = require('../services/analyticsService');
const Analytics = require('../models/Analytics');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics for user
 * @access  Private
 */
router.get('/dashboard', auth, async (req, res) => {
    try {
        const { period = 'monthly', limit = 12 } = req.query;
        const userType = req.user.role; // 'creator' or 'seller'

        const analytics = await AnalyticsService.getDashboardAnalytics(
            req.user.id,
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
        const userType = req.user.role;

        const summary = await AnalyticsService.getAnalyticsSummary(
            req.user.id,
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
        const userType = req.user.role;

        const snapshot = await AnalyticsService.recordDailySnapshot(
            req.user.id,
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
            type,
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
        const userType = req.user.role;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const analytics = await Analytics.find({
            userId: req.user.id,
            type: userType,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ date: 1 });

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
