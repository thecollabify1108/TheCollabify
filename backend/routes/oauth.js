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
 */
const setCookieToken = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,                    // Prevents XSS
        secure: process.env.NODE_ENV === 'production',  // HTTPS only
        sameSite: 'strict',                // CSRF protection
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

            // New user - redirect to complete registration
            if (user.isNewUser) {
                // Store Google profile data in session
                req.session.googleProfile = {
                    googleId: user.googleId,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar
                };

                // Redirect to registration completion page with role if specified
                const role = req.session.pendingRole || '';
                return res.redirect(`${FRONTEND_URL}/oauth/complete-registration?role=${role}`);
            }

            // Existing user - generate JWT and redirect to dashboard
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Set secure HTTPOnly cookie (NO token in URL)
            setCookieToken(res, token);

            // Redirect to appropriate dashboard (token in cookie, NOT URL)
            const dashboardPath = user.role === 'CREATOR'
                ? '/creator/dashboard'
                : user.role === 'SELLER'
                    ? '/seller/dashboard'
                    : '/admin';

            res.redirect(`${FRONTEND_URL}${dashboardPath}`);

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
            role: role.toUpperCase(),
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
            { userId: user.id, role: user.role },
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
                    role: user.role,
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
