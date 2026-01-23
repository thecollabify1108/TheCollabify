const mongoose = require('mongoose');

const contentCalendarSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromotionRequest'
    },

    // Event details
    title: {
        type: String,
        required: true
    },
    description: String,
    platform: {
        type: String,
        enum: ['instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'],
        required: true
    },
    contentType: {
        type: String,
        enum: ['Post', 'Story', 'Reel', 'Video', 'Short', 'Article', 'Thread', 'Live', 'IGTV'],
        required: true
    },

    // Scheduling
    scheduledDate: {
        type: Date,
        required: true,
        index: true
    },
    scheduledTime: String,

    // Status
    status: {
        type: String,
        enum: ['scheduled', 'posted', 'cancelled', 'failed'],
        default: 'scheduled'
    },

    // Content
    caption: String,
    hashtags: [String],
    mediaUrls: [String],

    // Metadata
    tags: [String],
    notes: String,

    // Reminders
    reminders: [{
        time: Date,
        type: { type: String, enum: ['24h', '1h', '15m'] },
        sent: { type: Boolean, default: false }
    }],

    // Performance (after posting)
    performance: {
        reach: Number,
        impressions: Number,
        engagement: Number,
        likes: Number,
        comments: Number,
        shares: Number,
        saves: Number
    },

    // Posting details
    postedAt: Date,
    postUrl: String
}, {
    timestamps: true
});

// Indexes
contentCalendarSchema.index({ creatorId: 1, scheduledDate: 1 });
contentCalendarSchema.index({ campaignId: 1 });
contentCalendarSchema.index({ status: 1, scheduledDate: 1 });

// Virtual for checking if event is upcoming
contentCalendarSchema.virtual('isUpcoming').get(function () {
    return this.status === 'scheduled' && this.scheduledDate > new Date();
});

// Static method to get calendar events
contentCalendarSchema.statics.getCalendarView = async function (creatorId, startDate, endDate) {
    return await this.find({
        creatorId,
        scheduledDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ scheduledDate: 1 }).populate('campaignId', 'title');
};

// Static method to check conflicts
contentCalendarSchema.statics.checkConflicts = async function (creatorId, scheduledDate, platform) {
    const thirtyMinsBefore = new Date(scheduledDate.getTime() - 30 * 60000);
    const thirtyMinsAfter = new Date(scheduledDate.getTime() + 30 * 60000);

    return await this.find({
        creatorId,
        platform,
        status: 'scheduled',
        scheduledDate: {
            $gte: thirtyMinsBefore,
            $lte: thirtyMinsAfter
        }
    });
};

module.exports = mongoose.model('ContentCalendar', contentCalendarSchema);
