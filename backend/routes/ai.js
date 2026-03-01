const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const AIContentService = require('../services/aiContentService');
const PredictiveService = require('../services/predictiveService');
const {
    AIEngine,
    CQIService,
    CampaignPrediction,
    FeedbackLoop,
    FraudDetection,
    AudienceIntelligence,
    DynamicWeights,
    RetrainingPipeline,
    EmbeddingService
} = require('../services/ai');

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

// ═══════════════════════════════════════════════════════════════
// AI ENGINE v2 — Predictive Intelligence Routes
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/ai/engine/health
 * @desc    Get AI system health dashboard
 * @access  Private
 */
router.get('/engine/health', auth, async (req, res) => {
    try {
        const health = await AIEngine.getSystemHealth();
        res.json({ success: true, data: health });
    } catch (error) {
        console.error('AI health check error:', error);
        res.status(500).json({ success: false, message: 'Failed to get AI health' });
    }
});

/**
 * @route   GET /api/ai/engine/cqi/:creatorId
 * @desc    Get Creator Quality Index for a creator
 * @access  Private
 */
router.get('/engine/cqi/:creatorId', auth, async (req, res) => {
    try {
        const cqi = await CQIService.getCQIWithTrend(req.params.creatorId);
        if (!cqi) {
            return res.status(404).json({ success: false, message: 'CQI not computed yet' });
        }
        res.json({ success: true, data: cqi });
    } catch (error) {
        console.error('CQI fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to get CQI' });
    }
});

/**
 * @route   POST /api/ai/engine/cqi/:creatorId/compute
 * @desc    Compute/refresh CQI for a creator
 * @access  Private
 */
router.post('/engine/cqi/:creatorId/compute', auth, async (req, res) => {
    try {
        const result = await CQIService.computeCQI(req.params.creatorId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('CQI compute error:', error);
        res.status(500).json({ success: false, message: 'Failed to compute CQI' });
    }
});

/**
 * @route   POST /api/ai/engine/predict
 * @desc    Predict campaign performance for a creator
 * @access  Private
 */
router.post('/engine/predict', auth, async (req, res) => {
    try {
        const { creatorId, campaign } = req.body;
        if (!creatorId || !campaign) {
            return res.status(400).json({ success: false, message: 'creatorId and campaign are required' });
        }
        const prediction = await CampaignPrediction.predict(creatorId, campaign);
        res.json({ success: true, data: prediction });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate prediction' });
    }
});

/**
 * @route   POST /api/ai/engine/feedback
 * @desc    Submit campaign completion feedback for learning loop
 * @access  Private
 */
router.post('/engine/feedback', auth, async (req, res) => {
    try {
        const feedback = await FeedbackLoop.recordCampaignFeedback(req.body);
        res.json({ success: true, data: feedback });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to record feedback' });
    }
});

/**
 * @route   GET /api/ai/engine/feedback/accuracy
 * @desc    Get model accuracy metrics
 * @access  Private
 */
router.get('/engine/feedback/accuracy', auth, async (req, res) => {
    try {
        const accuracy = await FeedbackLoop.getModelAccuracy(req.query.modelVersion);
        res.json({ success: true, data: accuracy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get accuracy' });
    }
});

/**
 * @route   GET /api/ai/engine/fraud/:creatorId
 * @desc    Get fraud analysis for a creator
 * @access  Private
 */
router.get('/engine/fraud/:creatorId', auth, async (req, res) => {
    try {
        const result = await FraudDetection.analyzeCreator(req.params.creatorId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Fraud analysis error:', error);
        res.status(500).json({ success: false, message: 'Failed to analyze fraud' });
    }
});

/**
 * @route   POST /api/ai/engine/fraud/:signalId/resolve
 * @desc    Resolve a fraud signal (admin)
 * @access  Private
 */
router.post('/engine/fraud/:signalId/resolve', auth, async (req, res) => {
    try {
        const result = await FraudDetection.resolveSignal(req.params.signalId, req.user.id);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to resolve signal' });
    }
});

/**
 * @route   GET /api/ai/engine/audience/:creatorId
 * @desc    Get audience intelligence for a creator
 * @access  Private
 */
router.get('/engine/audience/:creatorId', auth, async (req, res) => {
    try {
        const profile = await AudienceIntelligence.getBrandCreatorFit(
            req.params.creatorId,
            req.query.category || 'Lifestyle'
        );
        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Audience intel error:', error);
        res.status(500).json({ success: false, message: 'Failed to get audience data' });
    }
});

/**
 * @route   GET /api/ai/engine/audience-match
 * @desc    Find best audience matches for a brand category
 * @access  Private
 */
router.get('/engine/audience-match', auth, async (req, res) => {
    try {
        const { category, limit } = req.query;
        if (!category) {
            return res.status(400).json({ success: false, message: 'category is required' });
        }
        const matches = await AudienceIntelligence.findBestAudienceMatch(category, parseInt(limit) || 20);
        res.json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to find audience matches' });
    }
});

/**
 * @route   GET /api/ai/engine/weights
 * @desc    Get current scoring weights
 * @access  Private
 */
router.get('/engine/weights', auth, async (req, res) => {
    try {
        const weights = await DynamicWeights.getWeights(req.query.category);
        res.json({ success: true, data: weights });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get weights' });
    }
});

/**
 * @route   POST /api/ai/engine/weights/optimize
 * @desc    Trigger weight optimization
 * @access  Private
 */
router.post('/engine/weights/optimize', auth, async (req, res) => {
    try {
        const result = await DynamicWeights.optimizeWeights({
            category: req.body.category,
            trigger: 'MANUAL'
        });
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Weight optimization error:', error);
        res.status(500).json({ success: false, message: 'Failed to optimize weights' });
    }
});

/**
 * @route   GET /api/ai/engine/weights/history
 * @desc    Get weight optimization history
 * @access  Private
 */
router.get('/engine/weights/history', auth, async (req, res) => {
    try {
        const history = await DynamicWeights.getOptimizationHistory(parseInt(req.query.limit) || 10);
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get history' });
    }
});

/**
 * @route   POST /api/ai/engine/weights/rollback
 * @desc    Rollback to previous weights
 * @access  Private
 */
router.post('/engine/weights/rollback', auth, async (req, res) => {
    try {
        const result = await DynamicWeights.rollback(req.body.optimizationRunId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to rollback weights' });
    }
});

/**
 * @route   GET /api/ai/engine/model
 * @desc    Get current production model info
 * @access  Private
 */
router.get('/engine/model', auth, async (req, res) => {
    try {
        const model = await RetrainingPipeline.getCurrentModel();
        res.json({ success: true, data: model });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get model info' });
    }
});

/**
 * @route   GET /api/ai/engine/model/history
 * @desc    Get model version history
 * @access  Private
 */
router.get('/engine/model/history', auth, async (req, res) => {
    try {
        const history = await RetrainingPipeline.getModelHistory(parseInt(req.query.limit) || 10);
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get model history' });
    }
});

/**
 * @route   POST /api/ai/engine/retrain
 * @desc    Trigger model retraining pipeline
 * @access  Private
 */
router.post('/engine/retrain', auth, async (req, res) => {
    try {
        const result = await RetrainingPipeline.runPipeline({
            trigger: 'MANUAL',
            forceRetrain: req.body.force || false
        });
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Retrain error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrain model' });
    }
});

/**
 * @route   POST /api/ai/engine/model/rollback
 * @desc    Rollback to previous model version
 * @access  Private
 */
router.post('/engine/model/rollback', auth, async (req, res) => {
    try {
        const result = await RetrainingPipeline.rollback(req.body.modelVersionId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to rollback model' });
    }
});

/**
 * @route   POST /api/ai/engine/embed/creator/:creatorId
 * @desc    Generate embedding for a creator
 * @access  Private
 */
router.post('/engine/embed/creator/:creatorId', auth, async (req, res) => {
    try {
        const prisma = require('../config/prisma');
        const creator = await prisma.creatorProfile.findUnique({
            where: { id: req.params.creatorId }
        });
        if (!creator) {
            return res.status(404).json({ success: false, message: 'Creator not found' });
        }
        const embedding = await EmbeddingService.embedCreatorProfile(creator);
        res.json({ success: true, data: { id: embedding.id, entityType: embedding.entityType } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to embed creator' });
    }
});

/**
 * @route   POST /api/ai/engine/jobs/weekly
 * @desc    Manually trigger weekly AI jobs
 * @access  Private
 */
router.post('/engine/jobs/weekly', auth, async (req, res) => {
    try {
        const results = await AIEngine.runWeeklyJobs();
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Weekly jobs error:', error);
        res.status(500).json({ success: false, message: 'Failed to run weekly jobs' });
    }
});

/**
 * @route   POST /api/ai/engine/jobs/retrain
 * @desc    Manually trigger monthly retraining
 * @access  Private
 */
router.post('/engine/jobs/retrain', auth, async (req, res) => {
    try {
        const result = await AIEngine.runMonthlyRetrain();
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Monthly retrain error:', error);
        res.status(500).json({ success: false, message: 'Failed to run retraining' });
    }
});

module.exports = router;
