import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, BarChart3, Navigation, Clock, Route } from 'lucide-react';
import missionService from '../services/missionService';

const GeospatialAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await missionService.getGeospatialAnalytics();
      
      if (result.success) {
        setAnalytics(result.analytics);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des analyses:', err);
      setError('Erreur lors du chargement des analyses géospatiales');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des analyses géospatiales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <MapPin size={48} />
        <p>{error}</p>
        <button onClick={loadAnalytics} className="btn btn-primary">
          Réessayer
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-empty">
        <BarChart3 size={48} />
        <p>Aucune donnée d'analyse disponible</p>
      </div>
    );
  }

  const { globalStats, topDestinations, zoneStats } = analytics;

  return (
    <div className="geospatial-analytics">
      <div className="analytics-header">
        <h2>
          <MapPin size={24} />
          Analyses Géospatiales
        </h2>
        <p>Données basées sur les missions de la dernière année</p>
      </div>

      {/* Statistiques globales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Route size={24} />
          </div>
          <div className="stat-content">
            <h3>{globalStats.total_missions || 0}</h3>
            <p>Missions totales</p>
            <small>
              {globalStats.missions_with_coordinates || 0} avec coordonnées GPS
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Navigation size={24} />
          </div>
          <div className="stat-content">
            <h3>{globalStats.total_distance ? `${globalStats.total_distance.toFixed(0)} km` : 'N/A'}</h3>
            <p>Distance totale</p>
            <small>
              Moyenne: {globalStats.avg_distance ? `${globalStats.avg_distance.toFixed(1)} km` : 'N/A'}
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>
              {globalStats.avg_duration ? `${Math.round(globalStats.avg_duration)} min` : 'N/A'}
            </h3>
            <p>Temps moyen</p>
            <small>Par mission</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>
              {globalStats.missions_with_coordinates && globalStats.total_missions 
                ? `${Math.round((globalStats.missions_with_coordinates / globalStats.total_missions) * 100)}%`
                : '0%'
              }
            </h3>
            <p>Couverture GPS</p>
            <small>Missions géolocalisées</small>
          </div>
        </div>
      </div>

      {/* Top destinations */}
      {topDestinations && topDestinations.length > 0 && (
        <div className="analytics-section">
          <h3>
            <MapPin size={20} />
            Destinations les plus fréquentées
          </h3>
          <div className="destinations-list">
            {topDestinations.slice(0, 5).map((destination, index) => (
              <div key={index} className="destination-item">
                <div className="destination-rank">#{index + 1}</div>
                <div className="destination-info">
                  <div className="destination-name">{destination.destination}</div>
                  <div className="destination-stats">
                    <span>{destination.frequency} missions</span>
                    {destination.avg_distance && (
                      <span>{destination.avg_distance.toFixed(1)} km en moyenne</span>
                    )}
                  </div>
                </div>
                <div className="destination-frequency">
                  <div 
                    className="frequency-bar"
                    style={{ 
                      width: `${(destination.frequency / topDestinations[0].frequency) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques par zone */}
      {zoneStats && zoneStats.length > 0 && (
        <div className="analytics-section">
          <h3>
            <BarChart3 size={20} />
            Répartition par zones géographiques
          </h3>
          <div className="zones-grid">
            {zoneStats.map((zone, index) => (
              <div key={index} className="zone-card">
                <div className="zone-header">
                  <h4>{zone.zone}</h4>
                  <span className="zone-count">{zone.missions_count} missions</span>
                </div>
                <div className="zone-stats">
                  <div className="zone-stat">
                    <span>Distance moyenne</span>
                    <strong>
                      {zone.avg_distance ? `${zone.avg_distance.toFixed(1)} km` : 'N/A'}
                    </strong>
                  </div>
                </div>
                <div className="zone-progress">
                  <div 
                    className="zone-progress-bar"
                    style={{ 
                      width: `${(zone.missions_count / zoneStats[0].missions_count) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analytics-footer">
        <p>
          <small>
            Données mises à jour en temps réel • 
            Dernière actualisation: {new Date().toLocaleString('fr-FR')}
          </small>
        </p>
      </div>
    </div>
  );
};

export default GeospatialAnalytics; 