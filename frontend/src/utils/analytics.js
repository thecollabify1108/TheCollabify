/**
 * Simple Analytics Event Tracker Utility
 * 
 * Usage:
 * import { trackEvent } from '../utils/analytics';
 * trackEvent('event_name');
 * 
 * Notes:
 * - Automatically safe for development (no-op on localhost)
 * - Lightweight and non-blocking
 * - Ensures no sensitive data is transmitted
 */

export const trackEvent = (eventName) => {
    try {
        // 1. Check if running in production
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocal) {
            // console.log(`[Analytics-Dev] Event tracked: ${eventName}`);
            return;
        }

        // 2. Trigger Simple Analytics event
        // Reference: https://docs.simpleanalytics.com/events
        if (window.sa_event) {
            window.sa_event(eventName);
        } else {
            // Fallback if script hasn't loaded yet
            window.sa_event_queue = window.sa_event_queue || [];
            window.sa_event_queue.push(eventName);
        }
    } catch (error) {
        // Silent fail to ensure app stability
        console.warn('Analytics tracking failed', error);
    }
};
