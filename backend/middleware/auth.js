const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
    try {
        let token;

        // Try to get token from cookie first (HTTPOnly secure method)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Fallback to Authorization header (for backward compatibility and API clients)
        else {
            const authHeader = req.header('Authorization');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided. Authorization denied.'
                });
            }

            token = authHeader.replace('Bearer ', '');
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user with optimized selection
        select: {
            id: true,
                email: true,
                    name: true,
                        activeRole: true,
                            isActive: true,
                                avatar: true
        }
    });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Token is invalid. User not found.'
        });
    }

    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            message: 'Account has been deactivated.'
        });
    }

    // Attach user to request
    req.user = user;
    // Backwards compatibility: ensure 'role' property exists if used elsewhere
    if (user.activeRole && !user.role) {
        req.user.role = user.activeRole.toLowerCase(); // roles are usually lowercase in frontend checks
    }
    req.userId = user.id;

    next();
} catch (error) {
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token is invalid.'
        });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token has expired. Please login again.'
        });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
        success: false,
        message: 'Server error during authentication.'
    });
}
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = { auth, generateToken };
