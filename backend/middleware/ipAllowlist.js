/**
 * IP Allowlisting middleware for admin endpoint protection
 * Restricts access to admin routes based on IP addresses
 */

const ipAllowlist = (req, res, next) => {
    // Get allowed IPs from environment variable
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];

    // If no IPs configured, deny all admin access
    if (allowedIPs.length === 0) {
        console.warn('⚠️  No ADMIN_ALLOWED_IPS configured - denying all admin access');
        return res.status(403).json({
            success: false,
            message: 'Admin access is not configured'
        });
    }

    // Get client IP (handle proxies)
    const clientIP = req.ip ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.connection.remoteAddress;

    // Normalize IPv6 localhost to IPv4
    const normalizedIP = clientIP === '::1' ? '127.0.0.1' : clientIP;

    // Check if IP is in allowlist
    const isAllowed = allowedIPs.includes(normalizedIP);

    if (!isAllowed) {
        console.warn(`🚫 Admin access denied for IP: ${normalizedIP} [Request ID: ${req.id}]`);
        return res.status(403).json({
            success: false,
            message: 'Access denied: Your IP address is not authorized for admin operations',
            requestId: req.id
        });
    }

    console.log(`✅ Admin access granted for IP: ${normalizedIP} [Request ID: ${req.id}]`);
    next();
};

module.exports = ipAllowlist;
