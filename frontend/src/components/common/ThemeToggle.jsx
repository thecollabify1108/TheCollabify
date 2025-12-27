import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-dark-800 hover:bg-dark-700 text-yellow-400"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <FaSun className="w-5 h-5" />
            ) : (
                <FaMoon className="w-5 h-5 text-dark-600" />
            )}
        </button>
    );
};

export default ThemeToggle;
