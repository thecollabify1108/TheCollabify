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

        const userRole = req.user.activeRole ? req.user.activeRole.toUpperCase() : null;
        const requiredRoles = roles.map(r => r.toUpperCase());

        if (!userRole || !requiredRoles.includes(userRole)) {
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
const isCreator = roleCheck('CREATOR');
const isSeller = roleCheck('SELLER');
const isAdmin = roleCheck('ADMIN');
const isAdminOrSeller = roleCheck('ADMIN', 'SELLER');
const isAdminOrCreator = roleCheck('ADMIN', 'CREATOR');

module.exports = {
    roleCheck,
    isCreator,
    isSeller,
    isAdmin,
    isAdminOrSeller,
    isAdminOrCreator
};
