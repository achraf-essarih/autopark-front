import React, { useState, useEffect } from 'react';
import { Car, ClipboardList, Fuel, BarChart3, MoreHorizontal, AlertCircle } from 'lucide-react';
import vehicleService from '../services/vehicleService';
import consumptionService from '../services/consumptionService';
import missionService from '../services/missionService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    vehicles: 0,
    missions: 0,
    totalConsumption: 0,
    loading: true,
    error: null
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Charger les données en parallèle
      const [vehiclesResult, missionsResult, consumptionResult] = await Promise.all([
        vehicleService.getVehicleStats(),
        missionService.getMissionStats(),
        consumptionService.getConsumptionStats()
      ]);

      // Mise à jour des statistiques
      setStats({
        vehicles: vehiclesResult.success ? vehiclesResult.stats.total : 0,
        missions: missionsResult.success ? missionsResult.stats.totalMissions : 0,
        totalConsumption: consumptionResult.success ? consumptionResult.stats.totalCost : 0,
        loading: false,
        error: null
      });

      // Charger les données du graphique (consommations mensuelles)
      if (consumptionResult.success && consumptionResult.stats.monthlyData) {
        setChartData(consumptionResult.stats.monthlyData);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur lors du chargement des données'
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (stats.loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {stats.error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{stats.error}</span>
          <button onClick={loadDashboardData} className="retry-button">
            Réessayer
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Car size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.vehicles}</div>
          <div className="stat-label">Véhicules</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <ClipboardList size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.missions}</div>
          <div className="stat-label">Ordres des missions</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Fuel size={24} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(stats.totalConsumption)}</div>
          <div className="stat-label">Consommation carburant</div>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Analyse des consommations - 2025</h3>
          <button className="chart-menu" onClick={loadDashboardData}>
            <MoreHorizontal size={20} />
          </button>
        </div>
        <div className="chart-placeholder">
          {chartData.length > 0 ? (
            <div className="chart-data">
              <div className="chart-bars">
                {chartData.map((data, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar" 
                      style={{ 
                        height: `${(data.amount / Math.max(...chartData.map(d => d.amount))) * 100}%` 
                      }}
                    ></div>
                    <span className="bar-label">{data.month}</span>
                    <span className="bar-value">{formatCurrency(data.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty-state">
              <div className="chart-empty-icon">
                <BarChart3 size={32} />
              </div>
              <div className="chart-empty-title">
                Aucune donnée de consommation disponible
              </div>
              <div className="chart-empty-subtitle">
                Ajoutez des consommations de carburant pour voir l'analyse des données
              </div>
              <a href="/consommations" className="chart-empty-action">
                <Fuel size={16} />
                Ajouter une consommation
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 