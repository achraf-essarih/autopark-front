import React, { useState, useEffect } from 'react';
import { Plus, Car, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import vehicleService from '../services/vehicleService';

const ParcAuto = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    nom: '',
    marque: '',
    modele: '',
    date_mise_circulation: '',
    immatriculation: '',
    carburant: 'Essence',
    boite_vitesses: 'Manuelle',
    rapport: '5 Rapport',
    nombre_portes: '4 Port',
    etat_mecanique: 'Bon',
    puissance_fiscale: '',
    plein_reservoir: '',
    kilometrage: '',
    consommation_100km: '',
    description: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await vehicleService.getVehicles();
      
      if (result.success) {
        setVehicles(result.vehicles);
      } else {
        setError(result.message || 'Erreur lors du chargement des véhicules');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
      setError('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      marque: '',
      modele: '',
      date_mise_circulation: '',
      immatriculation: '',
      carburant: 'Essence',
      boite_vitesses: 'Manuelle',
      rapport: '5 Rapport',
      nombre_portes: '4 Port',
      etat_mecanique: 'Bon',
      puissance_fiscale: '',
      plein_reservoir: '',
      kilometrage: '',
      consommation_100km: '',
      description: ''
    });
    setEditingVehicle(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingVehicle) {
        result = await vehicleService.updateVehicle(editingVehicle.id, formData);
      } else {
        result = await vehicleService.createVehicle(formData);
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });
        resetForm();
        loadVehicles();
      } else {
        setMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde du véhicule'
      });
    }

    // Effacer le message après 5 secondes
    setTimeout(() => setMessage(null), 5000);
  };

  const handleEdit = (vehicle) => {
    setFormData({
      nom: vehicle.nom || '',
      marque: vehicle.marque || '',
      modele: vehicle.modele || '',
      date_mise_circulation: vehicle.date_mise_circulation ? vehicle.date_mise_circulation.split('T')[0] : '',
      immatriculation: vehicle.immatriculation || '',
      carburant: vehicle.carburant || 'Essence',
      boite_vitesses: vehicle.boite_vitesses || 'Manuelle',
      rapport: vehicle.rapport || '5 Rapport',
      nombre_portes: vehicle.nombre_portes || '4 Port',
      etat_mecanique: vehicle.etat_mecanique || 'Bon',
      puissance_fiscale: vehicle.puissance_fiscale || '',
      plein_reservoir: vehicle.plein_reservoir || '',
      kilometrage: vehicle.kilometrage || '',
      consommation_100km: vehicle.consommation_100km || '',
      description: vehicle.description || ''
    });
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        const result = await vehicleService.deleteVehicle(vehicleId);
        
        if (result.success) {
          setMessage({
            type: 'success',
            text: result.message
          });
          loadVehicles();
        } else {
          setMessage({
            type: 'error',
            text: result.message
          });
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setMessage({
          type: 'error',
          text: 'Erreur lors de la suppression du véhicule'
        });
      }

      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'Excellent': return '#10b981';
      case 'Bon': return '#f59e0b';
      case 'Mauvais': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des véhicules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

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
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
            {editingVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nom de véhicule *</label>
                <input 
                  type="text" 
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Marque de véhicule *</label>
                <input 
                  type="text" 
                  name="marque"
                  value={formData.marque}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Modèle de véhicule *</label>
                <input 
                  type="text" 
                  name="modele"
                  value={formData.modele}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de mise en circulation *</label>
                <input 
                  type="date" 
                  name="date_mise_circulation"
                  value={formData.date_mise_circulation}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Immatriculation *</label>
                <input 
                  type="text" 
                  name="immatriculation"
                  value={formData.immatriculation}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mode carburant *</label>
                <select 
                  name="carburant"
                  value={formData.carburant}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Boîte de vitesses *</label>
                <select 
                  name="boite_vitesses"
                  value={formData.boite_vitesses}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Manuelle">Manuelle</option>
                  <option value="Automatique">Automatique</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rapport *</label>
                <select 
                  name="rapport"
                  value={formData.rapport}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="5 Rapport">5 Rapport</option>
                  <option value="6 Rapport">6 Rapport</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre de portes *</label>
                <select 
                  name="nombre_portes"
                  value={formData.nombre_portes}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="2 Port">2 Portes</option>
                  <option value="4 Port">4 Portes</option>
                  <option value="5 Port">5 Portes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">État Mécanique *</label>
                <select 
                  name="etat_mecanique"
                  value={formData.etat_mecanique}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Mauvais">Mauvais</option>
                  <option value="Bon">Bon</option>
                  <option value="Excellent">Excellent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Puissance fiscal (cv) *</label>
                <input 
                  type="number" 
                  name="puissance_fiscale"
                  value={formData.puissance_fiscale}
                  onChange={handleInputChange}
                  className="form-input" 
                  min="1"
                  max="50"
                  required
                  title="La puissance fiscale doit être entre 1 et 50 CV"
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Valeur entre 1 et 50 CV
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Plein de réservoir (L) *</label>
                <input 
                  type="number" 
                  name="plein_reservoir"
                  value={formData.plein_reservoir}
                  onChange={handleInputChange}
                  className="form-input" 
                  min="10.0"
                  max="200.0"
                  step="0.1"
                  required
                  title="Le plein de réservoir doit être entre 10.0 et 200.0 litres"
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Valeur entre 10.0 et 200.0 litres
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Kilométrage *</label>
                <input 
                  type="number" 
                  name="kilometrage"
                  value={formData.kilometrage}
                  onChange={handleInputChange}
                  className="form-input" 
                  min="0"
                  required
                  title="Le kilométrage doit être positif"
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Valeur en kilomètres
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Consommation L/100km *</label>
                <input 
                  type="number" 
                  name="consommation_100km"
                  value={formData.consommation_100km}
                  onChange={handleInputChange}
                  className="form-input" 
                  step="0.1" 
                  min="3.0"
                  max="25.0"
                  required
                  title="La consommation doit être entre 3.0 et 25.0 L/100km"
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Valeur entre 3.0 et 25.0 L/100km
                </small>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea" 
                rows="4"
              ></textarea>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={resetForm}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                {editingVehicle ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={loadVehicles} className="retry-button">
              Réessayer
            </button>
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="empty-state">
            <Car size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>Aucun véhicule enregistré</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Marque</th>
                <th>Modèle</th>
                <th>Immatriculation</th>
                <th>Carburant</th>
                <th>État</th>
                <th>Kilométrage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.nom}</td>
                  <td>{vehicle.marque}</td>
                  <td>{vehicle.modele}</td>
                  <td>{vehicle.immatriculation}</td>
                  <td>{vehicle.carburant}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getEtatColor(vehicle.etat_mecanique) }}
                    >
                      {vehicle.etat_mecanique}
                    </span>
                  </td>
                  <td>{vehicle.kilometrage ? `${vehicle.kilometrage} km` : 'N/A'}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(vehicle)}
                        className="btn-icon"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(vehicle.id)}
                        className="btn-icon btn-danger"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ParcAuto; 