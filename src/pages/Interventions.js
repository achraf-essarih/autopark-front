import React, { useState } from 'react';
import { INTERVENTION_TABS } from '../utils/constants';

const Interventions = () => {
  const [activeTab, setActiveTab] = useState('assurance');

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Interventions</h1>
      </div>

      <div className="intervention-tabs">
        {INTERVENTION_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`intervention-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="intervention-content">
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Control de véhicule | {INTERVENTION_TABS.find(t => t.id === activeTab)?.label} (0)
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Véhicule *</label>
              <select className="form-select">
                <option>Choisissez une option</option>
              </select>
            </div>
            {activeTab === 'assurance' && (
              <div className="form-group">
                <label className="form-label">Mois d'assurance *</label>
                <select className="form-select">
                  <option>Choisissez une option</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" defaultValue="2025-06-26" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Note</label>
            <textarea className="form-textarea" rows="4"></textarea>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary">
              Ajouter
            </button>
          </div>
        </div>

        <div className="table-container">
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--table-header-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input type="text" placeholder="Search" className="form-input" style={{ width: '200px' }} />
          </div>
          <div className="empty-state">
            <p>aucun élément</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interventions; 