import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'theme';

// Helper to determine device/system theme preference
const getDeviceTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

export const ThemeProvider = ({ children }) => {
    // 1. If user previously chose a theme, use it.
    // 2. Otherwise default to the device's system theme preference.
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'dark' || savedTheme === 'light') {
                return savedTheme;
            }
            return getDeviceTheme();
        } catch {
            return getDeviceTheme();
        }
    });

    // Apply theme class to document root
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    // Listen for device/OS system theme changes if user has NOT set a manual preference
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only adapt to device setting if user has not explicitly locked a manual preference
            try {
                if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            } catch {
                // Ignore storage error
            }
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);

    // Toggle and always remember the user's explicit choice
    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const nextTheme = prevTheme === 'light' ? 'dark' : 'light';
            try {
                localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            } catch (error) {
                console.error('Failed to save theme preference:', error);
            }
            return nextTheme;
        });
    };

    // Set explicit theme and save to localStorage
    const changeTheme = (newTheme) => {
        if (newTheme !== 'light' && newTheme !== 'dark') return;
        setTheme(newTheme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const value = {
        theme,
        toggleTheme,
        changeTheme,
        isDark: theme === 'dark',
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
