import React from 'react';
import styles from '../styles/DarkModeToggle.module.css';

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
  console.log('DarkModeToggle props:', { darkMode, toggleDarkMode }); // Add this debug line
  
  return (
    <button 
      className={styles.darkModeButton}
      onClick={() => {
        console.log('Button clicked'); // Add this debug line
        toggleDarkMode();
      }}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      {darkMode ? (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.44 2.26a5.76 5.76 0 0 1-5.77-5.81 5.81 5.81 0 0 1 1.37-3.67A8.51 8.51 0 0 0 12 3m0-2C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1" />
        </svg>
      ) : (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
        </svg>
      )}
    </button>
  );
};

export default DarkModeToggle;