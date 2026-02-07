const rateLimit = require('express-rate-limit');

/**
 * Multi-tier rate limiting for brute force protection
 */

// Global rate limiter - applies to all requests
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Skip successful requests
    skipSuccessfulRequests: false,
    // Skip failed requests (e.g., 4xx, 5xx)
    skipFailedRequests: false,
});

// Auth-specific rate limiter - stricter for login/registration
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Only count failed login attempts
    skipSuccessfulRequests: true,
});

// API rate limiter - moderate for general API usage
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
        success: false,
        message: 'API rate limit exceeded, please slow down your requests.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for sensitive operations (password reset, email verification)
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per hour
    message: {
        success: false,
        message: 'Too many requests for this operation, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    authLimiter,
    apiLimiter,
    strictLimiter
};
