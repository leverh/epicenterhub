import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  // Check a preference is saved in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    console.log('Dark mode changed to:', darkMode); // Add this debug line
    
    // Update localStorage when dark mode changes
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle function
  const toggleDarkMode = () => {
    console.log('Toggling dark mode'); // Add this debug line
    setDarkMode(prevMode => !prevMode);
  };

  return [darkMode, toggleDarkMode];
};