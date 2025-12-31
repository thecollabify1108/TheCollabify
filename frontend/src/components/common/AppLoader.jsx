import { motion } from 'framer-motion';

const AppLoader = ({ message = "Loading...", subMessage = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center z-[9999]"
        >
            {/* Logo Animation */}
            <motion.div
                className="relative mb-8"
                animate={{
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {/* Outer Ring */}
                <div className="w-24 h-24 rounded-full border-4 border-dark-700 relative">
                    {/* Spinning Gradient Ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-secondary-500"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />

                    {/* Inner Circle with Logo */}
                    {/* Inner Circle with Logo */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-lg p-3">
                        <img src="/star-logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur-xl" />
            </motion.div>

            {/* Loading Text */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
            >
                <h2 className="text-xl font-semibold text-dark-100 mb-2">
                    {message}
                </h2>
                {subMessage && (
                    <p className="text-dark-400 text-sm">
                        {subMessage}
                    </p>
                )}
            </motion.div>

            {/* Animated Dots */}
            <div className="flex gap-2 mt-6">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        animate={{
                            y: [0, -8, 0],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default AppLoader;
