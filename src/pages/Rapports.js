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
    // Get the current active tab info
    const activeTab = REPORT_TABS.find(tab => tab.id === activeReportTab);
    const printTitle = activeTab ? activeTab.label : 'Rapport';
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const reportContent = document.getElementById('printable-content');
    
    if (!reportContent) {
      alert('Contenu non trouvé pour l\'impression');
      return;
    }
    
    // Get the current date
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // HTML content for print
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${printTitle} - EPTA</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              color: #333;
              line-height: 1.4;
              padding: 20px;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            
            .print-logo {
              margin-bottom: 15px;
            }
            
            .print-logo img {
              width: 200px;
              height: 100px;
              object-fit: contain;
            }
            
            .print-title {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 8px;
            }
            
            .print-subtitle {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            
            .print-date {
              font-size: 12px;
              color: #9ca3af;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            
            .print-table th {
              background-color: #f9fafb;
              border: 1px solid #d1d5db;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 12px;
              color: #374151;
            }
            
            .print-table td {
              border: 1px solid #d1d5db;
              padding: 10px;
              font-size: 11px;
              color: #4b5563;
            }
            
            .print-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .status-badge {
              padding: 4px 8px;
              border-radius: 4px;
              color: white;
              font-size: 10px;
              font-weight: 500;
            }
            
            .status-excellent { background-color: #10b981; }
            .status-bon { background-color: #f59e0b; }
            .status-mauvais { background-color: #ef4444; }
            .status-termine { background-color: #10b981; }
            .status-encours { background-color: #f59e0b; }
            .status-planifie { background-color: #3b82f6; }
            
            .print-footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
            }
            
            @media print {
              body { padding: 0; }
              .print-header { margin-bottom: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="print-logo">
              <img src="/epta-logo.jpg" alt="EPTA Logo" />
            </div>
            <div class="print-title">${printTitle}</div>
            <div class="print-subtitle">Total: ${getDataCount()} élément${getDataCount() !== 1 ? 's' : ''}</div>
            <div class="print-date">Date d'édition: ${currentDate}</div>
          </div>
          
          <table class="print-table">
            <thead>
              <tr>
                ${getTableHeaders().map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${getPrintTableRows()}
            </tbody>
          </table>
          
          <div class="print-footer">
            <p>Document généré automatiquement par le système EPTA Auto Parc</p>
            <p>© ${new Date().getFullYear()} EPTA - Tous droits réservés</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for images to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  const getPrintTableRows = () => {
    let rows = '';
    
    switch (activeReportTab) {
      case 'parc-auto':
        if (data.vehicles.length === 0) {
          rows = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #6b7280;">Aucun véhicule enregistré</td></tr>';
        } else {
          rows = data.vehicles.map((vehicle) => `
            <tr>
              <td>${vehicle.nom}</td>
              <td>${vehicle.immatriculation}</td>
              <td>${vehicle.boite_vitesses}</td>
              <td>${vehicle.puissance_fiscale} CV</td>
              <td>${vehicle.carburant}</td>
              <td>
                <span class="status-badge status-${vehicle.etat_mecanique.toLowerCase().replace('é', 'e')}">
                  ${vehicle.etat_mecanique}
                </span>
              </td>
            </tr>
          `).join('');
        }
        break;

             case 'consommation':
         if (data.consumptions.length === 0) {
           rows = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">Aucune consommation enregistrée</td></tr>';
         } else {
           rows = data.consumptions.map((consumption) => `
             <tr>
               <td>${getVehicleName(consumption.vehicule_id)}</td>
               <td>${formatDate(consumption.date_consommation)}</td>
               <td>${formatCurrency(consumption.montant || consumption.montant_total || 0)}</td>
               <td>${consumption.kilometrage || 0} km</td>
               <td>${consumption.litres_carburant || consumption.quantite || 0} L</td>
             </tr>
           `).join('');
         }
         break;

      default:
        const filteredInterventions = getFilteredInterventions();
        if (filteredInterventions.length === 0) {
          rows = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">Aucune intervention de type ${REPORT_TABS.find(tab => tab.id === activeReportTab)?.label} enregistrée</td></tr>`;
        } else {
          rows = filteredInterventions.map((intervention) => `
            <tr>
              <td>${getVehicleName(intervention.vehicule_id)}</td>
              <td>${formatDate(intervention.date_intervention)}</td>
              <td>${intervention.type_intervention}</td>
              <td>${intervention.description || 'N/A'}</td>
              <td>
                <span class="status-badge status-${intervention.statut.toLowerCase().replace('é', 'e').replace(' ', '')}">
                  ${intervention.statut}
                </span>
              </td>
            </tr>
          `).join('');
        }
        break;
    }
    
    return rows;
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
            <td>{formatCurrency(consumption.montant || consumption.montant_total || 0)}</td>
            <td>{consumption.kilometrage || 0} km</td>
            <td>{consumption.litres_carburant || consumption.quantite || 0} L</td>
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
        <div style={{ width: '300px' }} className="print-hide">
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
          <div className="content-container" id="printable-content">
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