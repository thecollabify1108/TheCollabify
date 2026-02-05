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

module.exports = router;
