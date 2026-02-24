import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

/**
 * Hook to track anonymous page views
 * Respects Do Not Track (DNT) settings
 */
const usePrivacyAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        // 1. Respect "Do Not Track" browser setting
        if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
            return;
        }

        // 2. Track Page View
        const trackPageView = async () => {
            try {
                // Use a non-blocking request (sendBeacon if available, else fetch)
                const payload = { path: location.pathname };

                // We use our own backend endpoint, NO third-party scripts
                await api.post('analytics/track', payload);
            } catch (error) {
                // Silently fail - never disrupt user experience for analytics
                console.error('Analytics error:', error);
            }
        };

        // Small delay to ensure route is fully mounted/settled
        const timeoutId = setTimeout(trackPageView, 1000);

        return () => clearTimeout(timeoutId);
    }, [location.pathname]); // Only re-run if path changes
};

export default usePrivacyAnalytics;
