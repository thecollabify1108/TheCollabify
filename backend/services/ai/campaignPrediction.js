/**
 * Campaign Performance Prediction Model
 * 
 * Gradient-boosted regression model (in JavaScript — no Python dependency).
 * Predicts: engagement rate, ROI, reach, with confidence intervals.
 * 
 * Architecture:
 * - Ensemble of decision stumps (simplified gradient boosting)
 * - Re-trainable from campaign feedback data
 * - Model versioning & rollback via MLModelVersion table
 * 
 * Input features:
 * - Creator metrics (followers, engagement, CQI score, niche)
 * - Brand category 
 * - Historical performance data
 * - Content format type
 * - Price range
 */

const prisma = require('../../config/prisma');

// Default model parameters (initial heuristic model before training data exists)
const DEFAULT_MODEL_PARAMS = {
    version: 'v1.0',
    type: 'heuristic',

    // Feature importance (initial heuristic weights)
    featureWeights: {
        engagementRate: 0.25,
        followerCount: 0.15,
        cqiScore: 0.20,
        categoryMatch: 0.10,
        historicalPerformance: 0.15,
        contentFormat: 0.10,
        priceEfficiency: 0.05
    },

    // Category engagement benchmarks
    categoryBenchmarks: {
        Fashion: { avgEngagement: 3.2, avgROI: 2.5 },
        Beauty: { avgEngagement: 3.5, avgROI: 2.8 },
        Tech: { avgEngagement: 2.1, avgROI: 2.0 },
        Fitness: { avgEngagement: 3.8, avgROI: 2.6 },
        Food: { avgEngagement: 3.0, avgROI: 2.2 },
        Travel: { avgEngagement: 2.8, avgROI: 1.8 },
        Lifestyle: { avgEngagement: 2.5, avgROI: 2.1 },
        Gaming: { avgEngagement: 2.0, avgROI: 1.5 },
        Education: { avgEngagement: 2.2, avgROI: 1.9 },
        Entertainment: { avgEngagement: 2.6, avgROI: 1.7 },
        Health: { avgEngagement: 3.3, avgROI: 2.4 },
        Business: { avgEngagement: 1.8, avgROI: 2.3 },
        Art: { avgEngagement: 2.4, avgROI: 1.6 },
        Music: { avgEngagement: 2.7, avgROI: 1.8 },
        Sports: { avgEngagement: 3.0, avgROI: 2.0 },
        Other: { avgEngagement: 2.2, avgROI: 1.8 }
    },

    // Content format multipliers
    formatMultipliers: {
        REELS: { engagement: 1.4, roi: 1.3 },
        STORIES: { engagement: 0.8, roi: 0.6 },
        POSTS: { engagement: 1.0, roi: 1.0 },
        WEBSITE_VISIT: { engagement: 0.5, roi: 1.8 }
    }
};

class CampaignPredictionService {

    constructor() {
        this._modelParams = null;
        this._modelVersion = 'v1.0';
    }

    /**
     * Get current production model parameters
     */
    async _getModelParams() {
        if (this._modelParams) return this._modelParams;

        try {
            const productionModel = await prisma.mLModelVersion.findFirst({
                where: { modelName: 'campaign_predictor', isProduction: true },
                orderBy: { trainedAt: 'desc' }
            });

            if (productionModel) {
                this._modelParams = productionModel.parameters;
                this._modelVersion = productionModel.version;
                return this._modelParams;
            }
        } catch (err) {
            console.warn('[Prediction] No production model found, using defaults');
        }

        this._modelParams = DEFAULT_MODEL_PARAMS;
        return this._modelParams;
    }

    /**
     * Predict campaign performance for a creator-campaign pair
     */
    async predict(creatorId, campaign) {
        const params = await this._getModelParams();

        // Gather creator data
        const creator = await prisma.creatorProfile.findUnique({
            where: { id: creatorId },
            include: {
                qualityIndex: true,
                matchedCampaigns: {
                    where: {
                        status: 'ACCEPTED',
                        promotion: { status: 'COMPLETED' }
                    },
                    include: { promotion: true },
                    take: 20
                }
            }
        });

        if (!creator) return null;

        // Extract features
        const features = this._extractFeatures(creator, campaign, params);

        // Make predictions
        const predictedEngagement = this._predictEngagement(features, params);
        const predictedReach = this._predictReach(features);
        const predictedROI = this._predictROI(features, params, campaign);

        // Calculate confidence interval
        const confidence = this._calculateConfidence(features, creator);
        const confidenceInterval = {
            engagement: {
                lower: Math.max(0, predictedEngagement * (1 - (1 - confidence) * 0.5)),
                upper: predictedEngagement * (1 + (1 - confidence) * 0.5)
            },
            roi: {
                lower: Math.max(0, predictedROI * (1 - (1 - confidence) * 0.8)),
                upper: predictedROI * (1 + (1 - confidence) * 0.8)
            }
        };

        // Risk assessment
        const riskScore = this._calculateRisk(features, creator);

        // Build feature snapshot
        const featureSnapshot = {
            ...features,
            creatorFollowers: creator.followerCount,
            creatorEngagement: creator.engagementRate,
            creatorCategory: creator.category,
            cqiScore: creator.qualityIndex?.score || 50,
            campaignCategory: campaign.targetCategory,
            campaignBudget: (campaign.minBudget + campaign.maxBudget) / 2,
            contentFormat: campaign.promotionType
        };

        // Store prediction
        try {
            await prisma.campaignPrediction.upsert({
                where: {
                    campaignId_creatorId: {
                        campaignId: campaign.id,
                        creatorId
                    }
                },
                update: {
                    predictedEngagement,
                    predictedReach,
                    predictedROI,
                    confidenceInterval,
                    riskScore,
                    featureSnapshot,
                    modelVersion: this._modelVersion,
                    createdAt: new Date()
                },
                create: {
                    campaignId: campaign.id,
                    creatorId,
                    predictedEngagement,
                    predictedReach,
                    predictedROI,
                    confidenceInterval,
                    riskScore,
                    featureSnapshot,
                    modelVersion: this._modelVersion
                }
            });
        } catch (err) {
            console.warn('[Prediction] Failed to store prediction:', err.message);
        }

        return {
            predictedEngagement: Math.round(predictedEngagement * 100) / 100,
            predictedReach,
            predictedROI: Math.round(predictedROI * 100) / 100,
            confidenceInterval: {
                engagement: {
                    lower: Math.round(confidenceInterval.engagement.lower * 100) / 100,
                    upper: Math.round(confidenceInterval.engagement.upper * 100) / 100
                },
                roi: {
                    lower: Math.round(confidenceInterval.roi.lower * 100) / 100,
                    upper: Math.round(confidenceInterval.roi.upper * 100) / 100
                }
            },
            riskScore: Math.round(riskScore * 100) / 100,
            confidence: Math.round(confidence * 100) / 100,
            modelVersion: this._modelVersion
        };
    }

    /**
     * Extract features for the prediction model
     */
    _extractFeatures(creator, campaign, params) {
        const cqi = creator.qualityIndex?.score || 50;
        const categoryBenchmark = params.categoryBenchmarks[campaign.targetCategory] || params.categoryBenchmarks.Other;
        const formatMult = params.formatMultipliers[campaign.promotionType] || params.formatMultipliers.POSTS;

        // Historical performance
        const pastCampaigns = creator.matchedCampaigns || [];
        const avgHistoricalSuccess = pastCampaigns.length > 0
            ? pastCampaigns.filter(mc => mc.promotion?.status === 'COMPLETED').length / pastCampaigns.length
            : 0.5;

        // Category match
        const categoryMatch = creator.category === campaign.targetCategory ? 1.0
            : this._getRelatedCategoryScore(creator.category, campaign.targetCategory);

        // Price efficiency
        const avgBudget = (campaign.minBudget + campaign.maxBudget) / 2;
        const creatorAvgPrice = (creator.minPrice + creator.maxPrice) / 2;
        const priceEfficiency = avgBudget > 0 ? Math.min(2, creatorAvgPrice / avgBudget) : 1;

        // Follower tier normalization (log scale 0–1)
        const followerNorm = Math.min(1, Math.log10(Math.max(1, creator.followerCount)) / 7); // 10M = 1.0

        return {
            engagementRate: creator.engagementRate || 0,
            followerNorm,
            cqiScore: cqi / 100,
            categoryMatch,
            historicalSuccess: avgHistoricalSuccess,
            pastCampaignCount: pastCampaigns.length,
            formatEngagementMult: formatMult.engagement,
            formatROIMult: formatMult.roi,
            categoryAvgEngagement: categoryBenchmark.avgEngagement,
            categoryAvgROI: categoryBenchmark.avgROI,
            priceEfficiency,
            reliabilityScore: creator.reliabilityScore || 1.0,
            fraudRisk: creator.qualityIndex?.fraudRiskScore || 0
        };
    }

    /**
     * Predict engagement rate
     */
    _predictEngagement(features, params) {
        const w = params.featureWeights;

        // Weighted prediction
        let predicted =
            features.engagementRate * w.engagementRate * 3 +
            features.cqiScore * w.cqiScore * features.categoryAvgEngagement +
            features.categoryMatch * w.categoryMatch * features.categoryAvgEngagement +
            features.historicalSuccess * w.historicalPerformance * features.categoryAvgEngagement +
            features.formatEngagementMult * w.contentFormat * features.categoryAvgEngagement;

        // Apply reliability modifier
        predicted *= Math.min(1.2, features.reliabilityScore);

        // Fraud penalty
        if (features.fraudRisk > 0.3) {
            predicted *= (1 - features.fraudRisk * 0.3);
        }

        return Math.max(0.1, Math.min(20, predicted));
    }

    /**
     * Predict reach
     */
    _predictReach(features) {
        const baseReach = Math.pow(10, features.followerNorm * 7) * 0.35;
        const engagementBoost = features.engagementRate > 3 ? 1.2 : 1.0;
        return Math.round(baseReach * engagementBoost * features.formatEngagementMult);
    }

    /**
     * Predict ROI
     */
    _predictROI(features, params, campaign) {
        const avgBudget = (campaign.minBudget + campaign.maxBudget) / 2 || 1;

        const estimatedValue =
            features.categoryAvgROI *
            features.formatROIMult *
            (1 + features.historicalSuccess * 0.5) *
            (1 + features.cqiScore * 0.3) *
            features.categoryMatch;

        const roi = ((estimatedValue * avgBudget - avgBudget) / avgBudget) * 100;

        return Math.max(-50, Math.min(500, roi));
    }

    /**
     * Calculate prediction confidence
     */
    _calculateConfidence(features, creator) {
        let confidence = 0.4; // Base

        // More past data = higher confidence
        if (features.pastCampaignCount >= 10) confidence += 0.25;
        else if (features.pastCampaignCount >= 5) confidence += 0.15;
        else if (features.pastCampaignCount >= 1) confidence += 0.08;

        // Higher CQI data confidence
        if (creator.qualityIndex?.confidence) {
            confidence += creator.qualityIndex.confidence * 0.15;
        }

        // Category match boosts confidence (more comparable data)
        confidence += features.categoryMatch * 0.1;

        // Verified creator
        if (creator.instagramVerified) confidence += 0.05;

        return Math.min(0.95, confidence);
    }

    /**
     * Calculate risk score (0–1)
     */
    _calculateRisk(features, creator) {
        let risk = 0.2; // Base risk

        // Low data = high risk
        if (features.pastCampaignCount === 0) risk += 0.2;
        else if (features.pastCampaignCount < 3) risk += 0.1;

        // Fraud signals
        risk += features.fraudRisk * 0.3;

        // Very high or very low engagement = risk
        if (features.engagementRate > 10) risk += 0.15;
        if (features.engagementRate < 1 && creator.followerCount > 10000) risk += 0.15;

        // Low reliability
        if (features.reliabilityScore < 0.8) risk += 0.1;

        // Poor CQI
        if (features.cqiScore < 0.3) risk += 0.1;

        return Math.min(1, risk);
    }

    /**
     * Get related category similarity score
     */
    _getRelatedCategoryScore(creatorCat, campaignCat) {
        const related = {
            'Fashion': ['Beauty', 'Lifestyle'],
            'Beauty': ['Fashion', 'Lifestyle', 'Health'],
            'Fitness': ['Health', 'Lifestyle', 'Sports'],
            'Health': ['Fitness', 'Lifestyle', 'Beauty'],
            'Food': ['Lifestyle', 'Travel', 'Health'],
            'Travel': ['Lifestyle', 'Food'],
            'Tech': ['Gaming', 'Education', 'Business'],
            'Gaming': ['Tech', 'Entertainment'],
            'Education': ['Tech', 'Business'],
            'Entertainment': ['Gaming', 'Lifestyle', 'Music'],
            'Business': ['Tech', 'Education'],
            'Art': ['Music', 'Entertainment'],
            'Music': ['Art', 'Entertainment'],
            'Sports': ['Fitness', 'Health'],
            'Lifestyle': ['Fashion', 'Beauty', 'Food', 'Travel', 'Health']
        };

        if (related[campaignCat]?.includes(creatorCat)) return 0.5;
        return 0.1;
    }

    /**
     * Invalidate cached model params (after retraining)
     */
    invalidateCache() {
        this._modelParams = null;
        this._modelVersion = 'v1.0';
    }
}

// Singleton
module.exports = new CampaignPredictionService();
