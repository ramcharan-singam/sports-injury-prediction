import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ACCENT_COLORS = {
  amber: { name: 'Amber Gold', hex: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-500', borderClass: 'border-amber-500' },
  emerald: { name: 'Emerald', hex: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500', borderClass: 'border-emerald-500' },
  cyan: { name: 'Cyan', hex: '#06b6d4', bgClass: 'bg-cyan-500', textClass: 'text-cyan-500', borderClass: 'border-cyan-500' },
  purple: { name: 'Purple', hex: '#8b5cf6', bgClass: 'bg-purple-500', textClass: 'text-purple-500', borderClass: 'border-purple-500' },
  rose: { name: 'Rose', hex: '#f43f5e', bgClass: 'bg-rose-500', textClass: 'text-rose-500', borderClass: 'border-rose-500' },
};

export const ThemeProvider = ({ children }) => {
  const savedTheme = localStorage.getItem('app-theme');
  const [theme, setTheme] = useState(savedTheme && savedTheme !== 'dark' ? savedTheme : 'light');
  const [accent, setAccent] = useState('amber');

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('dark', 'light', 'theme-high-contrast');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'high-contrast') {
      root.classList.add('dark', 'theme-high-contrast');
    } else {
      root.classList.add('light');
    }

    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', accent);
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-accent', accent);
  }, [theme, accent]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, ACCENT_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};
