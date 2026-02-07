const NodeCache = require('node-cache');

// Standard TTL 5 minutes, check period 1 minute (cleanup)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * In-memory caching middleware
 * @param {number} duration - Cache duration in seconds (default: 300)
 */
const cacheMiddleware = (duration = 300) => (req, res, next) => {
    // 1. Skip if not GET request
    if (req.method !== 'GET') {
        return next();
    }

    // 2. Skip if authenticated (Authorization header or session)
    // We strictly cache only public data
    if (req.headers.authorization || req.cookies?.connect?.sid || req.isAuthenticated?.()) {
        return next();
    }

    // 3. Generate cache key
    // distinct by URL
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);

    // 4. Serve from cache if hit
    if (cachedBody) {
        res.set('X-Cache', 'HIT');
        res.set('Content-Type', 'application/json'); // Assumption: API returns JSON
        return res.send(cachedBody);
    }

    // 5. Intercept response to cache it
    res.set('X-Cache', 'MISS');
    const originalSend = res.send;

    res.send = function (body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
            cache.set(key, body, duration);
        }
        originalSend.call(this, body);
    };

    next();
};

// Helper to manually clear cache if needed
const clearCache = (key) => {
    if (key) {
        cache.del(key);
    } else {
        cache.flushAll();
    }
};

module.exports = { cacheMiddleware, clearCache };
