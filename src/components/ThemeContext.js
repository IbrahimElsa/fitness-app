// src/components/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Add class to document body for global CSS selectors
    document.body.classList.toggle('dark-mode', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Comprehensive theme system
  const themeCss = {
    // Base theme colors
    light: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-900 text-slate-100',
    
    // Navbar styles
    navbarLight: 'bg-white text-slate-800 shadow-md',
    navbarDark: 'bg-slate-800 text-white shadow-md',
    
    // Card styles
    cardLight: 'bg-white shadow-sm border border-slate-200',
    cardDark: 'bg-slate-800 shadow-sm border border-slate-700',
    
    // Input styles
    inputLight: 'bg-slate-100 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
    inputDark: 'bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white',
    
    // Button styles - primary actions
    primaryButton: 'bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200',
    secondaryButton: 'bg-slate-200 hover:bg-slate-300 text-slate-800 transition-all duration-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white',
    dangerButton: 'bg-rose-600 hover:bg-rose-700 text-white transition-all duration-200',
    successButton: 'bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200',
    
    // Inactive/disabled buttons
    disabledButton: 'bg-slate-300 text-slate-500 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed',
    
    // Text colors
    primaryText: 'text-slate-900 dark:text-white',
    secondaryText: 'text-slate-600 dark:text-slate-400',
    mutedText: 'text-slate-500 dark:text-slate-500',
    
    // Brand/accent colors
    accentPrimary: 'text-indigo-600 dark:text-indigo-400',
    accentSuccess: 'text-emerald-600 dark:text-emerald-400',
    accentWarning: 'text-amber-600 dark:text-amber-400',
    accentDanger: 'text-rose-600 dark:text-rose-400',
    
    // Background accents
    accentBgLight: 'bg-indigo-100 text-indigo-800',
    accentBgDark: 'bg-indigo-900/30 text-indigo-300',
    successBgLight: 'bg-emerald-100 text-emerald-800',
    successBgDark: 'bg-emerald-900/30 text-emerald-300',
    
    // Table/list styles
    tableHeaderLight: 'bg-slate-100 text-slate-600',
    tableHeaderDark: 'bg-slate-800 text-slate-300',
    tableRowEvenLight: 'bg-white',
    tableRowEvenDark: 'bg-slate-800',
    tableRowOddLight: 'bg-slate-50',
    tableRowOddDark: 'bg-slate-750',
    
    // Form elements
    formLabelLight: 'text-slate-700',
    formLabelDark: 'text-slate-300',
    
    // Modal/dialog styles
    modalLight: 'bg-white rounded-xl shadow-xl border border-slate-200',
    modalDark: 'bg-slate-800 rounded-xl shadow-xl border border-slate-700',
    
    // Dividers and separators
    dividerLight: 'border-slate-200',
    dividerDark: 'border-slate-700',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeCss }}>
      {children}
    </ThemeContext.Provider>
  );
};