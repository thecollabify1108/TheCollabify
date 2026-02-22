/**
 * Environment Variable Validator
 * Ensures all required environment variables are present before startup
 */

const requiredEnvVars = {
    // Database
    DATABASE_URL: 'PostgreSQL connection string',

    // Authentication
    JWT_SECRET: 'Secret key for JWT token signing (must be strong and random)',

    // Session
    SESSION_SECRET: 'Secret key for session management',

    // Google OAuth
    GOOGLE_CLIENT_ID: 'Google OAuth Client ID',
    GOOGLE_CLIENT_SECRET: 'Google OAuth Client Secret',
    GOOGLE_CALLBACK_URL: 'Google OAuth Callback URL',

    // Push Notifications
    VAPID_PUBLIC_KEY: 'VAPID Public Key',
    VAPID_PRIVATE_KEY: 'VAPID Private Key',
    VAPID_EMAIL: 'VAPID Email',

    // Email Service
    EMAIL_HOST: 'SMTP Host',
    EMAIL_USER: 'SMTP User',
    EMAIL_PASS: 'SMTP Password',

    // Monitoring
    NEW_RELIC_LICENSE_KEY: 'New Relic License Key for APM',
};

const optionalEnvVars = {
    // Server
    PORT: '5000',
    NODE_ENV: 'development',
    FRONTEND_URL: 'http://localhost:5173',

    // JWT
    JWT_EXPIRE: '7d',

    // Monitoring (optional but recommended for production)
    SENTRY_DSN: undefined,

    // Admin Security (optional)
    ADMIN_ALLOWED_IPS: '127.0.0.1,::1',

    // Redis (optional — falls back to in-memory)
    REDIS_URL: undefined,
};

/**
 * Validate environment variables
 * @param {boolean} strictMode - If true, throws error on missing required vars
 */
function validateEnv(strictMode = process.env.NODE_ENV === 'production') {
    const missing = [];
    const warnings = [];

    // Check required variables
    for (const [key, description] of Object.entries(requiredEnvVars)) {
        if (!process.env[key] || process.env[key].trim() === '') {
            missing.push(`${key}: ${description}`);
        }
    }

    // Warn about missing optional but recommended variables in production
    if (strictMode) {
        const recommendedProd = ['EMAIL_HOST', 'EMAIL_USER', 'SENTRY_DSN'];
        for (const key of recommendedProd) {
            if (!process.env[key]) {
                warnings.push(`${key} is not set (recommended for production)`);
            }
        }
    }

    // Set defaults for optional variables
    for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
        if (!process.env[key] && defaultValue !== undefined) {
            process.env[key] = defaultValue;
        }
    }

    // Report results
    if (missing.length > 0) {
        console.error('\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
        missing.forEach(msg => console.error(`   - ${msg}`));

        if (strictMode) {
            console.error('\n💥 Cannot start server without required environment variables in production mode.');
            console.error('   Please set these variables in your .env file or deployment configuration.\n');
            throw new Error('Missing required environment variables');
        } else {
            console.warn('\n⚠️  WARNING: Missing required environment variables (continuing in development mode)\n');
        }
    } else {
        console.log('✅ All required environment variables are set');
    }

    if (warnings.length > 0) {
        console.warn('\n⚠️  PRODUCTION WARNINGS:');
        warnings.forEach(msg => console.warn(`   - ${msg}`));
        console.warn('');
    }

    return {
        isValid: missing.length === 0,
        missing,
        warnings
    };
}

/**
 * Validate JWT_SECRET strength
 */
function validateJWTSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;

    // In production, enforce that JWT_SECRET is at least 32 characters.
    // A weak secret makes authentication trivially breakable.
    if (process.env.NODE_ENV === 'production' && secret.length < 32) {
        throw new Error(
            `Weak JWT_SECRET detected (length: ${secret.length}). ` +
            'Set a secret of at least 32 random characters in Azure App Service Configuration.'
        );
    }

    return true;
}

module.exports = {
    validateEnv,
    validateJWTSecret
};
