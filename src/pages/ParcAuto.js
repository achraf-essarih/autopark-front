import React, { useState } from 'react';
import { Plus, Car } from 'lucide-react';

const ParcAuto = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Parc Auto</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} />
            Nouveau véhicule
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Ajouter un véhicule</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom de véhicule *</label>
              <input type="text" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Marque de véhicule *</label>
              <select className="form-select">
                <option>Choisissez une option</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Modèle de véhicule *</label>
              <select className="form-select">
                <option>Choisissez une option</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date de mise en circulation *</label>
              <input type="date" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Immatriculation *</label>
              <input type="text" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Mode carburant *</label>
              <select className="form-select">
                <option>Essence</option>
                <option>Diesel</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Boîte de vitesses *</label>
              <select className="form-select">
                <option>Manuelle</option>
                <option>Automatique</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rapport *</label>
              <select className="form-select">
                <option>5 Rapport</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre de port *</label>
              <select className="form-select">
                <option>2 Port</option>
                <option>4 Port</option>
                <option>5 Port</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">État Mécanique *</label>
              <select className="form-select">
                <option>Mauvais</option>
                <option>Bon</option>
                <option>Excellent</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Puissance fiscal (cv) *</label>
              <input type="number" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Plein de réservoir (L) *</label>
              <input type="number" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Kilométrage *</label>
              <input type="number" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Consommation L/100 *</label>
              <input type="number" className="form-input" step="0.1" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows="4"></textarea>
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

      <div className="table-container">
        <div className="empty-state">
          <Car size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>Aucun véhicule enregistré</p>
        </div>
      </div>
    </div>
  );
};

export default ParcAuto; 