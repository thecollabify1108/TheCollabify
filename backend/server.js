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

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

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

// ===== SECURITY MIDDLEWARE STACK =====

// 1. Request ID Tracking (FIRST - for audit trails)
app.use(requestTracker);

// 2. Production-grade security headers
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
    // Cross-Origin resource policy
    crossOriginResourcePolicy: {
        policy: 'same-site'
    }
}));

// 3. Compression & Logging
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 4. Global Rate Limiting (100 req/15min per IP)
app.use(globalLimiter);

// CORS Configuration
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
    credentials: true
}));

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
        app.use('/api/creators', require('./routes/creators'));
        app.use('/api/sellers', require('./routes/sellers'));
        app.use('/api/notifications', require('./routes/notifications'));
        app.use('/api/chat', require('./routes/chat'));

        // Admin routes: IP allowlisting required
        app.use('/api/admin', ipAllowlist, require('./routes/admin'));

        // Public routes
        app.use('/api/search', require('./routes/search'));
        app.use('/api/leaderboard', require('./routes/leaderboard'));
        app.use('/api/achievements', require('./routes/achievements'));
        app.use('/api/public', require('./routes/public'));
        app.use('/api/analytics', require('./routes/analytics'));
        app.use('/api/calendar', require('./routes/contentCalendar'));
        app.use('/api/team', require('./routes/teamManagement'));
        app.use('/api/ai', require('./routes/ai'));
        app.use('/api/payments', require('./routes/payments'));
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

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

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
