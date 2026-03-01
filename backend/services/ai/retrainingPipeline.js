/**
 * Model Retraining Pipeline
 * 
 * Orchestrates periodic model retraining:
 * - Collects training data from feedback loop
 * - Retrains prediction model with new data
 * - Versions and stores model parameters
 * - Supports rollback to previous versions
 * - Logs performance over time
 * 
 * Designed for zero-downtime: new model replaces old only after validation.
 */

const prisma = require('../../config/prisma');
const FeedbackLoopService = require('./feedbackLoop');
const CampaignPredictionService = require('./campaignPrediction');
const DynamicWeightService = require('./dynamicWeights');

class RetrainingPipeline {

    /**
     * Run full retraining pipeline
     * Call this from a scheduled job (monthly or when threshold is met)
     */
    static async runPipeline(options = {}) {
        const {
            trigger = 'SCHEDULED',
            minSamples = 20,
            forceRetrain = false
        } = options;

        const startTime = Date.now();
        const log = [];

        log.push(`[Retrain] Pipeline started at ${new Date().toISOString()}, trigger: ${trigger}`);

        // ── Step 1: Check if retraining is needed ──
        const { shouldRetrain, reason } = await this._checkRetrainingNeeded(minSamples, forceRetrain);
        log.push(`[Retrain] Should retrain: ${shouldRetrain} (${reason})`);

        if (!shouldRetrain) {
            return {
                success: false,
                reason,
                log,
                duration: Date.now() - startTime
            };
        }

        // ── Step 2: Collect training data ──
        const dataset = await FeedbackLoopService.getTrainingDataset({ minRecords: minSamples });
        log.push(`[Retrain] Training data: ${dataset.count} records (sufficient: ${dataset.sufficient})`);

        if (!dataset.sufficient) {
            return {
                success: false,
                reason: `Insufficient training data: ${dataset.count}/${minSamples}`,
                log,
                duration: Date.now() - startTime
            };
        }

        // ── Step 3: Get current model version ──
        const currentModel = await prisma.mLModelVersion.findFirst({
            where: { modelName: 'campaign_predictor', isProduction: true },
            orderBy: { trainedAt: 'desc' }
        });

        const currentVersion = currentModel?.version || 'v0.0';
        const newVersion = this._incrementVersion(currentVersion);
        log.push(`[Retrain] Model version: ${currentVersion} → ${newVersion}`);

        // ── Step 4: Train new model ──
        const trainingResult = await this._trainModel(dataset.data);
        log.push(`[Retrain] Training complete. Metrics: MAE=${trainingResult.metrics.mae?.toFixed(4)}`);

        // ── Step 5: Validate new model (compare against old) ──
        const validation = await this._validateModel(trainingResult, currentModel, dataset.data);
        log.push(`[Retrain] Validation: improvement=${validation.improvement?.toFixed(2)}%`);

        // Only deploy if improved (or if no previous model)
        if (!validation.improved && !forceRetrain) {
            log.push(`[Retrain] Not deploying — no improvement over current model`);

            // Still save for record, but not as production
            await this._saveModelVersion(newVersion, trainingResult, validation, false, currentModel?.id);

            return {
                success: false,
                reason: 'No improvement over current model',
                validation,
                log,
                duration: Date.now() - startTime
            };
        }

        // ── Step 6: Deploy new model ──
        // Demote current production model
        if (currentModel) {
            await prisma.mLModelVersion.update({
                where: { id: currentModel.id },
                data: { isProduction: false }
            });
        }

        // Save and promote new model
        const newModel = await this._saveModelVersion(newVersion, trainingResult, validation, true, currentModel?.id);
        log.push(`[Retrain] Deployed model ${newVersion} to production`);

        // ── Step 7: Update prediction service cache ──
        CampaignPredictionService.invalidateCache();

        // ── Step 8: Optimize match scoring weights ──
        try {
            const weightResult = await DynamicWeightService.optimizeWeights({
                trigger: 'MODEL_RETRAIN',
                minSamples: 10
            });
            log.push(`[Retrain] Weight optimization: ${weightResult.optimized ? 'success' : 'skipped'}`);
        } catch (err) {
            log.push(`[Retrain] Weight optimization failed: ${err.message}`);
        }

        const duration = Date.now() - startTime;
        log.push(`[Retrain] Pipeline completed in ${duration}ms`);

        return {
            success: true,
            modelVersion: newVersion,
            trainingData: dataset.count,
            metrics: trainingResult.metrics,
            validation,
            log,
            duration
        };
    }

    /**
     * Check if retraining is needed
     */
    static async _checkRetrainingNeeded(minSamples, forceRetrain) {
        if (forceRetrain) return { shouldRetrain: true, reason: 'forced' };

        // Check how many new feedback records since last training
        const lastModel = await prisma.mLModelVersion.findFirst({
            where: { modelName: 'campaign_predictor', isProduction: true },
            orderBy: { trainedAt: 'desc' }
        });

        const sinceDate = lastModel?.trainedAt || new Date(0);
        const newRecords = await prisma.campaignFeedbackRecord.count({
            where: {
                status: 'COMPLETED',
                completedAt: { gt: sinceDate }
            }
        });

        if (newRecords >= minSamples) {
            return { shouldRetrain: true, reason: `${newRecords} new records since last training` };
        }

        // Check if model accuracy has degraded
        const accuracy = await FeedbackLoopService.getModelAccuracy(lastModel?.version);
        if (accuracy.engagement?.accuracy && accuracy.engagement.accuracy < 0.65) {
            return { shouldRetrain: true, reason: `Accuracy degraded to ${(accuracy.engagement.accuracy * 100).toFixed(1)}%` };
        }

        return {
            shouldRetrain: false,
            reason: `Not enough new data (${newRecords}/${minSamples}) and accuracy OK`
        };
    }

    /**
     * Train model from feedback data
     * Uses simple gradient descent on feature weights
     */
    static async _trainModel(trainingData) {
        // Split into train/validation (80/20)
        const splitIdx = Math.ceil(trainingData.length * 0.8);
        const trainSet = trainingData.slice(0, splitIdx);
        const valSet = trainingData.slice(splitIdx);

        // Initialize parameters from default model
        const params = JSON.parse(JSON.stringify(require('./campaignPrediction')._modelParams || {}));
        if (!params.featureWeights) {
            params.featureWeights = {
                engagementRate: 0.25,
                followerCount: 0.15,
                cqiScore: 0.20,
                categoryMatch: 0.10,
                historicalPerformance: 0.15,
                contentFormat: 0.10,
                priceEfficiency: 0.05
            };
        }

        // Update category benchmarks from real data
        const categoryData = {};
        for (const sample of trainingData) {
            const cat = sample.features.category;
            if (!categoryData[cat]) categoryData[cat] = { engagements: [], rois: [] };
            if (sample.targets.engagement != null) categoryData[cat].engagements.push(sample.targets.engagement);
            if (sample.targets.roi != null) categoryData[cat].rois.push(sample.targets.roi);
        }

        if (!params.categoryBenchmarks) params.categoryBenchmarks = {};
        for (const [cat, data] of Object.entries(categoryData)) {
            if (data.engagements.length >= 3) {
                params.categoryBenchmarks[cat] = {
                    avgEngagement: data.engagements.reduce((a, b) => a + b, 0) / data.engagements.length,
                    avgROI: data.rois.length > 0 ? data.rois.reduce((a, b) => a + b, 0) / data.rois.length : 2.0
                };
            }
        }

        // Simple training: adjust feature weights using gradient descent
        const learningRate = 0.001;
        const epochs = 100;

        for (let epoch = 0; epoch < epochs; epoch++) {
            for (const sample of trainSet) {
                if (sample.targets.engagement == null) continue;

                // Forward pass: predict engagement
                const predicted = this._forwardPass(sample.features, params);
                const actual = sample.targets.engagement;
                const error = predicted - actual;

                // Backward pass: update weights
                const features = sample.features;
                for (const key of Object.keys(params.featureWeights)) {
                    const featureValue = this._getFeatureValue(key, features);
                    params.featureWeights[key] -= learningRate * error * featureValue;
                    // Clamp weights
                    params.featureWeights[key] = Math.max(0.01, Math.min(0.5, params.featureWeights[key]));
                }
            }
        }

        // Evaluate on validation set
        const metrics = this._evaluateModel(valSet, params);

        return {
            parameters: params,
            metrics,
            trainingSize: trainSet.length,
            validationSize: valSet.length,
            hyperparameters: { learningRate, epochs }
        };
    }

    /**
     * Forward pass: predict engagement from features
     */
    static _forwardPass(features, params) {
        const w = params.featureWeights;
        let predicted = 0;

        predicted += (features.engagementRate || 0) * (w.engagementRate || 0);
        predicted += Math.log10(Math.max(1, features.followerCount || 1)) * (w.followerCount || 0);
        predicted += (features.cqiScore || 50) / 100 * (w.cqiScore || 0) * 5;
        predicted += (features.reliabilityScore || 1) * (w.historicalPerformance || 0) * 3;
        predicted += (features.successfulPromotions || 0) * (w.historicalPerformance || 0) * 0.3;

        return Math.max(0, predicted);
    }

    /**
     * Get normalized feature value for gradient update
     */
    static _getFeatureValue(key, features) {
        switch (key) {
            case 'engagementRate': return (features.engagementRate || 0) / 10;
            case 'followerCount': return Math.log10(Math.max(1, features.followerCount || 1)) / 7;
            case 'cqiScore': return (features.cqiScore || 50) / 100;
            case 'categoryMatch': return 0.5; // Not directly available
            case 'historicalPerformance': return Math.min(1, (features.successfulPromotions || 0) / 10);
            case 'contentFormat': return 0.5;
            case 'priceEfficiency': return Math.min(1, (features.agreedAmount || 1000) / 5000);
            default: return 0;
        }
    }

    /**
     * Evaluate model on a dataset
     */
    static _evaluateModel(dataset, params) {
        const errors = [];
        const predictions = [];

        for (const sample of dataset) {
            if (sample.targets.engagement == null) continue;

            const predicted = this._forwardPass(sample.features, params);
            const actual = sample.targets.engagement;
            const error = Math.abs(predicted - actual);

            errors.push(error);
            predictions.push({ predicted, actual });
        }

        if (errors.length === 0) {
            return { mae: null, rmse: null, r2: null, sampleSize: 0 };
        }

        const mae = errors.reduce((a, b) => a + b, 0) / errors.length;
        const rmse = Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length);

        // R² score
        const actualMean = predictions.reduce((sum, p) => sum + p.actual, 0) / predictions.length;
        const ssTot = predictions.reduce((sum, p) => sum + Math.pow(p.actual - actualMean, 2), 0);
        const ssRes = predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0);
        const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

        return {
            mae: Math.round(mae * 10000) / 10000,
            rmse: Math.round(rmse * 10000) / 10000,
            r2: Math.round(r2 * 10000) / 10000,
            sampleSize: errors.length
        };
    }

    /**
     * Validate new model against current model
     */
    static async _validateModel(trainingResult, currentModel, data) {
        const newMetrics = trainingResult.metrics;

        if (!currentModel || !currentModel.metrics) {
            return {
                improved: true,
                improvement: 100,
                newMetrics,
                currentMetrics: null
            };
        }

        const currentMetrics = currentModel.metrics;

        // Compare MAE (lower is better)
        const newMAE = newMetrics.mae || Infinity;
        const currentMAE = currentMetrics.mae || Infinity;

        const improved = newMAE < currentMAE * 1.05; // Allow 5% tolerance
        const improvement = currentMAE > 0 ? ((currentMAE - newMAE) / currentMAE) * 100 : 0;

        return {
            improved,
            improvement: Math.round(improvement * 100) / 100,
            newMetrics,
            currentMetrics
        };
    }

    /**
     * Save model version to database
     */
    static async _saveModelVersion(version, trainingResult, validation, isProduction, previousVersionId) {
        return prisma.mLModelVersion.create({
            data: {
                modelName: 'campaign_predictor',
                version,
                parameters: trainingResult.parameters,
                hyperparameters: trainingResult.hyperparameters,
                metrics: trainingResult.metrics,
                trainingDataSize: trainingResult.trainingSize + trainingResult.validationSize,
                trainingDuration: 0,
                isProduction,
                deployedAt: isProduction ? new Date() : null,
                previousVersion: previousVersionId
            }
        });
    }

    /**
     * Increment version string (v1.0 → v1.1, v1.9 → v2.0)
     */
    static _incrementVersion(version) {
        const match = version.match(/v(\d+)\.(\d+)/);
        if (!match) return 'v1.0';

        let major = parseInt(match[1]);
        let minor = parseInt(match[2]) + 1;

        if (minor >= 10) {
            major++;
            minor = 0;
        }

        return `v${major}.${minor}`;
    }

    /**
     * Rollback to a previous model version
     */
    static async rollback(modelVersionId = null) {
        // Find the model to rollback to
        let targetModel;

        if (modelVersionId) {
            targetModel = await prisma.mLModelVersion.findUnique({ where: { id: modelVersionId } });
        } else {
            // Find the previous production model
            const currentModel = await prisma.mLModelVersion.findFirst({
                where: { modelName: 'campaign_predictor', isProduction: true }
            });

            if (currentModel?.previousVersion) {
                targetModel = await prisma.mLModelVersion.findUnique({ where: { id: currentModel.previousVersion } });
            }
        }

        if (!targetModel) {
            throw new Error('No rollback target found');
        }

        // Demote all current production models
        await prisma.mLModelVersion.updateMany({
            where: { modelName: 'campaign_predictor', isProduction: true },
            data: { isProduction: false }
        });

        // Promote target model
        await prisma.mLModelVersion.update({
            where: { id: targetModel.id },
            data: { isProduction: true, deployedAt: new Date() }
        });

        // Invalidate prediction cache
        CampaignPredictionService.invalidateCache();

        return { success: true, version: targetModel.version };
    }

    /**
     * Get model version history
     */
    static async getModelHistory(limit = 10) {
        return prisma.mLModelVersion.findMany({
            where: { modelName: 'campaign_predictor' },
            orderBy: { trainedAt: 'desc' },
            take: limit
        });
    }

    /**
     * Get current production model info
     */
    static async getCurrentModel() {
        return prisma.mLModelVersion.findFirst({
            where: { modelName: 'campaign_predictor', isProduction: true },
            orderBy: { trainedAt: 'desc' }
        });
    }
}

module.exports = RetrainingPipeline;
