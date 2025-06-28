import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const Consommations = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Consommations</h1>
      </div>

      {showForm && (
        <div className="form-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Ajouter une nouvelle consommation</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Véhicule *</label>
              <select className="form-select">
                <option>Choisissez une option</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" defaultValue="2025-06-26" />
            </div>
            <div className="form-group">
              <label className="form-label">Montant *</label>
              <input type="number" className="form-input" placeholder="MAD" />
            </div>
            <div className="form-group">
              <label className="form-label">Kilométrage *</label>
              <input type="number" className="form-input" />
            </div>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setShowForm(false)}>
              Annuler
            </button>
            <button className="btn btn-primary">
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
          style={{ marginBottom: '1rem' }}
        >
          <Plus size={18} />
          Ajouter une nouveau consommation
        </button>
      </div>

      <div className="table-container">
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Gestion des consommations (0)</h3>
          <input type="text" placeholder="Search" className="form-input" style={{ width: '200px' }} />
        </div>
        <div className="empty-state">
          <p>aucun élément</p>
        </div>
      </div>
    </div>
  );
};

export default Consommations; 