/**
 * Platform Settings Service
 *
 * Reads and writes key-value platform settings from the PlatformSetting table.
 * Used for feature flags like EARLY_BIRD_MODE.
 *
 * Falls back to environment variable or default if DB is unavailable.
 */

const prisma = require('../config/prisma');

// In-memory cache to reduce DB hits (30s TTL)
const cache = new Map(); // key → { value, expiresAt }
const CACHE_TTL = 30_000; // ms

const getSetting = async (key, defaultValue = null) => {
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) return cached.value;

    try {
        const row = await prisma.platformSetting.findUnique({ where: { key } });
        const value = row ? row.value : defaultValue;
        cache.set(key, { value, expiresAt: now + CACHE_TTL });
        return value;
    } catch (err) {
        console.warn(`[PlatformSettings] Failed to read ${key}:`, err.message);
        return defaultValue;
    }
};

const setSetting = async (key, value, updatedByUserId = null) => {
    const strValue = String(value);
    await prisma.platformSetting.upsert({
        where: { key },
        update: { value: strValue, updatedBy: updatedByUserId },
        create: { key, value: strValue, updatedBy: updatedByUserId }
    });
    // Invalidate cache
    cache.delete(key);
};

/**
 * Returns true if platform is in Early Bird mode (free collaborations).
 * Reads from DB, falls back to env var, then defaults to true (safe default for launch).
 */
const isEarlyBirdMode = async () => {
    // Env var override: EARLY_BIRD_MODE=false disables early bird regardless of DB
    if (process.env.EARLY_BIRD_MODE === 'false') return false;
    if (process.env.EARLY_BIRD_MODE === 'true') return true;

    const val = await getSetting('EARLY_BIRD_MODE', 'true');
    return val === 'true';
};

module.exports = { getSetting, setSetting, isEarlyBirdMode };
