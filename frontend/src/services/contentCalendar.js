/**
 * Content Calendar Service
 * Schedule and manage content across platforms
 */

/**
 * Create content calendar event
 */
export const createCalendarEvent = (eventData) => {
    const {
        title,
        platform,
        contentType,
        scheduledDate,
        scheduledTime,
        campaign,
        status = 'scheduled', // scheduled, posted, cancelled
        notes,
        tags = []
    } = eventData;

    return {
        id: `event_${Date.now()}`,
        title,
        platform,
        contentType,
        scheduledDateTime: new Date(`${scheduledDate}T${scheduledTime}`),
        campaign,
        status,
        notes,
        tags,
        createdAt: new Date(),
        reminders: generateReminders(new Date(`${scheduledDate}T${scheduledTime}`))
    };
};

/**
 * Get calendar view for a date range
 */
export const getCalendarView = (events, startDate, endDate, viewType = 'month') => {
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.scheduledDateTime);
        return eventDate >= startDate && eventDate <= endDate;
    });

    if (viewType === 'month') {
        return groupByDay(filteredEvents, startDate, endDate);
    } else if (viewType === 'week') {
        return groupByWeek(filteredEvents, startDate);
    } else if (viewType === 'day') {
        return groupByHour(filteredEvents, startDate);
    }

    return filteredEvents;
};

/**
 * Suggest optimal posting schedule
 */
export const suggestPostingSchedule = (params) => {
    const {
        platform,
        category,
        targetAudience,
        postsPerWeek = 7,
        preferredTimes = []
    } = params;

    const optimalTimes = {
        instagram: {
            weekdays: ['Monday', 'Wednesday', 'Friday'],
            times: ['11:00', '14:00', '19:00']
        },
        youtube: {
            weekdays: ['Thursday', 'Saturday', 'Sunday'],
            times: ['15:00', '18:00', '20:00']
        },
        tiktok: {
            weekdays: ['Tuesday', 'Thursday', 'Saturday'],
            times: ['06:00', '14:00', '17:00']
        },
        twitter: {
            weekdays: ['Monday', 'Wednesday', 'Friday'],
            times: ['08:00', '12:00', '17:00']
        },
        linkedin: {
            weekdays: ['Tuesday', 'Wednesday', 'Thursday'],
            times: ['09:00', '12:00', '17:00']
        }
    };

    const platformSchedule = optimalTimes[platform] || optimalTimes.instagram;
    const suggestions = [];

    const today = new Date();
    let postsScheduled = 0;

    for (let i = 0; i < 30 && postsScheduled < postsPerWeek * 4; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        if (platformSchedule.weekdays.includes(dayName)) {
            platformSchedule.times.forEach(time => {
                if (postsScheduled < postsPerWeek * 4) {
                    suggestions.push({
                        date: date.toISOString().split('T')[0],
                        time,
                        day: dayName,
                        reason: `Optimal ${platform} engagement time`
                    });
                    postsScheduled++;
                }
            });
        }
    }

    return suggestions.slice(0, postsPerWeek * 4);
};

/**
 * Check for scheduling conflicts
 */
export const checkConflicts = (newEvent, existingEvents) => {
    const newEventTime = new Date(newEvent.scheduledDateTime);
    const conflicts = [];

    existingEvents.forEach(event => {
        const eventTime = new Date(event.scheduledDateTime);
        const timeDiff = Math.abs(newEventTime - eventTime) / (1000 * 60); // minutes

        // Check if within 30 minutes
        if (timeDiff < 30 && event.platform === newEvent.platform) {
            conflicts.push({
                type: 'time',
                event,
                message: `Too close to "${event.title}" on ${event.platform}`
            });
        }

        // Check if same campaign, same day
        if (event.campaign === newEvent.campaign &&
            eventTime.toDateString() === newEventTime.toDateString()) {
            conflicts.push({
                type: 'campaign',
                event,
                message: `Multiple posts for same campaign on ${eventTime.toDateString()}`
            });
        }
    });

    return conflicts;
};

/**
 * Generate posting reminders
 */
export const generateReminders = (scheduledDateTime) => {
    const reminders = [];
    const postDate = new Date(scheduledDateTime);

    // 24 hours before
    const oneDayBefore = new Date(postDate);
    oneDayBefore.setHours(oneDayBefore.getHours() - 24);
    reminders.push({
        type: '24h',
        time: oneDayBefore,
        message: 'Content scheduled for tomorrow'
    });

    // 1 hour before
    const oneHourBefore = new Date(postDate);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    reminders.push({
        type: '1h',
        time: oneHourBefore,
        message: 'Content scheduled in 1 hour'
    });

    // 15 minutes before
    const fifteenMinBefore = new Date(postDate);
    fifteenMinBefore.setMinutes(fifteenMinBefore.getMinutes() - 15);
    reminders.push({
        type: '15m',
        time: fifteenMinBefore,
        message: 'Content scheduled in 15 minutes'
    });

    return reminders.filter(r => r.time > new Date());
};

/**
 * Bulk schedule content
 */
export const bulkSchedule = (contentItems, schedule) => {
    const {
        startDate,
        frequency = 'daily', // daily, weekly, custom
        platforms = ['instagram'],
        times = ['10:00']
    } = schedule;

    const scheduledEvents = [];
    let currentDate = new Date(startDate);

    contentItems.forEach((content, index) => {
        const platform = platforms[index % platforms.length];
        const time = times[index % times.length];

        scheduledEvents.push(createCalendarEvent({
            title: content.title,
            platform,
            contentType: content.type,
            scheduledDate: currentDate.toISOString().split('T')[0],
            scheduledTime: time,
            campaign: content.campaign,
            notes: content.notes,
            tags: content.tags
        }));

        // Increment date based on frequency
        if (frequency === 'daily') {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (frequency === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
        }
    });

    return scheduledEvents;
};

/**
 * Get posting analytics
 */
export const getPostingAnalytics = (events) => {
    const posted = events.filter(e => e.status === 'posted');
    const scheduled = events.filter(e => e.status === 'scheduled');
    const cancelled = events.filter(e => e.status === 'cancelled');

    const byPlatform = {};
    const byContentType = {};
    const byDay = {};

    events.forEach(event => {
        // By platform
        byPlatform[event.platform] = (byPlatform[event.platform] || 0) + 1;

        // By content type
        byContentType[event.contentType] = (byContentType[event.contentType] || 0) + 1;

        // By day
        const day = new Date(event.scheduledDateTime).toLocaleDateString('en-US', { weekday: 'long' });
        byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
        overview: {
            total: events.length,
            posted: posted.length,
            scheduled: scheduled.length,
            cancelled: cancelled.length,
            completionRate: events.length > 0 ? Math.round((posted.length / events.length) * 100) : 0
        },
        distribution: {
            byPlatform,
            byContentType,
            byDay
        },
        consistency: calculateConsistencyScore(events),
        upcomingWeek: getUpcomingEvents(scheduled, 7)
    };
};

/**
 * Content gap analysis
 */
export const analyzeContentGaps = (events, target) => {
    const {
        postsPerWeek = 7,
        platformDistribution = {
            instagram: 40,
            youtube: 20,
            tiktok: 20,
            twitter: 10,
            linkedin: 10
        }
    } = target;

    const thisWeek = getEventsThisWeek(events);
    const byPlatform = {};

    thisWeek.forEach(event => {
        byPlatform[event.platform] = (byPlatform[event.platform] || 0) + 1;
    });

    const gaps = [];
    const totalPosts = thisWeek.length;

    // Check overall posting frequency
    if (totalPosts < postsPerWeek) {
        gaps.push({
            type: 'frequency',
            severity: 'high',
            message: `${postsPerWeek - totalPosts} posts needed to meet weekly goal`,
            recommendation: `Schedule ${postsPerWeek - totalPosts} more posts this week`
        });
    }

    // Check platform distribution
    Object.entries(platformDistribution).forEach(([platform, targetPercent]) => {
        const actualCount = byPlatform[platform] || 0;
        const targetCount = Math.round((targetPercent / 100) * postsPerWeek);

        if (actualCount < targetCount) {
            gaps.push({
                type: 'platform',
                platform,
                severity: actualCount === 0 ? 'high' : 'medium',
                message: `Need ${targetCount - actualCount} more ${platform} posts`,
                recommendation: `Schedule ${targetCount - actualCount} posts on ${platform}`
            });
        }
    });

    return {
        gaps,
        gapScore: Math.max(0, 100 - (gaps.length * 15)),
        recommendations: generateGapRecommendations(gaps)
    };
};

// Helper Functions

function groupByDay(events, startDate, endDate) {
    const days = {};
    const current = new Date(startDate);

    while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        days[dateStr] = [];
        current.setDate(current.getDate() + 1);
    }

    events.forEach(event => {
        const dateStr = new Date(event.scheduledDateTime).toISOString().split('T')[0];
        if (days[dateStr]) {
            days[dateStr].push(event);
        }
    });

    return days;
}

function groupByWeek(events, startDate) {
    const weeks = {};

    events.forEach(event => {
        const eventDate = new Date(event.scheduledDateTime);
        const weekStart = getWeekStart(eventDate);
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeks[weekKey]) {
            weeks[weekKey] = [];
        }
        weeks[weekKey].push(event);
    });

    return weeks;
}

function groupByHour(events, date) {
    const hours = {};

    for (let i = 0; i < 24; i++) {
        hours[i] = [];
    }

    events.forEach(event => {
        const eventDate = new Date(event.scheduledDateTime);
        if (eventDate.toDateString() === date.toDateString()) {
            const hour = eventDate.getHours();
            hours[hour].push(event);
        }
    });

    return hours;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function calculateConsistencyScore(events) {
    if (events.length < 7) return 0;

    const dates = events.map(e => new Date(e.scheduledDateTime).getDate());
    dates.sort((a, b) => a - b);

    const gaps = [];
    for (let i = 1; i < dates.length; i++) {
        gaps.push(dates[i] - dates[i - 1]);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;

    return Math.max(0, 100 - Math.round(Math.sqrt(variance) * 10));
}

function getUpcomingEvents(events, days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return events
        .filter(e => {
            const eventDate = new Date(e.scheduledDateTime);
            return eventDate >= new Date() && eventDate <= cutoff;
        })
        .sort((a, b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime));
}

function getEventsThisWeek(events) {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return events.filter(event => {
        const eventDate = new Date(event.scheduledDateTime);
        return eventDate >= weekStart && eventDate < weekEnd;
    });
}

function generateGapRecommendations(gaps) {
    return gaps.map(gap => {
        if (gap.type === 'frequency') {
            return {
                priority: 'high',
                action: 'Increase posting frequency',
                suggestion: gap.recommendation
            };
        } else if (gap.type === 'platform') {
            return {
                priority: gap.severity === 'high' ? 'high' : 'medium',
                action: `Diversify to ${gap.platform}`,
                suggestion: gap.recommendation
            };
        }
        return null;
    }).filter(Boolean);
}

export default {
    createCalendarEvent,
    getCalendarView,
    suggestPostingSchedule,
    checkConflicts,
    generateReminders,
    bulkSchedule,
    getPostingAnalytics,
    analyzeContentGaps
};
