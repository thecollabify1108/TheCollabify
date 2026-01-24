const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const AIContentService = require('../services/aiContentService');

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

module.exports = router;
