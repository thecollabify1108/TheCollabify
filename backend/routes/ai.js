const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const AIContentService = require('../services/aiContentService');
const PredictiveService = require('../services/predictiveService');

/**
 * @route   POST /api/ai/generate-caption
 * @desc    Generate a caption using AI
 * @access  Private
 */
router.post('/generate-caption', auth, async (req, res) => {
    try {
        const { topic, platform, tone } = req.body;

        if (!topic || !platform) {
            return res.status(400).json({
                success: false,
                message: 'Topic and platform are required'
            });
        }

        const caption = await AIContentService.generateCaption(
            topic,
            platform,
            tone || 'professional'
        );

        res.json({
            success: true,
            data: { caption }
        });
    } catch (error) {
        console.error('Error generating caption:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate caption'
        });
    }
});

/**
 * @route   POST /api/ai/generate-hashtags
 * @desc    Generate hashtags using AI
 * @access  Private
 */
router.post('/generate-hashtags', auth, async (req, res) => {
    try {
        const { topic, niche } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: 'Topic is required'
            });
        }

        const hashtags = await AIContentService.generateHashtags(
            topic,
            niche || 'General'
        );

        res.json({
            success: true,
            data: { hashtags }
        });
    } catch (error) {
        console.error('Error generating hashtags:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate hashtags'
        });
    }
});

/**
 * @route   POST /api/ai/predict-roi
 * @desc    Predict ROI for a campaign-creator match
 * @access  Private
 */
router.post('/predict-roi', auth, async (req, res) => {
    try {
        const { creatorId, budget, promotionType, targetCategory } = req.body;

        if (!creatorId || !budget) {
            return res.status(400).json({
                success: false,
                message: 'Creator ID and budget are required'
            });
        }

        const mockRequest = {
            minBudget: budget,
            maxBudget: budget,
            promotionType: promotionType || 'POSTS',
            targetCategory: targetCategory || 'Lifestyle'
        };

        const prediction = await PredictiveService.predictROI(creatorId, mockRequest);

        res.json({
            success: true,
            data: prediction
        });
    } catch (error) {
        console.error('Error predicting ROI:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to predict ROI'
        });
    }
});

/**
 * @route   GET /api/ai/optimal-time/:creatorId
 * @desc    Get optimal posting time for a creator
 * @access  Private
 */
router.get('/optimal-time/:creatorId', auth, async (req, res) => {
    try {
        const { creatorId } = req.params;
        const suggestion = await PredictiveService.getOptimalPostingTime(creatorId);

        res.json({
            success: true,
            data: suggestion
        });
    } catch (error) {
        console.error('Error getting optimal time:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get optimal time'
        });
    }
});

const AIMatching = require('../services/aiMatching');

/**
 * @route   GET /api/ai/recommendations/:campaignId
 * @desc    Get AI-powered creator recommendations for a campaign
 * @access  Private
 */
router.get('/recommendations/:campaignId', auth, async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.promotionRequest.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        const recommendations = await AIMatching.findMatchingCreators(campaign);

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations'
        });
    }
});

/**
 * @route   POST /api/ai/generate-ideas
 * @desc    Generate content ideas using AI
 * @access  Private
 */
router.post('/generate-ideas', auth, async (req, res) => {
    try {
        const { category, platform } = req.body;
        const ideas = await AIContentService.generateContentIdeas(category, platform);
        res.json({ success: true, data: { ideas } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate ideas' });
    }
});

/**
 * @route   POST /api/ai/generate-schedule
 * @desc    Generate optimal schedule using AI
 * @access  Private
 */
router.post('/generate-schedule', auth, async (req, res) => {
    try {
        const { category } = req.body;
        const schedule = await AIContentService.generatePostingSchedule(category);
        res.json({ success: true, data: { schedule } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate schedule' });
    }
});

/**
 * @route   GET /api/ai/market-insights
 * @desc    Get AI-powered market insights
 * @access  Private
 */
router.get('/market-insights', auth, async (req, res) => {
    try {
        const insights = await AIContentService.getMarketInsights(req.query);
        res.json({ success: true, data: insights });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get insights' });
    }
});

/**
 * @route   POST /api/ai/profile-tips
 * @desc    Get AI-powered profile tips
 * @access  Private
 */
router.post('/profile-tips', auth, async (req, res) => {
    try {
        const tips = await AIContentService.getProfileTips(req.body);
        res.json({ success: true, data: tips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get tips' });
    }
});

module.exports = router;
