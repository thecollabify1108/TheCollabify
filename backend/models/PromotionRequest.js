const mongoose = require('mongoose');

const matchedCreatorSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreatorProfile',
        required: true
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    matchReason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Matched', 'Applied', 'Accepted', 'Rejected'],
        default: 'Matched'
    },
    appliedAt: Date,
    respondedAt: Date
}, { _id: true });

const promotionRequestSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    budgetRange: {
        min: {
            type: Number,
            required: [true, 'Minimum budget is required'],
            min: [0, 'Budget cannot be negative']
        },
        max: {
            type: Number,
            required: [true, 'Maximum budget is required'],
            min: [0, 'Budget cannot be negative']
        }
    },
    promotionType: {
        type: String,
        enum: ['Reels', 'Stories', 'Posts', 'Website Visit'],
        required: [true, 'Promotion type is required']
    },
    targetCategory: {
        type: String,
        required: [true, 'Target category is required'],
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
    followerRange: {
        min: {
            type: Number,
            required: [true, 'Minimum follower count is required'],
            min: [0, 'Follower count cannot be negative']
        },
        max: {
            type: Number,
            required: [true, 'Maximum follower count is required'],
            min: [0, 'Follower count cannot be negative']
        }
    },
    campaignGoal: {
        type: String,
        enum: ['Reach', 'Traffic', 'Sales'],
        required: [true, 'Campaign goal is required']
    },
    status: {
        type: String,
        enum: ['Open', 'Creator Interested', 'Accepted', 'Completed', 'Cancelled'],
        default: 'Open'
    },

    // Matched creators with AI scores
    matchedCreators: [matchedCreatorSchema],

    // Selected creator for the campaign
    acceptedCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreatorProfile'
    },

    // Campaign timeline
    deadline: {
        type: Date
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Validate that max values are greater than min values
promotionRequestSchema.pre('save', function (next) {
    if (this.budgetRange.max < this.budgetRange.min) {
        return next(new Error('Maximum budget must be greater than or equal to minimum budget'));
    }
    if (this.followerRange.max < this.followerRange.min) {
        return next(new Error('Maximum follower count must be greater than or equal to minimum'));
    }
    next();
});

// Update status when creator applies
promotionRequestSchema.methods.hasCreatorApplied = function (creatorId) {
    return this.matchedCreators.some(
        mc => mc.creatorId.toString() === creatorId.toString() && mc.status === 'Applied'
    );
};

// ===== INDEXES FOR PERFORMANCE =====
// Single-field indexes
promotionRequestSchema.index({ sellerId: 1 });
promotionRequestSchema.index({ status: 1 });
promotionRequestSchema.index({ targetCategory: 1 });
promotionRequestSchema.index({ promotionType: 1 });
promotionRequestSchema.index({ createdAt: -1 });
promotionRequestSchema.index({ 'matchedCreators.creatorId': 1 });

// Compound  indexes for common query patterns
promotionRequestSchema.index({ status: 1, createdAt: -1 }); // For filtering by status and sorting by date
promotionRequestSchema.index({ sellerId: 1, status: 1 }); // For seller's campaign dashboard
promotionRequestSchema.index({ targetCategory: 1, status: 1, createdAt: -1 }); // For category browsing
promotionRequestSchema.index({ status: 1, targetCategory: 1, promotionType: 1 }); // For filtered searches

module.exports = mongoose.model('PromotionRequest', promotionRequestSchema);
