import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
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
