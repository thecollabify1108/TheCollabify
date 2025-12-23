/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role(s)
 */

/**
 * Check if user has one of the specified roles
 * @param  {...string} roles - Allowed roles
 */
const roleCheck = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This action requires one of the following roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Shorthand middleware for common role checks
 */
const isCreator = roleCheck('creator');
const isSeller = roleCheck('seller');
const isAdmin = roleCheck('admin');
const isAdminOrSeller = roleCheck('admin', 'seller');
const isAdminOrCreator = roleCheck('admin', 'creator');

module.exports = {
    roleCheck,
    isCreator,
    isSeller,
    isAdmin,
    isAdminOrSeller,
    isAdminOrCreator
};
