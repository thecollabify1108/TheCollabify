const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

/**
 * @route   GET /api/search/creators
 * @desc    Search creators with filters and pagination
 * @access  Public
 */
router.get('/creators', async (req, res) => {
    try {
        const {
            category,
            minFollowers,
            maxFollowers,
            minEngagement,
            promotionTypes,
            minPrice,
            maxPrice,
            search,
            sortBy = 'matchScore',
            page = 1,
            limit = 12
        } = req.query;

        // Build where object
        const where = { isAvailable: true };

        // Category filter
        if (category && category !== 'All') {
            // Map to Enum value if necessary (schema has standard casing like 'Fashion')
            where.category = category;
        }

        // Follower range filter
        if (minFollowers || maxFollowers) {
            where.followerCount = {};
            if (minFollowers) where.followerCount.gte = parseInt(minFollowers);
            if (maxFollowers) where.followerCount.lte = parseInt(maxFollowers);
        }

        // Engagement rate filter
        if (minEngagement) {
            where.engagementRate = { gte: parseFloat(minEngagement) };
        }

        // Promotion types filter
        if (promotionTypes) {
            const types = promotionTypes.split(',').map(t => t.toUpperCase().replace(/\s+/g, '_'));
            if (types.length > 0) {
                where.promotionTypes = { hasSome: types };
            }
        }

        // Price range filter
        if (minPrice || maxPrice) {
            if (minPrice) where.maxPrice = { gte: parseFloat(minPrice) };
            if (maxPrice) where.minPrice = { lte: parseFloat(maxPrice) };
        }

        // Text search
        if (search) {
            where.OR = [
                { instagramUsername: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } }
                // Searching by User name requires a join, which OR handles in some contexts 
                // but usually better as a separate filter or using nested 'user' filter
            ];
        }

        // Sorting
        let orderBy = {};
        switch (sortBy) {
            case 'followers_desc':
                orderBy = { followerCount: 'desc' };
                break;
            case 'followers_asc':
                orderBy = { followerCount: 'asc' };
                break;
            case 'price_desc':
                orderBy = { maxPrice: 'desc' };
                break;
            case 'price_asc':
                orderBy = { minPrice: 'asc' };
                break;
            case 'engagement':
                orderBy = { engagementRate: 'desc' };
                break;
            case 'matchScore':
            default:
                orderBy = [
                    { aiScore: 'desc' },
                    { followerCount: 'desc' }
                ];
                break;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [creators, total] = await Promise.all([
            prisma.creatorProfile.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, avatar: true }
                    }
                },
                orderBy,
                skip,
                take: parseInt(limit)
            }),
            prisma.creatorProfile.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                creators,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Search creators error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search creators'
        });
    }
});

module.exports = router;
