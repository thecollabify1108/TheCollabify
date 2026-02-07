const timeout = require('connect-timeout');

/**
 * Global Request Timeout Middleware
 * Sets a timeout for all requests to prevent the server from hanging indefinitely.
 * Default: 29s (Azure Load Balancer has a 4-minute idle timeout, but 30s is a good practice for standard APIs)
 */
const timeoutMiddleware = timeout('29s');

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

module.exports = { timeoutMiddleware, timeoutErrorHandler };
