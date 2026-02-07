/**
 * Process-Level Error Handlers
 * Handles unhandled rejections and uncaught exceptions safely
 */

/**
 * Setup process-level error handlers
 * Call this once in server.js
 */
const setupProcessHandlers = () => {
    /**
     * Unhandled Promise Rejections
     * Occurs when a promise is rejected but no .catch() handler exists
     */
    process.on('unhandledRejection', (reason, promise) => {
        console.error('🚨 UNHANDLED PROMISE REJECTION:');
        console.error('Reason:', reason);
        console.error('Promise:', promise);

        // Log error details (sanitized)
        const errorLog = {
            type: 'UnhandledRejection',
            timestamp: new Date().toISOString(),
            reason: reason instanceof Error ? reason.message : String(reason),
            stack: reason instanceof Error ? reason.stack : undefined
        };
        console.error(JSON.stringify(errorLog, null, 2));

        // In production, gracefully shutdown
        if (process.env.NODE_ENV === 'production') {
            console.error('⚠️  Shutting down due to unhandled rejection...');
            process.exit(1);
        }
    });

    /**
     * Uncaught Exceptions
     * Synchronous errors that weren't caught
     */
    process.on('uncaughtException', (error) => {
        console.error('🚨 UNCAUGHT EXCEPTION:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);

        const errorLog = {
            type: 'UncaughtException',
            timestamp: new Date().toISOString(),
            message: error.message,
            name: error.name,
            stack: error.stack
        };
        console.error(JSON.stringify(errorLog, null, 2));

        // Uncaught exceptions are critical - must exit
        console.error('💥 Application in unstable state. Shutting down...');
        process.exit(1);
    });

    /**
     * SIGTERM - Graceful shutdown signal
     */
    process.on('SIGTERM', () => {
        console.log('👋 SIGTERM received. Starting graceful shutdown...');
        // Server will handle the actual shutdown
        process.exit(0);
    });

    /**
     * SIGINT - Ctrl+C in terminal
     */
    process.on('SIGINT', () => {
        console.log('👋 SIGINT received. Starting graceful shutdown...');
        process.exit(0);
    });

    console.log('✅ Process-level error handlers initialized');
};

/**
 * Graceful shutdown helper
 * Closes server and database connections cleanly
 */
const gracefulShutdown = async (server, prisma) => {
    console.log('🛑 Initiating graceful shutdown...');

    // Stop accepting new connections
    server.close(() => {
        console.log('✅ HTTP server closed');
    });

    // Close database connections
    if (prisma) {
        try {
            await prisma.$disconnect();
            console.log('✅ Database connections closed');
        } catch (error) {
            console.error('❌ Error closing database:', error);
        }
    }

    console.log('👋 Shutdown complete. Goodbye!');
    process.exit(0);
};

module.exports = {
    setupProcessHandlers,
    gracefulShutdown
};
