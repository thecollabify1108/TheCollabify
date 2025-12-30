import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
            <div className="text-center max-w-lg">
                {/* Animated 404 */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="relative mb-8"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur-3xl rounded-full" />

                    {/* 404 Text */}
                    <h1 className="relative text-9xl font-black bg-gradient-to-r from-primary-400 via-secondary-400 to-pink-400 bg-clip-text text-transparent">
                        404
                    </h1>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-dark-100 mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-dark-400 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track!
                    </p>
                </motion.div>

                {/* Illustration */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 flex items-center justify-center">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                y: [0, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <HiSparkles className="text-5xl text-primary-400" />
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
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                        <FaHome />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-dark-800 border border-dark-700 text-dark-200 font-semibold hover:bg-dark-700 transition-colors"
                    >
                        <FaArrowLeft />
                        Go Back
                    </button>
                </motion.div>

                {/* Fun Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-sm text-dark-500"
                >
                    Lost? Don't worry, even the best creators take wrong turns sometimes! 🚀
                </motion.p>
            </div>
        </div>
    );
};

export default NotFound;
