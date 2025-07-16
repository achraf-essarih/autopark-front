import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Edit2, Trash2, Eye, AlertCircle, CheckCircle, 
  UserCheck, UserX, Calendar, Phone, Mail, MapPin, CreditCard, X
} from 'lucide-react';
import chauffeurService from '../services/chauffeurService';
import '../styles/ListeChauffeurs.css';
import '../styles/glassmorphism.css';

const ListeChauffeurs = () => {
  const navigate = useNavigate();
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const typePermisOptions = [
    { value: 'B', label: 'Permis B (Voiture)' },
    { value: 'C', label: 'Permis C (Poids lourd)' },
    { value: 'D', label: 'Permis D (Transport en commun)' },
    { value: 'BE', label: 'Permis BE (Voiture + remorque)' },
    { value: 'CE', label: 'Permis CE (Poids lourd + remorque)' },
    { value: 'DE', label: 'Permis DE (Transport en commun + remorque)' }
  ];

  useEffect(() => {
    loadChauffeurs();
  }, []);

  const loadChauffeurs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await chauffeurService.getChauffeurs();
      
      if (result.success) {
        setChauffeurs(result.chauffeurs);
      } else {
        setError(result.message || 'Erreur lors du chargement des chauffeurs');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des chauffeurs:', error);
      setError('Erreur lors du chargement des chauffeurs');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setShowViewModal(true);
  };

  const handleEdit = (chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setEditFormData({
      nom: chauffeur.nom || '',
      prenom: chauffeur.prenom || '',
      date_naissance: chauffeur.date_naissance ? chauffeur.date_naissance.split('T')[0] : '',
      numero_permis: chauffeur.numero_permis || '',
      type_permis: chauffeur.type_permis || 'B',
      date_expiration_permis: chauffeur.date_expiration_permis ? chauffeur.date_expiration_permis.split('T')[0] : '',
      telephone: chauffeur.telephone || '',
      email: chauffeur.email || '',
      adresse: chauffeur.adresse || '',
      actif: chauffeur.actif === 1 || chauffeur.actif === true
    });
    setShowEditModal(true);
  };

  const handleDelete = async (chauffeur) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le chauffeur ${chauffeur.prenom} ${chauffeur.nom} ?`)) {
      try {
        const result = await chauffeurService.deleteChauffeur(chauffeur.id);
        
        if (result.success) {
          setMessage({
            type: 'success',
            text: result.message
          });
          loadChauffeurs();
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
          text: 'Erreur lors de la suppression du chauffeur'
        });
      }

      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await chauffeurService.updateChauffeur(selectedChauffeur.id, editFormData);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });
        setShowEditModal(false);
        loadChauffeurs();
      } else {
        setMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la modification du chauffeur'
      });
    }

    // Effacer le message après 5 secondes
    setTimeout(() => setMessage(null), 5000);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} ans`;
  };

  const getPermisStatus = (dateString) => {
    if (!dateString) return { status: 'unknown', label: 'Inconnu', color: '#6b7280' };
    
    const expirationDate = new Date(dateString);
    const today = new Date();
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'expired', label: 'Expiré', color: '#ef4444' };
    } else if (diffDays <= 30) {
      return { status: 'expiring', label: 'Expire bientôt', color: '#f59e0b' };
    } else {
      return { status: 'valid', label: 'Valide', color: '#10b981' };
    }
  };

  const getTypePermisLabel = (type) => {
    const option = typePermisOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const filteredChauffeurs = chauffeurs.filter(chauffeur => {
    const searchLower = searchTerm.toLowerCase();
    return (
      chauffeur.nom.toLowerCase().includes(searchLower) ||
      chauffeur.prenom.toLowerCase().includes(searchLower) ||
      chauffeur.numero_permis.toLowerCase().includes(searchLower) ||
      chauffeur.telephone.toLowerCase().includes(searchLower) ||
      (chauffeur.email && chauffeur.email.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="liste-chauffeurs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des chauffeurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Gestion des Chauffeurs</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/ajouter-chauffeur')}
        >
          <Plus size={18} />
          Ajouter un chauffeur
        </button>
      </div>

      <div className="content-container">
        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {error && (
          <div className="message error">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={loadChauffeurs} className="btn btn-secondary">
              Réessayer
            </button>
          </div>
        )}

        <div className="search-container">
          <h3 style={{ color: 'var(--glass-text-primary)', margin: 0 }}>
            Liste des chauffeurs ({filteredChauffeurs.length})
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--glass-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, numéro de permis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ width: '350px', paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {filteredChauffeurs.length === 0 ? (
          <div className="chart-empty-state">
            <div className="chart-empty-icon">
              <Users size={48} />
            </div>
            <div className="chart-empty-title">
              Aucun chauffeur trouvé
            </div>
            <div className="chart-empty-subtitle">
              {searchTerm 
                ? 'Aucun chauffeur ne correspond à votre recherche.' 
                : 'Commencez par ajouter votre premier chauffeur.'
              }
            </div>
            {!searchTerm && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/ajouter-chauffeur')}
              >
                <Plus size={18} />
                Ajouter un chauffeur
              </button>
            )}
          </div>
        ) : (
          <div className="professional-table">
            <table>
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>Permis</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Statut permis</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChauffeurs.map(chauffeur => {
                  const permisStatus = getPermisStatus(chauffeur.date_expiration_permis);
                  return (
                    <tr key={chauffeur.id}>
                      <td>
                        <div>
                          <strong>{chauffeur.prenom} {chauffeur.nom}</strong>
                          {chauffeur.date_naissance && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--glass-text-muted)' }}>
                              {calculateAge(chauffeur.date_naissance)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{chauffeur.numero_permis}</strong>
                          <div style={{ fontSize: '0.875rem', color: 'var(--glass-text-muted)' }}>
                            {getTypePermisLabel(chauffeur.type_permis)}
                          </div>
                        </div>
                      </td>
                      <td>{chauffeur.telephone}</td>
                      <td>{chauffeur.email || 'N/A'}</td>
                      <td>
                        <span 
                          className={`status-badge ${permisStatus.status === 'valid' ? 'success' : permisStatus.status === 'expiring' ? 'warning' : 'danger'}`}
                        >
                          {permisStatus.label}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${chauffeur.actif ? 'success' : 'secondary'}`}>
                          {chauffeur.actif ? (
                            <>
                              <UserCheck size={14} />
                              Actif
                            </>
                          ) : (
                            <>
                              <UserX size={14} />
                              Inactif
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn view"
                            onClick={() => handleView(chauffeur)}
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(chauffeur)}
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(chauffeur)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de visualisation */}
      {showViewModal && selectedChauffeur && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails du chauffeur</h2>
              <button 
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-sections">
                <div className="detail-section">
                  <h3>
                    <Users size={18} />
                    Informations personnelles
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Nom complet</label>
                      <span>{selectedChauffeur.prenom} {selectedChauffeur.nom}</span>
                    </div>
                    <div className="detail-item">
                      <label>Date de naissance</label>
                      <span>{formatDate(selectedChauffeur.date_naissance)} ({calculateAge(selectedChauffeur.date_naissance)})</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>
                    <CreditCard size={18} />
                    Permis de conduire
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Numéro de permis</label>
                      <span>{selectedChauffeur.numero_permis}</span>
                    </div>
                    <div className="detail-item">
                      <label>Type de permis</label>
                      <span>{getTypePermisLabel(selectedChauffeur.type_permis)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Date d'expiration</label>
                      <span>
                        {formatDate(selectedChauffeur.date_expiration_permis)}
                        <span 
                          className="status-badge small"
                          style={{ backgroundColor: getPermisStatus(selectedChauffeur.date_expiration_permis).color, marginLeft: '0.5rem' }}
                        >
                          {getPermisStatus(selectedChauffeur.date_expiration_permis).label}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>
                    <Phone size={18} />
                    Informations de contact
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Téléphone</label>
                      <span>{selectedChauffeur.telephone}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <span>{selectedChauffeur.email || 'N/A'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Adresse</label>
                      <span>{selectedChauffeur.adresse || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Statut</h3>
                  <div className="detail-item">
                    <span className={`status-badge ${selectedChauffeur.actif ? 'active' : 'inactive'}`}>
                      {selectedChauffeur.actif ? (
                        <>
                          <UserCheck size={14} />
                          Actif
                        </>
                      ) : (
                        <>
                          <UserX size={14} />
                          Inactif
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedChauffeur && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier le chauffeur</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="edit-sections">
                <div className="edit-section">
                  <h3>
                    <Users size={18} />
                    Informations personnelles
                  </h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nom *</label>
                      <input
                        type="text"
                        name="nom"
                        value={editFormData.nom}
                        onChange={handleEditInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Prénom *</label>
                      <input
                        type="text"
                        name="prenom"
                        value={editFormData.prenom}
                        onChange={handleEditInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date de naissance</label>
                      <input
                        type="date"
                        name="date_naissance"
                        value={editFormData.date_naissance}
                        onChange={handleEditInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-section">
                  <h3>
                    <CreditCard size={18} />
                    Permis de conduire
                  </h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Numéro de permis *</label>
                      <input
                        type="text"
                        name="numero_permis"
                        value={editFormData.numero_permis}
                        onChange={handleEditInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type de permis *</label>
                      <select
                        name="type_permis"
                        value={editFormData.type_permis}
                        onChange={handleEditInputChange}
                        required
                        className="form-select"
                      >
                        {typePermisOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date d'expiration *</label>
                      <input
                        type="date"
                        name="date_expiration_permis"
                        value={editFormData.date_expiration_permis}
                        onChange={handleEditInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-section">
                  <h3>
                    <Phone size={18} />
                    Informations de contact
                  </h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Téléphone *</label>
                      <input
                        type="tel"
                        name="telephone"
                        value={editFormData.telephone}
                        onChange={handleEditInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Adresse</label>
                      <textarea
                        name="adresse"
                        value={editFormData.adresse}
                        onChange={handleEditInputChange}
                        className="form-textarea"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-section">
                  <h3>Statut</h3>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={editFormData.actif}
                        onChange={handleEditInputChange}
                      />
                      <span>Chauffeur actif</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeChauffeurs; 