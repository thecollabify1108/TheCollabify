// New Relic APM — must be loaded FIRST but only if license key is configured
// Wrapped in try-catch so a missing/invalid key never crashes the server
if (process.env.NEW_RELIC_LICENSE_KEY) {
    try { require('newrelic'); } catch (e) { console.warn('⚠️  NewRelic failed to load:', e.message); }
}
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');

// Load environment variables FIRST (Critical for middleware config)
dotenv.config();

const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');

// Advanced Security Middleware
const requestTracker = require('./middleware/requestTracker');
const { globalLimiter, authLimiter, apiLimiter, strictLimiter } = require('./middleware/rateLimiter');
const ipAllowlist = require('./middleware/ipAllowlist');
const apiKeyAuth = require('./middleware/apiKeyAuth');

// Resilience Middleware
const { timeoutMiddleware, timeoutErrorHandler } = require('./middleware/timeout');
const { cacheMiddleware } = require('./middleware/cache');

// Error Handling Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { setupProcessHandlers, gracefulShutdown } = require('./utils/processHandlers');

// Friction Detection Scheduler (M12 fix: runs automatically every 24h)
const { startFrictionScheduler, stopFrictionScheduler } = require('./services/frictionScheduler');


// Sentry Error Monitoring — wrapped defensively
let sentryErrorHandler = (err, req, res, next) => next(err); // fallback noop
try {
    const Sentry = require('@sentry/node');
    const sentry = require('./config/sentry');
    sentryErrorHandler = sentry.sentryErrorHandler;
    console.log('✅ Sentry module loaded');
} catch (e) {
    console.warn('⚠️  Sentry failed to load (non-fatal):', e.message);
}

// Swagger API Documentation — wrapped defensively
let swaggerUi = null;
let swaggerSpec = null;
try {
    swaggerUi = require('swagger-ui-express');
    swaggerSpec = require('./config/swagger');
    console.log('✅ Swagger loaded');
} catch (e) {
    console.warn('⚠️  Swagger failed to load (non-fatal):', e.message);
}

// Validate environment variables — NEVER crash the server for missing vars
try {
    const { validateEnv, validateJWTSecret } = require('./utils/envValidator');
    console.log('🔍 [Startup] Validating environment...');
    validateEnv();
    try { validateJWTSecret(); } catch (jwtErr) {
        console.warn('⚠️  [Startup] JWT_SECRET warning:', jwtErr.message);
    }
    console.log('✅ [Startup] Environment validated');
} catch (e) {
    console.error('❌ [Startup] Environment validation failed:', e.message);
    // DO NOT process.exit() — let the server start so Azure health check passes
    // The app will fail gracefully on DB/auth calls if critical vars are truly missing
}

// Setup process-level error handlers (unhandled rejections, exceptions)
setupProcessHandlers();

const app = express();
const PORT = process.env.PORT || 8080;
console.log(`🔍 [Startup] Port configured: ${PORT}`);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    const requestedHeaders = req.headers['access-control-request-headers'];

    // Helper: is this origin allowed?
    const isOriginAllowed = (o) => {
        if (!o) return true; // no origin = server-to-server, always allow
        // Localhost (any port) in all environments
        if (o.startsWith('http://localhost:') || o.startsWith('http://127.0.0.1:')) return true;
        // Any *.thecollabify.tech subdomain + apex domain + Cloudflare Pages
        if (/^https:\/\/([\w-]+\.)*thecollabify[\w-]*\.(tech|pages\.dev)$/.test(o)) return true;
        // Raw Azure hostname (needed when Cloudflare proxy is bypassed)
        if (o === 'https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net') return true;
        return false;
    };

    if (isOriginAllowed(origin)) {
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', requestedHeaders || 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-KEY');
            res.setHeader('Access-Control-Max-Age', '86400');
            res.setHeader('Vary', 'Origin');
        }
    } else {
        console.warn(`CORS Blocked Origin: ${origin}`);
    }

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Diagnostic Ping - Absolute first route, no dependencies
app.get('/api/ping', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'pong',
        timestamp: new Date().toISOString()
    });
});

// Diagnostic Routes list - only in non-production or if special key provided
app.get('/api/routes', (req, res) => {
    // Basic route exploration
    const paths = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) { // routes registered directly on the app
            paths.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') { // router middleware
            const parentPath = middleware.regexp.toString()
                .replace('\\/?(?=\\/|$)', '')
                .replace('^\\', '')
                .replace('\\', '');
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    const path = handler.route.path;
                    paths.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${parentPath}${path}`);
                }
            });
        }
    });
    res.json({ success: true, count: paths.length, paths: paths.sort() });
});

// CRITICAL: Initialize Sentry DEFENSIVELY
try {
    initSentry(app);
} catch (e) {
    console.error('💥 CRITICAL: initSentry crashed synchronously:', e.message);
}

// Redis Configuration
const { initRedis, isRedisEnabled } = require('./config/redis');
initRedis();

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// CRITICAL: Early health check for Azure - runs before complex modules
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        early: true,
        port: PORT,
        redis: isRedisEnabled() ? 'connected' : 'disabled/disconnected'
    });
});

// Track initialization status
let prisma = null;
let passport = null;
let initializeSocketServer = null;
let isFullyInitialized = false;
let initError = null;

// ===== SECURITY & RESILIENCE MIDDLEWARE STACK =====

// 1. Request ID Tracking
app.use(requestTracker);

// 2. Global Timeout
app.use(timeoutMiddleware);

// 3. Production-grade security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'none'"],
            connectSrc: ["'self'", "https://thecollabify.tech", "https://*.thecollabify.tech", "https://www.googleapis.com", "https://*.azurewebsites.net"],
            frameSrc: ["'none'"],
            frameAncestors: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            manifestSrc: ["'none'"]
        }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    hidePoweredBy: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 4. Compression & Logging
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 5. Global Rate Limiting
app.use(globalLimiter);

// 6. Standard Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Warn if SESSION_SECRET is not set in production (but don't crash)
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.warn('⚠️ SESSION_SECRET not set in production. Using fallback. Set it in Azure Environment Variables!');
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Initialize complex modules asynchronously
const initializeModules = async () => {
    try {
        console.log('🔄 Loading modules...');

        // 1. Load Prisma
        try {
            prisma = require('./config/prisma');
            console.log('✅ Prisma loaded');
        } catch (e) {
            console.error('❌ Prisma load failed:', e.message);
            throw e;
        }

        // 2. Test database connection
        try {
            await prisma.$queryRaw`SELECT 1`;
            console.log('✅ Database connected');
        } catch (e) {
            console.error('❌ Database connection failed:', e.message);
        }

        // 3. Load Passport
        try {
            passport = require('./config/passport');
            app.use(passport.initialize());
            app.use(passport.session());
            console.log('✅ Passport initialized');
        } catch (e) {
            console.error('❌ Passport initialization failed:', e.message);
        }

        // 4. Load Socket.io
        try {
            initializeSocketServer = require('./socketServer');
            console.log('✅ Socket.io loaded');
        } catch (e) {
            console.error('❌ Socket.io load failed:', e.message);
        }

        // 5. Heavy logic that can stay async
        // (Socket.io, DB connection testing, etc.)

        isFullyInitialized = true;
        console.log('🚀 Full initialization complete!');

    } catch (error) {
        console.error('❌ Module initialization failed:', error);
        initError = error;
    }
};

// Full API health check (with database)
app.get('/api/health', async (req, res) => {
    try {
        if (!isFullyInitialized) {
            return res.status(503).json({
                status: 'initializing',
                error: initError?.message,
                port: PORT
            });
        }
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'postgresql', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'DB connection failed', error: error.message });
    }
});

// Register Routes — each wrapped in try-catch so one broken route can't crash the server
const safeRoute = (path, ...handlers) => {
    try {
        app.use(path, ...handlers);
    } catch (e) {
        console.error(`❌ Failed to load route ${path}:`, e.message);
    }
};

try { safeRoute('/api/auth', authLimiter, require('./routes/auth')); } catch (e) { console.error('auth route failed:', e.message); }
try { safeRoute('/api/auth/password-reset', strictLimiter, require('./routes/passwordReset')); } catch (e) { console.error('passwordReset route failed:', e.message); }
try { safeRoute('/api/oauth', require('./routes/oauth')); } catch (e) { console.error('oauth route failed:', e.message); }
try { safeRoute('/api/search', cacheMiddleware(300), require('./routes/search')); } catch (e) { console.error('search route failed:', e.message); }
try { safeRoute('/api/leaderboard', cacheMiddleware(300), require('./routes/leaderboard')); } catch (e) { console.error('leaderboard route failed:', e.message); }
try { safeRoute('/api/achievements', cacheMiddleware(300), require('./routes/achievements')); } catch (e) { console.error('achievements route failed:', e.message); }
try { safeRoute('/api/public', cacheMiddleware(300), require('./routes/public')); } catch (e) { console.error('public route failed:', e.message); }
try { safeRoute('/api/creators', require('./routes/creators')); } catch (e) { console.error('creators route failed:', e.message); }
try { safeRoute('/api/sellers', require('./routes/sellers')); } catch (e) { console.error('sellers route failed:', e.message); }
try { safeRoute('/api/notifications', require('./routes/notifications')); } catch (e) { console.error('notifications route failed:', e.message); }
try { safeRoute('/api/chat', require('./routes/chat')); } catch (e) { console.error('chat route failed:', e.message); }
try { safeRoute('/api/admin', ipAllowlist, require('./routes/admin')); } catch (e) { console.error('admin route failed:', e.message); }
try { safeRoute('/api/analytics', require('./routes/analytics')); } catch (e) { console.error('analytics route failed:', e.message); }
try { safeRoute('/api/calendar', require('./routes/contentCalendar')); } catch (e) { console.error('calendar route failed:', e.message); }
try { safeRoute('/api/team', require('./routes/teamManagement')); } catch (e) { console.error('team route failed:', e.message); }
try { safeRoute('/api/ai', require('./routes/ai')); } catch (e) { console.error('ai route failed:', e.message); }
try { safeRoute('/api/collaboration', require('./routes/collaboration')); } catch (e) { console.error('collaboration route failed:', e.message); }

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'TheCollabify API',
        status: isFullyInitialized ? 'ready' : 'initializing'
    });
});

// ===== ERROR HANDLING (MUST BE LAST) =====
app.use(notFoundHandler);
app.use(timeoutErrorHandler);
app.use(sentryErrorHandler);
app.use(errorHandler);

// Start background initialization
initializeModules().catch(err => {
    console.error('💥 Background initialization failed:', err);
});

// Start Server
const server = http.createServer(app);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, '0.0.0.0', async () => {
        console.log(`✅ Server listening on port ${PORT}`);

        // Start friction detection scheduler (runs every 24h automatically)
        startFrictionScheduler();

        if (initializeSocketServer) {
            try {
                const { io, sendNotification, broadcastCampaignUpdate, sendBulkNotification } = initializeSocketServer(server);
                app.locals.sendNotification = sendNotification;
                app.locals.broadcastCampaignUpdate = broadcastCampaignUpdate;
                app.locals.sendBulkNotification = sendBulkNotification;
                console.log('✅ Socket.io initialized');
            } catch (e) {
                console.error('❌ Socket.io initialization failed:', e.message);
            }
        }
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => { stopFrictionScheduler(); gracefulShutdown(server, prisma); });
    process.on('SIGINT', () => { stopFrictionScheduler(); gracefulShutdown(server, prisma); });
}

// Export for testing
module.exports = app;

