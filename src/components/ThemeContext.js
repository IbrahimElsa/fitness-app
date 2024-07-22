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
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const themeCss = {
    light: 'bg-gray-100 text-black',
    dark: 'bg-gray-900 text-white',
    navbarLight: 'bg-gray-200 text-black',
    navbarDark: 'bg-gray-800 text-white',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeCss }}>
      {children}
    </ThemeContext.Provider>
  );
};