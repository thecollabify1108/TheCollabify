const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ContentCalendar = require('../models/ContentCalendar');

/**
 * @route   GET /api/calendar
 * @desc    Get calendar events for user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        const query = { creatorId: req.user.id };

        if (startDate && endDate) {
            query.scheduledDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (status) {
            query.status = status;
        }

        const events = await ContentCalendar.find(query)
            .sort({ scheduledDate: 1 })
            .populate('campaignId', 'title status');

        res.json({
            success: true,
            data: { events }
        });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events'
        });
    }
});

/**
 * @route   POST /api/calendar
 * @desc    Create calendar event
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            description,
            platform,
            contentType,
            scheduledDate,
            scheduledTime,
            campaignId,
            caption,
            hashtags,
            tags,
            notes
        } = req.body;

        // Check for conflicts
        const conflicts = await ContentCalendar.checkConflicts(
            req.user.id,
            new Date(scheduledDate),
            platform
        );

        if (conflicts.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Scheduling conflict detected',
                conflicts
            });
        }

        const event = new ContentCalendar({
            creatorId: req.user.id,
            title,
            description,
            platform,
            contentType,
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            campaignId,
            caption,
            hashtags,
            tags,
            notes
        });

        // Generate reminders
        const scheduledDateTime = new Date(scheduledDate);
        event.reminders = [
            { time: new Date(scheduledDateTime.getTime() - 24 * 60 * 60 * 1000), type: '24h' },
            { time: new Date(scheduledDateTime.getTime() - 60 * 60 * 1000), type: '1h' },
            { time: new Date(scheduledDateTime.getTime() - 15 * 60 * 1000), type: '15m' }
        ];

        await event.save();

        res.status(201).json({
            success: true,
            data: { event }
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event'
        });
    }
});

/**
 * @route   PUT /api/calendar/:id
 * @desc    Update calendar event
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
    try {
        const event = await ContentCalendar.findOne({
            _id: req.params.id,
            creatorId: req.user.id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            event[key] = updates[key];
        });

        await event.save();

        res.json({
            success: true,
            data: { event }
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event'
        });
    }
});

/**
 * @route   DELETE /api/calendar/:id
 * @desc    Delete calendar event
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await ContentCalendar.findOneAndDelete({
            _id: req.params.id,
            creatorId: req.user.id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event'
        });
    }
});

/**
 * @route   POST /api/calendar/:id/mark-posted
 * @desc    Mark event as posted
 * @access  Private
 */
router.post('/:id/mark-posted', auth, async (req, res) => {
    try {
        const { postUrl, performance } = req.body;

        const event = await ContentCalendar.findOne({
            _id: req.params.id,
            creatorId: req.user.id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        event.status = 'posted';
        event.postedAt = new Date();
        event.postUrl = postUrl;
        if (performance) {
            event.performance = performance;
        }

        await event.save();

        res.json({
            success: true,
            data: { event }
        });
    } catch (error) {
        console.error('Error marking as posted:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event'
        });
    }
});

module.exports = router;
