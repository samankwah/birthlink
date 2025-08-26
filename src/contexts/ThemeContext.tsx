import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

type Theme = 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { userSettings } = useSelector((state: RootState) => state.settings);
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light'>('light');

  // Update theme when user settings change
  useEffect(() => {
    if (userSettings?.theme) {
      setThemeState(userSettings.theme);
    }
  }, [userSettings?.theme]);

  // Calculate effective theme (resolve 'system' to actual theme)  
  useEffect(() => {
    // Always use light theme regardless of system preference
    setEffectiveTheme('light');
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.removeAttribute('data-theme');
    
    // Apply new theme
    root.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    }
  }, [theme, effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // The actual saving to settings will be handled by the settings component
  };

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};