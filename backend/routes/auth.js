const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { auth, generateToken } = require('../middleware/auth');
const { notifyWelcome } = require('../services/notificationService');
const { createAndSendOTP, verifyOTP } = require('../services/otpService');
const { sendEmail } = require('../services/emailTemplates');
// Removed legacy emailService

/**
 * SECURITY: Secure cookie configuration helper
 * Sets HttpOnly, Secure, and SameSite=Strict for production
 */
const setCookieToken = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,                    // Prevents XSS access via JavaScript
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        sameSite: 'strict',                // CSRF protection (strict for same-site only)
        maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
    });
};

/**
 * SECURITY: Sanitize user object - remove sensitive fields
 * Never return passwords, tokens, or sensitive data in API responses
 */
const sanitizeUser = (user) => {
    const sanitized = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || null,
        activeRole: user.activeRole,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
    };

    // Add optional fields if they exist
    if (user.roles) {
        sanitized.availableRoles = user.roles.map(r => r.type);
    }
    if (user.stripeOnboardingComplete !== undefined) {
        sanitized.stripeOnboardingComplete = user.stripeOnboardingComplete;
    }

    return sanitized;
};

/**
 * Validation middleware
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
// @route   POST /api/auth/register/send-otp
// @desc    Send OTP for email verification during registration
// @access  Public
router.post('/register/send-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('name').trim().escape().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage('Password must be at least 8 chars with 1 uppercase, 1 lowercase, and 1 number'),
    body('role').isIn(['creator', 'seller']).withMessage('Role must be either creator or seller'),
    handleValidation
], async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });

        let isAddingRole = false;

        if (existingUser) {
            // Check if user already has this role
            if (existingUser.roles && existingUser.roles.length > 0) {
                const hasRole = existingUser.roles.some(r => r.type === role.toUpperCase());
                if (hasRole) {
                    return res.status(400).json({
                        success: false,
                        message: `You already have a ${role} account with this email`
                    });
                }
                isAddingRole = true;
            } else if (existingUser.activeRole === role.toUpperCase()) {
                return res.status(400).json({
                    success: false,
                    message: `You already have a ${role} account with this email`
                });
            } else {
                isAddingRole = true;
            }
        }

        // Generate and send OTP
        const result = await createAndSendOTP(email, name, 'registration');

        // Store user data temporarily
        const tempData = Buffer.from(JSON.stringify({ email, name, password, role, isAddingRole })).toString('base64');

        res.json({
            success: true,
            message: isAddingRole
                ? `OTP sent! You're adding ${role} role to your account.`
                : 'OTP sent to your email. Please check your inbox.',
            data: {
                tempUserId: tempData,
                expiresIn: result.expiresIn,
                isAddingRole
            }
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send OTP. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/register/verify-otp
 * @desc    Verify OTP and complete registration
 * @access  Public
 */
router.post('/register/verify-otp', [
    body('tempUserId').notEmpty().withMessage('User data is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    handleValidation
], async (req, res) => {
    try {
        const { tempUserId, otp } = req.body;

        // Decode temporary user data
        let userData;
        try {
            const decoded = Buffer.from(tempUserId, 'base64').toString('utf-8');
            userData = JSON.parse(decoded);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }

        const { email, name, password, role, isAddingRole } = userData;

        // Verify OTP
        const otpResult = await verifyOTP(email, otp, 'registration');

        if (!otpResult.success) {
            return res.status(400).json({
                success: false,
                message: otpResult.message
            });
        }

        // Check if adding to existing user or creating new
        let user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });
        let token;

        // Hash password manually before creating/updating
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (isAddingRole && user) {
            // Update existing user with new role
            user = await prisma.user.update({
                where: { email },
                data: {
                    activeRole: role.toUpperCase(),
                    emailVerified: true,
                    roles: {
                        create: {
                            type: role.toUpperCase(),
                            password: hashedPassword
                        }
                    }
                }
            });

            token = generateToken(user.id);

        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    activeRole: role.toUpperCase(),
                    emailVerified: true,
                    roles: {
                        create: {
                            type: role.toUpperCase(),
                            password: hashedPassword
                        }
                    }
                }
            });

            token = generateToken(user.id);
        }

        // Send welcome notification
        try {
            await notifyWelcome(user._id, role);

            // Send welcome email based on role
            if (role === 'creator') {
                await sendEmail(user.email, 'welcomeCreator', user.name);
            } else if (role === 'seller') {
                await sendEmail(user.email, 'welcomeSeller', user.name);
            }
        } catch (err) {
            console.error('Failed to send welcome notification/email:', err);
        }

        // Set secure HTTPOnly cookie (token NOT in response body)
        setCookieToken(res, token);

        res.status(201).json({
            success: true,
            message: 'Email verified! Registration successful',
            data: {
                user: sanitizeUser({ ...user, activeRole: role.toUpperCase() })
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/register/resend-otp
 * @desc    Resend OTP for registration
 * @access  Public
 */
router.post('/register/resend-otp', [
    body('tempUserId').notEmpty().withMessage('User data is required'),
    handleValidation
], async (req, res) => {
    try {
        const { tempUserId } = req.body;

        // Decode temporary user data
        let userData;
        try {
            const decoded = Buffer.from(tempUserId, 'base64').toString('utf-8');
            userData = JSON.parse(decoded);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }

        const { email, name } = userData;

        // Generate and send new OTP
        const result = await createAndSendOTP(email, name, 'registration');

        res.json({
            success: true,
            message: 'New OTP sent to your email',
            data: {
                expiresIn: result.expiresIn
            }
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to resend OTP. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (creator or seller)
 * @access  Public
 */
router.post('/register', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage('Weak password'),
    body('name').trim().escape().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('role').isIn(['creator', 'seller']).withMessage('Role must be either creator or seller'),
    handleValidation
], async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            name,
            role
        });

        // Generate token
        const token = generateToken(user._id);

        // Send welcome notification
        try {
            await notifyWelcome(user._id, role);
        } catch (err) {
            console.error('Failed to send welcome notification:', err);
        }

        // Set secure HTTPOnly cookie (token NOT in response body)
        setCookieToken(res, token);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: sanitizeUser({ ...user, activeRole: role.toUpperCase() })
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isIn(['creator', 'seller']).withMessage('Role must be creator or seller'),
    handleValidation
], async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Find user and include roles
        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated. Please contact support.'
            });
        }

        // Compare password based on role
        let isMatch = false;
        let matchedRole = null;

        if (user.roles && user.roles.length > 0) {
            if (role) {
                const roleObj = user.roles.find(r => r.type === role.toUpperCase());
                if (roleObj) {
                    isMatch = await bcrypt.compare(password, roleObj.password);
                    matchedRole = role.toUpperCase();
                }
            } else {
                // Try all roles
                for (const roleObj of user.roles) {
                    const match = await bcrypt.compare(password, roleObj.password);
                    if (match) {
                        isMatch = true;
                        matchedRole = roleObj.type;
                        break;
                    }
                }
            }
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: role
                    ? `Invalid password for ${role} role`
                    : 'Invalid email or password'
            });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Generate token
        const token = generateToken(user.id);

        // Set secure HTTPOnly cookie (token NOT in response body)
        setCookieToken(res, token);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: sanitizeUser({ ...user, activeRole: matchedRole })
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        res.json({
            success: true,
            data: {
                user: sanitizeUser(user)
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user information'
        });
    }
});

/**
 * @route   PUT /api/auth/update
 * @desc    Update current user
 * @access  Private
 */
router.put('/update', auth, [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
    handleValidation
], async (req, res) => {
    try {
        const { name, avatar } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (avatar) updateData.avatar = avatar;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.activeRole,
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

/**
 * @route   POST /api/auth/password-reset/send-otp
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post('/password-reset/send-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    handleValidation
], async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always respond with success to prevent email enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account with that email exists, we sent a password reset OTP.',
                data: {
                    tempUserId: Buffer.from(JSON.stringify({ email })).toString('base64'),
                    expiresIn: 600
                }
            });
        }

        // Generate and send OTP
        const result = await createAndSendOTP(email, user.name, 'password-reset');

        // Create tempUserId (base64 encoded email)
        const tempUserId = Buffer.from(JSON.stringify({ email })).toString('base64');

        res.json({
            success: true,
            message: 'Password reset OTP sent to your email. Please check your inbox.',
            data: {
                tempUserId,
                expiresIn: result.expiresIn
            }
        });
    } catch (error) {
        console.error('Send password reset OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send OTP. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/password-reset/verify-otp
 * @desc    Verify OTP (step 2 of 3)
 * @access  Public
 */
router.post('/password-reset/verify-otp', [
    body('tempUserId').notEmpty().withMessage('User data is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    handleValidation
], async (req, res) => {
    try {
        const { tempUserId, otp } = req.body;

        // Decode tempUserId to get email
        let email;
        try {
            const decoded = Buffer.from(tempUserId, 'base64').toString('utf-8');
            const data = JSON.parse(decoded);
            email = data.email;
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }

        // Verify OTP
        const otpResult = await verifyOTP(email, otp, 'password-reset');

        if (!otpResult.success) {
            return res.status(400).json({
                success: false,
                message: otpResult.message
            });
        }

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/password-reset/reset
 * @desc    Reset password (step 3 of 3)
 * @access  Public
 */
router.post('/password-reset/reset', [
    body('tempUserId').notEmpty().withMessage('User data is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidation
], async (req, res) => {
    try {
        const { tempUserId, newPassword } = req.body;

        // Decode tempUserId to get email
        let email;
        try {
            const decoded = Buffer.from(tempUserId, 'base64').toString('utf-8');
            const data = JSON.parse(decoded);
            email = data.email;
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash password manually
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password for ALL roles of this user for consistency during reset
        await prisma.userRole.updateMany({
            where: { userId: user.id },
            data: { password: hashedPassword }
        });

        // Also update legacy password field if needed (though we primarily use roles)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Generate token for auto-login
        const token = generateToken(user.id);

        // Set HTTPOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Password reset successful! You are now logged in.',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.activeRole
                }
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password. Please try again.'
        });
    }
});

// DELETED legacy token-based handles: /forgot-password and /reset-password/:token
// Use /password-reset/send-otp and /password-reset/reset instead

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (requires current password)
 * @access  Private
 */
router.post('/change-password', auth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    handleValidation
], async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { roles: true }
        });

        // Find the role password to compare against (using activeRole or primary role)
        const roleToMatch = user.activeRole || 'CREATOR';
        const roleObj = user.roles.find(r => r.type === roleToMatch);

        if (!roleObj) {
            return res.status(400).json({
                success: false,
                message: 'User role not found'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, roleObj.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.userRole.updateMany({
            where: { userId: user.id },
            data: { password: hashedPassword }
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

/**
 * @route   POST /api/auth/set-password
 * @desc    Set password for OAuth users (Google sign-up)
 * @access  Private
 */
router.post('/set-password', auth, [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    handleValidation
], async (req, res) => {
    try {
        const { password } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        // Set new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Ensure roles have this password too
        await prisma.userRole.updateMany({
            where: { userId: user.id },
            data: { password: hashedPassword }
        });

        res.json({
            success: true,
            message: 'Password set successfully! You can now login with email and password.'
        });
    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set password'
        });
    }
});

/**
 * @route   POST /api/auth/google
 * @desc    Login or Register with Google OAuth
 * @access  Public
 */
router.post('/google', async (req, res) => {
    try {
        const { email, name, googleId, avatar } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({
                success: false,
                message: 'Email and Google ID are required'
            });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });

        if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        googleId,
                        authProvider: 'GOOGLE',
                        avatar: avatar || user.avatar
                    },
                    include: { roles: true }
                });
            }

            // Check if account is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account has been deactivated. Please contact support.'
                });
            }
        } else {
            // New user - default to 'CREATOR'
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    googleId,
                    avatar: avatar || "",
                    authProvider: 'GOOGLE',
                    emailVerified: true,
                    activeRole: 'CREATOR',
                    roles: {
                        create: {
                            type: 'CREATOR',
                            password: crypto.randomBytes(32).toString('hex')
                        }
                    }
                },
                include: { roles: true }
            });

            // Send welcome notification
            try {
                await notifyWelcome(user.id, 'CREATOR');
            } catch (err) {
                console.error('Failed to send welcome notification:', err);
            }
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Generate token
        const token = generateToken(user.id);

        // Use activeRole or first role
        const userRole = user.activeRole || (user.roles[0] ? user.roles[0].type : 'CREATOR');

        // Set HTTPOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Google login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: userRole,
                    avatar: user.avatar,
                    availableRoles: user.roles.map(r => r.type)
                },
                token
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear HTTPOnly cookie)
 * @access  Public
 */
router.post('/logout', (req, res) => {
    try {
        // Clear the HTTPOnly cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

/**
 * @route   POST /api/auth/newsletter
 * @desc    Subscribe to newsletter
 * @access  Public
 */
router.post('/newsletter', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    handleValidation
], async (req, res) => {
    try {
        const { email } = req.body;
        const Subscriber = require('../models/Subscriber');

        // Check if already subscribed
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            if (!subscriber.isActive) {
                subscriber.isActive = true;
                await subscriber.save();
                return res.json({ success: true, message: 'Welcome back! You have been resubscribed.' });
            }
            return res.json({ success: true, message: 'You are already subscribed to our newsletter.' });
        }

        // Create new subscriber
        await Subscriber.create({ email });

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter!'
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again.'
        });
    }
});

module.exports = router;
