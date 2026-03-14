const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client with Azure-optimised connection settings.
 * Azure free-tier PostgreSQL has aggressive idle-connection timeouts.
 * - connection_limit: keep the pool small so Azure doesn't reject connections
 * - pool_timeout: wait up to 30s for a free connection (cold-start safe)
 * - connect_timeout: allow 30s for initial TCP handshake on cold DB
 */
const dbUrl = process.env.DATABASE_URL;
const prismaOpts = {};

// Only override datasource URL if we can actually enhance it
if (dbUrl) {
    const enhanced = appendPoolParams(dbUrl);
    if (enhanced !== dbUrl) {
        prismaOpts.datasources = { db: { url: enhanced } };
    }
}

const prisma = new PrismaClient(prismaOpts);

/**
 * Append connection-pool query params to DATABASE_URL if not already present.
 * This avoids requiring users to manually edit their env var.
 */
function appendPoolParams(url) {
    if (!url) return url;
    const sep = url.includes('?') ? '&' : '?';
    const extras = [];
    // Conservative defaults for small Azure tiers to avoid pool saturation.
    if (!url.includes('connection_limit')) extras.push('connection_limit=5');
    if (!url.includes('pool_timeout')) extras.push('pool_timeout=15');
    if (!url.includes('connect_timeout')) extras.push('connect_timeout=10');
    return extras.length ? `${url}${sep}${extras.join('&')}` : url;
}

// Only in development: log queries
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        console.log('Query: ' + e.query);
        console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
    });
}

/**
 * Warm up the database connection on module load.
 * This fires a trivial SELECT 1 so the TCP connection + TLS handshake
 * happen at boot time rather than on the first user request.
 */
prisma.$queryRaw`SELECT 1`
    .then(() => console.log('✅ Prisma DB connection warmed up'))
    .catch((err) => console.warn('⚠️  Prisma warmup query failed (will retry on first request):', err.message));

module.exports = prisma;
