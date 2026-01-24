import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendar,
    FaPlus,
    FaTimes,
    FaInstagram,
    FaYoutube,
    FaTiktok,
    FaTwitter,
    FaLinkedin,
    FaCheck,
    FaClock,
    FaExclamationTriangle
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Setup the localizer by searching for the global moment instance
const localizer = momentLocalizer(moment);

/**
 * Content Calendar Component
 * Schedule and manage content across multiple platforms
 */
const ContentCalendar = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [view, setView] = useState('month');
    const [loading, setLoading] = useState(true);

    const [newEvent, setNewEvent] = useState({
        title: '',
        start: new Date(),
        end: new Date(),
        type: 'post',
        platform: 'instagram',
        description: '',
        status: 'planned'
    });

    // Fetch events on mount
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await calendarAPI.getEvents();
            // Convert string dates back to Date objects for the calendar
            const formattedEvents = response.data.map(evt => ({
                ...evt,
                start: new Date(evt.start),
                end: new Date(evt.end || evt.start),
                resource: evt // Keep original data
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load calendar');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSlot = ({ start, end }) => {
        setNewEvent({
            ...newEvent,
            start,
            end,
            title: '',
            description: ''
        });
        setSelectedEvent(null);
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setNewEvent({
            ...event.resource,
            start: event.start,
            end: event.end
        });
        setShowModal(true);
    };

    const handleSaveEvent = async () => {
        if (!newEvent.title) {
            toast.error('Please add a title');
            return;
        }

        try {
            if (selectedEvent) {
                // Update existing
                const response = await calendarAPI.updateEvent(selectedEvent.resource._id, newEvent);
                const updatedEvent = {
                    ...response.data,
                    start: new Date(response.data.start),
                    end: new Date(response.data.end || response.data.start),
                    resource: response.data
                };

                setEvents(events.map(ev => ev.resource._id === response.data._id ? updatedEvent : ev));
                toast.success('Event updated!');
            } else {
                // Create new
                const response = await calendarAPI.createEvent(newEvent);
                const savedEvent = {
                    ...response.data,
                    start: new Date(response.data.start),
                    end: new Date(response.data.end || response.data.start),
                    resource: response.data
                };

                setEvents([...events, savedEvent]);
                toast.success('Event scheduled!');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Failed to save event');
        }
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await calendarAPI.deleteEvent(selectedEvent.resource._id);
                setEvents(events.filter(ev => ev.resource._id !== selectedEvent.resource._id));
                toast.success('Event removed');
                setShowModal(false);
            } catch (error) {
                console.error('Error deleting event:', error);
                toast.error('Failed to delete event');
            }
        }
    };

    // Custom Event Component
    const EventComponent = ({ event }) => (
        <div className="flex items-center gap-1 overflow-hidden h-full">
            {event.resource.platform === 'instagram' && <FaInstagram className="text-pink-500 text-xs" />}
            {event.resource.platform === 'youtube' && <FaYoutube className="text-red-500 text-xs" />}
            {event.resource.platform === 'tiktok' && <FaTiktok className="text-black dark:text-white text-xs" />}

            <span className="text-xs truncate">{event.title}</span>

            {event.resource.status === 'published' && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" title="Published" />
            )}
        </div>
    );

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3B82F6'; // Default blue

        switch (event.resource.type) {
            case 'story': backgroundColor = '#EC4899'; break; // Pink
            case 'reel': backgroundColor = '#8B5CF6'; break; // Purple
            case 'video': backgroundColor = '#EF4444'; break; // Red
            default: backgroundColor = '#3B82F6';
        }

        if (event.resource.status === 'published') {
            backgroundColor = '#10B981'; // Green
        }

        return {
            style: {
                backgroundColor: `${backgroundColor}dd`,
                borderRadius: '6px',
                border: 'none',
                color: 'white',
                display: 'block'
            }
        };
    };

    return (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl overflow-hidden glass-card h-[800px] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        Content Calendar
                    </h2>
                    <p className="text-gray-500 dark:text-dark-400 text-sm">
                        Plan and schedule your upcoming content
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedEvent(null);
                        setNewEvent({
                            title: '',
                            start: new Date(),
                            end: new Date(),
                            type: 'post',
                            platform: 'instagram',
                            status: 'planned'
                        });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <FaPlus />
                    <span>New Content</span>
                </button>
            </div>

            {/* Calendar Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-dark-400">Loading calendar...</p>
                    </div>
                </div>
            ) : viewMode === 'month' ? (
                <MonthView events={events} onEditEvent={handleEditEvent} onDeleteEvent={handleDeleteEvent} />
            ) : viewMode === 'week' ? (
                <WeekView events={events} onEditEvent={handleEditEvent} onDeleteEvent={handleDeleteEvent} />
            ) : (
                <DayView events={events} onEditEvent={handleEditEvent} onDeleteEvent={handleDeleteEvent} />
            )}

            {/* Event Modal */}
            <AnimatePresence>
                {showEventModal && (
                    <EventModal
                        event={selectedEvent}
                        onClose={() => setShowEventModal(false)}
                        onSave={() => {
                            setShowEventModal(false);
                            fetchEvents();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Month View Component
 */
const MonthView = ({ events, onEditEvent, onDeleteEvent }) => {
    const daysInMonth = 31; // Simplified for demo
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="grid grid-cols-7 gap-4">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-dark-400 font-semibold text-sm">
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {days.map((day) => {
                    const dayEvents = events.filter((e) => {
                        const eventDate = new Date(e.scheduledDate);
                        return eventDate.getDate() === day;
                    });

                    return (
                        <div
                            key={day}
                            className="min-h-[100px] bg-dark-800/50 rounded-lg p-2 hover:bg-dark-800 transition-colors"
                        >
                            <div className="text-dark-300 text-sm mb-2">{day}</div>
                            <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event) => (
                                    <EventCard
                                        key={event._id}
                                        event={event}
                                        compact
                                        onEdit={onEditEvent}
                                        onDelete={onDeleteEvent}
                                    />
                                ))}
                                {dayEvents.length > 2 && (
                                    <div className="text-xs text-dark-500 text-center">
                                        +{dayEvents.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Week View Component
 */
const WeekView = ({ events, onEditEvent, onDeleteEvent }) => {
    return (
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="space-y-2">
                {events.map((event) => (
                    <EventCard
                        key={event._id}
                        event={event}
                        onEdit={onEditEvent}
                        onDelete={onDeleteEvent}
                    />
                ))}
                {events.length === 0 && (
                    <div className="text-center py-20 text-dark-500">
                        No events scheduled for this week
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Day View Component
 */
const DayView = ({ events, onEditEvent, onDeleteEvent }) => {
    return (
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="space-y-3">
                {events.map((event) => (
                    <EventCard
                        key={event._id}
                        event={event}
                        detailed
                        onEdit={onEditEvent}
                        onDelete={onDeleteEvent}
                    />
                ))}
                {events.length === 0 && (
                    <div className="text-center py-20 text-dark-500">
                        No events scheduled for today
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Event Card Component
 */
const EventCard = ({ event, compact, detailed, onEdit, onDelete }) => {
    const platformIcons = {
        instagram: FaInstagram,
        youtube: FaYoutube,
        tiktok: FaTiktok,
        twitter: FaTwitter,
        linkedin: FaLinkedin
    };

    const statusColors = {
        scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        posted: 'bg-green-500/20 text-green-400 border-green-500/30',
        cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const PlatformIcon = platformIcons[event.platform] || FaCalendar;

    if (compact) {
        return (
            <div
                onClick={() => onEdit(event)}
                className="text-xs p-1 bg-purple-500/20 text-purple-400 rounded cursor-pointer hover:bg-purple-500/30 truncate"
            >
                <PlatformIcon className="inline mr-1" />
                {event.title}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <PlatformIcon className="text-purple-400 text-xl" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-dark-100 font-semibold">{event.title}</h3>
                            <p className="text-dark-400 text-sm">
                                {new Date(event.scheduledDate).toLocaleDateString()} at {event.scheduledTime}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[event.status]}`}>
                            {event.status}
                        </div>
                    </div>

                    {detailed && event.description && (
                        <p className="text-dark-300 text-sm mb-3">{event.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-dark-400">
                        <span className="px-2 py-1 bg-dark-700 rounded">
                            {event.contentType}
                        </span>
                        <span className="px-2 py-1 bg-dark-700 rounded capitalize">
                            {event.platform}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 ml-4">
                    <button
                        onClick={() => onEdit(event)}
                        className="p-2 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-lg transition-colors"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onDelete(event._id)}
                        className="p-2 bg-dark-700 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Event Modal Component
 */
const EventModal = ({ event, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        platform: event?.platform || 'instagram',
        contentType: event?.contentType || 'Post',
        scheduledDate: event?.scheduledDate ? new Date(event.scheduledDate).toISOString().split('T')[0] : '',
        scheduledTime: event?.scheduledTime || '',
        caption: event?.caption || '',
        hashtags: event?.hashtags?.join(', ') || '',
        tags: event?.tags?.join(', ') || '',
        notes: event?.notes || ''
    });

    const [loading, setLoading] = useState(false);
    const [conflicts, setConflicts] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                hashtags: formData.hashtags.split(',').map(h => h.trim()).filter(Boolean),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (event?._id) {
                await api.put(`/api/calendar/${event._id}`, payload);
                toast.success('Event updated successfully');
            } else {
                await api.post('/api/calendar', payload);
                toast.success('Event scheduled successfully');
            }

            onSave();
        } catch (error) {
            console.error('Error saving event:', error);
            if (error.response?.data?.conflicts) {
                setConflicts(error.response.data.conflicts);
                toast.error('Scheduling conflict detected!');
            } else {
                toast.error('Failed to save event');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-4 md:inset-20 bg-dark-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">
                            {event ? 'Edit Event' : 'Schedule Content'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <FaTimes className="text-white text-xl" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Form fields would go here - simplified for brevity */}
                    <div>
                        <label className="block text-sm font-semibold text-dark-200 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:border-purple-500 focus:outline-none"
                            placeholder="Content title..."
                        />
                    </div>

                    {/* More form fields would follow... */}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : event ? 'Update' : 'Schedule'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </>
    );
};

export default ContentCalendar;
