import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import consumptionService from '../services/consumptionService';
import vehicleService from '../services/vehicleService';

const Consommations = () => {
  const [consumptions, setConsumptions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    vehicule_id: '',
    date_consommation: '',
    quantite: '',
    prix_unitaire: '',
    montant_total: '',
    kilometrage: '',
    type_carburant: 'Essence',
    station_service: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [consumptionsResult, vehiclesResult] = await Promise.all([
        consumptionService.getConsumptions(),
        vehicleService.getVehicles()
      ]);
      
      if (consumptionsResult.success) {
        setConsumptions(consumptionsResult.consumptions);
      } else {
        setError(consumptionsResult.message || 'Erreur lors du chargement des consommations');
      }

      if (vehiclesResult.success) {
        setVehicles(vehiclesResult.vehicles);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Calculer le montant total automatiquement
      if (name === 'quantite' || name === 'prix_unitaire') {
        const quantite = parseFloat(name === 'quantite' ? value : prev.quantite) || 0;
        const prixUnitaire = parseFloat(name === 'prix_unitaire' ? value : prev.prix_unitaire) || 0;
        newData.montant_total = (quantite * prixUnitaire).toFixed(2);
      }
      
      return newData;
    });
  };

  const resetForm = () => {
    setFormData({
      vehicule_id: '',
      date_consommation: '',
      quantite: '',
      prix_unitaire: '',
      montant_total: '',
      kilometrage: '',
      type_carburant: 'Essence',
      station_service: '',
      notes: ''
    });
    setEditingConsumption(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingConsumption) {
        result = await consumptionService.updateConsumption(editingConsumption.id, formData);
      } else {
        result = await consumptionService.createConsumption(formData);
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });
        resetForm();
        loadData();
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
        text: 'Erreur lors de la sauvegarde de la consommation'
      });
    }

    // Effacer le message après 5 secondes
    setTimeout(() => setMessage(null), 5000);
  };

  const handleEdit = (consumption) => {
    setFormData({
      vehicule_id: consumption.vehicule_id || '',
      date_consommation: consumption.date_consommation ? consumption.date_consommation.split('T')[0] : '',
      quantite: consumption.quantite || '',
      prix_unitaire: consumption.prix_unitaire || '',
      montant_total: consumption.montant_total || '',
      kilometrage: consumption.kilometrage || '',
      type_carburant: consumption.type_carburant || 'Essence',
      station_service: consumption.station_service || '',
      notes: consumption.notes || ''
    });
    setEditingConsumption(consumption);
    setShowForm(true);
  };

  const handleDelete = async (consumptionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette consommation ?')) {
      try {
        const result = await consumptionService.deleteConsumption(consumptionId);
        
        if (result.success) {
          setMessage({
            type: 'success',
            text: result.message
          });
          loadData();
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
          text: 'Erreur lors de la suppression de la consommation'
        });
      }

      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.marque} ${vehicle.modele} (${vehicle.immatriculation})` : 'Véhicule inconnu';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredConsumptions = consumptions.filter(consumption => {
    const vehicleName = getVehicleName(consumption.vehicule_id).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return vehicleName.includes(searchLower) || 
           consumption.station_service?.toLowerCase().includes(searchLower) ||
           consumption.type_carburant?.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des consommations...</p>
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
        <h1 className="page-title">Consommations</h1>
      </div>

      {showForm && (
        <div className="form-container">
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
            {editingConsumption ? 'Modifier la consommation' : 'Ajouter une nouvelle consommation'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Véhicule *</label>
                <select 
                  name="vehicule_id"
                  value={formData.vehicule_id}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Choisissez un véhicule</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.marque} {vehicle.modele} ({vehicle.immatriculation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input 
                  type="date" 
                  name="date_consommation"
                  value={formData.date_consommation}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type de carburant *</label>
                <select 
                  name="type_carburant"
                  value={formData.type_carburant}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantité (L) *</label>
                <input 
                  type="number" 
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleInputChange}
                  className="form-input" 
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prix unitaire (MAD/L) *</label>
                <input 
                  type="number" 
                  name="prix_unitaire"
                  value={formData.prix_unitaire}
                  onChange={handleInputChange}
                  className="form-input" 
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Montant total (MAD) *</label>
                <input 
                  type="number" 
                  name="montant_total"
                  value={formData.montant_total}
                  onChange={handleInputChange}
                  className="form-input" 
                  step="0.01"
                  required
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kilométrage *</label>
                <input 
                  type="number" 
                  name="kilometrage"
                  value={formData.kilometrage}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Station service</label>
                <input 
                  type="text" 
                  name="station_service"
                  value={formData.station_service}
                  onChange={handleInputChange}
                  className="form-input" 
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea" 
                rows="3"
              ></textarea>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={resetForm}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                {editingConsumption ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
          style={{ marginBottom: '1rem' }}
        >
          <Plus size={18} />
          Ajouter une nouvelle consommation
        </button>
      </div>

      <div className="table-container">
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={loadData} className="retry-button">
              Réessayer
            </button>
          </div>
        )}

        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Gestion des consommations ({filteredConsumptions.length})</h3>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input" 
              style={{ width: '200px', paddingLeft: '2.5rem' }} 
            />
          </div>
        </div>

        {filteredConsumptions.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm ? 'Aucune consommation trouvée' : 'Aucune consommation enregistrée'}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Date</th>
                <th>Type</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Montant total</th>
                <th>Kilométrage</th>
                <th>Station</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConsumptions.map((consumption) => (
                <tr key={consumption.id}>
                  <td>{getVehicleName(consumption.vehicule_id)}</td>
                  <td>{formatDate(consumption.date_consommation)}</td>
                  <td>{consumption.type_carburant}</td>
                  <td>{consumption.quantite} L</td>
                  <td>{formatCurrency(consumption.prix_unitaire)}</td>
                  <td>{formatCurrency(consumption.montant_total)}</td>
                  <td>{consumption.kilometrage} km</td>
                  <td>{consumption.station_service || 'N/A'}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(consumption)}
                        className="btn-icon"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(consumption.id)}
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

export default Consommations; 