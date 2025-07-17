import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, FileText, Calendar, Edit2, Trash2, AlertCircle, CheckCircle, Search, UserPlus, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import missionService from '../services/missionService';
import vehicleService from '../services/vehicleService';
import chauffeurService from '../services/chauffeurService';
import GoogleMapsSelector from '../components/GoogleMapsSelector';

const OrdresMissions = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGoogleMaps, setShowGoogleMaps] = useState(false);

  const [formData, setFormData] = useState({
    vehicule_id: '',
    chauffeur_id: '',
    objet: '',
    date_depart: '',
    date_retour: '',
    destination: '',
    personnel_transporte: '',
    statut: 'Planifié',
    notes: '',
    // Nouvelles données Google Maps
    destination_latitude: null,
    destination_longitude: null,
    google_maps_link: '',
    distance_km: null,
    temps_estime_minutes: null,
    lieu_depart: 'Siège social',
    depart_latitude: 33.9716, // Rabat par défaut
    depart_longitude: -6.8498
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [missionsResult, vehiclesResult, chauffeursResult] = await Promise.all([
        missionService.getMissions(),
        vehicleService.getVehicles(),
        chauffeurService.getChauffeursActifs()
      ]);

      if (missionsResult.success) {
        setMissions(missionsResult.missions);
      } else {
        setError(missionsResult.message || 'Erreur lors du chargement des missions');
      }

      if (vehiclesResult.success) {
        setVehicles(vehiclesResult.vehicles);
      }

      if (chauffeursResult.success) {
        setChauffeurs(chauffeursResult.chauffeurs);
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

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      destination: locationData.address,
      destination_latitude: locationData.location.lat,
      destination_longitude: locationData.location.lng,
      google_maps_link: locationData.googleMapsLink
    }));
  };

  const handleDistanceCalculated = (routeData) => {
    setFormData(prev => ({
      ...prev,
      distance_km: routeData.distance,
      temps_estime_minutes: Math.round(routeData.duration)
    }));
  };

  const resetForm = () => {
    setFormData({
      vehicule_id: '',
      chauffeur_id: '',
      objet: '',
      date_depart: '',
      date_retour: '',
      destination: '',
      personnel_transporte: '',
      statut: 'Planifié',
      notes: '',
      destination_latitude: null,
      destination_longitude: null,
      google_maps_link: '',
      distance_km: null,
      temps_estime_minutes: null,
      lieu_depart: 'Siège social',
      depart_latitude: 33.9716,
      depart_longitude: -6.8498
    });
    setEditingMission(null);
    setShowForm(false);
    setShowGoogleMaps(false);
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
      chauffeur_id: mission.chauffeur_id || '',
      objet: mission.objet || '',
      date_depart: mission.date_depart ? mission.date_depart.split('T')[0] : '',
      date_retour: mission.date_retour ? mission.date_retour.split('T')[0] : '',
      destination: mission.destination || '',
      personnel_transporte: mission.personnel_transporte || '',
      statut: mission.statut || 'Planifié',
      notes: mission.notes || '',
      destination_latitude: mission.destination_latitude || null,
      destination_longitude: mission.destination_longitude || null,
      google_maps_link: mission.google_maps_link || '',
      distance_km: mission.distance_km || null,
      temps_estime_minutes: mission.temps_estime_minutes || null,
      lieu_depart: mission.lieu_depart || 'Siège social',
      depart_latitude: mission.depart_latitude || 33.9716,
      depart_longitude: mission.depart_longitude || -6.8498
    });
    setEditingMission(mission);
    setShowForm(true);
    // Afficher la carte si des coordonnées existent
    if (mission.destination_latitude && mission.destination_longitude) {
      setShowGoogleMaps(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      try {
        const result = await missionService.deleteMission(id);
        if (result.success) {
          setMessage({
            type: 'success',
            text: 'Mission supprimée avec succès'
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
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.marque} ${vehicle.modele} (${vehicle.immatriculation})` : 'Véhicule inconnu';
  };

  const getChauffeurName = (chauffeurId) => {
    if (!chauffeurId) return 'Non assigné';
    const chauffeur = chauffeurs.find(c => c.id === chauffeurId);
    return chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : 'Chauffeur inconnu';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Terminé': return 'success';
      case 'En cours': return 'warning';
      case 'Planifié': return 'info';
      case 'Annulé': return 'danger';
      default: return 'secondary';
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

      <div className="page-actions" style={{ marginBottom: '1.5rem' }}>

        <div className="btn-group">
          <button
            className={`btn ${!showForm ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowForm(false)}
          >
            <FileText size={18} />
            Liste des ordres des missions ({missions.length})
          </button>

          <button
            className={`btn ${showForm ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={18} />
            Nouveau ordre de mission
          </button>
        </div>
      </div>

      {showForm && (
        <div className="content-container">
          <div className="professional-form" style={{ color: '#ffffff' }}>
            <h3 className="form-title">
              {editingMission ? 'Modifier l\'ordre de mission' : 'Ajouter un ordre de mission'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Véhicule <span className="required">*</span></label>
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
                <div className="form-field">
                  <label className="form-label">Statut <span className="required">*</span></label>
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

              <div className="form-field">
                <label className="form-label">Pour objet <span className="required">*</span></label>
                <input
                  type="text"
                  name="objet"
                  value={formData.objet}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Décrivez l'objet de la mission..."
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Date de départ <span className="required">*</span></label>
                  <input
                    type="date"
                    name="date_depart"
                    value={formData.date_depart}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Date de retour <span className="required">*</span></label>
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

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Destination <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Lieu de destination..."
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowGoogleMaps(!showGoogleMaps)}
                      className={`btn ${showGoogleMaps ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ minWidth: '140px' }}
                    >
                      <MapPin size={16} />
                      {showGoogleMaps ? 'Masquer carte' : 'Carte interactive'}
                    </button>
                  </div>
                  {formData.distance_km && formData.temps_estime_minutes && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#e8f5e8',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      gap: '1rem'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Navigation size={14} />
                        Distance: {formData.distance_km.toFixed(1)} km
                      </span>
                      <span>
                        Temps estimé: {Math.round(formData.temps_estime_minutes)} min
                      </span>
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-label">Chauffeur <span className="required">*</span></label>
                  <select
                    name="chauffeur_id"
                    value={formData.chauffeur_id}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Sélectionnez un chauffeur</option>
                    {chauffeurs.map(chauffeur => (
                      <option key={chauffeur.id} value={chauffeur.id}>
                        {chauffeur.prenom} {chauffeur.nom} ({chauffeur.numero_permis})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section Google Maps Interactive */}
              {showGoogleMaps && (
                <div className="form-field full-width">
                  <label className="form-label">
                    <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Sélection de destination sur carte
                  </label>
                  <GoogleMapsSelector
                    onLocationSelect={handleLocationSelect}
                    onDistanceCalculated={handleDistanceCalculated}
                    initialDestination={formData.destination}
                    departureLocation={{
                      lat: formData.depart_latitude,
                      lng: formData.depart_longitude
                    }}
                    height="450px"
                  />
                </div>
              )}

              <div className="form-field">
                <label className="form-label">Personnel transporté</label>
                <input
                  type="text"
                  name="personnel_transporte"
                  value={formData.personnel_transporte}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ex: 3 passagers, Équipe technique..."
                />
              </div>

              <div className="form-field">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                  placeholder="Notes additionnelles..."
                ></textarea>
              </div>

              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMission ? 'Modifier' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="content-container">
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
              Ordres des missions ({filteredMissions.length})
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

          {filteredMissions.length === 0 ? (
            <div className="chart-empty-state">
              <div className="chart-empty-icon">
                <ClipboardList size={48} />
              </div>
              <div className="chart-empty-title">
                {searchTerm ? 'Aucune mission trouvée' : 'Aucun ordre de mission'}
              </div>
              <div className="chart-empty-subtitle">
                {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par créer votre premier ordre de mission'}
              </div>
            </div>
          ) : (
            <div className="professional-table">
              <table>
                <thead>
                  <tr>
                    <th>Véhicule</th>
                    <th>Chauffeur</th>
                    <th>Objet</th>
                    <th>Destination</th>
                    <th>Distance</th>
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
                      <td>{getChauffeurName(mission.chauffeur_id)}</td>
                      <td>{mission.objet}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{mission.destination}</span>
                          {mission.google_maps_link && (
                            <a
                              href={mission.google_maps_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#4285f4', textDecoration: 'none' }}
                              title="Ouvrir dans Google Maps"
                            >
                              <Navigation size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div>{mission.distance_km} km</div>
                        </div>
                      </td>
                      <td>{formatDate(mission.date_depart)}</td>
                      <td>{formatDate(mission.date_retour)}</td>
                      <td>{mission.personnel_transporte || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(mission.statut)}`}>
                          {mission.statut}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleEdit(mission)}
                            className="action-btn edit"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(mission.id)}
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
      )}
    </div>
  );
};

export default OrdresMissions; 