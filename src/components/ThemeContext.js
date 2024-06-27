import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
