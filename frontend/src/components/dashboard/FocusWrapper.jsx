import { motion } from 'framer-motion';

const FocusWrapper = ({ children, sectionId, currentFocus, className = '' }) => {
    // If no focus mode is active, render normally
    if (!currentFocus) {
        return <div className={className}>{children}</div>;
    }

    const isFocused = currentFocus === sectionId;

    return (
        <motion.div
            animate={{
                opacity: isFocused ? 1 : 0.3,
                filter: isFocused ? 'blur(0px)' : 'blur(2px)',
                scale: isFocused ? 1.02 : 0.98,
            }}
            transition={{ duration: 0.3 }}
            className={`${className} ${isFocused ? 'relative z-10 ring-2 ring-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/10' : 'pointer-events-none'}`}
        >
            {children}
        </motion.div>
    );
};

export default FocusWrapper;
