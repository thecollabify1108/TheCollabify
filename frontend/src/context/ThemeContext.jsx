import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Force dark theme always - remove any saved light theme preference
    const [theme, setTheme] = useState(() => {
        // Clear any light theme from localStorage
        localStorage.removeItem('theme');
        return 'dark';
    });

    useEffect(() => {
        // Always force dark theme
        localStorage.setItem('theme', 'dark');

        // Always use dark theme - remove light theme class if present
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
