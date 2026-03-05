const NodeCache = require('node-cache');
// Redis removed — using in-memory NodeCache only

// Fallback local cache for development or Redis failure
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Enterprise Caching Middleware (public routes only)
 * @param {number} duration - Cache duration in seconds (default: 300)
 */
const cacheMiddleware = (duration = 300) => async (req, res, next) => {
    // 1. Skip if not GET request
    if (req.method !== 'GET') {
        return next();
    }

    // 2. Skip if authenticated (Private data should not be publicly cached)
    if (req.headers.authorization || req.cookies?.connect?.sid || req.isAuthenticated?.()) {
        return next();
    }

    // 3. Generate unique cache key
    const key = `__express__${req.originalUrl || req.url}`;

    try {
        // 4. Check in-memory cache
        const cachedBody = localCache.get(key);

        // 5. Serve from cache if hit
        if (cachedBody) {
            res.set('X-Cache', 'HIT');
            res.set('Content-Type', 'application/json');
            return res.send(cachedBody);
        }

        // 6. Intercept response to cache it
        res.set('X-Cache', 'MISS');
        const originalSend = res.send;

        res.send = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                localCache.set(key, body, duration);
            }
            originalSend.call(this, body);
        };

        next();
    } catch (error) {
        console.error('Cache Middleware Error:', error);
        next();
    }
};

/**
 * Per-user cache middleware for authenticated routes.
 * Caches responses keyed by userId + URL for short durations (default: 30s).
 * @param {number} duration - Cache duration in seconds (default: 30)
 */
const userCacheMiddleware = (duration = 30) => async (req, res, next) => {
    if (req.method !== 'GET') return next();

    // Requires auth middleware to have run first (req.userId must exist)
    const userId = req.userId || req.user?.id;
    if (!userId) return next();

    const key = `__usercache__${userId}:${req.originalUrl || req.url}`;

    try {
        const cachedBody = localCache.get(key);

        if (cachedBody) {
            res.set('X-Cache', 'HIT');
            res.set('X-Cache-Type', 'user');
            res.set('Content-Type', 'application/json');
            return res.send(cachedBody);
        }

        res.set('X-Cache', 'MISS');
        const originalSend = res.send;

        res.send = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                localCache.set(key, body, duration);
            }
            originalSend.call(this, body);
        };

        next();
    } catch (error) {
        console.error('User Cache Middleware Error:', error);
        next();
    }
};

/**
 * Clear cache entries. For user-specific caches, pass the userId prefix.
 */
const clearCache = async (key) => {
    try {
        if (key) {
            if (key.includes('*')) {
                const pattern = new RegExp('^' + key.replace(/\*/g, '.*') + '$');
                const allKeys = localCache.keys();
                for (const k of allKeys) {
                    if (pattern.test(k)) localCache.del(k);
                }
            } else {
                localCache.del(key);
            }
        } else {
            localCache.flushAll();
        }
    } catch (error) {
        console.error('Clear Cache Error:', error);
    }
};

/**
 * Clear all cached data for a specific user.
 */
const clearUserCache = async (userId) => {
    return clearCache(`__usercache__${userId}:*`);
};

module.exports = { cacheMiddleware, userCacheMiddleware, clearCache, clearUserCache };
