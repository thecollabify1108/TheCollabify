import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

const FloatingCreateButton = ({ onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
            <FaPlus className="text-2xl" />

            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-25"></span>

            {/* Glow effect */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 blur-lg opacity-50"></span>
        </motion.button>
    );
};

export default FloatingCreateButton;
