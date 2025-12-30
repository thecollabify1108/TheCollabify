import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHome, FaRedo, FaExclamationTriangle } from 'react-icons/fa';

const ServerError = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
            <div className="text-center max-w-lg">
                {/* Animated 500 */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="relative mb-8"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-3xl rounded-full" />

                    {/* 500 Text */}
                    <h1 className="relative text-9xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                        500
                    </h1>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-dark-100 mb-4">
                        Server Error
                    </h2>
                    <p className="text-dark-400 mb-8">
                        Something went wrong on our end. Our team has been notified
                        and we're working to fix it. Please try again in a moment.
                    </p>
                </motion.div>

                {/* Illustration */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-700/30 flex items-center justify-center">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [1, 0.7, 1]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <FaExclamationTriangle className="text-5xl text-orange-400" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                        <FaRedo />
                        Try Again
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-dark-800 border border-dark-700 text-dark-200 font-semibold hover:bg-dark-700 transition-colors"
                    >
                        <FaHome />
                        Go Home
                    </Link>
                </motion.div>

                {/* Status */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 p-4 rounded-xl bg-dark-800/50 border border-dark-700"
                >
                    <p className="text-sm text-dark-400">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" />
                        Our servers might be waking up. This usually takes 30 seconds.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default ServerError;
