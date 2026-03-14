const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { auth, generateToken } = require('../middleware/auth');
const { createAndSendOTP, verifyOTP } = require('../services/otpService');
const { sendEmail } = require('../services/emailTemplates');
const { upload } = require('../services/storageService');

// ---------- helpers ----------

const setCookieToken = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

// Safely compare bcrypt hashes; returns false instead of throwing on malformed hashes.
const safeBcryptCompare = async (plain, maybeHash) => {
    if (!maybeHash || typeof maybeHash !== 'string') return false;
    // bcrypt hashes start with $2a$, $2b$, or $2y$
    if (!/^\$2[aby]\$/.test(maybeHash)) return false;
    try {
        return await bcrypt.compare(plain, maybeHash);
    } catch {
        return false;
    }
};

const sanitizeUser = (user) => {
    const out = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || null,
        activeRole: user.activeRole,
        emailVerified: user.emailVerified,
        reliabilityScore: user.reliabilityScore || 1.0,
        subscriptionTier: user.subscriptionTier || 'FREE',
        createdAt: user.createdAt
    };
    if (user.roles) out.availableRoles = user.roles.map(r => r.type);
    return out;
};

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
};

// ============================================================
// 0. REGISTRATION - Direct (email + password, no OTP)
// ============================================================
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().escape().isLength({ min: 2, max: 50 }),
    body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
        .withMessage('Password must be at least 8 chars with 1 uppercase, 1 lowercase, and 1 number'),
    body('role').isIn(['creator', 'seller']),
    handleValidation
], async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });

        let isAddingRole = false;

        if (existingUser) {
            const hasRole = existingUser.roles && existingUser.roles.some(r => r.type === role.toUpperCase());
            if (hasRole || (!existingUser.roles.length && existingUser.activeRole === role.toUpperCase())) {
                return res.status(400).json({ success: false, message: 'You already have a ' + role + ' account with this email' });
            }
            isAddingRole = true;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let user;

        if (isAddingRole) {
            user = await prisma.user.update({
                where: { email },
                data: {
                    activeRole: role.toUpperCase(),
                    emailVerified: true,
                    roles: { create: { type: role.toUpperCase(), password: hashedPassword } }
                },
                include: { roles: true }
            });
        } else {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    activeRole: role.toUpperCase(),
                    emailVerified: true,
                    authProvider: 'LOCAL',
                    roles: { create: { type: role.toUpperCase(), password: hashedPassword } }
                },
                include: { roles: true }
            });
        }

        const token = generateToken(user.id);
        setCookieToken(res, token);

        const tpl = role === 'creator' ? 'welcomeCreator' : 'welcomeSeller';
        sendEmail(user.email, tpl, user.name).catch(function (emailErr) {
            console.error('[Email] Welcome email failed (non-fatal):', emailErr.message);
        });

        try {
            const notifSvc = require('../services/notificationService');
            notifSvc.notifyWelcome(user.id, role).catch(function (notifErr) {
                console.error('[Notif] Welcome notif failed (non-fatal):', notifErr.message);
            });
        } catch (e2) {
            console.error('[Notif] Welcome notif module error:', e2.message);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: { token, user: sanitizeUser({ ...user, activeRole: role.toUpperCase() }) }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

// ============================================================
// 1. REGISTRATION - Step 1: send OTP
// ============================================================
router.post('/register/send-otp', [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().escape().isLength({ min: 2, max: 50 }),
    body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
        .withMessage('Password must be at least 8 chars with 1 uppercase, 1 lowercase, and 1 number'),
    body('role').isIn(['creator', 'seller']),
    handleValidation
], async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });

        let isAddingRole = false;

        if (existingUser) {
            const hasRole = existingUser.roles && existingUser.roles.some(r => r.type === role.toUpperCase());
            if (hasRole || (!existingUser.roles.length && existingUser.activeRole === role.toUpperCase())) {
                return res.status(400).json({ success: false, message: 'You already have a ' + role + ' account with this email' });
            }
            isAddingRole = true;
        }

        const result = await createAndSendOTP(email, name, 'registration');

        const tempData = Buffer.from(JSON.stringify({ email, name, password, role, isAddingRole })).toString('base64');

        const message = result.emailSent
            ? (isAddingRole ? 'OTP sent! Adding ' + role + ' role.' : 'OTP sent to your email. Check your inbox.')
            : 'Code generated. If you do not receive an email within 30s, tap Resend.';

        res.json({
            success: true,
            message,
            data: { tempUserId: tempData, expiresIn: result.expiresIn, isAddingRole, emailSent: result.emailSent }
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to send OTP.' });
    }
});

// ============================================================
// 2. REGISTRATION - Step 2: verify OTP and create account
// ============================================================
router.post('/register/verify-otp', [
    body('tempUserId').notEmpty(),
    body('otp').isLength({ min: 6, max: 6 }),
    handleValidation
], async (req, res) => {
    try {
        const { tempUserId, otp } = req.body;

        let userData;
        try {
            userData = JSON.parse(Buffer.from(tempUserId, 'base64').toString('utf-8'));
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid registration data. Please start over.' });
        }

        const { email, name, password, role, isAddingRole } = userData;

        // FIX #20: Pass shouldDelete: false. We only delete the OTP after successful DB op.
        // This ensures the OTP remains valid for a retry if this request times out or fails during hashing.
        const otpResult = await verifyOTP(email, otp, 'registration', false);
        if (!otpResult.success) {
            return res.status(400).json({ success: false, message: otpResult.message });
        }

        // FIX #21: Reduce bcrypt cost from 12 to 10.
        // Cost 10 takes ~100ms vs ~400ms for cost 12. Much faster for registration flow.
        const hashedPassword = await bcrypt.hash(password, 10);

        let user;

        if (isAddingRole) {
            user = await prisma.user.update({
                where: { email },
                data: {
                    activeRole: role.toUpperCase(),
                    emailVerified: true,
                    roles: { create: { type: role.toUpperCase(), password: hashedPassword } }
                },
                include: { roles: true }
            });
        } else {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    activeRole: role.toUpperCase(),
                    emailVerified: true,
                    authProvider: 'LOCAL',
                    roles: { create: { type: role.toUpperCase(), password: hashedPassword } }
                },
                include: { roles: true }
            });
        }

        // FIX #20: Delete OTP only AFTER successful user creation/update
        try {
            const prisma2 = require('../config/prisma');
            await prisma2.oTP.delete({ where: { id: otpResult.otpId } }).catch(() => { });
        } catch (e) { }

        const token = generateToken(user.id);
        setCookieToken(res, token);

        // Fire-and-forget welcome email — FIX #15: log errors instead of silently swallowing
        const tpl = role === 'creator' ? 'welcomeCreator' : 'welcomeSeller';
        sendEmail(user.email, tpl, user.name).catch(function (emailErr) {
            console.error('[Email] Welcome email failed (non-fatal):', emailErr.message);
        });

        try {
            const notifSvc = require('../services/notificationService');
            notifSvc.notifyWelcome(user.id, role).catch(function (notifErr) {
                console.error('[Notif] Welcome notif failed (non-fatal):', notifErr.message);
            });
        } catch (e2) {
            console.error('[Notif] Welcome notif module error:', e2.message);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: { token, user: sanitizeUser({ ...user, activeRole: role.toUpperCase() }) }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

// ============================================================
// 3. REGISTRATION - Resend OTP
// ============================================================
router.post('/register/resend-otp', [
    body('tempUserId').notEmpty(),
    handleValidation
], async (req, res) => {
    try {
        const { tempUserId } = req.body;

        let userData;
        try {
            userData = JSON.parse(Buffer.from(tempUserId, 'base64').toString('utf-8'));
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid data. Please restart registration.' });
        }

        const result = await createAndSendOTP(userData.email, userData.name, 'registration');

        res.json({
            success: true,
            message: result.emailSent ? 'New code sent!' : 'Code generated. Check your email.',
            data: { expiresIn: result.expiresIn, emailSent: result.emailSent }
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to resend code.' });
    }
});

// ============================================================
// 4. LOGIN
// ============================================================
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('role').optional().isIn(['creator', 'seller']),
    handleValidation
], async (req, res) => {
    try {
        const email = req.body.email;
        const password = String(req.body.password || '').trim();
        const role = req.body.role;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
        }

        let isMatch = false;
        let matchedRole = null;

        // --- Try role-specific passwords first (UserRole table) ---
        if (user.roles && user.roles.length > 0) {
            if (role) {
                const roleObj = user.roles.find(r => r.type === role.toUpperCase());
                if (roleObj) {
                    isMatch = await safeBcryptCompare(password, roleObj.password);
                    matchedRole = role.toUpperCase();
                }
            } else {
                // FIX #17: use const/let — var hoists out of for-block causing subtle bugs
                for (let i = 0; i < user.roles.length; i++) {
                    const match = await safeBcryptCompare(password, user.roles[i].password);
                    if (match) {
                        isMatch = true;
                        matchedRole = user.roles[i].type;
                        break;
                    }
                }
            }
        }

        // --- Fallback: check User.password directly (covers admin + legacy accounts) ---
        if (!isMatch && user.password) {
            const directMatch = await safeBcryptCompare(password, user.password);
            if (directMatch) {
                isMatch = true;
                matchedRole = role ? role.toUpperCase() : (user.activeRole || 'CREATOR');
            }
        }

        if (!isMatch) {
            let debug = '';
            if (email === 'admin@thecollabify.tech' && process.env.NODE_ENV !== 'production_stale') {
                debug = ` (Debug: roles=${user.roles.length}, fallback=${!!user.password})`;
            }
            return res.status(401).json({ success: false, message: 'Invalid email or password' + debug });
        }

        prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }).catch(function () { });

        const token = generateToken(user.id);
        setCookieToken(res, token);

        res.json({
            success: true,
            message: 'Login successful',
            data: { token, user: sanitizeUser({ ...user, activeRole: matchedRole }) }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
});

// ============================================================
// 5. GET CURRENT USER
// ============================================================
router.get('/me', auth, async (req, res) => {
    try {
        const roles = await prisma.userRole.findMany({
            where: { userId: req.userId },
            select: { type: true }
        });

        res.json({
            success: true,
            data: { user: sanitizeUser({ ...req.user, roles }) }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user information' });
    }
});

// ============================================================
// 6. UPDATE PROFILE
// ============================================================
router.put('/update', auth, [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('avatar').optional().isURL(),
    handleValidation
], async (req, res) => {
    try {
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.avatar) updateData.avatar = req.body.avatar;

        const user = await prisma.user.update({ where: { id: req.userId }, data: updateData });

        res.json({
            success: true,
            message: 'Profile updated',
            data: { user: { id: user.id, email: user.email, name: user.name, role: user.activeRole, avatar: user.avatar } }
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// ============================================================
// 7. UPLOAD AVATAR
// ============================================================
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });

        const avatarUrl = req.file.path;
        await prisma.user.update({ where: { id: req.userId }, data: { avatar: avatarUrl } });

        res.json({ success: true, message: 'Avatar updated', avatar: avatarUrl });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload avatar' });
    }
});

// ============================================================
// 8. CHANGE PASSWORD (authenticated)
// ============================================================
router.post('/change-password', auth, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    handleValidation
], async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { roles: true } });

        const roleObj = user.roles.find(r => r.type === (user.activeRole || 'CREATOR'));
        if (!roleObj) return res.status(400).json({ success: false, message: 'User role not found' });

        const isMatch = await safeBcryptCompare(currentPassword, roleObj.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.userRole.updateMany({ where: { userId: user.id }, data: { password: hashed } });
        await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
});

// ============================================================
// 9. SET PASSWORD (Google OAuth users)
// ============================================================
router.post('/set-password', auth, [
    body('password').isLength({ min: 6 }),
    body('confirmPassword').custom(function (v, obj) { if (v !== obj.req.body.password) throw new Error('Passwords do not match'); return true; }),
    handleValidation
], async (req, res) => {
    try {
        const hashed = await bcrypt.hash(req.body.password, 12);
        await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } });
        await prisma.userRole.updateMany({ where: { userId: req.userId }, data: { password: hashed } });

        res.json({ success: true, message: 'Password set successfully' });
    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ success: false, message: 'Failed to set password' });
    }
});

// ============================================================
// 10. FORGOT PASSWORD - send OTP
// ============================================================
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail(),
    handleValidation
], async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.json({ success: true, message: 'If this email is registered, you will receive a reset code.', data: { expiresIn: 600 } });
        }

        const result = await createAndSendOTP(email, user.name, 'password_reset');
        res.json({ success: true, message: 'Reset code sent to your email.', data: { expiresIn: result.expiresIn } });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Failed to send reset code.' });
    }
});

// ============================================================
// 11. RESET PASSWORD - verify OTP + update
// ============================================================
router.post('/reset-password', [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }),
    body('newPassword').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }),
    handleValidation
], async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const otpResult = await verifyOTP(email, otp, 'password_reset');
        if (!otpResult.success) return res.status(400).json({ success: false, message: otpResult.message });

        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({ where: { email }, data: { password: hashed } });
        await prisma.userRole.updateMany({ where: { user: { email } }, data: { password: hashed } });

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
});

// ============================================================
// 12. GOOGLE OAUTH
// ============================================================
router.post('/google', async (req, res) => {
    try {
        const { email, name, googleId, avatar, role: requestedRole } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ success: false, message: 'Email and Google ID are required' });
        }

        const finalRole = (requestedRole && ['creator', 'seller'].includes(requestedRole.toLowerCase()))
            ? requestedRole.toUpperCase()
            : 'CREATOR';

        let user = await prisma.user.findFirst({
            where: { OR: [{ email }, { googleId }] },
            include: { roles: true }
        });

        if (user) {
            // FIX #17: use const instead of var
            const updateData = { lastLogin: new Date() };
            if (!user.googleId) { updateData.googleId = googleId; updateData.authProvider = 'GOOGLE'; }
            if (!user.avatar && avatar) updateData.avatar = avatar;
            if (!user.emailVerified) updateData.emailVerified = true;
            updateData.activeRole = finalRole;

            const hasRole = user.roles && user.roles.some(r => r.type === finalRole);
            if (!hasRole) {
                updateData.roles = { create: { type: finalRole, password: crypto.randomBytes(32).toString('hex') } };
            }

            user = await prisma.user.update({ where: { id: user.id }, data: updateData, include: { roles: true } });

            if (!user.isActive) {
                return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
            }
        } else {
            user = await prisma.user.create({
                data: {
                    email, name, googleId,
                    avatar: avatar || null,
                    authProvider: 'GOOGLE',
                    emailVerified: true,
                    activeRole: finalRole,
                    roles: { create: { type: finalRole, password: crypto.randomBytes(32).toString('hex') } }
                },
                include: { roles: true }
            });

            try {
                const notifSvc2 = require('../services/notificationService');
                notifSvc2.notifyWelcome(user.id, finalRole).catch(function (err) {
                    console.error('[Notif] Google welcome notif failed (non-fatal):', err.message);
                });
            } catch (e3) {
                console.error('[Notif] Google welcome notif module error:', e3.message);
            }
        }

        const token = generateToken(user.id);
        setCookieToken(res, token);

        res.json({
            success: true,
            message: 'Google authentication successful',
            data: { token, user: sanitizeUser({ ...user, activeRole: finalRole }) }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ success: false, message: 'Google authentication failed.' });
    }
});

// ============================================================
// 13. LOGOUT
// ============================================================
router.post('/logout', function (req, res) {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================================
// 14. NEWSLETTER
// ============================================================
router.post('/newsletter', [
    body('email').isEmail().normalizeEmail(),
    handleValidation
], async (req, res) => {
    try {
        const { email } = req.body;
        const existing = await prisma.subscriber.findUnique({ where: { email } });

        if (existing) {
            if (!existing.isActive) {
                await prisma.subscriber.update({ where: { email }, data: { isActive: true } });
                return res.json({ success: true, message: 'Welcome back! Resubscribed.' });
            }
            return res.json({ success: true, message: 'Already subscribed.' });
        }

        await prisma.subscriber.create({ data: { email } });
        res.status(201).json({ success: true, message: 'Subscribed!' });
    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({ success: false, message: 'Failed to subscribe.' });
    }
});

module.exports = router;
