const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { sendOTPEmail } = require('../utils/brevoEmailService');

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
        const recentOTPs = await prisma.oTP.count({
            where: {
                email: email.toLowerCase(),
                purpose,
                createdAt: { gte: oneHourAgo }
            }
        });

        if (recentOTPs >= 5) {
            throw new Error('Too many OTP requests. Please try again later.');
        }

        // Delete any existing OTPs for this email and purpose
        await prisma.oTP.deleteMany({
            where: { email: email.toLowerCase(), purpose }
        });

        // Generate new OTP
        const otpCode = generateOTP();
        const hashedOTP = await bcrypt.hash(otpCode, 10);

        // Calculate expiry (10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Store OTP in database
        const otpDoc = await prisma.oTP.create({
            data: {
                email: email.toLowerCase(),
                otp: hashedOTP,
                purpose,
                expiresAt
            }
        });

        // Send OTP via email
        await sendOTPEmail(email, name, otpCode);

        return {
            success: true,
            otpId: otpDoc.id,
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
        const otpDoc = await prisma.oTP.findFirst({
            where: {
                email: email.toLowerCase(),
                purpose,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpDoc) {
            return {
                success: false,
                message: 'Invalid or expired OTP'
            };
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otpCode, otpDoc.otp);

        if (!isValid) {
            return {
                success: false,
                message: `Invalid OTP. Please check your email and try again.`
            };
        }

        // OTP is valid - delete it
        await prisma.oTP.delete({
            where: { id: otpDoc.id }
        });

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
        const otpDoc = await prisma.oTP.findFirst({
            where: {
                email: email.toLowerCase(),
                purpose,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpDoc) {
            return {
                exists: false
            };
        }

        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((otpDoc.expiresAt - now) / 1000));

        return {
            exists: true,
            remainingSeconds
        };
    } catch (error) {
        console.error('Error getting OTP status:', error);
        throw error;
    }
};

// Cleanup expired OTPs
const cleanupExpiredOTPs = async () => {
    try {
        const result = await prisma.oTP.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        });
        console.log(`Cleaned up expired OTPs`);
        return result.count;
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
