import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Car, 
  Users, 
  Fuel, 
  Wrench, 
  MapPin, 
  BarChart3, 
  Settings,
  UserPlus,
  ClipboardList,
  User,
  LogOut,
  ChevronDown,
  Shield,
  UserCog,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import authService from '../services/authService';
import SettingsModal from './SettingsModal';
import { useTheme } from '../contexts/ThemeContext';

const ModernNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState !== null) {
      setSidebarCollapsed(JSON.parse(savedSidebarState));
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    
    // Add/remove class to body for CSS targeting
    if (sidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    
    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [sidebarCollapsed]);

  const navigationItems = [
    {
      section: "Principal",
      items: [
        { name: "Dashboard", path: "/", icon: Home },
        { name: "Rapports", path: "/rapports", icon: BarChart3 },
      ]
    },
    {
      section: "Gestion des Véhicules",
      items: [
        { name: "Parc Auto", path: "/parc-auto", icon: Car },
        { name: "Consommations", path: "/consommations", icon: Fuel },
        { name: "Interventions", path: "/interventions", icon: Wrench },
      ]
    },
    {
      section: "Gestion des Missions",
      items: [
        { name: "Ordres de Missions", path: "/ordres-missions", icon: ClipboardList },
        { name: "Liste Chauffeurs", path: "/liste-chauffeurs", icon: Users },
        { name: "Ajouter Chauffeur", path: "/ajouter-chauffeur", icon: UserPlus },
      ]
    }
  ];

  // Ajouter la section Administration si l'utilisateur est admin
  if (user?.role === 'admin') {
    navigationItems.push({
      section: "Administration",
      items: [
        { name: "Gestion Responsables", path: "#", icon: UserCog, action: () => setShowSettingsModal(true) },
      ]
    });
  }

  // Fonction pour vérifier si un chemin est actif
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      setShowUserMenu(false);
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Car size={32} />
            {!sidebarCollapsed && <span>Auto Parc</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Développer la sidebar" : "Réduire la sidebar"}
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              {!sidebarCollapsed && (
                <div className="nav-section-title">{section.section}</div>
              )}
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return item.path === "#" ? (
                  <button
                    key={itemIndex}
                    onClick={() => handleItemClick(item)}
                    className="nav-item nav-item-button"
                    title={sidebarCollapsed ? item.name : ""}
                  >
                    <IconComponent className="nav-item-icon" size={20} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    title={sidebarCollapsed ? item.name : ""}
                  >
                    <IconComponent className="nav-item-icon" size={20} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Theme toggle button */}
        <div className="theme-toggle-container">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!sidebarCollapsed && (
              <span>{isDarkMode ? "Mode Clair" : "Mode Sombre"}</span>
            )}
          </button>
        </div>

        {/* Profil utilisateur en bas de la sidebar */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-profile-header" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">
                <User size={20} />
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="user-info">
                    <span className="user-name">{user?.prenom} {user?.nom}</span>
                    <span className="user-role">
                      {user?.role === 'admin' ? (
                        <>
                          <Shield size={12} />
                          Administrateur
                        </>
                      ) : (
                        'Responsable'
                      )}
                    </span>
                  </div>
                  <button className="logout-icon-btn" onClick={handleLogout} title="Se déconnecter">
                    <LogOut size={16} />
                  </button>
                </>
              )}
              {sidebarCollapsed && (
                <button className="logout-icon-btn-collapsed" onClick={handleLogout} title="Se déconnecter">
                  <LogOut size={16} />
                </button>
              )}
            </div>
            
            {showUserMenu && !sidebarCollapsed && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-avatar-large">
                    <User size={24} />
                  </div>
                  <div className="user-details">
                    <span className="user-name-large">{user?.prenom} {user?.nom}</span>
                    <span className="user-email">{user?.email}</span>
                    <span className="user-role-badge">
                      {user?.role === 'admin' ? 'Administrateur' : 'Responsable'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu */}
      {showUserMenu && (
        <div 
          className="user-menu-overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Modal Settings pour les admins */}
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
      />
    </>
  );
};

export default ModernNavigation; 