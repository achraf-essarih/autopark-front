import React from 'react';
import { Bell, Settings, Moon, User } from 'lucide-react';

const Header = () => {
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
          <Moon size={20} />
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