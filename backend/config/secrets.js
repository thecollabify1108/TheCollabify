const { createClient } = require('@1password/op-js');
const dotenv = require('dotenv');

// Load .env as fallback
dotenv.config();

/**
 * Secret Management Service
 * Prioritizes 1Password for production secrets with local .env fallback.
 */

class SecretManager {
    constructor() {
        this.client = null;
        this.token = process.env.OP_SERVICE_ACCOUNT_TOKEN;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        if (this.token) {
            try {
                this.client = createClient({
                    auth: this.token
                });
                console.log('🛡️  1Password Secret Management Initialized');
                this.isInitialized = true;
            } catch (error) {
                console.warn('⚠️  Failed to initialize 1Password. Falling back to .env');
                console.error(error);
            }
        } else {
            console.log('ℹ️  No OP_SERVICE_ACCOUNT_TOKEN found. Using .env for secrets.');
            this.isInitialized = true;
        }
    }

    /**
     * Get a secret by its name/reference
     * @param {string} key - Environment variable key
     * @param {string} opReference - 1Password secret reference (op://vault/item/field)
     */
    async getSecret(key, opReference) {
        if (!this.isInitialized) await this.initialize();

        // Try 1Password first if client is available and reference is provided
        if (this.client && opReference) {
            try {
                const secret = await this.client.items.get(opReference);
                return secret.fields.find(f => f.label === 'password' || f.label === 'value')?.value || process.env[key];
            } catch (error) {
                console.warn(`⚠️  Failed to fetch secret ${key} from 1Password. Using .env fallback.`);
                return process.env[key];
            }
        }

        // Default to environment variable
        return process.env[key];
    }

    /**
     * Load all critical secrets
     */
    async loadSecrets() {
        await this.initialize();

        // Example Mapping: Define references for 1Password
        const mappings = {
            DATABASE_URL: 'op://Production/PostgreSQL/connection-url',
            JWT_SECRET: 'op://Production/Backend/jwt-secret',
            GOOGLE_CLIENT_SECRET: 'op://Production/OAuth/google-secret'
        };

        const secrets = {};
        for (const [key, ref] of Object.entries(mappings)) {
            secrets[key] = await this.getSecret(key, ref);
            // Update process.env for compatibility with existing code
            if (secrets[key]) process.env[key] = secrets[key];
        }

        return secrets;
    }
}

module.exports = new SecretManager();
