const express = require('express');
const router = express.Router();
const CreatorProfile = require('../models/CreatorProfile');

/**
 * @route   GET /api/search/creators
 * @desc    Search creators with filters and pagination
 * @access  Public (for now, or Private based on requirements)
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
            sortBy = 'matchScore', // default sort
            page = 1,
            limit = 12
        } = req.query;

        // Build query object
        const query = { isAvailable: true }; // Only show available creators

        // Category filter
        if (category && category !== 'All') {
            query.category = category;
        }

        // Follower range filter
        if (minFollowers || maxFollowers) {
            query.followerCount = {};
            if (minFollowers) query.followerCount.$gte = parseInt(minFollowers);
            if (maxFollowers) query.followerCount.$lte = parseInt(maxFollowers);
        }

        // Engagement rate filter
        if (minEngagement) {
            query.engagementRate = { $gte: parseFloat(minEngagement) };
        }

        // Promotion types filter
        if (promotionTypes) {
            const types = promotionTypes.split(',');
            if (types.length > 0) {
                query.promotionTypes = { $in: types };
            }
        }

        // Price range filter
        if (minPrice || maxPrice) {
            // We check if creator's price range overlaps with filtered range
            // Logic: Creator min <= Filter max AND Creator max >= Filter min
            // However, simpler logic for "creators within budget":
            // Creator's min price should be at least Filter min (if specified)
            // Creator's max price should be at most Filter max (if specified)
            // Or maybe searching for creators whose range intersects?
            // Let's go with: "Creators who have ANY price within this range"
            // For now, let's filter based on their STARTING price (min) for minPrice
            // and their MAX price for maxPrice to ensure they are affordable.

            // Actually, usually users want "Creators who charge between X and Y"
            // So we can check if their average price falls in range, or if their range overlaps.
            // Let's do simple overlap for maximum flexibility:
            // Creator.min <= Filter.max AND Creator.max >= Filter.min

            const priceQuery = {};
            if (minPrice) priceQuery.$gte = parseFloat(minPrice); // Logic might be complex for ranges

            // Simplified approach for typical user mental model:
            // "I have a budget of X-Y" -> find creators whose range fits entirely or partially inside?
            // Let's stick to simple field filtering for now based on implementation plan
            // "Price range slider" usually implies "Show me creators who cost around this much"

            // Let's implement: Creator's min price >= Filter min AND Creator's max price <= Filter max
            // This ensures they are strictly within budget.
            const priceConditions = {};
            if (minPrice) priceConditions['priceRange.max'] = { $gte: parseFloat(minPrice) };
            if (maxPrice) priceConditions['priceRange.min'] = { $lte: parseFloat(maxPrice) };

            if (Object.keys(priceConditions).length > 0) {
                Object.assign(query, priceConditions);
            }
        }

        // Text search (name, bio, instagram username)
        // Since we don't have text index on all fields yet, we can use regex for simple match
        // Ideally we should add a text index in the model, but regex works for small datasets
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            // We need to look up User model for name matches, but CreatorProfile stores userId ref.
            // This is tricky with simple find(). 
            // We'll populate first? No, that's slow.
            // Search mainly on bio, category, instagramUsername stored in profile.
            // If we want to search by name, we'd need aggregation lookup.
            // For MVP: Search instagramUsername and Bio.
            query.$or = [
                { instagramUsername: searchRegex },
                { bio: searchRegex },
                { category: searchRegex }
            ];
        }

        // Sorting
        let sort = {};
        switch (sortBy) {
            case 'followers_desc':
                sort = { followerCount: -1 };
                break;
            case 'followers_asc':
                sort = { followerCount: 1 };
                break;
            case 'price_desc':
                sort = { 'priceRange.max': -1 };
                break;
            case 'price_asc':
                sort = { 'priceRange.min': 1 };
                break;
            case 'engagement':
                sort = { engagementRate: -1 };
                break;
            case 'matchScore':
            default:
                sort = { 'insights.score': -1, followerCount: -1 }; // Best creators first
                break;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [creators, total] = await Promise.all([
            CreatorProfile.find(query)
                .populate('userId', 'name email avatar')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            CreatorProfile.countDocuments(query)
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
