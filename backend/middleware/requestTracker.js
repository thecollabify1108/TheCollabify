const { v4: uuidv4 } = require('uuid');

/**
 * Request ID tracking middleware for audit trails
 * Generates a unique correlation ID for each request
 */

const requestTracker = (req, res, next) => {
    // Generate unique request ID
    const requestId = uuidv4();

    // Attach to request object
    req.id = requestId;

    // Add to response headers for client-side tracking
    res.setHeader('X-Request-Id', requestId);

    // Log request with ID for audit trails
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] [${requestId}] ${method} ${path} from ${ip}`);

    // Track request start time for performance monitoring
    req.startTime = Date.now();

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        const statusCode = res.statusCode;
        console.log(`[${timestamp}] [${requestId}] Completed ${statusCode} in ${duration}ms`);
    });

    next();
};

module.exports = requestTracker;
