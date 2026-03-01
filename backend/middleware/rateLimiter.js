const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

/**
 * Build a Redis-backed store if Redis is available, otherwise fall back to memory.
 * This ensures brute-force protection persists across container restarts on Azure.
 */
const buildStore = (prefix) => {
    const client = getRedisClient();
    if (client) {
        return new RedisStore({
            sendCommand: (...args) => client.call(...args),
            prefix: `rl:${prefix}:`,
        });
    }
    // Graceful fallback: in-memory (acceptable for local dev where Redis is not running)
    return undefined;
};

/**
 * Multi-tier rate limiting for brute force protection
 */

// Global rate limiter - applies to all requests
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    store: buildStore('global'),
});

// Auth-specific rate limiter - stricter for login/registration
// NOTE: This also covers GET /auth/me (session check on every page load),
// so max must be high enough for normal browsing.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Count ALL attempts (not just failed) — skipSuccessfulRequests:true can be abused
    // when attacker mixes successful requests to reset the IP window
    skipSuccessfulRequests: false,
    store: buildStore('auth'),
});

// API rate limiter - moderate for general API usage
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: 'API rate limit exceeded, please slow down your requests.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: buildStore('api'),
});

// Strict limiter for sensitive operations (password reset, email verification)
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many requests for this operation, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: buildStore('strict'),
});

module.exports = {
    globalLimiter,
    authLimiter,
    apiLimiter,
    strictLimiter
};
