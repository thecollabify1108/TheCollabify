const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { auth, generateToken } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { notifyWelcome } = require('../services/notificationService');
const { createAndSendOTP, verifyOTP } = require('../services/otpService');

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
 * @route   POST /api/auth/register/send-otp
 * @desc    Send OTP for email verification during registration
 * @access  Public
 */
router.post('/register/send-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['creator', 'seller']).withMessage('Role must be either creator or seller'),
    handleValidation
], async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Generate and send OTP
        const result = await createAndSendOTP(email, name, 'registration');

        // Store user data temporarily (in production, use Redis or session)
        // For now, we'll send it back encrypted or use session storage
        const tempData = Buffer.from(JSON.stringify({ email, name, password, role })).toString('base64');

        res.json({
            success: true,
            message: 'OTP sent to your email. Please check your inbox.',
            data: {
                tempUserId: tempData,
                expiresIn: result.expiresIn
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

        const { email, name, password, role } = userData;

        // Verify OTP
        const otpResult = await verifyOTP(email, otp, 'registration');

        if (!otpResult.success) {
            return res.status(400).json({
                success: false,
                message: otpResult.message
            });
        }

        // Check if user already exists (double-check)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user with email verified
        const user = await User.create({
            email,
            password,
            name,
            role,
            emailVerified: true
        });

        // Generate token
        const token = generateToken(user._id);

        // Send welcome notification
        try {
            await notifyWelcome(user._id, role);
        } catch (err) {
            console.error('Failed to send welcome notification:', err);
        }

        // Set HTTPOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            message: 'Email verified! Registration successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: user.emailVerified
                },
                token
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
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
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

        // Set HTTPOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token // Still send token for backward compatibility during transition
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
    handleValidation
], async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');

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

        // Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Set HTTPOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar
                },
                token // Still send token for backward compatibility during transition
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
        const user = await User.findById(req.userId);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    createdAt: user.createdAt
                }
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

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
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

        const user = await User.findOne({ email });

        // Always respond with success to prevent email enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account with that email exists, we sent a password reset OTP.'
            });
        }

        // Generate and send OTP
        const result = await createAndSendOTP(email, user.name, 'password-reset');

        res.json({
            success: true,
            message: 'Password reset OTP sent to your email. Please check your inbox.',
            data: {
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
 * @desc    Verify OTP and reset password
 * @access  Public
 */
router.post('/password-reset/verify-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidation
], async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or OTP'
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

        // Update password
        user.password = newPassword;
        await user.save();

        // Generate token for auto-login
        const token = generateToken(user._id);

        // Set HTTPOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Password reset successful! You are now logged in.',
            data: {
                token // Still send token for backward compatibility
            }
        });
    } catch (error) {
        console.error('Verify OTP password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email (OLD - Token-based, kept for backward compatibility)
 * @access  Public
 */
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    handleValidation
], async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        // Always respond with success to prevent email enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account with that email exists, we sent a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = user.generateResetToken();
        await user.save();

        // Send email
        await sendPasswordResetEmail(email, resetToken, user.name);

        res.json({
            success: true,
            message: 'If an account with that email exists, we sent a password reset link.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request'
        });
    }
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password/:token', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidation
], async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Generate new token for auto-login
        const authToken = generateToken(user._id);

        // Set HTTPOnly cookie
        res.cookie('token', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Password reset successful',
            data: {
                token: authToken // Still send token for backward compatibility
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
});

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

        const user = await User.findById(req.userId).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

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

        const user = await User.findById(req.userId).select('+password');

        // Check if user already has a password set
        // Google OAuth users have random hex password, check if it's hex format
        const hasRealPassword = user.password && !/^[a-f0-9]{64}$/.test(user.password);

        if (hasRealPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password already set. Use change password instead.'
            });
        }

        // Set new password
        user.password = password;
        await user.save();

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

        // Check if user exists with this email
        let user = await User.findOne({ email });

        if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                if (avatar && !user.avatar) {
                    user.avatar = avatar;
                }
                await user.save();
            }

            // Check if account is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account has been deactivated. Please contact support.'
                });
            }
        } else {
            // New user - need to ask for role
            // For now, default to 'creator' - can be changed later
            // In production, you might want to redirect to a role selection page
            user = await User.create({
                email,
                name,
                googleId,
                avatar,
                role: 'creator', // Default role for Google sign-ups
                password: crypto.randomBytes(32).toString('hex') // Random password for Google users
            });

            // Send welcome notification
            try {
                await notifyWelcome(user._id, user.role);
            } catch (err) {
                console.error('Failed to send welcome notification:', err);
            }
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Set HTTPOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: user.createdAt === user.updatedAt ? 'Registration successful' : 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar
                },
                token // Still send token for backward compatibility
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
