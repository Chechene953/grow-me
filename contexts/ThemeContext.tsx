import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Color schemes
const lightColors = {
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    150: '#EEEEEE',
    200: '#E0E0E0',
    300: '#BDBDBD',
    400: '#9E9E9E',
    500: '#757575',
    600: '#616161',
    700: '#424242',
    800: '#303030',
    900: '#1A1A1A',
  },
  accent: {
    coral: '#FF6B6B',
    gold: '#FFB347',
    teal: '#4DB6AC',
    lavender: '#9575CD',
  },
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.85)',
    medium: 'rgba(255, 255, 255, 0.72)',
    dark: 'rgba(0, 0, 0, 0.4)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#616161',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
  },
};

const darkColors = {
  primary: {
    50: '#1B3D1F',
    100: '#234827',
    200: '#2E5C32',
    300: '#3A713E',
    400: '#4A8A4E',
    500: '#5CA35F',
    600: '#6FBA72',
    700: '#85CD88',
    800: '#9EDE9F',
    900: '#B9EEB9',
  },
  neutral: {
    0: '#121212',
    50: '#1A1A1A',
    100: '#242424',
    150: '#2D2D2D',
    200: '#363636',
    300: '#4A4A4A',
    400: '#6B6B6B',
    500: '#8C8C8C',
    600: '#ADADAD',
    700: '#CECECE',
    800: '#E8E8E8',
    900: '#FFFFFF',
  },
  accent: {
    coral: '#FF8A8A',
    gold: '#FFC76D',
    teal: '#6EC9BF',
    lavender: '#B094D9',
  },
  semantic: {
    success: '#6FBA72',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',
  },
  glass: {
    light: 'rgba(30, 30, 30, 0.85)',
    medium: 'rgba(30, 30, 30, 0.72)',
    dark: 'rgba(0, 0, 0, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  background: {
    primary: '#121212',
    secondary: '#1A1A1A',
    tertiary: '#242424',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#ADADAD',
    tertiary: '#6B6B6B',
    inverse: '#1A1A1A',
  },
};

export type ThemeColors = typeof lightColors;

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@growme_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setMode(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference when it changes
  const setThemeMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  // Get the current color scheme
  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  // Toggle between light and dark
  const toggleTheme = () => {
    if (mode === 'system') {
      setThemeMode(isDark ? 'light' : 'dark');
    } else {
      setThemeMode(mode === 'light' ? 'dark' : 'light');
    }
  };

  const value = useMemo(() => ({
    mode,
    isDark,
    colors,
    setThemeMode,
    toggleTheme,
  }), [mode, isDark, colors]);

  // Don't render until we've loaded the saved preference
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export light colors as default for backward compatibility
export { lightColors as colors };

// Helper hook to get themed styles
export const useThemedColors = () => {
  const { colors, isDark } = useTheme();
  return { colors, isDark };
};
