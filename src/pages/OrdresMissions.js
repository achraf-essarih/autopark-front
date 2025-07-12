import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, FileText, Calendar, Edit2, Trash2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import missionService from '../services/missionService';
import vehicleService from '../services/vehicleService';

const OrdresMissions = () => {
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    vehicule_id: '',
    objet: '',
    date_depart: '',
    date_retour: '',
    destination: '',
    personnel_transporte: '',
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
      
      const [missionsResult, vehiclesResult] = await Promise.all([
        missionService.getMissions(),
        vehicleService.getVehicles()
      ]);
      
      if (missionsResult.success) {
        setMissions(missionsResult.missions);
      } else {
        setError(missionsResult.message || 'Erreur lors du chargement des missions');
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
      objet: '',
      date_depart: '',
      date_retour: '',
      destination: '',
      personnel_transporte: '',
      statut: 'Planifié',
      notes: ''
    });
    setEditingMission(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingMission) {
        result = await missionService.updateMission(editingMission.id, formData);
      } else {
        result = await missionService.createMission(formData);
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
        text: 'Erreur lors de la sauvegarde de la mission'
      });
    }

    // Effacer le message après 5 secondes
    setTimeout(() => setMessage(null), 5000);
  };

  const handleEdit = (mission) => {
    setFormData({
      vehicule_id: mission.vehicule_id || '',
      objet: mission.objet || '',
      date_depart: mission.date_depart ? mission.date_depart.split('T')[0] : '',
      date_retour: mission.date_retour ? mission.date_retour.split('T')[0] : '',
      destination: mission.destination || '',
      personnel_transporte: mission.personnel_transporte || '',
      statut: mission.statut || 'Planifié',
      notes: mission.notes || ''
    });
    setEditingMission(mission);
    setShowForm(true);
  };

  const handleDelete = async (missionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      try {
        const result = await missionService.deleteMission(missionId);
        
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
          text: 'Erreur lors de la suppression de la mission'
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Terminé': return '#10b981';
      case 'En cours': return '#f59e0b';
      case 'Planifié': return '#3b82f6';
      case 'Annulé': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredMissions = missions.filter(mission => {
    const vehicleName = getVehicleName(mission.vehicule_id).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return vehicleName.includes(searchLower) || 
           mission.objet?.toLowerCase().includes(searchLower) ||
           mission.destination?.toLowerCase().includes(searchLower) ||
           mission.statut?.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des missions...</p>
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
          onClick={() => setShowForm(false)}
        >
          <FileText size={18} />
          Liste des ordres des missions ({missions.length})
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
          <h3 style={{ marginBottom: '1.5rem' }}>
            {editingMission ? 'Modifier l\'ordre de mission' : 'Ajouter un ordre de mission'}
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
                  <option value="">Sélectionnez un véhicule</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.marque} {vehicle.modele} ({vehicle.immatriculation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Statut *</label>
                <select 
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Planifié">Planifié</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Pour objet *</label>
              <input 
                type="text" 
                name="objet"
                value={formData.objet}
                onChange={handleInputChange}
                className="form-input" 
                required
              />
            </div>

            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Date de départ *</label>
                <input 
                  type="date" 
                  name="date_depart"
                  value={formData.date_depart}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de retour *</label>
                <input 
                  type="date" 
                  name="date_retour"
                  value={formData.date_retour}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Destination *</label>
                <input 
                  type="text" 
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="form-input" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Personnel transporté</label>
                <input 
                  type="text" 
                  name="personnel_transporte"
                  value={formData.personnel_transporte}
                  onChange={handleInputChange}
                  className="form-input" 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
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
              <button type="submit" className="btn" style={{ 
                background: '#0f2557', 
                color: 'white', 
                borderRadius: '0.375rem',
                padding: '0.75rem 1.5rem'
              }}>
                {editingMission ? 'Modifier' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
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
            <h3>Ordres des missions ({filteredMissions.length})</h3>
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

          {filteredMissions.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>{searchTerm ? 'Aucune mission trouvée' : 'Aucun ordre de mission'}</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Véhicule</th>
                  <th>Objet</th>
                  <th>Destination</th>
                  <th>Date départ</th>
                  <th>Date retour</th>
                  <th>Personnel</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissions.map((mission) => (
                  <tr key={mission.id}>
                    <td>{getVehicleName(mission.vehicule_id)}</td>
                    <td>{mission.objet}</td>
                    <td>{mission.destination}</td>
                    <td>{formatDate(mission.date_depart)}</td>
                    <td>{formatDate(mission.date_retour)}</td>
                    <td>{mission.personnel_transporte || 'N/A'}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(mission.statut) }}
                      >
                        {mission.statut}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          onClick={() => handleEdit(mission)}
                          className="btn-icon"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(mission.id)}
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
      )}
    </div>
  );
};

export default OrdresMissions; 