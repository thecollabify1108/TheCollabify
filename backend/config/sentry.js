const Sentry = require('@sentry/node');

// Defensive load of profiling integration
let profilingIntegration = null;
try {
    const profiling = require('@sentry/profiling-node');
    profilingIntegration = profiling.nodeProfilingIntegration;
} catch (e) {
    console.warn('⚠️ Sentry Profiling Node integration failed to load:', e.message);
}

/**
 * Initialize Sentry for production error monitoring
 * Updated for Sentry Node SDK v8+ (v10)
 */
const initSentry = (app) => {
    // Only initialize if DSN is provided
    if (!process.env.SENTRY_DSN) {
        console.log('⚠️  Sentry DSN not configured - error monitoring disabled');
        return;
    }

    try {
        // Initialize Sentry
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            integrations: [
                // Add profiling if available
                ...(profilingIntegration ? [profilingIntegration()] : []),
            ],
            // Performance Monitoring
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
            profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
        });

        // V10: Automatically setup Express error handling
        // This replaces the old app.use(Sentry.Handlers.errorHandler())
        Sentry.setupExpressErrorHandler(app);

        console.log('✅ Sentry initialized (v10 compatibility mode)');
    } catch (error) {
        console.error('❌ Sentry initialization failed:', error.message);
    }
};

/**
 * Legacy Sentry Error Handler Placeholder
 * Kept to prevent breaking server.js which imports 'sentryErrorHandler'
 * In v10, setupExpressErrorHandler(app) handles this automatically.
 */
const sentryErrorHandler = (err, req, res, next) => {
    // Pass through to next error handler
    next(err);
};

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
