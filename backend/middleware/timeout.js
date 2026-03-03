const timeout = require('connect-timeout');

/**
 * Global Request Timeout Middleware
 * Azure free-tier PostgreSQL can take 10s+ per query on cold start.
 * Auth flows (register, login, Google) chain 3-5 queries sequentially,
 * so we need at least 60s to survive a cold DB.
 * Azure App Service itself allows up to 230s before its own gateway timeout.
 */
const timeoutMiddleware = timeout('120s');

/**
 * Extended timeout for auth routes (register, login, Google OAuth)
 * These endpoints chain multiple DB queries + external API calls (Brevo email)
 * and are the most likely to hit Azure cold-start delays.
 */
const authTimeoutMiddleware = timeout('120s');

/**
 * Timeout Error Handler
 * Checks if the request timed out and sends a 503 response.
 * MUST be placed after the route handlers.
 */
const timeoutErrorHandler = (req, res, next) => {
    if (!req.timedout) {
        next();
        return;
    }

    // If headers sent, we can't send a response, so just close
    if (res.headersSent) {
        return;
    }

    res.status(503).json({
        success: false,
        message: 'Request timed out. Please try again later.',
        code: 'REQUEST_TIMEOUT'
    });
};

module.exports = { timeoutMiddleware, authTimeoutMiddleware, timeoutErrorHandler };
