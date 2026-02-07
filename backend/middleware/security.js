const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Advanced Security Middleware
 * Hardens the application with industry-standard security headers
 * and Cloudflare-specific validation.
 */

// 1. Strict Security Headers using Helmet
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:", "http:"],
            "connect-src": ["'self'", "https://api.thecollabify.tech", "https://thecollabify.tech"]
        }
    },
    crossOriginEmbedderPolicy: false, // For local dev/CORS flexibility
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// 2. Cloudflare Verification Middleware
// Ensures the request is coming through the Cloudflare WAF
const verifyCloudflare = (req, res, next) => {
    // Skip verification for health checks (Azure probes need direct access)
    if (req.path === '/api/health' || req.path === '/health') {
        return next();
    }

    // Skip in development
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    // In production, we should check for CF-Connecting-IP and optionally a custom secret header
    // set in Cloudflare Workers/Rules to prevent bypassing the WAF.
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    const cfRay = req.headers['cf-ray'];

    // Allow Azure health probes (they have specific user-agent patterns)
    const userAgent = req.headers['user-agent'] || '';
    const isAzureProbe = userAgent.includes('AlwaysOn') ||
        userAgent.includes('HealthCheck') ||
        userAgent.includes('ReadyForRequest');

    if (!cfConnectingIP && !isAzureProbe) {
        console.warn(`[Security] Direct access attempt blocked from ${req.ip}`);
        return res.status(403).json({
            success: false,
            message: 'Direct access to the origin server is prohibited. Please use the official domain.'
        });
    }

    // Bot Management (Optional: requires Cloudflare Bot Management)
    const cfBotScore = req.headers['cf-bot-score'];
    if (cfBotScore && parseInt(cfBotScore) < 30) {
        console.warn(`[Security] Bot detected (Score: ${cfBotScore}) from ${cfConnectingIP}`);
        // Optional: Block or challenge bots here
    }

    next();
};

// 3. API Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

module.exports = {
    securityHeaders,
    verifyCloudflare,
    apiLimiter
};
