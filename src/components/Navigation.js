import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/constants';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="nav-container">
      <div className="nav-tabs">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation; 