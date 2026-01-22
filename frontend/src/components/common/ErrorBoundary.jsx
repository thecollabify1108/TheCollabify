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
                        className="max-w-md w-full"
                    >
                        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8 text-center">
                            {/* Error Icon */}
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>

                            {/* Error Message */}
                            <h1 className="text-2xl font-bold text-dark-100 mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-dark-400 mb-6">
                                We encountered an unexpected error. Don't worry, your data is safe.
                            </p>

                            {/* Error Details (Development only) */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="mb-6 p-4 bg-dark-950 border border-dark-700 rounded-xl text-left">
                                    <p className="text-xs text-red-400 font-mono mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo?.componentStack && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-dark-500 cursor-pointer hover:text-dark-400">
                                                Show stack trace
                                            </summary>
                                            <pre className="text-xs text-dark-500 mt-2 overflow-auto max-h-40">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        this.setState({ hasError: false, error: null, errorInfo: null });
                                        window.location.reload();
                                    }}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium hover:opacity-90 transition-opacity"
                                    aria-label="Reload page"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1 py-3 px-4 rounded-xl bg-dark-800 text-dark-300 font-medium hover:bg-dark-700 transition-colors"
                                    aria-label="Go to homepage"
                                >
                                    Go Home
                                </button>
                            </div>

                            {/* Help Text */}
                            <p className="mt-6 text-xs text-dark-500">
                                If this problem persists, please{' '}
                                <a href="mailto:support@thecollabify.com" className="text-primary-400 hover:text-primary-300 underline">
                                    contact support
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
