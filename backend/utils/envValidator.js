/**
 * Environment Variable Validator
 * Ensures all required environment variables are present before startup
 */

const requiredEnvVars = {
    // Database — app cannot function without this
    DATABASE_URL: 'PostgreSQL connection string',
    // Auth — app cannot authenticate users without this
    JWT_SECRET: 'Secret key for JWT token signing (must be strong and random)',
};

// These are important but missing ones should NOT crash the app — features degrade gracefully
const recommendedEnvVars = {
    SESSION_SECRET: 'Secret key for session management',
    GOOGLE_CLIENT_ID: 'Google OAuth Client ID (Google login disabled if missing)',
    GOOGLE_CLIENT_SECRET: 'Google OAuth Client Secret',
    GOOGLE_CALLBACK_URL: 'Google OAuth Callback URL',
    VAPID_PUBLIC_KEY: 'VAPID Public Key (push notifications disabled if missing)',
    VAPID_PRIVATE_KEY: 'VAPID Private Key',
    VAPID_EMAIL: 'VAPID Email',
    EMAIL_HOST: 'SMTP Host (email sending disabled if missing)',
    EMAIL_USER: 'SMTP User',
    EMAIL_PASS: 'SMTP Password',
    NEW_RELIC_LICENSE_KEY: 'New Relic License Key (APM monitoring disabled if missing)',
};

const optionalEnvVars = {
    PORT: '5000',
    NODE_ENV: 'development',
    FRONTEND_URL: 'http://localhost:5173',
    JWT_EXPIRE: '7d',
    SENTRY_DSN: undefined,
    ADMIN_ALLOWED_IPS: '127.0.0.1,::1',
    REDIS_URL: undefined,
};

/**
 * Validate environment variables
 * @param {boolean} strictMode - If true, throws error on missing *required* vars
 */
function validateEnv(strictMode = process.env.NODE_ENV === 'production') {
    const missing = [];
    const warnings = [];

    // Check truly required variables (missing = app cannot start)
    for (const [key, description] of Object.entries(requiredEnvVars)) {
        if (!process.env[key] || process.env[key].trim() === '') {
            missing.push(`${key}: ${description}`);
        }
    }

    // Check recommended variables (missing = warn only, feature degrades gracefully)
    for (const [key, description] of Object.entries(recommendedEnvVars)) {
        if (!process.env[key] || process.env[key].trim() === '') {
            warnings.push(`${key} not set — ${description}`);
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
        console.error('\n❌ MISSING CRITICAL ENVIRONMENT VARIABLES:');
        missing.forEach(msg => console.error(`   - ${msg}`));

        if (strictMode) {
            console.error('\n💥 Cannot start server without critical environment variables.');
            throw new Error('Missing required environment variables: ' + missing.map(m => m.split(':')[0]).join(', '));
        } else {
            console.warn('\n⚠️  WARNING: Missing critical environment variables (continuing in development mode)\n');
        }
    } else {
        console.log('✅ All critical environment variables are set');
    }

    if (warnings.length > 0) {
        console.warn('\n⚠️  MISSING RECOMMENDED ENV VARS (features will degrade gracefully):');
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
