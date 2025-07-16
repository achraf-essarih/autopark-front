import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { REPORT_TABS } from '../utils/constants';
import vehicleService from '../services/vehicleService';
import consumptionService from '../services/consumptionService';
import interventionService from '../services/interventionService';

const Rapports = () => {
  const [activeReportTab, setActiveReportTab] = useState('parc-auto');
  const [data, setData] = useState({
    vehicles: [],
    consumptions: [],
    interventions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [vehiclesResult, consumptionsResult, interventionsResult] = await Promise.all([
        vehicleService.getVehicles(),
        consumptionService.getConsumptions(),
        interventionService.getInterventions()
      ]);
      
      setData({
        vehicles: vehiclesResult.success ? vehiclesResult.vehicles : [],
        consumptions: consumptionsResult.success ? consumptionsResult.consumptions : [],
        interventions: interventionsResult.success ? interventionsResult.interventions : []
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Véhicule inconnu';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getFilteredInterventions = () => {
    return data.interventions.filter(intervention => {
      switch (activeReportTab) {
        case 'assurance':
          return intervention.type_intervention === 'assurance';
        case 'vidange':
          return intervention.type_intervention === 'vidange';
        case 'vignette':
          return intervention.type_intervention === 'vignette';
        case 'controle':
          return intervention.type_intervention === 'controle';
        case 'mecanique':
          return intervention.type_intervention === 'mecanique';
        default:
          return false;
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            <p>Chargement des données...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </td>
        </tr>
      );
    }

    switch (activeReportTab) {
      case 'parc-auto':
        if (data.vehicles.length === 0) {
          return (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Aucun véhicule enregistré
              </td>
            </tr>
          );
        }
        return data.vehicles.map((vehicle) => (
          <tr key={vehicle.id}>
            <td>{vehicle.nom}</td>
            <td>{vehicle.immatriculation}</td>
            <td>{vehicle.boite_vitesses}</td>
            <td>{vehicle.puissance_fiscale} CV</td>
            <td>{vehicle.carburant}</td>
            <td>
              <span 
                style={{ 
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  backgroundColor: 
                    vehicle.etat_mecanique === 'Excellent' ? '#10b981' :
                    vehicle.etat_mecanique === 'Bon' ? '#f59e0b' : '#ef4444'
                }}
              >
                {vehicle.etat_mecanique}
              </span>
            </td>
          </tr>
        ));

      case 'consommation':
        if (data.consumptions.length === 0) {
          return (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Aucune consommation enregistrée
              </td>
            </tr>
          );
        }
        return data.consumptions.map((consumption) => (
          <tr key={consumption.id}>
            <td>{getVehicleName(consumption.vehicule_id)}</td>
            <td>{formatDate(consumption.date_consommation)}</td>
            <td>{formatCurrency(consumption.montant_total)}</td>
            <td>{consumption.kilometrage} km</td>
            <td>{consumption.quantite} L</td>
          </tr>
        ));

      default:
        const filteredInterventions = getFilteredInterventions();
        if (filteredInterventions.length === 0) {
          return (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Aucune intervention de type {REPORT_TABS.find(tab => tab.id === activeReportTab)?.label} enregistrée
              </td>
            </tr>
          );
        }
        return filteredInterventions.map((intervention) => (
          <tr key={intervention.id}>
            <td>{getVehicleName(intervention.vehicule_id)}</td>
            <td>{formatDate(intervention.date_intervention)}</td>
            <td>{intervention.type_intervention}</td>
            <td>{intervention.description || 'N/A'}</td>
            <td>
              <span 
                style={{ 
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  backgroundColor: 
                    intervention.statut === 'Terminée' ? '#10b981' :
                    intervention.statut === 'En cours' ? '#f59e0b' :
                    intervention.statut === 'Planifiée' ? '#3b82f6' : '#ef4444'
                }}
              >
                {intervention.statut}
              </span>
            </td>
          </tr>
        ));
    }
  };

  const getTableHeaders = () => {
    switch (activeReportTab) {
      case 'parc-auto':
        return ['VÉHICULE', 'IMMATRICULATION', 'BOÎTE DE VITESSES', 'PUISSANCE FISCALE', 'MODE CARBURANT', 'ÉTAT MÉCANIQUE'];
      case 'consommation':
        return ['VÉHICULE', 'DATE', 'MONTANT (MAD)', 'KILOMÉTRAGE', 'QUANTITÉ (L)'];
      default:
        return ['VÉHICULE', 'DATE', 'TYPE', 'DESCRIPTION', 'STATUT'];
    }
  };

  const getDataCount = () => {
    switch (activeReportTab) {
      case 'parc-auto':
        return data.vehicles.length;
      case 'consommation':
        return data.consumptions.length;
      default:
        return getFilteredInterventions().length;
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Rapports</h1>
        <button className="btn btn-success" onClick={handlePrint}>
          <FileText size={18} />
          Imprimer
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ width: '300px' }}>
          <div className="glass-card">
            <div className="tab-sidebar">
              {REPORT_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeReportTab === tab.id;
                return (
                  <div 
                    key={tab.id}
                    onClick={() => setActiveReportTab(tab.id)}
                    className={`tab-sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="tab-sidebar-content">
                      <Icon size={18} />
                      {tab.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="content-container">
            <div className="report-header">
              <div className="report-logo">
                <img 
                  src="/epta-logo.jpg" 
                  alt="EPTA Logo" 
                  style={{ 
                    width: '200px', 
                    height: '100px', 
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
            
            <div className="report-title">
              <h2 style={{ color: 'var(--glass-text-primary)', marginBottom: '0.5rem' }}>
                {REPORT_TABS.find(tab => tab.id === activeReportTab)?.label || 'Situation du Parc Auto'}
              </h2>
              <p style={{ color: 'var(--glass-text-muted)', fontSize: '0.875rem' }}>
                Total: {getDataCount()} élément{getDataCount() !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="professional-table">
              <table>
                <thead>
                  <tr>
                    {getTableHeaders().map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {renderTableContent()}
                </tbody>
              </table>
            </div>
            
            <div className="report-footer">
              <p style={{ color: 'var(--glass-text-muted)', fontSize: '0.875rem' }}>Date d'édition</p>
              <p style={{ color: 'var(--glass-text-primary)', fontWeight: '500' }}>{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rapports; 