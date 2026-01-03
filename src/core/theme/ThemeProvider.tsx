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

    // Convert camelCase to kebab-case for CSS variables
    const toKebabCase = (str: string) =>
      str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

    // Apply CSS variables
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${toKebabCase(key)}`, value);
    });

    Object.entries(themeConfig.glass).forEach(([key, value]) => {
      root.style.setProperty(`--glass-${toKebabCase(key)}`, value);
    });

    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${toKebabCase(key)}`, value);
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
