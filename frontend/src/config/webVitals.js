import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and sends to analytics
 */

const sendToAnalytics = (metric) => {
    // Log to console in development
    if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    }

    // Send to Google Analytics if available
    if (window.gtag) {
        window.gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
        });
    }

    // Send to custom analytics endpoint (optional)
    if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
        fetch(`${import.meta.env.VITE_API_URL}/analytics/vitals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: metric.name,
                value: metric.value,
                rating: metric.rating,
                delta: metric.delta,
                id: metric.id,
                timestamp: Date.now(),
            }),
        }).catch(() => {
            // Silently fail - don't disrupt user experience
        });
    }
};

export const initWebVitals = () => {
    getCLS(sendToAnalytics);  // Cumulative Layout Shift
    getFID(sendToAnalytics);  // First Input Delay
    getFCP(sendToAnalytics);  // First Contentful Paint
    getLCP(sendToAnalytics);  // Largest Contentful Paint
    getTTFB(sendToAnalytics); // Time to First Byte
};
