const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
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

// Sentry Error Monitoring
const { initSentry, sentryErrorHandler } = require('./config/sentry');

// Load environment variables FIRST
dotenv.config();

// Setup process-level error handlers (unhandled rejections, exceptions)
setupProcessHandlers();

const app = express();
const PORT = process.env.PORT || 8080;

// 0. MANUAL PREFLIGHT — ABSOLUTE FIRST (runs before Sentry, Health Checks, etc.)
const ALLOWED_ORIGINS = [
    'https://thecollabify.tech',
    'https://www.thecollabify.tech',
    process.env.FRONTEND_URL
].filter(Boolean);

function isOriginAllowed(origin) {
    if (!origin) return true;
    if (origin.includes('localhost')) return true;
    if (/https:\/\/.*\.vercel\.app$/.test(origin)) return true;
    if (/https:\/\/.*\.pages\.dev$/.test(origin)) return true;
    const normalized = origin.replace(/\/$/, '');
    return ALLOWED_ORIGINS.some(ao => ao && ao.replace(/\/$/, '') === normalized);
}

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,X-API-KEY');
    }
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// CRITICAL: Initialize Sentry FIRST (before any middleware)
initSentry(app);

// CRITICAL: Early health check for Azure - runs before complex modules
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', early: true, port: PORT });
});

// Track initialization status
let prisma = null;
let passport = null;
let initializeSocketServer = null;
let isFullyInitialized = false;
let initError = null;

// ===== SECURITY & RESILIENCE MIDDLEWARE STACK =====

// 1. Request ID Tracking (for audit trails)
app.use(requestTracker);

// 2. Global Timeout (Prevents hanging requests)
app.use(timeoutMiddleware);

// 3. Production-grade security headers
app.use(helmet({
    // Content Security Policy for API endpoints
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'none'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            frameAncestors: ["'none'"],
            scriptSrc: ["'none'"],
            styleSrc: ["'none'"],
            imgSrc: ["'none'"],
            fontSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            manifestSrc: ["'none'"]
        }
    },
    // HTTP Strict Transport Security (HSTS)
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    // Prevent clickjacking
    frameguard: {
        action: 'deny'
    },
    // Prevent MIME type sniffing
    noSniff: true,
    // Disable X-Powered-By header
    hidePoweredBy: true,
    // Referrer Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    // Cross-Origin embedder policy
    crossOriginEmbedderPolicy: false, // Not needed for API
    // Cross-Origin opener policy — MUST be disabled for Google OAuth popup flow
    crossOriginOpenerPolicy: false,
    // Cross-Origin resource policy — must be 'cross-origin' for API serving a different-origin frontend
    crossOriginResourcePolicy: {
        policy: 'cross-origin'
    }
}));

// 4. CORS — MUST run before rate limiter so preflight OPTIONS gets headers
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        // Allow localhost in development
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
            return callback(null, true);
        }

        // Allow Vercel preview deploys
        if (origin.match(/https:\/\/.*\.vercel\.app$/)) {
            return callback(null, true);
        }

        // Allow Cloudflare Pages preview deploys
        if (origin.match(/https:\/\/.*\.pages\.dev$/)) {
            return callback(null, true);
        }

        // Allow production domains
        const allowedOrigins = [
            'https://thecollabify.tech',
            'https://www.thecollabify.tech',
            process.env.FRONTEND_URL
        ].filter(Boolean);

        const normalizedOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some(ao => ao && ao.replace(/\/$/, "") === normalizedOrigin);

        if (isAllowed) return callback(null, true);
        return callback(new Error('CORS blocked'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
}));

// 5. Compression & Logging
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 6. Global Rate Limiting (100 req/15min per IP)
app.use(globalLimiter);

// Standard Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-session-secret-key',
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
        prisma = require('./config/prisma');
        console.log('✅ Prisma loaded');

        // 2. Test database connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connected');

        // 3. Load Passport
        passport = require('./config/passport');
        app.use(passport.initialize());
        app.use(passport.session());
        console.log('✅ Passport initialized');

        // 4. Load Socket.io
        initializeSocketServer = require('./socketServer');
        console.log('✅ Socket.io loaded');

        // 5. Load Routes with specialized security
        // Auth routes: strict rate limiting (5 req/15min)
        app.use('/api/auth', authLimiter, require('./routes/auth'));
        app.use('/api/auth/password-reset', strictLimiter, require('./routes/passwordReset'));
        app.use('/api/oauth', require('./routes/oauth'));

        // Standard API routes
        // Cache these heavy, public, rarely-changing routes (5 mins)
        app.use('/api/search', cacheMiddleware(300), require('./routes/search'));
        app.use('/api/leaderboard', cacheMiddleware(300), require('./routes/leaderboard'));
        app.use('/api/achievements', cacheMiddleware(300), require('./routes/achievements'));
        app.use('/api/public', cacheMiddleware(300), require('./routes/public'));

        // No cache for dynamic/private routes
        app.use('/api/creators', require('./routes/creators'));
        app.use('/api/sellers', require('./routes/sellers'));
        app.use('/api/notifications', require('./routes/notifications'));
        app.use('/api/chat', require('./routes/chat'));

        // Admin routes: IP allowlisting required
        app.use('/api/admin', ipAllowlist, require('./routes/admin'));

        // Other routes
        app.use('/api/analytics', require('./routes/analytics'));
        app.use('/api/calendar', require('./routes/contentCalendar'));
        app.use('/api/team', require('./routes/teamManagement'));
        app.use('/api/ai', require('./routes/ai'));
        app.use('/api/payments', require('./routes/payments'));
        app.use('/api/collaboration', require('./routes/collaboration'));
        console.log('✅ Routes loaded with security middleware');

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
        res.json({
            status: 'ok',
            database: 'postgresql',
            security: 'hardened',
            resilience: 'enabled',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'DB connection failed',
            error: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'TheCollabify API',
        status: isFullyInitialized ? 'ready' : 'initializing'
    });
});

// ===== ERROR HANDLING (MUST BE LAST) =====

// 404 Not Found Handler - catches undefined routes
app.use(notFoundHandler);

// Timeout Handler (catches timed out requests)
app.use(timeoutErrorHandler);

// Sentry Error Handler - captures 5xx errors for monitoring (BEFORE custom handler)
app.use(sentryErrorHandler);

// Global Error Handler - catches all errors
app.use(errorHandler);

// Start Server
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', async () => {
    console.log(`✅ Server listening on port ${PORT}`);

    // Initialize modules AFTER server is listening
    // This ensures Azure health checks pass while we're loading
    await initializeModules();

    // Initialize Socket.io after modules are loaded
    if (initializeSocketServer) {
        const { io, sendNotification, broadcastCampaignUpdate, sendBulkNotification } = initializeSocketServer(server);
        app.locals.sendNotification = sendNotification;
        app.locals.broadcastCampaignUpdate = broadcastCampaignUpdate;
        app.locals.sendBulkNotification = sendBulkNotification;
        console.log('✅ Socket.io initialized');
    }
});

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown(server, prisma));
process.on('SIGINT', () => gracefulShutdown(server, prisma));
