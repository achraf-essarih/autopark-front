import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, AlertCircle, CheckCircle, Search, Car, Calendar, FileText, Settings } from 'lucide-react';
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
          text: result.message || 'Erreur lors de l\'opération'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'opération'
      });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const handleEdit = (intervention) => {
    setFormData({
      vehicule_id: intervention.vehicule_id,
      type_intervention: intervention.type_intervention,
      date_intervention: intervention.date_intervention ? intervention.date_intervention.split('T')[0] : '',
      description: intervention.description || '',
      cout: intervention.cout || '',
      statut: intervention.statut,
      notes: intervention.notes || ''
    });
    setEditingIntervention(intervention);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      return;
    }

    try {
      const result = await interventionService.deleteIntervention(id);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });
        loadData();
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Erreur lors de la suppression'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression'
      });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const filteredInterventions = interventions.filter(intervention => {
    const matchesType = intervention.type_intervention === activeTab;
    const matchesSearch = searchTerm === '' || 
      intervention.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getVehicleName(intervention.vehicule_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.marque} ${vehicle.modele} (${vehicle.immatriculation})` : 'Véhicule inconnu';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(2)} MAD`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'planifiée': return 'pending';
      case 'en cours': return 'progress';
      case 'terminée': return 'completed';
      case 'annulée': return 'cancelled';
      default: return 'pending';
    }
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, type_intervention: activeTab }));
  }, [activeTab]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Interventions</h1>
        </div>
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Gestion des Interventions</h1>
        <p className="page-subtitle">Planifiez et suivez toutes les interventions de votre parc automobile</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="intervention-tabs">
        {INTERVENTION_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`intervention-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="content-container">
        <div className="intervention-form">
          <h3 className="form-title">
            {editingIntervention ? 'Modifier l\'intervention' : 'Ajouter une intervention'} | {INTERVENTION_TABS.find(t => t.id === activeTab)?.label}
          </h3>
          
          <form onSubmit={handleSubmit}>
            {/* Section 1: Informations principales */}
            <div className="form-section">
              <div className="section-header">
                <Car size={20} />
                <h4>Informations principales</h4>
              </div>
              <div className="form-grid-two">
                <div className="form-field">
                  <label className="form-label">
                    Véhicule <span className="required">*</span>
                  </label>
                  <select 
                    name="vehicule_id"
                    value={formData.vehicule_id}
                    onChange={handleInputChange}
                    className="form-input-clean"
                    required
                  >
                    <option value="">Sélectionnez un véhicule</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.marque} {vehicle.modele} ({vehicle.immatriculation})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Statut <span className="required">*</span>
                  </label>
                  <select 
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="form-input-clean"
                  >
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Planning et dates */}
            <div className="form-section">
              <div className="section-header">
                <Calendar size={20} />
                <h4>Planning et coût</h4>
              </div>
              <div className="form-grid-two">
                <div className="form-field">
                  <label className="form-label">
                    Date d'intervention <span className="required">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="date_intervention"
                    value={formData.date_intervention}
                    onChange={handleInputChange}
                    className="form-input-clean" 
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Coût (MAD)</label>
                  <input 
                    type="number" 
                    name="cout"
                    value={formData.cout}
                    onChange={handleInputChange}
                    className="form-input-clean" 
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Détails et observations */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h4>Description et observations</h4>
              </div>
              <div className="form-field">
                <label className="form-label">Description de l'intervention</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea-clean" 
                  rows="3"
                  placeholder="Décrivez en détail l'intervention à effectuer ou effectuée..."
                ></textarea>
              </div>
              <div className="form-field">
                <label className="form-label">Notes additionnelles</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-textarea-clean" 
                  rows="3"
                  placeholder="Commentaires, observations particulières..."
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingIntervention ? '✓ Modifier l\'intervention' : '+ Ajouter l\'intervention'}
              </button>
              {editingIntervention && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {error && (
          <div className="message error">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={loadData} className="btn btn-secondary">
              Réessayer
            </button>
          </div>
        )}

        <div className="search-container">
          <h3 style={{ color: 'var(--glass-text-primary)', margin: 0 }}>
            Interventions {INTERVENTION_TABS.find(t => t.id === activeTab)?.label} ({filteredInterventions.length})
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--glass-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input" 
              style={{ width: '250px', paddingLeft: '2.5rem' }} 
            />
          </div>
        </div>

        {filteredInterventions.length === 0 ? (
          <div className="chart-empty-state">
            <div className="chart-empty-icon">
              <AlertCircle size={48} />
            </div>
            <div className="chart-empty-title">
              {searchTerm ? 'Aucune intervention trouvée' : 'Aucune intervention enregistrée'}
            </div>
            <div className="chart-empty-subtitle">
              {searchTerm ? 'Essayez de modifier votre recherche' : `Commencez par ajouter une intervention ${INTERVENTION_TABS.find(t => t.id === activeTab)?.label.toLowerCase()}`}
            </div>
          </div>
        ) : (
          <div className="professional-table">
            <table>
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
                      <span className={`status-badge ${getStatusColor(intervention.statut)}`}>
                        {intervention.statut}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          onClick={() => handleEdit(intervention)}
                          className="action-btn edit"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(intervention.id)}
                          className="action-btn delete"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Interventions; 