import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import authService from '../services/authService';

const Header = () => {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Even if logout fails, redirect to login
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <div>
          <img src="/nav-logo.jpg" alt="EPTA Logo" />
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
        
        {/* Menu utilisateur avec déconnexion */}
        <div className="user-menu-container">
          <button 
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <User size={16} />
            </div>
            {user && (
              <div className="user-info">
                <span className="user-name">{user.prenom} {user.nom}</span>
                <span className="user-role">{user.role}</span>
              </div>
            )}
            <ChevronDown size={16} className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
          </button>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-avatar-large">
                  <User size={20} />
                </div>
                <div className="user-details">
                  <span className="user-name-large">{user?.prenom} {user?.nom}</span>
                  <span className="user-email">{user?.email}</span>
                  <span className="user-role-badge">{user?.role}</span>
                </div>
              </div>
              
              <div className="user-dropdown-divider"></div>
              
              <button className="user-dropdown-item" onClick={handleLogout}>
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay pour fermer le menu */}
      {showUserMenu && (
        <div 
          className="user-menu-overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header; 