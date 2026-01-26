const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const initializeSocketServer = require('./socketServer');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Trust proxy - required when running behind Render/Heroku reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet()); // Set security headers
app.use(compression()); // Compress responses

// Request logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined')); // Apache-style logging for production
} else {
    app.use(morgan('dev')); //Colored, concise logging for development
}

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 login/register attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Enhanced CORS configuration - support ALL Vercel deployments
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        // Allow localhost for development
        if (origin.includes('localhost')) return callback(null, true);

        // Allow ALL Vercel deployments (*.vercel.app)
        if (origin.match(/https:\/\/.*\.vercel\.app$/)) {
            return callback(null, true);
        }

        // Allow custom frontend URL from environment
        const allowedOrigins = [
            'https://thecollabify.tech',
            'https://www.thecollabify.tech'
        ];

        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }

        const normalizedOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some(ao => ao.replace(/\/$/, "") === normalizedOrigin);

        if (isAllowed) {
            return callback(null, true);
        }

        console.log(`CORS blocked origin: ${origin}`);
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true // Enable credentials (cookies) for cross-origin requests
}));

// Cookie parser middleware
app.use(cookieParser());

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parser with limits
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/password-reset', require('./routes/passwordReset'));
app.use('/api/oauth', require('./routes/oauth'));
app.use('/api/creators', require('./routes/creators'));
app.use('/api/sellers', require('./routes/sellers'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/search', require('./routes/search'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/achievements', require('./routes/achievements'));

// NEW ROUTES - Phase 2 Backend Integration
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/calendar', require('./routes/contentCalendar'));
app.use('/api/team', require('./routes/teamManagement'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/payments', require('./routes/payments'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Creator-Seller Marketplace API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Create HTTP server (required for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io for real-time features
const { io, sendNotification, broadcastCampaignUpdate, sendBulkNotification } = initializeSocketServer(server);

// Make Socket.io functions available to routes
app.locals.sendNotification = sendNotification;
app.locals.broadcastCampaignUpdate = broadcastCampaignUpdate;
app.locals.sendBulkNotification = sendBulkNotification;

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Required for Render to detect the port

server.listen(PORT, HOST, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔌 WebSocket server ready for real-time features`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API endpoints ready`);
});

module.exports = { app, server, io };
