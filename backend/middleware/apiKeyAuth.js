const KeyRotationService = require('../services/keyRotation');

/**
 * API Key Authentication Middleware
 * Validates API keys for protected endpoints
 */

const apiKeyAuth = async (req, res, next) => {
    try {
        // Get API key from header
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'API key required',
                requestId: req.id
            });
        }

        // Validate the key
        const validKey = await KeyRotationService.validateKey(apiKey);

        if (!validKey) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired API key',
                requestId: req.id
            });
        }

        // Attach key info to request
        req.apiKey = {
            id: validKey.id,
            serviceName: validKey.serviceName,
            userId: validKey.userId
        };

        console.log(`✅ API key validated: ${validKey.serviceName} [Request ID: ${req.id}]`);
        next();
    } catch (error) {
        console.error('API key validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'API key validation failed',
            requestId: req.id
        });
    }
};

module.exports = apiKeyAuth;
