const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date
    },
    type: {
        type: String,
        enum: ['post', 'story', 'reel', 'video', 'other'],
        default: 'post'
    },
    platform: {
        type: String,
        enum: ['instagram', 'youtube', 'tiktok', 'other'],
        default: 'instagram'
    },
    status: {
        type: String,
        enum: ['planned', 'created', 'scheduled', 'published'],
        default: 'planned'
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request'
    },
    description: String,
    url: String,

    // For drag and drop ordering or specific metadata
    meta: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
