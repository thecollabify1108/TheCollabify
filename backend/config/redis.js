const Redis = require('ioredis');

let redisClient = null;
let subClient = null;

const initRedis = () => {
    if (!process.env.REDIS_URL) {
        console.log('⚠️ No REDIS_URL found. Redis features will be disabled or fall back to local memory.');
        return null;
    }

    try {
        const redisUrl = new URL(process.env.REDIS_URL);
        const options = {
            retryStrategy: (times) => Math.min(times * 50, 2000),
            maxRetriesPerRequest: 3,
            enableOfflineQueue: false
        };

        // Azure Redis requires TLS
        if (redisUrl.protocol === 'rediss:' || process.env.NODE_ENV === 'production') {
            options.tls = { servername: redisUrl.hostname };
        }

        redisClient = new Redis(process.env.REDIS_URL, options);

        // Secondary client for Pub/Sub (required for Socket.io adapter)
        subClient = redisClient.duplicate();

        redisClient.on('error', (err) => {
            console.error('❌ Redis Error:', err.message);
        });

        redisClient.on('connect', () => {
            console.log('✅ Connected to Redis');
        });

        return { redisClient, subClient };
    } catch (error) {
        console.error('❌ Critical Redis Init Error:', error.message);
        return null;
    }
};

const getRedisClient = () => redisClient;
const getSubClient = () => subClient;

const isRedisEnabled = () => !!redisClient;

module.exports = {
    initRedis,
    getRedisClient,
    getSubClient,
    isRedisEnabled
};
