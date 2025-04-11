import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      // Check if user prefers dark mode at system level
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    // Apply theme to body
    document.body.className = darkMode ? 'dark-theme' : 'light-theme';
  }, [darkMode]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    setDarkMode(newDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};