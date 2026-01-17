/**
 * Haptic Feedback Utility
 * Provides tactile feedback for user interactions
 */

export const haptic = {
    /**
     * Light tap feedback (selection, button press)
     */
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    /**
     * Medium feedback (toggle, notification)
     */
    medium: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
    },

    /**
     * Heavy feedback (error, important action)
     */
    heavy: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    },

    /**
     * Success pattern (task completion)
     */
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([10, 50, 10]);
        }
    },

    /**
     * Error pattern (failed action)
     */
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 100, 50]);
        }
    },

    /**
     * Selection change pattern
     */
    selection: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
    },

    /**
     * Check if haptic feedback is supported
     */
    isSupported: () => {
        return 'vibrate' in navigator;
    }
};

export default haptic;
