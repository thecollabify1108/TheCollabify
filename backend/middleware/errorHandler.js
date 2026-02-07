/**
 * Production-Grade Error Handling Middleware
 * Centralized error handler for crash-safe backend
 */

/**
 * Custom Error Classes for better error categorization
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Sanitize error for logging - remove sensitive data
 */
const sanitizeError = (error) => {
    const sanitized = {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        timestamp: error.timestamp || new Date().toISOString()
    };

    // Remove sensitive data patterns
    if (sanitized.message) {
        sanitized.message = sanitized.message
            .replace(/password[=:]\s*\S+/gi, 'password=***')
            .replace(/token[=:]\s*\S+/gi, 'token=***')
            .replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=***');
    }

    return sanitized;
};

/**
 * Global Error Handler Middleware
 * MUST be placed AFTER all routes in server.js
 */
const errorHandler = (err, req, res, next) => {
    // Default to 500 server error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let isOperational = err.isOperational || false;

    // Log error securely (sanitized)
    const sanitizedError = sanitizeError(err);
    const logContext = {
        requestId: req.id,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.userId || 'anonymous',
        error: sanitizedError
    };

    // Log error based on severity
    if (statusCode >= 500) {
        console.error('🔴 SERVER ERROR:', JSON.stringify(logContext, null, 2));
        if (process.env.NODE_ENV !== 'production') {
            console.error('Stack trace:', err.stack);
        }
    } else {
        console.warn('⚠️  CLIENT ERROR:', JSON.stringify(logContext, null, 2));
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message || 'Validation failed';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    } else if (err.name === 'PrismaClientKnownRequestError') {
        // Prisma database errors
        if (err.code === 'P2002') {
            statusCode = 409;
            message = 'A record with this data already exists';
        } else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        } else {
            statusCode = 500;
            message = 'Database error occurred';
        }
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid data format';
    }

    // Production response (NO stack traces)
    const errorResponse = {
        success: false,
        message: message,
        requestId: req.id,
        timestamp: new Date().toISOString()
    };

    // Development: include stack trace for debugging
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
        errorResponse.error = err;
    }

    // Send response
    res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 * Place BEFORE the global error handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
    next(error);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError
};
