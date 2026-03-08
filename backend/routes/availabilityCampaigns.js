/**
 * Creator Availability Campaigns
 * Creators post their availability so brands can discover them ("Creators Nearby").
 *
 * Rules:
 *   - Only one active campaign allowed per creator at a time.
 *   - FREE users: 3–5 days duration.
 *   - PREMIUM (CREATOR_PRO) users: up to 10 days duration.
 *   - Expired campaigns are automatically excluded.
 */

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');
const { isCreator, isSeller } = require('../middleware/roleCheck');
const { userCacheMiddleware } = require('../middleware/cache');

const VALID_CATEGORIES = ['Fashion','Tech','Fitness','Food','Travel','Lifestyle','Beauty','Gaming','Education','Entertainment','Health','Business','Art','Music','Sports','Other'];

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
};

// ──────────────────────────────────────────────────────────────
// CREATOR ENDPOINTS
// ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/availability/my
 * @desc    Get creator's own availability campaign
 * @access  Private (Creator)
 */
router.get('/my', auth, isCreator, async (req, res) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({ where: { userId: req.userId } });
        if (!profile) return res.status(404).json({ success: false, message: 'Creator profile not found.' });

        const campaign = await prisma.availabilityCampaign.findFirst({
            where: { creatorProfileId: profile.id, isActive: true, expiresAt: { gte: new Date() } }
        });

        res.json({ success: true, data: { campaign } });
    } catch (err) {
        console.error('Get availability campaign error:', err);
        res.status(500).json({ success: false, message: 'Failed to get availability campaign' });
    }
});

/**
 * @route   POST /api/availability
 * @desc    Create an availability campaign
 * @access  Private (Creator)
 */
router.post('/', auth, isCreator, [
    body('niche').isIn(VALID_CATEGORIES).withMessage(`Niche must be one of: ${VALID_CATEGORIES.join(', ')}`),
    body('deliverablesOffered').isArray({ min: 1 }).withMessage('At least one deliverable is required'),
    body('collaborationBudgetMin').isFloat({ min: 0 }).withMessage('Min budget must be positive'),
    body('collaborationBudgetMax').isFloat({ min: 0 }).withMessage('Max budget must be positive'),
    body('durationDays').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
    handleValidation
], async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { subscriptionTier: true } });
        const profile = await prisma.creatorProfile.findUnique({ where: { userId: req.userId } });
        if (!profile) return res.status(404).json({ success: false, message: 'Creator profile not found.' });

        // Duration limits based on tier
        const isPremium = user?.subscriptionTier === 'CREATOR_PRO';
        const maxDuration = isPremium ? 10 : 5;
        const minDuration = 3;
        let { durationDays, niche, locationCity, locationState, locationCountry, deliverablesOffered, collaborationBudgetMin, collaborationBudgetMax, description } = req.body;

        durationDays = parseInt(durationDays);
        if (durationDays < minDuration || durationDays > maxDuration) {
            return res.status(400).json({
                success: false,
                message: `Duration must be between ${minDuration} and ${maxDuration} days for your plan. ${!isPremium ? 'Upgrade to CREATOR_PRO for up to 10 days.' : ''}`
            });
        }

        // Only one active campaign allowed
        const existingActive = await prisma.availabilityCampaign.findFirst({
            where: { creatorProfileId: profile.id, isActive: true, expiresAt: { gte: new Date() } }
        });
        if (existingActive) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active availability campaign. Deactivate it before creating a new one.',
                existingCampaignId: existingActive.id
            });
        }

        const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        const campaign = await prisma.availabilityCampaign.create({
            data: {
                creatorProfileId: profile.id,
                creatorUserId: req.userId,
                niche,
                locationCity: locationCity || null,
                locationState: locationState || null,
                locationCountry: locationCountry || null,
                deliverablesOffered: Array.isArray(deliverablesOffered) ? deliverablesOffered : [deliverablesOffered],
                collaborationBudgetMin: parseFloat(collaborationBudgetMin),
                collaborationBudgetMax: parseFloat(collaborationBudgetMax),
                description: description || null,
                durationDays,
                expiresAt,
                isActive: true
            }
        });

        res.status(201).json({ success: true, message: 'Availability campaign created.', data: { campaign } });
    } catch (err) {
        console.error('Create availability campaign error:', err);
        res.status(500).json({ success: false, message: 'Failed to create availability campaign' });
    }
});

/**
 * @route   DELETE /api/availability/:id
 * @desc    Deactivate/delete own availability campaign
 * @access  Private (Creator)
 */
router.delete('/:id', auth, isCreator, async (req, res) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({ where: { userId: req.userId } });
        if (!profile) return res.status(404).json({ success: false, message: 'Creator profile not found.' });

        const campaign = await prisma.availabilityCampaign.findUnique({ where: { id: req.params.id } });
        if (!campaign || campaign.creatorProfileId !== profile.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this campaign.' });
        }

        await prisma.availabilityCampaign.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

        res.json({ success: true, message: 'Availability campaign deactivated.' });
    } catch (err) {
        console.error('Delete availability campaign error:', err);
        res.status(500).json({ success: false, message: 'Failed to deactivate campaign' });
    }
});

// ──────────────────────────────────────────────────────────────
// BRAND (SELLER) ENDPOINTS — "Creators Nearby"
// ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/availability/nearby
 * @desc    Brands discover creators by their availability campaigns
 * @access  Private (Seller)
 */
router.get('/nearby', auth, isSeller, userCacheMiddleware(120), [
    query('niche').optional().isString(),
    query('city').optional().isString(),
    query('state').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    handleValidation
], async (req, res) => {
    try {
        const { niche, city, state, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            isActive: true,
            expiresAt: { gte: new Date() }
        };

        // Location expansion: City → State → Country fallback
        if (city) {
            where.OR = [
                { locationCity: { contains: city, mode: 'insensitive' } },
                ...(state ? [{ locationState: { contains: state, mode: 'insensitive' } }] : [])
            ];
        }

        if (niche) where.niche = niche;

        const [campaigns, total] = await Promise.all([
            prisma.availabilityCampaign.findMany({
                where,
                include: {
                    creatorProfile: {
                        select: {
                            id: true,
                            followerRange: true,
                            engagementRate: true,
                            category: true,
                            collaborationTypes: true,
                            riskLevel: true,
                            compositeRiskScore: true,
                            minPrice: true,
                            maxPrice: true,
                            bio: true,
                            user: { select: { name: true, avatar: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.availabilityCampaign.count({ where })
        ]);

        // Strip creator exact location — show only niche/type info to brands
        const sanitized = campaigns.map(c => ({
            id: c.id,
            niche: c.niche,
            deliverablesOffered: c.deliverablesOffered,
            collaborationBudgetMin: c.collaborationBudgetMin,
            collaborationBudgetMax: c.collaborationBudgetMax,
            description: c.description,
            expiresAt: c.expiresAt,
            locationCity: c.locationCity, // city visible to brands for discovery
            creator: c.creatorProfile
        }));

        res.json({
            success: true,
            data: {
                campaigns: sanitized,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
            }
        });
    } catch (err) {
        console.error('Get nearby campaigns error:', err);
        res.status(500).json({ success: false, message: 'Failed to get availability campaigns' });
    }
});

module.exports = router;
