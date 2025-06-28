import React from 'react';
import { Car, ClipboardList, Fuel, BarChart3, MoreHorizontal } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="main-content">
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Car size={24} />
            </div>
          </div>
          <div className="stat-value">0</div>
          <div className="stat-label">Véhicules</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <ClipboardList size={24} />
            </div>
          </div>
          <div className="stat-value">0</div>
          <div className="stat-label">Ordres des missions</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Fuel size={24} />
            </div>
          </div>
          <div className="stat-value">0 DH</div>
          <div className="stat-label">Consommation carburant (MAD)</div>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Analyse des consommations - 2025</h3>
          <button className="chart-menu">
            <MoreHorizontal size={20} />
          </button>
        </div>
        <div className="chart-placeholder">
          <div>
            <BarChart3 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Graphique des consommations par mois</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 