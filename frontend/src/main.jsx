import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import * as Sentry from "@sentry/react"
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

// Initialize Sentry for error monitoring
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // Environment (development, production)
    environment: import.meta.env.MODE,

    // Performance Monitoring
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
            maskAllText: true,  // Privacy: mask all text content
            blockAllMedia: true, // Privacy: don't record images/videos
        }),
    ],

    // Performance traces (10% sample rate for low overhead)
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0,

    // Session Replay (record 10% of sessions, 100% of error sessions)
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0, // Always record when error occurs

    // SECURITY: Filter sensitive data before sending
    beforeSend(event, hint) {
        // Don't send events in development unless explicitly enabled
        if (import.meta.env.MODE !== 'production' && !import.meta.env.VITE_SENTRY_ENABLE_DEV) {
            return null;
        }

        // Remove sensitive data from breadcrumbs
        if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map(crumb => {
                if (crumb.data) {
                    // Remove passwords, tokens from form data
                    const sanitized = { ...crumb.data };
                    delete sanitized.password;
                    delete sanitized.token;
                    delete sanitized.apiKey;
                    crumb.data = sanitized;
                }
                return crumb;
            });
        }

        return event;
    },
});

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '223460533138-nkmmomsvj3nvjd8geg77gdp2rqho3o22.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <Sentry.ErrorBoundary
                                fallback={({ error, resetError }) => (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100vh',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        background: '#0f172a',
                                        color: '#f1f5f9'
                                    }}>
                                        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                            Oops! Something went wrong
                                        </h1>
                                        <p style={{ marginBottom: '2rem', color: '#94a3b8' }}>
                                            Our team has been notified. Please try refreshing the page.
                                        </p>
                                        <button
                                            onClick={resetError}
                                            style={{
                                                padding: '0.75rem 2rem',
                                                background: '#6366f1',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                                showDialog={false}
                            >
                                <App />
                                <Toaster
                                    position="top-right"
                                    toastOptions={{
                                        duration: 4000,
                                        style: {
                                            background: '#1e293b',
                                            color: '#f1f5f9',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                        },
                                        success: {
                                            iconTheme: {
                                                primary: '#10b981',
                                                secondary: '#f1f5f9',
                                            },
                                        },
                                        error: {
                                            iconTheme: {
                                                primary: '#ef4444',
                                                secondary: '#f1f5f9',
                                            },
                                        },
                                    }}
                                />
                            </Sentry.ErrorBoundary>
                        </NotificationProvider>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)

