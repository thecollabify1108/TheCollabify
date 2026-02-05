const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

// @route   GET /api/calendar
// @desc    Get all events for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { start, end } = req.query;
        let where = { userId: req.user.id };

        // Date range filtering if provided
        if (start && end) {
            where.startDate = { gte: new Date(start), lte: new Date(end) };
        }

        const events = await prisma.calendarEvent.findMany({
            where,
            orderBy: { startDate: 'asc' }
        });
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
        const { title, start, end, type, platform, status, description, campaignId, url, meta } = req.body;

        const event = await prisma.calendarEvent.create({
            data: {
                userId: req.user.id,
                title,
                startDate: new Date(start),
                endDate: end ? new Date(end) : new Date(start),
                type,
                platform,
                status,
                description,
                campaignId,
                url,
                meta: meta || {}
            }
        });

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
        const event = await prisma.calendarEvent.findUnique({
            where: { id: req.params.id }
        });

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Make sure user owns event
        if (event.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { title, start, end, type, platform, status, description, campaignId, url, meta } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (start !== undefined) updateData.startDate = new Date(start);
        if (end !== undefined) updateData.endDate = new Date(end);
        if (type !== undefined) updateData.type = type;
        if (platform !== undefined) updateData.platform = platform;
        if (status !== undefined) updateData.status = status;
        if (description !== undefined) updateData.description = description;
        if (campaignId !== undefined) updateData.campaignId = campaignId;
        if (url !== undefined) updateData.url = url;
        if (meta !== undefined) updateData.meta = meta;

        const updatedEvent = await prisma.calendarEvent.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json(updatedEvent);
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
        const event = await prisma.calendarEvent.findUnique({
            where: { id: req.params.id }
        });

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Make sure user owns event
        if (event.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await prisma.calendarEvent.delete({
            where: { id: req.params.id }
        });

        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
