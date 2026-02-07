const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry for production error monitoring
 * Call this BEFORE any other Express middleware
 */
const initSentry = (app) => {
    // Only initialize if DSN is provided
    if (!process.env.SENTRY_DSN) {
        console.log('⚠️  Sentry DSN not configured - error monitoring disabled');
        return;
    }

    // Initialize Sentry
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0, // 10% in prod, 0% in dev
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0, // 10% profiling in prod

        integrations: [
            // Profiling integration for performance insights
            new ProfilingIntegration(),
        ],

        // SECURITY: Data sanitization - remove sensitive information
        beforeSend(event, hint) {
            // Don't send events in development (unless explicitly enabled)
            if (process.env.NODE_ENV !== 'production' && !process.env.SENTRY_ENABLE_DEV) {
                return null;
            }

            // Sanitize request data
            if (event.request) {
                // Remove cookies (may contain auth tokens)
                delete event.request.cookies;

                // Sanitize headers
                if (event.request.headers) {
                    delete event.request.headers['authorization'];
                    delete event.request.headers['cookie'];
                    delete event.request.headers['x-api-key'];
                }

                // Sanitize request body
                if (event.request.data) {
                    event.request.data = sanitizeData(event.request.data);
                }

                // Sanitize query parameters
                if (event.request.query_string) {
                    event.request.query_string = sanitizeQueryString(event.request.query_string);
                }
            }

            // Sanitize user data
            if (event.user) {
                delete event.user.password;
                delete event.user.token;
                delete event.user.apiKey;
            }

            // Sanitize extra context
            if (event.extra) {
                event.extra = sanitizeData(event.extra);
            }

            // Sanitize breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.map(crumb => {
                    if (crumb.data) {
                        crumb.data = sanitizeData(crumb.data);
                    }
                    return crumb;
                });
            }

            return event;
        },

        // SECURITY: Ignore common sensitive errors
        ignoreErrors: [
            // Authentication errors (don't need to track in Sentry)
            'JsonWebTokenError',
            'TokenExpiredError',

            // Validation errors (user input issues)
            'ValidationError',

            // Rate limiting (not actual errors)
            'Too many requests',
        ],
    });

    // Request handler must be the first middleware
    app.use(Sentry.Handlers.requestHandler());

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    console.log('✅ Sentry initialized for error monitoring');
};

/**
 * Sentry error handler - must be added BEFORE your custom error handler
 * but AFTER all routes
 */
const sentryErrorHandler = Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
        // Only send 5xx errors and unexpected errors to Sentry
        // Don't send 4xx client errors (validation, auth, etc.)
        const statusCode = error.statusCode || error.status || 500;
        return statusCode >= 500;
    },
});

/**
 * Sanitize data object - recursively remove sensitive fields
 */
const sanitizeData = (data) => {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const sensitiveKeys = [
        'password',
        'token',
        'apiKey',
        'api_key',
        'secret',
        'authorization',
        'cookie',
        'sessionId',
        'session_id',
        'creditCard',
        'credit_card',
        'ssn',
        'social_security',
    ];

    const sanitized = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();

        // Check if key contains sensitive data
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            // Recursively sanitize nested objects
            sanitized[key] = sanitizeData(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Sanitize query string
 */
const sanitizeQueryString = (queryString) => {
    if (!queryString) return queryString;

    // Replace common sensitive parameter values
    return queryString
        .replace(/([?&])(token|apikey|password|secret)=[^&]*/gi, '$1$2=[REDACTED]')
        .replace(/([?&])(api[_-]?key)=[^&]*/gi, '$1$2=[REDACTED]');
};

/**
 * Manually capture exception to Sentry
 * Use this in catch blocks when you need explicit control
 */
const captureException = (error, context = {}) => {
    Sentry.captureException(error, {
        extra: sanitizeData(context),
    });
};

/**
 * Set user context for Sentry
 * Call this after authentication to track errors by user
 */
const setUserContext = (user) => {
    if (!user) {
        Sentry.setUser(null);
        return;
    }

    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
        // Don't include password, tokens, or other sensitive data
    });
};

/**
 * Add breadcrumb for debugging
 */
const addBreadcrumb = (message, category = 'custom', data = {}) => {
    Sentry.addBreadcrumb({
        message,
        category,
        data: sanitizeData(data),
        level: 'info',
    });
};

module.exports = {
    initSentry,
    sentryErrorHandler,
    captureException,
    setUserContext,
    addBreadcrumb,
};
