/**
 * AI Engine — Barrel Export
 * 
 * Central import point for all AI sub-services.
 * Usage: const { AIEngine, CQIService, ... } = require('./services/ai');
 */

const AIEngine = require('./aiEngine');
const EmbeddingService = require('./embeddingService');
const CQIService = require('./creatorQualityIndex');
const CampaignPrediction = require('./campaignPrediction');
const FeedbackLoop = require('./feedbackLoop');
const FraudDetection = require('./fraudDetection');
const AudienceIntelligence = require('./audienceIntelligence');
const DynamicWeights = require('./dynamicWeights');
const RetrainingPipeline = require('./retrainingPipeline');

module.exports = {
    AIEngine,
    EmbeddingService,
    CQIService,
    CampaignPrediction,
    FeedbackLoop,
    FraudDetection,
    AudienceIntelligence,
    DynamicWeights,
    RetrainingPipeline
};
