const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const prisma = require('../config/prisma');

/**
 * @route   GET /api/calendar
 * @desc    Get calendar events for user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        const where = { creatorId: req.user.id };

        if (startDate && endDate) {
            where.scheduledDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (status) {
            where.status = status;
        }

        const events = await prisma.contentCalendar.findMany({
            where,
            include: {
                campaign: {
                    select: { title: true, status: true }
                }
            },
            orderBy: { scheduledDate: 'asc' }
        });

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
        const schedDate = new Date(scheduledDate);
        const thirtyMinsBefore = new Date(schedDate.getTime() - 30 * 60000);
        const thirtyMinsAfter = new Date(schedDate.getTime() + 30 * 60000);

        const conflicts = await prisma.contentCalendar.findMany({
            where: {
                creatorId: req.user.id,
                platform,
                status: 'scheduled',
                scheduledDate: {
                    gte: thirtyMinsBefore,
                    lte: thirtyMinsAfter
                }
            }
        });

        if (conflicts.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Scheduling conflict detected',
                conflicts
            });
        }

        // Generate reminders
        const scheduledDateTime = new Date(scheduledDate);
        const reminders = [
            { time: new Date(scheduledDateTime.getTime() - 24 * 60 * 60 * 1000), type: '24h', sent: false },
            { time: new Date(scheduledDateTime.getTime() - 60 * 60 * 1000), type: '1h', sent: false },
            { time: new Date(scheduledDateTime.getTime() - 15 * 60 * 1000), type: '15m', sent: false }
        ];

        const event = await prisma.contentCalendar.create({
            data: {
                creatorId: req.user.id,
                title,
                description,
                platform,
                contentType,
                scheduledDate: new Date(scheduledDate),
                scheduledTime,
                campaignId: campaignId || null,
                caption,
                hashtags: hashtags || [],
                tags: tags || [],
                notes,
                reminders
            }
        });

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
        const event = await prisma.contentCalendar.findUnique({
            where: { id: req.params.id }
        });

        if (!event || event.creatorId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or unauthorized'
            });
        }

        const updatedEvent = await prisma.contentCalendar.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json({
            success: true,
            data: { event: updatedEvent }
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
        const event = await prisma.contentCalendar.findUnique({
            where: { id: req.params.id }
        });

        if (!event || event.creatorId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or unauthorized'
            });
        }

        await prisma.contentCalendar.delete({
            where: { id: req.params.id }
        });

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

        const event = await prisma.contentCalendar.findUnique({
            where: { id: req.params.id }
        });

        if (!event || event.creatorId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or unauthorized'
            });
        }

        const updatedEvent = await prisma.contentCalendar.update({
            where: { id: req.params.id },
            data: {
                status: 'posted',
                postedAt: new Date(),
                postUrl: postUrl,
                performance: performance || {}
            }
        });

        res.json({
            success: true,
            data: { event: updatedEvent }
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
