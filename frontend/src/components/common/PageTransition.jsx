import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.3,
                ease: [0.55, 0.085, 0.68, 0.53]
            }
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
