/**
 * Lightweight sessionStorage cache for dashboard API responses.
 * Serves stale data instantly while fresh data loads in the background.
 * Default TTL: 30 seconds.
 */
const CACHE_PREFIX = '__dash_cache__';
const DEFAULT_TTL = 30_000; // 30 seconds

/**
 * Get cached data if still valid.
 * @param {string} key - Cache key
 * @returns {any|null} Parsed data or null if expired/missing
 */
export function getCached(key) {
    try {
        const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (!raw) return null;
        const { data, expiry } = JSON.parse(raw);
        if (Date.now() > expiry) {
            sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

/**
 * Store data in cache with TTL.
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in ms (default: 30s)
 */
export function setCache(key, data, ttl = DEFAULT_TTL) {
    try {
        sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
            data,
            expiry: Date.now() + ttl
        }));
    } catch {
        // quota exceeded — silently ignore
    }
}

/**
 * Clear all dashboard cache entries.
 */
export function clearDashboardCache() {
    try {
        const keys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
        }
        keys.forEach(k => sessionStorage.removeItem(k));
    } catch {
        // ignore
    }
}

/**
 * Fetch with cache-first strategy. Returns cached data immediately if available,
 * then fetches fresh data in the background and calls onUpdate.
 *
 * @param {string} cacheKey - Cache key
 * @param {Function} fetchFn - Async function returning the data
 * @param {Function} onUpdate - Called with fresh data when fetch completes
 * @param {number} ttl - Cache TTL in ms
 * @returns {any|null} Cached data (null if no cache)
 */
export async function fetchWithCache(cacheKey, fetchFn, onUpdate, ttl = DEFAULT_TTL) {
    const cached = getCached(cacheKey);

    // Always fetch fresh data (stale-while-revalidate)
    fetchFn()
        .then(data => {
            setCache(cacheKey, data, ttl);
            if (onUpdate) onUpdate(data);
        })
        .catch(err => {
            console.error(`Cache fetch failed for ${cacheKey}:`, err);
        });

    return cached;
}
