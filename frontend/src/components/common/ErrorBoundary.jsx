import React from 'react';
import { motion } from 'framer-motion';
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi';

/**
 * ErrorBoundary - Catch and handle React errors gracefully
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        console.error('Error caught by boundary:', error, errorInfo);

        // In production, you could log to an error tracking service
        // logErrorToService(error, errorInfo);

        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card max-w-md w-full p-8 text-center"
                    >
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <HiExclamationCircle className="w-10 h-10 text-red-400" />
                        </div>

                        {/* Heading */}
                        <h2 className="text-2xl font-bold text-dark-100 mb-2">
                            Oops! Something went wrong
                        </h2>

                        <p className="text-dark-400 mb-6">
                            We encountered an unexpected error. Don't worry, your data is safe. Please try refreshing the page.
                        </p>

                        {/* Error Details (development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-dark-500 hover:text-dark-400 mb-2">
                                    Error Details (Development)
                                </summary>
                                <div className="p-3 rounded-lg bg-dark-800 text-xs text-red-400 overflow-auto max-h-40">
                                    <p className="font-mono">{this.state.error.toString()}</p>
                                    {this.state.errorInfo && (
                                        <pre className="mt-2 text-dark-500">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:from-primary-500 hover:to-secondary-500 transition flex items-center justify-center gap-2"
                            >
                                <HiRefresh className="w-5 h-5" />
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex-1 py-3 rounded-xl bg-dark-800 text-dark-200 font-semibold hover:bg-dark-700 transition"
                            >
                                Try Again
                            </button>
                        </div>

                        {/* Support Link */}
                        <p className="mt-6 text-sm text-dark-500">
                            Need help? <a href="mailto:support@thecollabify.com" className="text-primary-400 hover:underline">Contact Support</a>
                        </p>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
