let newrelic;
try {
    newrelic = require('newrelic');
} catch (e) {
    // New Relic failed to load, which is fine, we'll just skip it
    newrelic = { recordCustomEvent: () => { }, startSegment: (name, record, fn) => fn ? fn() : null };
}

const FrictionService = require('../services/frictionService');

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

        // Lazy detect friction points if admin triggers or periodic
        if (req.user.activeRole === 'ADMIN') {
            FrictionService.detectOnboardingDropOffs().catch(console.error);
            FrictionService.detectCollaborationStalls().catch(console.error);
            FrictionService.detectCreatorNonResponse().catch(console.error);
        }

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

/**
 * @route   POST /api/analytics/track
 * @desc    Track anonymous page view (Privacy-friendly, no PII)
 * @access  Public
 */
router.post('/track', async (req, res) => {
    try {
        const { path } = req.body;

        // Normalize path (remove query params, trailing slashes)
        const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';

        // Get today's date (UTC, reset time)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        await prisma.dailyTraffic.upsert({
            where: {
                date_path: {
                    date: today,
                    path: cleanPath
                }
            },
            update: {
                views: { increment: 1 }
            },
            create: {
                date: today,
                path: cleanPath,
                views: 1
            }
        });

        res.status(200).send('ok');
    } catch (error) {
        // Silently fail to not disrupt client
        console.error('Analytics track error:', error);
        res.status(200).send('ok');
    }
});

/**
 * @route   POST /api/analytics/feedback
 * @desc    Record match feedback (AI Learning Loop)
 * @access  Private
 */
router.post('/feedback', auth, async (req, res) => {
    try {
        const { targetUserId, action, source, matchId, meta } = req.body;

        // Basic validation
        if (!targetUserId || !action) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (matchId) {
            const match = await prisma.matchedCreator.findUnique({
                where: { id: matchId },
                include: { promotion: { select: { sellerId: true } }, creator: { select: { userId: true } } }
            });
            if (match && match.promotion.sellerId !== req.userId && match.creator.userId !== req.userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized feedback' });
            }
        }

        await AnalyticsService.recordMatchFeedback({
            userId: req.userId,
            targetUserId: targetUserId,
            action: action.toUpperCase(),
            source,
            matchId,
            meta
        });

        res.status(200).json({ success: true });
    } catch (error) {
        // Fail silently to client, log on server
        console.error('Feedback endpoint error:', error);
        res.status(200).json({ success: true });
    }
});

/**
 * @route   POST /api/analytics/outcome
 * @desc    Track match outcome (AI Outcome Loop)
 * @access  Private
 */
router.post('/outcome', auth, async (req, res) => {
    try {
        const { matchId, status } = req.body;

        if (!matchId || !status) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const match = await prisma.matchedCreator.findUnique({
            where: { id: matchId },
            include: { promotion: { select: { sellerId: true } }, creator: { select: { userId: true } } }
        });

        if (!match || (match.promotion.sellerId !== req.userId && match.creator.userId !== req.userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized outcome tracking' });
        }

        newrelic.addCustomParameters({
            matchId,
            outcomeStatus: status
        });

        await AnalyticsService.trackMatchOutcome({
            matchId,
            status
        });

        // Record custom metric for business tracking
        newrelic.recordMetric('Custom/Match/Outcome/' + status, 1);

        res.status(200).json({ success: true });
    } catch (error) {
        newrelic.noticeError(error);
        console.error('Outcome endpoint error:', error);
        res.status(200).json({ success: true });
    }
});

/**
 * @route   GET /api/analytics/insights
 * @desc    Get role-scoped insights (brand or creator)
 * @access  Private
 */
router.get('/insights', auth, async (req, res) => {
    try {
        const role = req.user.activeRole;
        let insights;

        if (role === 'SELLER') {
            insights = await AnalyticsService.getBrandInsights(req.userId);
        } else if (role === 'CREATOR') {
            insights = await AnalyticsService.getCreatorInsights(req.userId);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Insights not available for this role'
            });
        }

        res.json({
            success: true,
            data: { insights, role }
        });
    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get insights'
        });
    }
});

/**
 * @route   POST /api/analytics/campaign-intent
 * @desc    Track when a seller opens the campaign creation wizard (before submission)
 *          Used for campaign abandonment detection in friction analysis.
 *          Call this the moment the wizard step renders; if no CAMPAIGN_CREATED event
 *          follows within the detection window, it is counted as CAMPAIGN_ABANDONMENT.
 * @access  Private (Seller)
 */
router.post('/campaign-intent', auth, async (req, res) => {
    try {
        const { context } = req.body; // Optional metadata: template used, step reached, etc.

        await FrictionService.trackCampaignIntent(req.userId, context || {});

        res.json({
            success: true,
            message: 'Campaign intent tracked'
        });
    } catch (error) {
        console.error('Track campaign intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track campaign intent'
        });
    }
});

module.exports = router;
