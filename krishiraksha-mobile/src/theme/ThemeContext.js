import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './tokens';

const THEME_STORAGE_KEY = '@krishiraksha_theme_mode';

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') {
        setIsDark(true);
      }
    } catch (e) {
      console.warn('Failed to load theme preference:', e);
    }
  };

  const toggleTheme = async () => {
    try {
      const nextVal = !isDark;
      setIsDark(nextVal);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextVal ? 'dark' : 'light');
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  const setThemeMode = async (mode) => {
    try {
      const dark = mode === 'dark';
      setIsDark(dark);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save theme mode:', e);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
