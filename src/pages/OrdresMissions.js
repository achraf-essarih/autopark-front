import React, { useState } from 'react';
import { ClipboardList, Plus, FileText, Calendar } from 'lucide-react';

const OrdresMissions = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Ordres des missions</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          className="btn" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
                         background: '#1e40af',  
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem'
          }}
        >
          <FileText size={18} />
          Liste des ordres des missions
        </button>

        <button 
          className="btn" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
                         background: '#1e40af',  
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem'
          }}
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Nouveau ordre de mission
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3 style={{ marginBottom: '1.5rem' }}>Ajouter un ordre de mission</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Véhicule :</label>
              <select className="form-select">
                <option>Sélectionnez</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type :</label>
              <select className="form-select">
                <option>Sélectionnez</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Pour objet:</label>
            <input type="text" className="form-input" />
          </div>

          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date de départ :</label>
              <input type="date" className="form-input" defaultValue="0000-00-00" />
            </div>
            <div className="form-group">
              <label className="form-label">Date de retour :</label>
              <input type="date" className="form-input" defaultValue="0000-00-00" />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Autorisé à se rendre :</label>
              <input type="text" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Personnel transporté :</label>
              <input type="text" className="form-input" />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn" style={{ 
              background: '#0f2557', 
              color: 'white', 
              borderRadius: '0.375rem',
              padding: '0.75rem 1.5rem'
            }}>
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="table-container">
          <div className="empty-state">
            <ClipboardList size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>Aucun ordre de mission</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdresMissions; 