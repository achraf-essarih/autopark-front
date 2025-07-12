import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { INTERVENTION_TABS } from '../utils/constants';
import interventionService from '../services/interventionService';
import vehicleService from '../services/vehicleService';

const Interventions = () => {
  const [interventions, setInterventions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assurance');
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    vehicule_id: '',
    type_intervention: 'assurance',
    date_intervention: '',
    description: '',
    cout: '',
    statut: 'Planifiée',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [interventionsResult, vehiclesResult] = await Promise.all([
        interventionService.getInterventions(),
        vehicleService.getVehicles()
      ]);
      
      if (interventionsResult.success) {
        setInterventions(interventionsResult.interventions);
      } else {
        setError(interventionsResult.message || 'Erreur lors du chargement des interventions');
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      vehicule_id: '',
      type_intervention: activeTab,
      date_intervention: '',
      description: '',
      cout: '',
      statut: 'Planifiée',
      notes: ''
    });
    setEditingIntervention(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        ...formData,
        type_intervention: activeTab
      };

      let result;
      if (editingIntervention) {
        result = await interventionService.updateIntervention(editingIntervention.id, dataToSend);
      } else {
        result = await interventionService.createIntervention(dataToSend);
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
        text: 'Erreur lors de la sauvegarde de l\'intervention'
      });
    }

    // Effacer le message après 5 secondes
    setTimeout(() => setMessage(null), 5000);
  };

  const handleEdit = (intervention) => {
    setFormData({
      vehicule_id: intervention.vehicule_id || '',
      type_intervention: intervention.type_intervention || activeTab,
      date_intervention: intervention.date_intervention ? intervention.date_intervention.split('T')[0] : '',
      description: intervention.description || '',
      cout: intervention.cout || '',
      statut: intervention.statut || 'Planifiée',
      notes: intervention.notes || ''
    });
    setEditingIntervention(intervention);
  };

  const handleDelete = async (interventionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      try {
        const result = await interventionService.deleteIntervention(interventionId);
        
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
          text: 'Erreur lors de la suppression de l\'intervention'
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

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Terminée': return '#10b981';
      case 'En cours': return '#f59e0b';
      case 'Planifiée': return '#3b82f6';
      case 'Annulée': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredInterventions = interventions.filter(intervention => {
    const matchesTab = intervention.type_intervention === activeTab;
    const vehicleName = getVehicleName(intervention.vehicule_id).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = vehicleName.includes(searchLower) || 
                         intervention.description?.toLowerCase().includes(searchLower) ||
                         intervention.statut?.toLowerCase().includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFormData(prev => ({
      ...prev,
      type_intervention: tabId
    }));
    setEditingIntervention(null);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des interventions...</p>
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
        <h1 className="page-title">Interventions</h1>
      </div>

      <div className="intervention-tabs">
        {INTERVENTION_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`intervention-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="intervention-content">
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
            {editingIntervention ? 'Modifier l\'intervention' : 'Ajouter une intervention'} | {INTERVENTION_TABS.find(t => t.id === activeTab)?.label} ({filteredInterventions.length})
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
                  name="date_intervention"
                  value={formData.date_intervention}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Coût (MAD)</label>
                <input 
                  type="number" 
                  name="cout"
                  value={formData.cout}
                  onChange={handleInputChange}
                  className="form-input" 
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Statut *</label>
                <select 
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Planifiée">Planifiée</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminée">Terminée</option>
                  <option value="Annulée">Annulée</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea" 
                rows="3"
              ></textarea>
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
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingIntervention ? 'Modifier' : 'Ajouter'}
              </button>
              {editingIntervention && (
                <button type="button" className="btn" onClick={resetForm}>
                  Annuler
                </button>
              )}
            </div>
          </form>
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
            <h3>Interventions {INTERVENTION_TABS.find(t => t.id === activeTab)?.label} ({filteredInterventions.length})</h3>
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

          {filteredInterventions.length === 0 ? (
            <div className="empty-state">
              <p>{searchTerm ? 'Aucune intervention trouvée' : 'Aucune intervention enregistrée'}</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Véhicule</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Coût</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterventions.map((intervention) => (
                  <tr key={intervention.id}>
                    <td>{getVehicleName(intervention.vehicule_id)}</td>
                    <td>{formatDate(intervention.date_intervention)}</td>
                    <td>{intervention.description || 'N/A'}</td>
                    <td>{intervention.cout ? formatCurrency(intervention.cout) : 'N/A'}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(intervention.statut) }}
                      >
                        {intervention.statut}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          onClick={() => handleEdit(intervention)}
                          className="btn-icon"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(intervention.id)}
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
    </div>
  );
};

export default Interventions; 