// Redis removed — using in-memory fallbacks for cache and rate limiting.
// All functions are no-ops so existing imports don't break.

const initRedis = () => { console.log('ℹ️  Redis disabled — using in-memory fallbacks'); };
const getRedisClient = () => null;
const getSubClient = () => null;
const isRedisEnabled = () => false;

module.exports = { initRedis, getRedisClient, getSubClient, isRedisEnabled };
