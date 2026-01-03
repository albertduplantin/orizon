"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { themes, defaultTheme, type Theme } from './themes';

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  themeConfig: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('orizon-theme');
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: string) => {
    if (!themes[newTheme]) return;
    setThemeState(newTheme);
    localStorage.setItem('orizon-theme', newTheme);
  };

  const themeConfig = themes[theme] || themes[defaultTheme];

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    Object.entries(themeConfig.glass).forEach(([key, value]) => {
      root.style.setProperty(`--glass-${key}`, value);
    });

    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }, [theme, mounted, themeConfig]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
