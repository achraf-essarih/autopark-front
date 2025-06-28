import React from 'react';
import { Bell, Settings, Moon, Sun, Rss, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="header">
      <div className="logo">
        <div>
          <img src="/nav-logo.png" alt="EPTA Logo" />
        </div>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}></span>
      </div>
      <div className="header-actions">
        <button className="header-icon">
          <Rss size={20} />
        </button>
        <button className="header-icon" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="header-icon">
          <Settings size={20} />
        </button>
        <button className="header-icon">
          <Bell size={20} />
        </button>
        <div className="user-avatar">
          <User size={16} />
        </div>
      </div>
    </header>
  );
};

export default Header; 