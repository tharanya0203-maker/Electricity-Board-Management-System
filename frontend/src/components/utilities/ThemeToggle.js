import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    document.body.className = `theme-${savedTheme}`;
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    document.body.className = `theme-${newTheme}`;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}
      title={`Current theme: ${currentTheme}`}
    >
      {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;