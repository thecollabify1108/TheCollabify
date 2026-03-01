/**
 * Dynamic Weight Optimization Service
 * 
 * Instead of fixed scoring weights in aiMatching.js:
 * - Learns optimal weights from historical campaign success data
 * - Adjusts per-category and per-format
 * - Implements adaptive weight tuning based on feedback loop
 * 
 * Uses coordinate descent optimization (no ML library needed).
 */

const prisma = require('../../config/prisma');

// Default weights (same as current aiMatching.js)
const DEFAULT_WEIGHTS = {
    engagementRate: 0.11,
    nicheSimilarity: 0.11,
    priceCompatibility: 0.11,
    locationMatch: 0.08,
    campaignTypeMatch: 0.08,
    reliability: 0.08,
    availabilityMatch: 0.08,
    predictedROI: 0.07,
    trackRecord: 0.07,
    insightScore: 0.07,
    intentMatch: 0.07,
    personalization: 0.07
};

// Weight bounds (no single factor can dominate)
const WEIGHT_BOUNDS = { min: 0.02, max: 0.25 };

class DynamicWeightService {

    /**
     * Get active weights for a specific context
     * Falls back to default if no optimized config exists
     */
    static async getWeights(category = null) {
        try {
            // Try category-specific weights first
            if (category) {
                const catConfig = await prisma.scoringWeightConfig.findFirst({
                    where: {
                        name: `${category.toLowerCase()}_optimized`,
                        isActive: true
                    }
                });
                if (catConfig) return catConfig.weights;
            }

            // Try default optimized config
            const defaultConfig = await prisma.scoringWeightConfig.findFirst({
                where: { isDefault: true, isActive: true }
            });

            if (defaultConfig) return defaultConfig.weights;
        } catch (err) {
            console.warn('[DynamicWeights] Error loading weights:', err.message);
        }

        return DEFAULT_WEIGHTS;
    }

    /**
     * Run weight optimization based on campaign feedback data
     * Uses coordinate descent to find weights that maximize successful match rate
     */
    static async optimizeWeights(options = {}) {
        const {
            category = null,
            minSamples = 15,
            learningRate = 0.01,
            iterations = 50
        } = options;

        // Get completed campaign feedback
        const where = { status: 'COMPLETED', actualEngagement: { not: null } };
        if (category) where.brandCategory = category;

        const feedbackRecords = await prisma.campaignFeedbackRecord.findMany({
            where,
            include: {
                campaign: {
                    select: { targetCategory: true, promotionType: true }
                }
            }
        });

        if (feedbackRecords.length < minSamples) {
            console.log(`[DynamicWeights] Not enough data (${feedbackRecords.length}/${minSamples}). Skipping optimization.`);
            return { optimized: false, reason: 'insufficient_data', samples: feedbackRecords.length };
        }

        // Current weights
        const currentWeights = await this.getWeights(category);
        const previousWeights = { ...currentWeights };

        // Calculate "success score" for each record
        // Success = actual engagement exceeded or met predicted engagement
        const samples = feedbackRecords.map(record => ({
            success: record.actualEngagement >= (record.predictedEngagement || 0) * 0.8 ? 1 : 0,
            category: record.brandCategory,
            format: record.contentFormat,
            metrics: record.creatorMetrics || {}
        }));

        // Coordinate descent optimization
        const weights = { ...currentWeights };
        const weightKeys = Object.keys(weights);

        let bestScore = this._evaluateWeights(weights, samples);

        for (let iter = 0; iter < iterations; iter++) {
            for (const key of weightKeys) {
                // Try increasing
                const originalValue = weights[key];

                weights[key] = Math.min(WEIGHT_BOUNDS.max, originalValue + learningRate);
                this._normalizeWeights(weights);
                const scoreUp = this._evaluateWeights(weights, samples);

                // Try decreasing
                weights[key] = Math.max(WEIGHT_BOUNDS.min, originalValue - learningRate);
                this._normalizeWeights(weights);
                const scoreDown = this._evaluateWeights(weights, samples);

                // Keep the best direction
                if (scoreUp > bestScore && scoreUp >= scoreDown) {
                    weights[key] = Math.min(WEIGHT_BOUNDS.max, originalValue + learningRate);
                    bestScore = scoreUp;
                } else if (scoreDown > bestScore) {
                    weights[key] = Math.max(WEIGHT_BOUNDS.min, originalValue - learningRate);
                    bestScore = scoreDown;
                } else {
                    weights[key] = originalValue; // No improvement
                }
            }

            this._normalizeWeights(weights);
        }

        // Calculate before/after metrics
        const beforeScore = this._evaluateWeights(previousWeights, samples);
        const afterScore = bestScore;
        const improvement = beforeScore > 0 ? ((afterScore - beforeScore) / beforeScore) * 100 : 0;

        // Store optimization results
        const configName = category ? `${category.toLowerCase()}_optimized` : 'default';

        await prisma.scoringWeightConfig.upsert({
            where: { name: configName },
            update: {
                weights,
                campaignsUsed: feedbackRecords.length,
                avgSuccessRate: bestScore,
                optimizationLog: {
                    iterations,
                    learningRate,
                    improvement: Math.round(improvement * 100) / 100,
                    samples: feedbackRecords.length,
                    previousScore: beforeScore,
                    newScore: afterScore,
                    optimizedAt: new Date().toISOString()
                },
                isActive: true,
                isDefault: category === null
            },
            create: {
                name: configName,
                weights,
                campaignsUsed: feedbackRecords.length,
                avgSuccessRate: bestScore,
                optimizationLog: {
                    iterations,
                    learningRate,
                    improvement: Math.round(improvement * 100) / 100,
                    samples: feedbackRecords.length,
                    optimizedAt: new Date().toISOString()
                },
                isActive: true,
                isDefault: category === null
            }
        });

        // Record optimization run
        await prisma.weightOptimizationRun.create({
            data: {
                previousWeights: previousWeights,
                newWeights: weights,
                trigger: options.trigger || 'SCHEDULED',
                beforeMetrics: { successRate: beforeScore, samples: feedbackRecords.length },
                campaignsSampled: feedbackRecords.length,
                improvement: Math.round(improvement * 100) / 100,
                applied: true,
                appliedAt: new Date()
            }
        });

        console.log(`[DynamicWeights] Optimized ${configName}: ${beforeScore.toFixed(3)} → ${afterScore.toFixed(3)} (+${improvement.toFixed(1)}%)`);

        return {
            optimized: true,
            configName,
            previousWeights,
            newWeights: weights,
            improvement: Math.round(improvement * 100) / 100,
            samples: feedbackRecords.length,
            successRate: Math.round(bestScore * 1000) / 1000
        };
    }

    /**
     * Evaluate weight configuration against sample data
     * Returns success prediction accuracy
     */
    static _evaluateWeights(weights, samples) {
        if (samples.length === 0) return 0;

        let correct = 0;
        for (const sample of samples) {
            // Simple scoring based on creator metrics * weights
            let score = 0;
            const metrics = sample.metrics;

            // Map available metrics to weight dimensions
            score += (metrics.engagementRate || 0) * (weights.engagementRate || 0) * 10;
            score += (metrics.cqiScore || 50) * (weights.insightScore || 0);
            score += (metrics.reliabilityScore || 1) * (weights.reliability || 0) * 100;
            score += (metrics.successfulPromotions || 0) * (weights.trackRecord || 0) * 5;

            // Normalize score to 0-1
            const normalizedScore = Math.min(1, score / 100);

            // Predict success if normalized score > 0.5
            const predictedSuccess = normalizedScore > 0.5 ? 1 : 0;

            if (predictedSuccess === sample.success) correct++;
        }

        return correct / samples.length;
    }

    /**
     * Normalize weights to sum to 1.0
     */
    static _normalizeWeights(weights) {
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        if (sum === 0) return;

        for (const key of Object.keys(weights)) {
            weights[key] = weights[key] / sum;
        }
    }

    /**
     * Rollback to previous weights
     */
    static async rollback(optimizationRunId) {
        const run = await prisma.weightOptimizationRun.findUnique({
            where: { id: optimizationRunId }
        });

        if (!run) throw new Error('Optimization run not found');

        // Restore previous weights
        const defaultConfig = await prisma.scoringWeightConfig.findFirst({
            where: { isDefault: true }
        });

        if (defaultConfig) {
            await prisma.scoringWeightConfig.update({
                where: { id: defaultConfig.id },
                data: { weights: run.previousWeights }
            });
        }

        // Mark run as rolled back
        await prisma.weightOptimizationRun.update({
            where: { id: optimizationRunId },
            data: { rolledBack: true }
        });

        return { success: true, restoredWeights: run.previousWeights };
    }

    /**
     * Get optimization history
     */
    static async getOptimizationHistory(limit = 10) {
        return prisma.weightOptimizationRun.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
}

module.exports = DynamicWeightService;
