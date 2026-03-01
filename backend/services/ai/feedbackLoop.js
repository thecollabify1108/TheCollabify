/**
 * Campaign Feedback Learning Loop
 * 
 * After every completed campaign:
 * 1. Records predicted vs actual performance metrics
 * 2. Calculates prediction errors
 * 3. Feeds data back into The prediction model retraining pipeline
 * 4. Adjusts match scoring weights based on outcome patterns
 * 
 * This is the core self-improvement mechanism of the AI engine.
 */

const prisma = require('../../config/prisma');

class FeedbackLoopService {

    /**
     * Record feedback for a completed campaign
     * Called when a collaboration transitions to COMPLETED
     */
    static async recordCampaignFeedback({
        campaignId,
        creatorId,
        actualEngagement = null,
        actualROI = null,
        actualReach = null,
        actualConversions = null,
        agreedAmount = null,
        campaignDuration = null
    }) {
        // Get the prediction that was made for this campaign-creator pair
        const prediction = await prisma.campaignPrediction.findUnique({
            where: {
                campaignId_creatorId: { campaignId, creatorId }
            }
        });

        // Get campaign and creator snapshot
        const [campaign, creator] = await Promise.all([
            prisma.promotionRequest.findUnique({ where: { id: campaignId } }),
            prisma.creatorProfile.findUnique({
                where: { id: creatorId },
                include: { qualityIndex: true }
            })
        ]);

        if (!campaign || !creator) {
            throw new Error('Campaign or creator not found');
        }

        // Snapshot creator metrics at this point
        const creatorMetrics = {
            followerCount: creator.followerCount,
            engagementRate: creator.engagementRate,
            cqiScore: creator.qualityIndex?.score || 50,
            reliabilityScore: creator.reliabilityScore,
            successfulPromotions: creator.successfulPromotions,
            averageRating: creator.averageRating,
            aiScore: creator.aiScore
        };

        // Calculate prediction errors
        let engagementError = null;
        let roiError = null;

        if (prediction && actualEngagement != null && prediction.predictedEngagement > 0) {
            engagementError = Math.abs(prediction.predictedEngagement - actualEngagement) / Math.max(0.01, actualEngagement);
        }

        if (prediction && actualROI != null && prediction.predictedROI !== 0) {
            roiError = Math.abs(prediction.predictedROI - actualROI) / Math.max(0.01, Math.abs(actualROI));
        }

        // Upsert feedback record
        const feedback = await prisma.campaignFeedbackRecord.upsert({
            where: {
                campaignId_creatorId: { campaignId, creatorId }
            },
            update: {
                predictedEngagement: prediction?.predictedEngagement || null,
                predictedROI: prediction?.predictedROI || null,
                predictedReach: prediction?.predictedReach || null,
                actualEngagement,
                actualROI,
                actualReach,
                actualConversions,
                creatorMetrics,
                brandCategory: campaign.targetCategory,
                contentFormat: campaign.promotionType,
                campaignDuration,
                agreedAmount,
                engagementError,
                roiError,
                modelVersion: prediction?.modelVersion || 'v1.0',
                status: 'COMPLETED',
                completedAt: new Date()
            },
            create: {
                campaignId,
                creatorId,
                predictedEngagement: prediction?.predictedEngagement || null,
                predictedROI: prediction?.predictedROI || null,
                predictedReach: prediction?.predictedReach || null,
                actualEngagement,
                actualROI,
                actualReach,
                actualConversions,
                creatorMetrics,
                brandCategory: campaign.targetCategory,
                contentFormat: campaign.promotionType,
                campaignDuration,
                agreedAmount,
                engagementError,
                roiError,
                modelVersion: prediction?.modelVersion || 'v1.0',
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        console.log(`[FeedbackLoop] Recorded feedback: campaign=${campaignId}, creator=${creatorId}, engError=${engagementError?.toFixed(3)}, roiError=${roiError?.toFixed(3)}`);

        return feedback;
    }

    /**
     * Get feedback dataset for model retraining
     * Returns structured data suitable for training
     */
    static async getTrainingDataset(options = {}) {
        const {
            minRecords = 10,
            modelVersion = null,
            category = null,
            sinceDate = null
        } = options;

        const where = { status: 'COMPLETED' };
        if (modelVersion) where.modelVersion = modelVersion;
        if (category) where.brandCategory = category;
        if (sinceDate) where.completedAt = { gte: sinceDate };

        const records = await prisma.campaignFeedbackRecord.findMany({
            where,
            orderBy: { completedAt: 'desc' },
            include: {
                campaign: {
                    select: {
                        targetCategory: true,
                        promotionType: true,
                        minBudget: true,
                        maxBudget: true,
                        campaignGoal: true,
                        locationType: true
                    }
                }
            }
        });

        if (records.length < minRecords) {
            return { data: [], sufficient: false, count: records.length, required: minRecords };
        }

        // Transform to training features
        const data = records.map(record => ({
            // Input features
            features: {
                followerCount: record.creatorMetrics?.followerCount || 0,
                engagementRate: record.creatorMetrics?.engagementRate || 0,
                cqiScore: record.creatorMetrics?.cqiScore || 50,
                reliabilityScore: record.creatorMetrics?.reliabilityScore || 1,
                successfulPromotions: record.creatorMetrics?.successfulPromotions || 0,
                category: record.brandCategory,
                contentFormat: record.contentFormat,
                budgetMid: ((record.campaign?.minBudget || 0) + (record.campaign?.maxBudget || 0)) / 2,
                campaignGoal: record.campaign?.campaignGoal || 'REACH',
                agreedAmount: record.agreedAmount || 0
            },
            // Target values
            targets: {
                engagement: record.actualEngagement,
                roi: record.actualROI,
                reach: record.actualReach
            },
            // Metadata
            meta: {
                campaignId: record.campaignId,
                creatorId: record.creatorId,
                modelVersion: record.modelVersion,
                completedAt: record.completedAt
            }
        }));

        return { data, sufficient: true, count: data.length };
    }

    /**
     * Calculate model accuracy metrics from feedback data
     */
    static async getModelAccuracy(modelVersion = null) {
        const where = {
            status: 'COMPLETED',
            engagementError: { not: null }
        };
        if (modelVersion) where.modelVersion = modelVersion;

        const records = await prisma.campaignFeedbackRecord.findMany({
            where,
            select: {
                engagementError: true,
                roiError: true,
                modelVersion: true,
                brandCategory: true
            }
        });

        if (records.length === 0) {
            return { totalRecords: 0, accuracy: null };
        }

        // Mean Absolute Error
        const engErrors = records.filter(r => r.engagementError != null).map(r => r.engagementError);
        const roiErrors = records.filter(r => r.roiError != null).map(r => r.roiError);

        const avgEngError = engErrors.length > 0 ? engErrors.reduce((a, b) => a + b, 0) / engErrors.length : null;
        const avgROIError = roiErrors.length > 0 ? roiErrors.reduce((a, b) => a + b, 0) / roiErrors.length : null;

        // Accuracy by category
        const categoryAccuracy = {};
        for (const record of records) {
            const cat = record.brandCategory;
            if (!categoryAccuracy[cat]) {
                categoryAccuracy[cat] = { engErrors: [], roiErrors: [] };
            }
            if (record.engagementError != null) categoryAccuracy[cat].engErrors.push(record.engagementError);
            if (record.roiError != null) categoryAccuracy[cat].roiErrors.push(record.roiError);
        }

        const categorySummary = {};
        for (const [cat, data] of Object.entries(categoryAccuracy)) {
            categorySummary[cat] = {
                avgEngError: data.engErrors.length > 0 ? data.engErrors.reduce((a, b) => a + b, 0) / data.engErrors.length : null,
                avgROIError: data.roiErrors.length > 0 ? data.roiErrors.reduce((a, b) => a + b, 0) / data.roiErrors.length : null,
                sampleSize: data.engErrors.length
            };
        }

        return {
            totalRecords: records.length,
            engagement: {
                mae: avgEngError,
                accuracy: avgEngError != null ? Math.max(0, 1 - avgEngError) : null,
                sampleSize: engErrors.length
            },
            roi: {
                mae: avgROIError,
                accuracy: avgROIError != null ? Math.max(0, 1 - avgROIError) : null,
                sampleSize: roiErrors.length
            },
            byCategory: categorySummary
        };
    }

    /**
     * Get improvement suggestions based on error patterns
     */
    static async getImprovementInsights() {
        const accuracy = await this.getModelAccuracy();
        const insights = [];

        if (accuracy.totalRecords < 10) {
            insights.push({
                type: 'data_needed',
                message: `Only ${accuracy.totalRecords} completed campaigns with feedback. Need at least 10 for reliable insights.`,
                priority: 'HIGH'
            });
            return insights;
        }

        // Check overall accuracy
        if (accuracy.engagement?.accuracy && accuracy.engagement.accuracy < 0.7) {
            insights.push({
                type: 'model_retrain',
                message: `Engagement prediction accuracy is ${(accuracy.engagement.accuracy * 100).toFixed(1)}% — below 70% threshold. Retraining recommended.`,
                priority: 'HIGH'
            });
        }

        // Check per-category accuracy
        for (const [cat, data] of Object.entries(accuracy.byCategory)) {
            if (data.avgEngError > 0.4 && data.sampleSize >= 3) {
                insights.push({
                    type: 'category_weak',
                    message: `${cat} category has ${((1 - data.avgEngError) * 100).toFixed(1)}% accuracy (${data.sampleSize} samples). Consider category-specific tuning.`,
                    priority: 'MEDIUM'
                });
            }
        }

        return insights;
    }
}

module.exports = FeedbackLoopService;
