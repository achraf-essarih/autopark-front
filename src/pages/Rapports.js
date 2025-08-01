import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { REPORT_TABS } from '../utils/constants';

const Rapports = () => {
  const [activeReportTab, setActiveReportTab] = useState('parc-auto');

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Rapports</h1>
        <button className="btn btn-success">
          <FileText size={18} />
          Imprimer
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ width: '300px' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeReportTab === tab.id;
              return (
                <div 
                  key={tab.id}
                  onClick={() => setActiveReportTab(tab.id)}
                  style={{ 
                    marginBottom: '1rem', 
                    padding: '0.75rem', 
                    color: isActive ? '#3b82f6' : '#6b7280', 
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    background: isActive ? '#eff6ff' : 'transparent',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: isActive ? '500' : 'normal' }}>
                    <Icon size={18} />
                    {tab.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
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
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '2rem' }}>
                {REPORT_TABS.find(tab => tab.id === activeReportTab)?.label || 'Situation du Parc Auto'}
              </h2>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {activeReportTab === 'parc-auto' && (
                      <>
                        <th>VÉHICULE</th>
                        <th>IMMATRICULATION</th>
                        <th>BOÎTE DE VITESSES</th>
                        <th>PUISSANCE FISCALE</th>
                        <th>MODE CARBURANT</th>
                        <th>ÉTAT MÉCANIQUE</th>
                      </>
                    )}
                    {activeReportTab === 'consommation' && (
                      <>
                        <th>VÉHICULE</th>
                        <th>DATE</th>
                        <th>MONTANT (DH)</th>
                        <th>KILOMÉTRAGE</th>
                        <th>CONSOMMATION (L/100km)</th>
                      </>
                    )}
                    {(activeReportTab === 'assurance' || activeReportTab === 'vidange' || 
                      activeReportTab === 'vignette' || activeReportTab === 'controle' || 
                      activeReportTab === 'mecanique') && (
                      <>
                        <th>VÉHICULE</th>
                        <th>DATE</th>
                        <th>TYPE</th>
                        <th>NOTE</th>
                        <th>STATUT</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={
                      activeReportTab === 'parc-auto' ? 6 :
                      activeReportTab === 'consommation' ? 5 : 5
                    } style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      Aucune donnée disponible pour {REPORT_TABS.find(tab => tab.id === activeReportTab)?.label}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'right', color: '#6b7280' }}>
              <p>Date d'édition</p>
              <p>2025-06-26</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rapports; 