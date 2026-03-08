const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');
const { isSeller } = require('../middleware/roleCheck');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
};

const VALID_CATEGORIES = ['Fashion','Tech','Fitness','Food','Travel','Lifestyle','Beauty','Gaming','Education','Entertainment','Health','Business','Art','Music','Sports','Other'];

/**
 * @route   GET /api/brands/profile
 * @desc    Get brand (seller) profile
 * @access  Private (Seller)
 */
router.get('/profile', auth, isSeller, async (req, res) => {
    try {
        const profile = await prisma.brandProfile.findUnique({
            where: { userId: req.userId }
        });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Brand profile not found.' });
        }

        // Never expose location to external parties — safe since this is the brand's own endpoint
        res.json({ success: true, data: { profile } });
    } catch (error) {
        console.error('Get brand profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to get brand profile' });
    }
});

/**
 * @route   POST /api/brands/profile
 * @desc    Create brand profile
 * @access  Private (Seller)
 */
router.post('/profile', auth, isSeller, [
    body('brandName').trim().notEmpty().withMessage('Brand name is required'),
    body('category').isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
    body('locationCity').trim().notEmpty().withMessage('City is required'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),
    handleValidation
], async (req, res) => {
    try {
        const existing = await prisma.brandProfile.findUnique({ where: { userId: req.userId } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Brand profile already exists. Use PUT to update.' });
        }

        const { brandName, category, website, instagramBusinessUrl, description, locationCity, locationState, locationCountry } = req.body;

        if (!website && !instagramBusinessUrl) {
            return res.status(400).json({
                success: false,
                message: 'Either a website or Instagram business account URL is required.'
            });
        }

        const profile = await prisma.brandProfile.create({
            data: {
                userId: req.userId,
                brandName,
                category,
                website: website || null,
                instagramBusinessUrl: instagramBusinessUrl || null,
                description: description || null,
                locationCity,
                locationState: locationState || null,
                locationCountry: locationCountry || null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Brand profile created.',
            data: { profile },
            locationNote: 'Your location is used only for creator matching and remains private.'
        });
    } catch (error) {
        console.error('Create brand profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to create brand profile' });
    }
});

/**
 * @route   PUT /api/brands/profile
 * @desc    Update brand profile
 * @access  Private (Seller)
 */
router.put('/profile', auth, isSeller, [
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),
    handleValidation
], async (req, res) => {
    try {
        const profile = await prisma.brandProfile.findUnique({ where: { userId: req.userId } });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Brand profile not found.' });
        }

        const updateData = {};
        const fields = ['brandName', 'category', 'website', 'instagramBusinessUrl', 'description', 'locationCity', 'locationState', 'locationCountry'];
        fields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

        const updated = await prisma.brandProfile.update({
            where: { userId: req.userId },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Brand profile updated.',
            data: { profile: updated },
            locationNote: 'Your location is used only for creator matching and remains private.'
        });
    } catch (error) {
        console.error('Update brand profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update brand profile' });
    }
});

module.exports = router;
