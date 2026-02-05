const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const passport = require('./config/passport');
const prisma = require('./config/prisma');
const secrets = require('./config/secrets');
const { securityHeaders, verifyCloudflare, apiLimiter } = require('./middleware/security');
const initializeSocketServer = require('./socketServer');

// Load environment variables fallback
dotenv.config();

const app = express();

// 1. Initial Infrastructure Setup
const startServer = async () => {
    try {
        // A. Load Secrets from 1Password (with .env fallback)
        await secrets.loadSecrets();

        // Azure App Service provides the port via process.env.PORT
        const PORT = process.env.PORT || 5000;
        const HOST = '0.0.0.0';

        // B. Global Security & Optimization
        // Azure App Service uses a front-end load balancer, so we trust it
        app.set('trust proxy', true);
        app.use(securityHeaders);
        app.use(compression());
        app.use(verifyCloudflare);

        // C. Logging
        if (process.env.NODE_ENV === 'production') {
            app.use(morgan('combined'));
        } else {
            app.use(morgan('dev'));
        }

        // D. API Rate Limiting
        app.use('/api', apiLimiter);

        // E. CORS Configuration
        app.use(cors({
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);
                if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
                    return callback(null, true);
                }
                if (origin.match(/https:\/\/.*\.vercel\.app$/)) {
                    return callback(null, true);
                }
                const allowedOrigins = [
                    'https://thecollabify.tech',
                    'https://www.thecollabify.tech'
                ];
                if (process.env.FRONTEND_URL) {
                    allowedOrigins.push(process.env.FRONTEND_URL);
                }
                const normalizedOrigin = origin.replace(/\/$/, "");
                const isAllowed = allowedOrigins.some(ao => ao.replace(/\/$/, "") === normalizedOrigin);
                if (isAllowed) return callback(null, true);

                return callback(new Error('CORS blocked'), false);
            },
            credentials: true
        }));

        // F. Standard Middleware
        app.use(cookieParser());
        app.use(express.json({ limit: '10kb' }));
        app.use(express.urlencoded({ extended: true, limit: '10kb' }));
        app.use(session({
            secret: process.env.SESSION_SECRET || 'elite-guardian-session-key',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            }
        }));

        // G. Authentication
        app.use(passport.initialize());
        app.use(passport.session());

        // H. API Routes
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
        app.use('/api/public', require('./routes/public'));
        app.use('/api/analytics', require('./routes/analytics'));
        app.use('/api/calendar', require('./routes/contentCalendar'));
        app.use('/api/team', require('./routes/teamManagement'));
        app.use('/api/ai', require('./routes/ai'));
        app.use('/api/payments', require('./routes/payments'));

        // I. Health & Error Handling
        app.get('/api/health', async (req, res) => {
            try {
                await prisma.$queryRaw`SELECT 1`;
                res.json({
                    status: 'ok',
                    database: 'postgresql',
                    security: 'hardened',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({ status: 'error', message: 'DB connection failed' });
            }
        });

        app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
        app.use((err, req, res, next) => {
            console.error('Error:', err.stack);
            res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || 'Internal Server Error'
            });
        });

        // J. Server & Socket Initialization
        const server = http.createServer(app);
        const { io, sendNotification, broadcastCampaignUpdate, sendBulkNotification } = initializeSocketServer(server);

        app.locals.sendNotification = sendNotification;
        app.locals.broadcastCampaignUpdate = broadcastCampaignUpdate;
        app.locals.sendBulkNotification = sendBulkNotification;

        server.listen(PORT, HOST, () => {
            console.log(`✅ Guardian Elite Server running on port ${PORT}`);
            console.log(`🛡️  Security: Hardened (Helmet + Cloudflare Verification)`);
            console.log(`🗝️  Secrets: Initialized via 1Password/Env`);
        });

    } catch (error) {
        console.error('❌ Critical failure during server startup:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
