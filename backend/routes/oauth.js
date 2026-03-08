const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Frontend URL for redirects (cross-domain OAuth flow)
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://thecollabify.tech';

/**
 * SECURITY: Secure cookie helper for OAuth
 * FIX #2: sameSite must be 'none' (not 'strict') for cross-domain OAuth redirects.
 * 'strict' prevents the browser from sending the cookie after a redirect from Google → backend → frontend.
 * secure must always be true — we are always on HTTPS in production.
 */
const setCookieToken = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,        // Always true — site is always HTTPS
        sameSite: 'none',    // Required for cross-domain OAuth redirect flow
        maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
    });
};

/**
 * @route   GET /api/oauth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get('/google', (req, res, next) => {
    // Store role in session if provided (for registration flow)
    if (req.query.role) {
        req.session.pendingRole = req.query.role;
    }

    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
});

/**
 * @route   GET /api/oauth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
        session: true
    }),
    async (req, res) => {
        try {
            const user = req.user;

            // New user — pass profile via a short-lived signed token so frontend
            // can call POST /oauth/google-login after the user selects their role
            if (user.isNewUser) {
                const profileToken = jwt.sign(
                    {
                        googleId: user.googleId,
                        email: user.email,
                        name: user.name,
                        avatar: user.avatar,
                        isGoogleProfile: true
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '10m' }
                );
                const role = req.session.pendingRole || '';
                return res.redirect(
                    `${FRONTEND_URL}/auth/callback?oauthProfile=${encodeURIComponent(profileToken)}&role=${encodeURIComponent(role)}`
                );
            }

            // Existing user — FIX #9: pass token as URL *fragment* (#) not query string.
            // Fragments are never sent to the server, never logged by Cloudflare/Azure, never
            // appear in Referer headers. AuthContext reads window.location.hash instead.
            const token = jwt.sign(
                { userId: user.id, role: user.activeRole },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            const dashboardPath = user.activeRole === 'CREATOR'
                ? '/creator/dashboard'
                : user.activeRole === 'SELLER'
                    ? '/seller/dashboard'
                    : '/admin';

            // Token in hash — not in query string (prevents server/CDN logging)
            res.redirect(`${FRONTEND_URL}${dashboardPath}#token=${encodeURIComponent(token)}`);

        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${FRONTEND_URL}/login?error=oauth_error`);
        }
    }
);

/**
 * @route   POST /api/oauth/complete-registration
 * @desc    Complete Google OAuth registration with role and optional password
 * @access  Public (requires session with Google profile data)
 */
router.post('/complete-registration', [
    body('role').isIn(['creator', 'seller']).withMessage('Valid role is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check if Google profile data exists in session
        if (!req.session.googleProfile) {
            return res.status(400).json({
                success: false,
                message: 'No Google authentication data found. Please sign in with Google again.'
            });
        }

        const { role, password } = req.body;
        const googleProfile = req.session.googleProfile;

        // Check if user already exists
        let existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: googleProfile.email },
                    { googleId: googleProfile.googleId }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Prepare user data
        const userData = {
            googleId: googleProfile.googleId,
            email: googleProfile.email,
            name: googleProfile.name,
            activeRole: role.toUpperCase(),
            authProvider: 'GOOGLE',
            avatar: googleProfile.avatar,
            isActive: true,
            lastLogin: new Date()
        };

        // Add password if provided
        if (password) {
            userData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.create({
            data: userData
        });

        // Add role to UserRole if applicable (for legacy parity)
        await prisma.userRole.create({
            data: {
                userId: user.id,
                type: role.toUpperCase(),
                password: password ? userData.password : ""
            }
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.activeRole },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Clear session data
        delete req.session.googleProfile;
        delete req.session.pendingRole;

        res.status(201).json({
            success: true,
            message: 'Registration completed successfully',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.activeRole ? user.activeRole.toLowerCase() : null,
                    avatar: user.avatar
                }
            }
        });

    } catch (error) {
        console.error('Complete registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete registration'
        });
    }
});

/**
 * @route   POST /api/oauth/google-login
 * @desc    Authenticate or register a user using Google profile data (frontend redirect flow)
 * @access  Public
 */
router.post('/google-login', [
    // FIX #3/#18: Accept either a signed profileToken (new secure flow) OR
    // the individual fields (legacy path — still validated). Backend verifies the
    // profileToken signature so the client can never forge a different identity.
    body('profileToken').optional(),
    body('email').optional().isEmail().normalizeEmail(),
    body('googleId').optional(),
    body('name').optional().trim().escape(),
    body('role').optional().isIn(['creator', 'seller'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        let email, name, googleId, avatar, role;

        if (req.body.profileToken) {
            // SECURE PATH: backend verifies the JWT it signed — client cannot forge this
            let decoded;
            try {
                decoded = jwt.verify(req.body.profileToken, process.env.JWT_SECRET);
            } catch (jwtErr) {
                return res.status(401).json({ success: false, message: 'Invalid or expired profile token. Please sign in with Google again.' });
            }
            if (!decoded.isGoogleProfile) {
                return res.status(401).json({ success: false, message: 'Invalid profile token type.' });
            }
            email = decoded.email;
            name = decoded.name;
            googleId = decoded.googleId;
            avatar = decoded.avatar;
            role = req.body.role;
        } else {
            // LEGACY PATH: accept raw fields (still used by old frontend versions)
            if (!req.body.email || !req.body.googleId || !req.body.name) {
                return res.status(400).json({ success: false, message: 'email, googleId, and name are required' });
            }
            email = req.body.email;
            name = req.body.name;
            googleId = req.body.googleId;
            avatar = req.body.avatar;
            role = req.body.role;
        }

        // Check if user exists by googleId
        let user = await prisma.user.findUnique({ where: { googleId } });

        if (!user) {
            // Check by email (link accounts)
            user = await prisma.user.findUnique({ where: { email } });

            if (user) {
                // Link Google to existing account
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId, authProvider: 'GOOGLE', avatar: avatar || user.avatar, lastLogin: new Date() }
                });
            }
        }

        if (!user) {
            // New user
            if (!role || !['creator', 'seller'].includes(role)) {
                // No role provided — need registration completion
                return res.status(202).json({
                    success: false,
                    code: 'ROLE_REQUIRED',
                    message: 'Role selection required to complete registration',
                    data: { email, name, googleId, avatar }
                });
            }

            const roleUpper = role.toUpperCase();
            user = await prisma.user.create({
                data: {
                    googleId,
                    email,
                    name,
                    activeRole: roleUpper,
                    authProvider: 'GOOGLE',
                    avatar: avatar || '',
                    isActive: true,
                    emailVerified: true,
                    lastLogin: new Date()
                }
            });

            await prisma.userRole.create({
                data: { userId: user.id, type: roleUpper, password: '' }
            });
        } else {
            await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.activeRole },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        setCookieToken(res, token);

        return res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.activeRole ? user.activeRole.toLowerCase() : null,
                    activeRole: user.activeRole ? user.activeRole.toLowerCase() : null,
                    avatar: user.avatar
                }
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ success: false, message: 'Google sign-in failed' });
    }
});

/**
 * @route   GET /api/oauth/session-data
 * @desc    Get Google profile data from session (for registration form)
 * @access  Public (requires session)
 */
router.get('/session-data', (req, res) => {
    if (!req.session.googleProfile) {
        return res.status(404).json({
            success: false,
            message: 'No session data found'
        });
    }

    res.json({
        success: true,
        data: {
            email: req.session.googleProfile.email,
            name: req.session.googleProfile.name,
            avatar: req.session.googleProfile.avatar
        }
    });
});

module.exports = router;
