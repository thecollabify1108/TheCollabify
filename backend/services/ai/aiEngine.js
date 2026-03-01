/**
 * AI Engine — Unified Orchestrator
 * 
 * Central entry point for the multi-layer intelligence system.
 * Coordinates all AI sub-services for matching, prediction, and scoring.
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────┐
 * │                  AI Engine                       │
 * │ ┌──────────────┐  ┌──────────────────────────┐  │
 * │ │  Embeddings   │  │  Semantic Matching       │  │
 * │ │  (Gemini API) │  │  (cosine similarity)     │  │
 * │ └──────┬───────┘  └────────────┬─────────────┘  │
 * │        │                       │                 │
 * │ ┌──────▼────────────────────────▼─────────────┐  │
 * │ │         Composite Match Scoring             │  │
 * │ │  embedding + CQI + audience + fraud + ROI   │  │
 * │ └──────────────────────┬──────────────────────┘  │
 * │                        │                         │
 * │ ┌──────────────┐  ┌───▼──────────┐ ┌──────────┐ │
 * │ │ CQI Service  │  │  Prediction  │ │  Fraud   │ │
 * │ │ (0-100)      │  │  Model       │ │  Detect  │ │
 * │ └──────────────┘  └──────────────┘ └──────────┘ │
 * │                        │                         │
 * │ ┌──────────────────────▼──────────────────────┐  │
 * │ │         Feedback Learning Loop              │  │
 * │ │  predicted vs actual → retrain pipeline     │  │
 * │ └──────────────────────┬──────────────────────┘  │
 * │                        │                         │
 * │ ┌──────────────┐  ┌───▼──────────┐              │
 * │ │ Dynamic Wts  │  │  Retrain     │              │
 * │ │ Coord Desc   │  │  Pipeline    │              │
 * │ └──────────────┘  └──────────────┘              │
 * └─────────────────────────────────────────────────┘
 */

const EmbeddingService = require('./embeddingService');
const CQIService = require('./creatorQualityIndex');
const CampaignPrediction = require('./campaignPrediction');
const FeedbackLoop = require('./feedbackLoop');
const FraudDetection = require('./fraudDetection');
const AudienceIntelligence = require('./audienceIntelligence');
const DynamicWeights = require('./dynamicWeights');
const RetrainingPipeline = require('./retrainingPipeline');

class AIEngine {

    /**
     * Enhanced matching: combines semantic similarity + CQI + audience fit + prediction
     * Replaces the static weight-based scoring in aiMatching.js
     */
    static async computeEnhancedMatchScore(creatorId, campaignId, campaign) {
        const results = {};

        // 1. Semantic similarity (embedding-based)
        try {
            results.semanticSimilarity = await EmbeddingService.getCreatorCampaignSimilarity(creatorId, campaignId);
        } catch { results.semanticSimilarity = 0; }

        // 2. Creator Quality Index
        try {
            const cqi = await CQIService.getCQIWithTrend(creatorId);
            results.cqiScore = cqi?.score || 50;
            results.cqiTrend = cqi?.trend || 'STABLE';
            results.fraudRisk = cqi?.fraudRiskScore || 0;
        } catch { results.cqiScore = 50; results.cqiTrend = 'STABLE'; results.fraudRisk = 0; }

        // 3. Audience-brand fit
        try {
            const fit = await AudienceIntelligence.getBrandCreatorFit(creatorId, campaign.targetCategory);
            results.audienceFit = fit.fitScore;
            results.audienceAuthenticity = fit.audienceAuthenticity;
        } catch { results.audienceFit = 0.5; results.audienceAuthenticity = 0.5; }

        // 4. Campaign performance prediction
        try {
            const prediction = await CampaignPrediction.predict(creatorId, campaign);
            results.predictedEngagement = prediction?.predictedEngagement || 0;
            results.predictedROI = prediction?.predictedROI || 0;
            results.riskScore = prediction?.riskScore || 0.5;
            results.predictionConfidence = prediction?.confidence || 0.5;
        } catch { results.predictedEngagement = 0; results.predictedROI = 0; results.riskScore = 0.5; }

        // 5. Get dynamic weights for this category
        const weights = await DynamicWeights.getWeights(campaign.targetCategory);

        // ── Composite Score ──
        // Modular, weight-adjustable score combining all signals
        const compositeScore = this._computeComposite(results, weights);

        return {
            compositeScore,
            components: results,
            weightsUsed: weights
        };
    }

    /**
     * Compute composite match score from all AI components
     */
    static _computeComposite(results, weights) {
        // Normalize all signals to 0–100
        const signals = {
            semantic: (results.semanticSimilarity || 0) * 100,
            cqi: results.cqiScore || 50,
            audienceFit: (results.audienceFit || 0.5) * 100,
            authenticity: (results.audienceAuthenticity || 0.5) * 100,
            predictedROI: Math.max(0, Math.min(100, (results.predictedROI || 0) / 3)), // Normalize ROI
            engagement: Math.min(100, (results.predictedEngagement || 0) * 15)
        };

        // AI engine weight distribution (distinct from match scoring weights)
        const aiWeights = {
            semantic: 0.20,
            cqi: 0.25,
            audienceFit: 0.15,
            authenticity: 0.10,
            predictedROI: 0.15,
            engagement: 0.15
        };

        let score = 0;
        for (const [key, weight] of Object.entries(aiWeights)) {
            score += (signals[key] || 0) * weight;
        }

        // Fraud penalty (up to 30% reduction)
        const fraudPenalty = (results.fraudRisk || 0) * 30;
        score = Math.max(0, score - fraudPenalty);

        return Math.round(Math.min(100, score));
    }

    /**
     * Run all periodic jobs (called by scheduler)
     */
    static async runWeeklyJobs() {
        const results = {};

        console.log('[AIEngine] Starting weekly jobs...');

        // 1. Compute CQI for all creators
        try {
            results.cqi = await CQIService.computeAllCQI();
            console.log(`[AIEngine] CQI: ${results.cqi.processed} processed`);
        } catch (err) {
            results.cqi = { error: err.message };
            console.error('[AIEngine] CQI failed:', err.message);
        }

        // 2. Run fraud detection
        try {
            results.fraud = await FraudDetection.analyzeAllCreators();
            console.log(`[AIEngine] Fraud: ${results.fraud.processed} analyzed, ${results.fraud.flagged} flagged`);
        } catch (err) {
            results.fraud = { error: err.message };
            console.error('[AIEngine] Fraud detection failed:', err.message);
        }

        // 3. Build audience profiles
        try {
            results.audience = await AudienceIntelligence.buildAllProfiles();
            console.log(`[AIEngine] Audience: ${results.audience.processed} profiles`);
        } catch (err) {
            results.audience = { error: err.message };
            console.error('[AIEngine] Audience intelligence failed:', err.message);
        }

        // 4. Update embeddings
        try {
            const creators = await EmbeddingService.batchEmbedCreators();
            const campaigns = await EmbeddingService.batchEmbedCampaigns();
            results.embeddings = { creators, campaigns };
            console.log(`[AIEngine] Embeddings: ${creators} creators, ${campaigns} campaigns`);
        } catch (err) {
            results.embeddings = { error: err.message };
            console.error('[AIEngine] Embeddings failed:', err.message);
        }

        console.log('[AIEngine] Weekly jobs completed');
        return results;
    }

    /**
     * Run monthly model retraining
     */
    static async runMonthlyRetrain() {
        console.log('[AIEngine] Starting monthly retraining...');

        try {
            const result = await RetrainingPipeline.runPipeline({ trigger: 'SCHEDULED' });
            console.log(`[AIEngine] Retraining: ${result.success ? 'deployed ' + result.modelVersion : result.reason}`);
            return result;
        } catch (err) {
            console.error('[AIEngine] Retraining failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Get comprehensive AI system health dashboard
     */
    static async getSystemHealth() {
        const [
            currentModel,
            modelAccuracy,
            feedbackInsights,
            optimizationHistory
        ] = await Promise.all([
            RetrainingPipeline.getCurrentModel(),
            FeedbackLoop.getModelAccuracy(),
            FeedbackLoop.getImprovementInsights(),
            DynamicWeights.getOptimizationHistory(5)
        ]);

        return {
            model: {
                version: currentModel?.version || 'v1.0 (heuristic)',
                isProduction: currentModel?.isProduction || false,
                trainedAt: currentModel?.trainedAt || null,
                trainingDataSize: currentModel?.trainingDataSize || 0,
                metrics: currentModel?.metrics || {}
            },
            accuracy: modelAccuracy,
            insights: feedbackInsights,
            weightOptimization: {
                recentRuns: optimizationHistory.length,
                lastRun: optimizationHistory[0] || null
            },
            status: this._getOverallStatus(modelAccuracy, feedbackInsights)
        };
    }

    /**
     * Determine overall AI system status
     */
    static _getOverallStatus(accuracy, insights) {
        if (accuracy.totalRecords === 0) {
            return { status: 'BOOTSTRAPPING', message: 'Awaiting first campaign completions for learning', color: 'blue' };
        }

        const highPriorityIssues = insights.filter(i => i.priority === 'HIGH').length;
        if (highPriorityIssues > 0) {
            return { status: 'NEEDS_ATTENTION', message: `${highPriorityIssues} high-priority issues detected`, color: 'amber' };
        }

        if (accuracy.engagement?.accuracy && accuracy.engagement.accuracy > 0.75) {
            return { status: 'HEALTHY', message: 'Model performing well', color: 'green' };
        }

        return { status: 'LEARNING', message: 'Model improving with incoming data', color: 'blue' };
    }
}

module.exports = AIEngine;
