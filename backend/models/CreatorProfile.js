const mongoose = require('mongoose');

const creatorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    instagramUsername: {
        type: String,
        trim: true,
        default: ''
    },
    instagramProfileUrl: {
        type: String,
        trim: true,
        default: '',
        validate: {
            validator: function (v) {
                if (!v) return true; // Allow empty
                // More lenient regex: accepts various Instagram URL formats
                return /^https?:\/\/(www\.)?instagram\.com\/.+/.test(v);
            },
            message: 'Please provide a valid Instagram profile URL (e.g., https://instagram.com/username)'
        }
    },
    instagramVerified: {
        type: Boolean,
        default: false
    },
    lastVerifiedAt: {
        type: Date
    },
    followerCount: {
        type: Number,
        required: [true, 'Follower count is required'],
        min: [0, 'Follower count cannot be negative']
    },
    engagementRate: {
        type: Number,
        required: [true, 'Engagement rate is required'],
        min: [0, 'Engagement rate cannot be negative'],
        max: [100, 'Engagement rate cannot exceed 100%']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Fashion',
            'Tech',
            'Fitness',
            'Food',
            'Travel',
            'Lifestyle',
            'Beauty',
            'Gaming',
            'Education',
            'Entertainment',
            'Health',
            'Business',
            'Art',
            'Music',
            'Sports',
            'Other'
        ]
    },
    promotionTypes: [{
        type: String,
        enum: ['Reels', 'Stories', 'Posts', 'Website Visit'],
        required: true
    }],
    priceRange: {
        min: {
            type: Number,
            required: [true, 'Minimum price is required'],
            min: [0, 'Price cannot be negative']
        },
        max: {
            type: Number,
            required: [true, 'Maximum price is required'],
            min: [0, 'Price cannot be negative']
        }
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: ''
    },
    isAvailable: {
        type: Boolean,
        default: true
    },

    // AI-Generated Insights (auto-populated by aiInsights service)
    insights: {
        engagementQuality: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        audienceAuthenticity: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        strengths: [{
            type: String
        }],
        profileSummary: {
            type: String,
            default: ''
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 50
        },
        lastAnalyzed: {
            type: Date,
            default: Date.now
        }
    },

    // Performance tracking
    totalPromotions: {
        type: Number,
        default: 0
    },
    successfulPromotions: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    leaderboardScore: {
        type: Number,
        default: 0,
        index: -1
    },
    lastScoreUpdate: {
        type: Date,
        default: Date.now
    },
    achievements: [{
        badgeId: {
            type: String,
            required: true
        },
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Validate that max price is greater than min price
creatorProfileSchema.pre('save', function (next) {
    if (this.priceRange.max < this.priceRange.min) {
        next(new Error('Maximum price must be greater than or equal to minimum price'));
    }
    next();
});

// Index for efficient querying
creatorProfileSchema.index({ userId: 1 });
creatorProfileSchema.index({ category: 1 });
creatorProfileSchema.index({ isAvailable: 1 });
creatorProfileSchema.index({ followerCount: 1 });
creatorProfileSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });
creatorProfileSchema.index({ 'insights.score': -1 });

module.exports = mongoose.model('CreatorProfile', creatorProfileSchema);
