const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/CalendarEvent');
const { protect } = require('../middleware/auth');

// @route   GET /api/calendar
// @desc    Get all events for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { start, end } = req.query;
        let query = { userId: req.user.id };

        // Date range filtering if provided
        if (start && end) {
            query.start = { $gte: new Date(start), $lte: new Date(end) };
        }

        const events = await CalendarEvent.find(query).sort({ start: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/calendar
// @desc    Create a new event
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, start, end, type, platform, status, description, campaignId } = req.body;

        const newEvent = new CalendarEvent({
            userId: req.user.id,
            title,
            start,
            end: end || start, // Default end to start if not provided
            type,
            platform,
            status,
            description,
            campaignId
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/calendar/:id
// @desc    Update an event
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Make sure user owns event
        if (event.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        event = await CalendarEvent.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/calendar/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        let event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Make sure user owns event
        if (event.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await event.deleteOne();

        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
