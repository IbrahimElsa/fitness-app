import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
const [theme, setTheme] = useState('light');

const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
};

const themeCss = {
    light: 'bg-gray-200 text-black',
    dark: 'bg-gray-800 text-white',
};

return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeCss }}>
        {children}
    </ThemeContext.Provider>
    );
};