const crypto = require('crypto');
const prisma = require('../config/prisma');

/**
 * API Key Rotation Service
 * Handles secure generation, rotation, and validation of API keys
 */

class KeyRotationService {
    /**
     * Generate a secure random API key
     * @returns {string} 256-bit hex encoded key
     */
    static generateKey() {
        return crypto.randomBytes(32).toString('hex'); // 256-bit key
    }

    /**
     * Create a new API key
     * @param {Object} options - Key creation options
     * @param {string} options.serviceName - Name of the service
     * @param {string} [options.userId] - Optional user ID
     * @param {string} [options.description] - Optional description
     * @param {number} [options.expiryDays=90] - Days until expiration
     * @returns {Promise<Object>} Created API key object
     */
    static async createKey({ serviceName, userId = null, description = null, expiryDays = 90 }) {
        const key = this.generateKey();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        const apiKey = await prisma.apiKey.create({
            data: {
                key,
                serviceName,
                userId,
                description,
                expiresAt,
                isActive: true
            }
        });

        return apiKey;
    }

    /**
     * Rotate an existing API key
     * @param {string} oldKeyId - ID of the key to rotate
     * @param {number} [gracePeriodDays=7] - Grace period for old key
     * @returns {Promise<Object>} New API key object
     */
    static async rotateKey(oldKeyId, gracePeriodDays = 7) {
        // Get the old key
        const oldKey = await prisma.apiKey.findUnique({
            where: { id: oldKeyId }
        });

        if (!oldKey) {
            throw new Error('API key not found');
        }

        // Create new key with same settings
        const newKey = await this.createKey({
            serviceName: oldKey.serviceName,
            userId: oldKey.userId,
            description: oldKey.description
        });

        // Update old key with grace period
        const graceExpiresAt = new Date();
        graceExpiresAt.setDate(graceExpiresAt.getDate() + gracePeriodDays);

        await prisma.apiKey.update({
            where: { id: oldKeyId },
            data: {
                expiresAt: graceExpiresAt,
                rotatedFrom: newKey.id
            }
        });

        console.log(`🔄 API key rotated: ${oldKey.serviceName} (grace period: ${gracePeriodDays} days)`);

        return newKey;
    }

    /**
     * Validate an API key
     * @param {string} key - API key to validate
     * @returns {Promise<Object|null>} API key object if valid, null otherwise
     */
    static async validateKey(key) {
        const apiKey = await prisma.apiKey.findUnique({
            where: { key },
            include: { user: true }
        });

        // Check if key exists
        if (!apiKey) {
            return null;
        }

        // Check if key is active
        if (!apiKey.isActive) {
            return null;
        }

        // Check if key has expired
        if (new Date() > apiKey.expiresAt) {
            // Deactivate expired key
            await prisma.apiKey.update({
                where: { id: apiKey.id },
                data: { isActive: false }
            });
            return null;
        }

        // Update last used timestamp
        await prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() }
        });

        return apiKey;
    }

    /**
     * Deactivate an API key
     * @param {string} keyId - ID of the key to deactivate
     */
    static async deactivateKey(keyId) {
        await prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false }
        });

        console.log(`🔒 API key deactivated: ${keyId}`);
    }

    /**
     * Clean up expired keys (run periodically)
     */
    static async cleanupExpiredKeys() {
        const result = await prisma.apiKey.updateMany({
            where: {
                expiresAt: { lt: new Date() },
                isActive: true
            },
            data: { isActive: false }
        });

        console.log(`🧹 Cleaned up ${result.count} expired API keys`);
        return result.count;
    }

    /**
     * List all active keys for a service
     * @param {string} serviceName - Name of the service
     * @returns {Promise<Array>} List of active API keys
     */
    static async listKeys(serviceName = null) {
        const where = {
            isActive: true,
            ...(serviceName && { serviceName })
        };

        return await prisma.apiKey.findMany({
            where,
            select: {
                id: true,
                serviceName: true,
                description: true,
                expiresAt: true,
                createdAt: true,
                lastUsedAt: true
                // Don't return the actual key
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

module.exports = KeyRotationService;
