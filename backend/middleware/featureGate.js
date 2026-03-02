/**
 * Feature Gate Middleware
 * Attaches the user's feature manifest + subscription tier to req
 * so downstream route handlers can gate access.
 */

const prisma = require('../config/prisma');
const { buildFeatureManifest } = require('../services/featureGateService');

/**
 * Middleware: loads user tier and attaches req.features
 * Must run AFTER auth middleware (requires req.userId).
 */
const attachFeatures = async (req, res, next) => {
    try {
        if (!req.userId) return next(); // no user — skip

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { subscriptionTier: true, activeRole: true, dailyAIQueryCount: true, lastAIQueryDate: true }
        });

        if (!user) return next();

        req.subscriptionTier = user.subscriptionTier || 'FREE';
        req.userRole = user.activeRole;
        req.features = buildFeatureManifest(user.subscriptionTier, user.activeRole);
        req.dailyAIQueryCount = user.dailyAIQueryCount || 0;
        req.lastAIQueryDate = user.lastAIQueryDate;

        next();
    } catch (err) {
        console.error('[FeatureGate] Error loading tier:', err.message);
        // Fail open — default to FREE
        req.subscriptionTier = 'FREE';
        req.features = buildFeatureManifest('FREE', null);
        next();
    }
};

module.exports = { attachFeatures };
