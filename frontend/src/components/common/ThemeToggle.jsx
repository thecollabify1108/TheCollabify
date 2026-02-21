import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import Icon from './Icon';

const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-dark-800 hover:bg-dark-700 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-indigo-600'
                }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Icon name="sun" size={20} />
            ) : (
                <Icon name="moon" size={20} className="text-dark-600" />
            )}
        </motion.button>
    );
};

export default ThemeToggle;
