import { authAPI } from './api';

/**
 * Lightweight fire-and-forget feedback logger for AI training
 * @param {Object} feedbackData
 * @param {string} feedbackData.targetUserId - The ID of the user/entity being interacted with
 * @param {string} feedbackData.action - VIEWED, CLICKED, SAVED, IGNORED, ACCEPTED, REJECTED
 * @param {string} feedbackData.source - e.g. 'campaign_suggestions', 'search_results'
 * @param {string} [feedbackData.matchId] - Optional ID of the specific match record
 * @param {Object} [feedbackData.meta] - Optional context (search query, filters, etc.)
 */
export const trackMatchFeedback = (feedbackData) => {
    try {
        // Use sendBeacon if available for guaranteed delivery on unload, 
        // otherwise fall back to standard API call but don't await it.
        // Since we need auth headers, sendBeacon is tricky. 
        // We'll use the standard axios instance but catch errors silently.

        authAPI.post('/api/analytics/feedback', feedbackData)
            .catch(err => {
                // Silent failure - do not disturb user experience
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Feedback logging failed:', err.message);
                }
            });
    } catch (error) {
        // double safety
    }
};

/**
 * Track definitive match outcome (State Change)
 * @param {Object} outcomeData
 * @param {string} outcomeData.matchId - The ID of the match/promotion-creator pair
 * @param {string} outcomeData.status - contacted, accepted, started, completed, abandoned
 */
export const trackMatchOutcome = (outcomeData) => {
    try {
        authAPI.post('/api/analytics/outcome', outcomeData)
            .catch(err => {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Outcome logging failed:', err.message);
                }
            });
    } catch (error) {
        // safety
    }
};

export default trackMatchFeedback;
