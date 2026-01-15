const bcrypt = require('bcryptjs');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/resendEmailService');

/**
 * OTP Service
 * Handles OTP generation, storage, verification, and cleanup
 */

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create and send OTP
const createAndSendOTP = async (email, name, purpose = 'registration') => {
    try {
        // Check rate limiting - max 5 OTPs per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentOTPs = await OTP.countDocuments({
            email,
            purpose,
            createdAt: { $gte: oneHourAgo }
        });

        if (recentOTPs >= 5) {
            throw new Error('Too many OTP requests. Please try again later.');
        }

        // Delete any existing OTPs for this email and purpose
        await OTP.deleteMany({ email, purpose });

        // Generate new OTP
        const otpCode = generateOTP();
        const hashedOTP = await bcrypt.hash(otpCode, 10);

        // Calculate expiry (10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Store OTP in database
        const otpDoc = await OTP.create({
            email,
            otp: hashedOTP,
            purpose,
            expiresAt
        });

        // Send OTP via email
        await sendOTPEmail(email, name, otpCode);

        return {
            success: true,
            otpId: otpDoc._id,
            expiresIn: 600 // seconds
        };
    } catch (error) {
        console.error('Error creating OTP:', error);
        throw error;
    }
};

// Verify OTP
const verifyOTP = async (email, otpCode, purpose = 'registration') => {
    try {
        // Find valid OTP
        const otpDoc = await OTP.findValidOTP(email, purpose);

        if (!otpDoc) {
            return {
                success: false,
                message: 'Invalid or expired OTP'
            };
        }

        // Check if OTP is expired
        if (otpDoc.isExpired()) {
            await otpDoc.deleteOne();
            return {
                success: false,
                message: 'OTP has expired. Please request a new one.'
            };
        }

        // Check attempts
        if (otpDoc.attempts >= 3) {
            await otpDoc.deleteOne();
            return {
                success: false,
                message: 'Too many failed attempts. Please request a new OTP.'
            };
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otpCode, otpDoc.otp);

        if (!isValid) {
            // Increment attempts
            await otpDoc.incrementAttempts();

            const attemptsLeft = 3 - otpDoc.attempts;
            return {
                success: false,
                message: `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
            };
        }

        // OTP is valid - delete it
        await otpDoc.deleteOne();

        return {
            success: true,
            message: 'OTP verified successfully'
        };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

// Check if OTP exists and get remaining time
const getOTPStatus = async (email, purpose = 'registration') => {
    try {
        const otpDoc = await OTP.findValidOTP(email, purpose);

        if (!otpDoc) {
            return {
                exists: false
            };
        }

        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((otpDoc.expiresAt - now) / 1000));

        return {
            exists: true,
            remainingSeconds,
            attemptsLeft: 3 - otpDoc.attempts
        };
    } catch (error) {
        console.error('Error getting OTP status:', error);
        throw error;
    }
};

// Cleanup expired OTPs (can be run periodically)
const cleanupExpiredOTPs = async () => {
    try {
        const result = await OTP.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up OTPs:', error);
        throw error;
    }
};

module.exports = {
    generateOTP,
    createAndSendOTP,
    verifyOTP,
    getOTPStatus,
    cleanupExpiredOTPs
};
