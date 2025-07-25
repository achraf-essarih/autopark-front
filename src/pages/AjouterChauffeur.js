import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Save, ArrowLeft, Phone, Mail, MapPin, 
  CreditCard, Calendar, CheckCircle, AlertCircle
} from 'lucide-react';
import chauffeurService from '../services/chauffeurService';
import '../styles/AjouterChauffeur.css';
import '../styles/glassmorphism.css';

const AjouterChauffeur = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    numero_permis: '',
    type_permis: '',
    date_expiration_permis: '',
    telephone: '',
    email: '',
    adresse: '',
    actif: true
  });

  const typePermisOptions = [
    { value: '', label: 'Sélectionner un type de permis' },
    { value: 'B', label: 'Permis B (Voiture)' },
    { value: 'C', label: 'Permis C (Poids lourd)' },
    { value: 'D', label: 'Permis D (Transport en commun)' },
    { value: 'BE', label: 'Permis BE (Voiture + remorque)' },
    { value: 'CE', label: 'Permis CE (Poids lourd + remorque)' },
    { value: 'DE', label: 'Permis DE (Transport en commun + remorque)' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await chauffeurService.createChauffeur(formData);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Chauffeur ajouté avec succès!'
        });
        
        // Rediriger vers la liste des chauffeurs après 2 secondes
        setTimeout(() => {
          navigate('/liste-chauffeurs');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Erreur lors de l\'ajout du chauffeur'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du chauffeur:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'ajout du chauffeur'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/liste-chauffeurs');
  };

  return (
    <div className="ajouter-chauffeur-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <div className="page-icon">
              <UserPlus size={32} />
            </div>
            <div>
              <h1>Ajouter un Chauffeur</h1>
              <p>Saisir les informations du nouveau chauffeur</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              <ArrowLeft size={18} />
              Retour à la liste
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="form-container glass-card">
          <form onSubmit={handleSubmit} className="chauffeur-form">
            <div className="form-sections">
              <div className="form-section">
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
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Nom de famille"
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date de naissance</label>
                    <input
                      type="date"
                      name="date_naissance"
                      value={formData.date_naissance}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
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
                      value={formData.numero_permis}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Numéro du permis de conduire"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type de permis *</label>
                    <select
                      name="type_permis"
                      value={formData.type_permis}
                      onChange={handleInputChange}
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
                      value={formData.date_expiration_permis}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
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
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Adresse email"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Adresse</label>
                    <textarea
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="3"
                      placeholder="Adresse complète"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Statut</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="actif"
                      checked={formData.actif}
                      onChange={handleInputChange}
                    />
                    <span>Chauffeur actif</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Ajouter le chauffeur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjouterChauffeur; 