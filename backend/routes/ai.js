const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const AIContentService = require('../services/aiContentService');
const PredictiveService = require('../services/predictiveService');
const prisma = require('../config/prisma');

// Gemini Service — centralised AI reasoning engine
const GeminiService = require('../services/geminiService');

// Feature Gate Service — subscription tier enforcement
const FeatureGate = require('../services/featureGateService');

// AI Engine v2 services — defensive import so existing routes still work if AI module fails
let AIEngine, CQIService, CampaignPrediction, FeedbackLoop, FraudDetection,
    AudienceIntelligence, DynamicWeights, RetrainingPipeline, EmbeddingService;
try {
    const ai = require('../services/ai');
    AIEngine = ai.AIEngine;
    CQIService = ai.CQIService;
    CampaignPrediction = ai.CampaignPrediction;
    FeedbackLoop = ai.FeedbackLoop;
    FraudDetection = ai.FraudDetection;
    AudienceIntelligence = ai.AudienceIntelligence;
    DynamicWeights = ai.DynamicWeights;
    RetrainingPipeline = ai.RetrainingPipeline;
    EmbeddingService = ai.EmbeddingService;
} catch (e) {
    console.warn('[AI] Failed to load AI engine services:', e.message);
}

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
// FEATURE MANIFEST — tells frontend what the current user can access
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/ai/features
 * @desc    Get feature manifest for current user based on subscription tier
 * @access  Private
 */
router.get('/features', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { subscriptionTier: true, activeRole: true, dailyAIQueryCount: true, lastAIQueryDate: true }
        });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const manifest = FeatureGate.buildFeatureManifest(user.subscriptionTier, user.activeRole);

        // Attach remaining daily queries for FREE tier
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = user.lastAIQueryDate ? user.lastAIQueryDate.toISOString().slice(0, 10) : null;
        const usedToday = (lastDate === today) ? (user.dailyAIQueryCount || 0) : 0;
        const limit = manifest.dailyAILimit === -1 ? Infinity : manifest.dailyAILimit;
        manifest.dailyAIRemaining = limit === Infinity ? -1 : Math.max(0, limit - usedToday);

        res.json({ success: true, data: manifest });
    } catch (error) {
        console.error('Feature manifest error:', error);
        res.status(500).json({ success: false, message: 'Failed to load features' });
    }
});

// ═══════════════════════════════════════════════════════════════
// INTELLIGENCE MODES — Gemini-backed, DB-driven, tier-gated
// ═══════════════════════════════════════════════════════════════

/**
 * Helper: gate an intelligence mode based on subscription tier.
 * Returns { accessLevel, error? } where accessLevel is 'full', 'summary', or false.
 */
async function gateIntelligenceMode(req, res, modeName) {
    // Check daily limit for FREE tier
    const dailyCheck = await FeatureGate.checkDailyAILimit(req.userId);
    if (!dailyCheck.allowed) {
        return res.status(403).json({
            success: false,
            message: 'Daily AI query limit reached',
            upgrade: true,
            limit: dailyCheck.limit,
            remaining: 0,
        });
    }

    const tier = req.subscriptionTier || 'FREE';
    const role = req.userRole || null;
    const access = FeatureGate.getModeAccess(tier, modeName, role);

    if (!access) {
        return res.status(403).json({
            success: false,
            message: `Upgrade required to access ${modeName}`,
            upgrade: true,
            requiredTier: modeName.includes('campaign') || modeName.includes('roi') || modeName === 'match-intelligence' ? 'BRAND_PRO' : 'CREATOR_PRO',
        });
    }

    return access; // 'full' or 'summary'
}

/**
 * Helper: trim a Gemini result down to summary-only fields for FREE tier.
 */
function summariseResult(modeName, data) {
    if (!data || typeof data !== 'object') return data;

    switch (modeName) {
        case 'match-intelligence':
            return {
                matchFitScore: data.matchFitScore,
                audienceAlignmentSummary: data.audienceAlignmentSummary,
                confidenceLevel: data.confidenceLevel,
                _gated: true,
                _upgradeMessage: 'Upgrade to Brand Pro for full breakdown including risk factors, engagement reliability, and campaign angle suggestions.',
            };
        case 'creator-audit':
            return {
                nicheAuthorityLevel: data.nicheAuthorityLevel,
                riskIndex: data.riskIndex,
                _gated: true,
                _upgradeMessage: 'Upgrade to Creator Pro for full audit with engagement consistency, growth stability, and authenticity indicators.',
            };
        default:
            return data;
    }
}

/**
 * @route   POST /api/ai/mode/match-intelligence
 * @desc    Run Match Intelligence — fetches real creator + campaign data from DB
 * @access  Private
 * @body    { creatorId, campaignId } — OR legacy body fields for backward compat
 */
router.post('/mode/match-intelligence', auth, async (req, res) => {
    try {
        const accessLevel = await gateIntelligenceMode(req, res, 'match-intelligence');
        if (res.headersSent) return; // 403 already sent

        const { creatorId, campaignId } = req.body;

        let result;
        if (creatorId && campaignId) {
            const [creator, campaign] = await Promise.all([
                GeminiService.fetchCreatorData(creatorId),
                GeminiService.fetchCampaignData(campaignId),
            ]);
            if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });
            if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

            const prompt = GeminiService.buildMatchIntelligencePrompt(creator, campaign);
            const fallback = await AIContentService.runMatchIntelligence(req.body);

            result = await GeminiService.callGemini({
                userId: req.userId,
                mode: 'match-intelligence',
                prompt,
                fallback,
                parser: GeminiService.parseJSON,
            });
        } else {
            result = await AIContentService.runMatchIntelligence(req.body);
        }

        await FeatureGate.incrementAIQuery(req.userId);
        const data = accessLevel === 'summary' ? summariseResult('match-intelligence', result) : result;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Match Intelligence error:', error);
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to run match intelligence' });
    }
});

/**
 * @route   POST /api/ai/mode/creator-audit
 * @desc    Run Creator Audit — fetches real creator data from DB
 * @access  Private
 * @body    { creatorId } — OR legacy body fields for backward compat
 */
router.post('/mode/creator-audit', auth, async (req, res) => {
    try {
        const accessLevel = await gateIntelligenceMode(req, res, 'creator-audit');
        if (res.headersSent) return;

        const { creatorId } = req.body;

        let result;
        if (creatorId) {
            const creator = await GeminiService.fetchCreatorData(creatorId);
            if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });

            const prompt = GeminiService.buildCreatorAuditPrompt(creator);
            const fallback = await AIContentService.runCreatorAudit(req.body);

            result = await GeminiService.callGemini({
                userId: req.userId,
                mode: 'creator-audit',
                prompt,
                fallback,
                parser: GeminiService.parseJSON,
            });
        } else {
            result = await AIContentService.runCreatorAudit(req.body);
        }

        await FeatureGate.incrementAIQuery(req.userId);
        const data = accessLevel === 'summary' ? summariseResult('creator-audit', result) : result;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Creator Audit error:', error);
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to run creator audit' });
    }
});

/**
 * @route   POST /api/ai/mode/campaign-strategy
 * @desc    Run Campaign Strategy — fetches real campaign data from DB
 * @access  Private
 * @body    { campaignId } — OR legacy body fields for backward compat
 */
router.post('/mode/campaign-strategy', auth, async (req, res) => {
    try {
        const accessLevel = await gateIntelligenceMode(req, res, 'campaign-strategy');
        if (res.headersSent) return;

        const { campaignId } = req.body;

        let result;
        if (campaignId) {
            const campaign = await GeminiService.fetchCampaignData(campaignId);
            if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

            const prompt = GeminiService.buildCampaignStrategyPrompt(campaign);
            const fallback = await AIContentService.runCampaignStrategy(req.body);

            result = await GeminiService.callGemini({
                userId: req.userId,
                mode: 'campaign-strategy',
                prompt,
                fallback,
                parser: GeminiService.parseJSON,
            });
        } else {
            result = await AIContentService.runCampaignStrategy(req.body);
        }

        await FeatureGate.incrementAIQuery(req.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Campaign Strategy error:', error);
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to run campaign strategy' });
    }
});

/**
 * @route   POST /api/ai/mode/roi-forecast
 * @desc    Run ROI & Performance Forecast — fetches real data from DB
 * @access  Private
 * @body    { creatorId, campaignId } — OR legacy body fields for backward compat
 */
router.post('/mode/roi-forecast', auth, async (req, res) => {
    try {
        const accessLevel = await gateIntelligenceMode(req, res, 'roi-forecast');
        if (res.headersSent) return;

        const { creatorId, campaignId } = req.body;

        let result;
        if (creatorId && campaignId) {
            const [creator, campaign] = await Promise.all([
                GeminiService.fetchCreatorData(creatorId),
                GeminiService.fetchCampaignData(campaignId),
            ]);
            if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });
            if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

            const prompt = GeminiService.buildROIForecastPrompt(creator, campaign);
            const fallback = await AIContentService.runROIForecast(req.body);

            result = await GeminiService.callGemini({
                userId: req.userId,
                mode: 'roi-forecast',
                prompt,
                fallback,
                parser: GeminiService.parseJSON,
            });
        } else {
            result = await AIContentService.runROIForecast(req.body);
        }

        await FeatureGate.incrementAIQuery(req.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('ROI Forecast error:', error);
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to run ROI forecast' });
    }
});

/**
 * @route   POST /api/ai/mode/optimization
 * @desc    Run Optimization analysis — fetches real campaign data from DB
 * @access  Private
 * @body    { campaignId, engagementRate, reach, conversions, contentTypes } — OR legacy body fields
 */
router.post('/mode/optimization', auth, async (req, res) => {
    try {
        const accessLevel = await gateIntelligenceMode(req, res, 'optimization');
        if (res.headersSent) return;

        const { campaignId, engagementRate, reach, conversions, contentTypes } = req.body;

        let result;
        if (campaignId) {
            const campaign = await GeminiService.fetchCampaignData(campaignId);
            if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

            const prompt = GeminiService.buildOptimizationPrompt(campaign, {
                engagementRate, reach, conversions, contentTypes
            });
            const fallback = await AIContentService.runOptimization(req.body);

            result = await GeminiService.callGemini({
                userId: req.userId,
                mode: 'optimization',
                prompt,
                fallback,
                parser: GeminiService.parseJSON,
            });
        } else {
            result = await AIContentService.runOptimization(req.body);
        }

        await FeatureGate.incrementAIQuery(req.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Optimization error:', error);
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to run optimization' });
    }
});

// ═══════════════════════════════════════════════════════════════
// AI USAGE STATS
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/ai/usage/me
 * @desc    Get current user's AI usage stats
 * @access  Private
 */
router.get('/usage/me', auth, async (req, res) => {
    try {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [totalCalls, totalTokens, byMode, recentLogs] = await Promise.all([
            prisma.aIUsageLog.count({ where: { userId: req.userId, createdAt: { gte: since } } }),
            prisma.aIUsageLog.aggregate({
                where: { userId: req.userId, createdAt: { gte: since } },
                _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
                _avg: { latencyMs: true },
            }),
            prisma.aIUsageLog.groupBy({
                by: ['mode'],
                where: { userId: req.userId, createdAt: { gte: since } },
                _count: { id: true },
                _sum: { totalTokens: true },
            }),
            prisma.aIUsageLog.findMany({
                where: { userId: req.userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { id: true, mode: true, model: true, totalTokens: true, latencyMs: true, success: true, createdAt: true },
            }),
        ]);

        res.json({
            success: true,
            data: {
                period: '30d',
                totalCalls,
                totalTokens: totalTokens._sum.totalTokens || 0,
                promptTokens: totalTokens._sum.promptTokens || 0,
                completionTokens: totalTokens._sum.completionTokens || 0,
                avgLatencyMs: Math.round(totalTokens._avg.latencyMs || 0),
                byMode: byMode.map(m => ({ mode: m.mode, calls: m._count.id, tokens: m._sum.totalTokens || 0 })),
                recentLogs,
            },
        });
    } catch (error) {
        console.error('AI usage stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get AI usage stats' });
    }
});

/**
 * @route   GET /api/ai/usage/admin
 * @desc    Get platform-wide AI usage stats (admin)
 * @access  Private (admin)
 */
router.get('/usage/admin', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { activeRole: true } });
        if (user?.activeRole !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [totalCalls, tokenStats, byMode, topUsers, errorRate] = await Promise.all([
            prisma.aIUsageLog.count({ where: { createdAt: { gte: since } } }),
            prisma.aIUsageLog.aggregate({
                where: { createdAt: { gte: since } },
                _sum: { totalTokens: true },
                _avg: { latencyMs: true },
            }),
            prisma.aIUsageLog.groupBy({
                by: ['mode'],
                where: { createdAt: { gte: since } },
                _count: { id: true },
                _sum: { totalTokens: true },
                orderBy: { _count: { id: 'desc' } },
            }),
            prisma.aIUsageLog.groupBy({
                by: ['userId'],
                where: { createdAt: { gte: since } },
                _count: { id: true },
                _sum: { totalTokens: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
            prisma.aIUsageLog.count({ where: { createdAt: { gte: since }, success: false } }),
        ]);

        res.json({
            success: true,
            data: {
                period: '30d',
                totalCalls,
                totalTokens: tokenStats._sum.totalTokens || 0,
                avgLatencyMs: Math.round(tokenStats._avg.latencyMs || 0),
                errorRate: totalCalls ? ((errorRate / totalCalls) * 100).toFixed(1) + '%' : '0%',
                byMode: byMode.map(m => ({ mode: m.mode, calls: m._count.id, tokens: m._sum.totalTokens || 0 })),
                topUsers: topUsers.map(u => ({ userId: u.userId, calls: u._count.id, tokens: u._sum.totalTokens || 0 })),
            },
        });
    } catch (error) {
        console.error('Admin AI usage stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get admin AI usage stats' });
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
