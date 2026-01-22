import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes,
} from 'react-router-dom';

// Initialize Sentry only in production
if (import.meta.env.PROD) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN || '', // Add VITE_SENTRY_DSN to Vercel env vars
        integrations: [
            new Sentry.BrowserTracing({
                routingInstrumentation: Sentry.reactRouterV6Instrumentation(
                    useEffect,
                    useLocation,
                    useNavigationType,
                    createRoutesFromChildren,
                    matchRoutes,
                ),
            }),
            new Sentry.Replay({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Performance Monitoring
        tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% when errors occur

        // Environment
        environment: 'production',

        // Filter out known non-critical errors
        beforeSend(event, hint) {
            // Don't send ResizeObserver errors (harmless browser quirk)
            if (event.message?.includes('ResizeObserver')) {
                return null;
            }
            return event;
        },
    });
}

export default Sentry;
