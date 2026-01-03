const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { auth, generateToken } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { notifyWelcome } = require('../services/notificationService');
const { createAndSendOTP, verifyOTP } = require('../services/otpService');

// ... existing code ...

// ADD THESE NEW ROUTES BEFORE /forgot-password

/**
 * @route   POST /api/auth/forgot-password/send-otp
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post('/forgot-password/send-otp', [
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
                message: 'If an account exists, we sent a password reset code.'
            });
        }

        // Generate and send OTP
        const result = await createAndSendOTP(email, user.name, 'password-reset');

        // Store email temporarily
        const tempData = Buffer.from(JSON.stringify({ email })).toString('base64');

        res.json({
            success: true,
            message: 'Password reset code sent to your email',
            data: {
                tempUserId: tempData,
                expiresIn: result.expiresIn
            }
        });
    } catch (error) {
        console.error('Send password reset OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send password reset code'
        });
    }
});

/**
 * @route   POST /api/auth/forgot-password/verify-otp
 * @desc    Verify OTP for password reset
 * @access  Public
 */
router.post('/forgot-password/verify-otp', [
    body('tempUserId').notEmpty().withMessage('User data is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    handleValidation
], async (req, res) => {
    try {
        const { tempUserId, otp } = req.body;

        // Decode temp data
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

        const { email } = userData;

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
            message: 'OTP verified successfully. You can now reset your password.'
        });
    } catch (error) {
        console.error('Verify password reset OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed'
        });
    }
});

/**
 * @route   POST /api/auth/forgot-password/reset-password
 * @desc    Reset password after OTP verification
 * @access  Public
 */
router.post('/forgot-password/reset-password', [
    body('tempUserId').notEmpty().withMessage('User data is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidation
], async (req, res) => {
    try {
        const { tempUserId, newPassword } = req.body;

        // Decode temp data
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

        const { email } = userData;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
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
