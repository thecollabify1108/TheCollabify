const Redis = require('ioredis');
const NodeCache = require('node-cache');

// Initialize Redis Client (Azure Production)
let redisClient = null;
let localCache = null;

if (process.env.REDIS_URL) {
    try {
        console.log('🔌 Connecting to Azure Redis...');
        // Safely extract hostname for TLS
        const redisUrl = new URL(process.env.REDIS_URL);

        redisClient = new Redis(process.env.REDIS_URL, {
            tls: { servername: redisUrl.hostname }, // Required for Azure
            retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff
            maxRetriesPerRequest: 3,
            enableOfflineQueue: false // Fail fast if not connected
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Error:', err.message);
        });

        redisClient.on('connect', () => {
            console.log('✅ Connected to Azure Redis');
        });
    } catch (error) {
        console.error('❌ Critical Redis Init Error:', error.message);
        console.warn('⚠️ Falling back to local memory cache due to Redis configuration error.');
        localCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
        redisClient = null;
    }
} else {
    // Fallback to Local Memory (Development)
    console.log('⚠️ No REDIS_URL found. Using local in-memory cache.');
    localCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
}

/**
 * Enterprise Caching Middleware
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
        // 4. Check Cache (Redis or Local)
        let cachedBody;
        if (redisClient) {
            cachedBody = await redisClient.get(key);
        } else {
            cachedBody = localCache.get(key);
        }

        // 5. Serve from cache if hit
        if (cachedBody) {
            res.set('X-Cache', 'HIT');
            res.set('Content-Type', 'application/json');
            // Redis stores strings, so we might need to parse if it was objects, 
            // but for API response caching, sending the string directly is efficient.
            return res.send(cachedBody);
        }

        // 6. Intercept response to cache it
        res.set('X-Cache', 'MISS');
        const originalSend = res.send;

        res.send = function (body) {
            // Only cache successful JSON responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                if (redisClient) {
                    // Store in Redis with expiration
                    redisClient.set(key, body, 'EX', duration).catch(err => console.error('Redis Set Error:', err));
                } else {
                    localCache.set(key, body, duration);
                }
            }
            originalSend.call(this, body);
        };

        next();
    } catch (error) {
        console.error('Cache Middleware Error:', error);
        next(); // Fail open: if cache fails, just process request normally
    }
};

// Helper to manually clear cache
const clearCache = async (key) => {
    try {
        if (redisClient) {
            if (key) {
                await redisClient.del(key);
            } else {
                await redisClient.flushdb();
            }
        } else {
            if (key) {
                localCache.del(key);
            } else {
                localCache.flushAll();
            }
        }
    } catch (error) {
        console.error('Clear Cache Error:', error);
    }
};

module.exports = { cacheMiddleware, clearCache };
