import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import chauffeurService from '../services/chauffeurService';
import '../styles/AjouterChauffeur.css';

const AjouterChauffeur = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    numero_permis: '',
    type_permis: 'B',
    date_expiration_permis: '',
    telephone: '',
    email: '',
    adresse: '',
    actif: true
  });

  const [errors, setErrors] = useState({});

  const typePermisOptions = [
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation des champs obligatoires
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
    }
    
    if (!formData.numero_permis.trim()) {
      newErrors.numero_permis = 'Le numéro de permis est obligatoire';
    }
    
    if (!formData.date_expiration_permis) {
      newErrors.date_expiration_permis = 'La date d\'expiration du permis est obligatoire';
    } else {
      // Vérifier que la date d'expiration n'est pas dans le passé
      const expirationDate = new Date(formData.date_expiration_permis);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expirationDate < today) {
        newErrors.date_expiration_permis = 'La date d\'expiration ne peut pas être dans le passé';
      }
    }
    
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est obligatoire';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Le numéro de téléphone n\'est pas valide';
    }
    
    // Validation de l'email si fourni
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'adresse email n\'est pas valide';
    }
    
    // Validation de la date de naissance si fournie
    if (formData.date_naissance) {
      const birthDate = new Date(formData.date_naissance);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || age > 80) {
        newErrors.date_naissance = 'L\'âge doit être entre 18 et 80 ans';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <h1 className="page-title">Ajouter un chauffeur</h1>
        </div>
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

        <div className="professional-form">
          <form onSubmit={handleSubmit}>
            {/* Informations personnelles */}
            <div className="form-section">
              <h3 className="form-title">
                <User size={20} />
                Informations personnelles
              </h3>
          
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">
                    Nom <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className={`form-input ${errors.nom ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="Nom de famille"
                  />
                  {errors.nom && <span className="error-message">{errors.nom}</span>}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Prénom <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className={`form-input ${errors.prenom ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="Prénom"
                  />
                  {errors.prenom && <span className="error-message">{errors.prenom}</span>}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    <Calendar size={16} />
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="date_naissance"
                    value={formData.date_naissance}
                    onChange={handleInputChange}
                    className={`form-input ${errors.date_naissance ? 'error' : ''}`}
                    disabled={loading}
                  />
                  {errors.date_naissance && <span className="error-message">{errors.date_naissance}</span>}
                </div>
              </div>
            </div>

            {/* Informations du permis */}
            <div className="form-section">
              <h3 className="form-title">
                <CreditCard size={20} />
                Informations du permis de conduire
              </h3>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">
                    Numéro de permis <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="numero_permis"
                    value={formData.numero_permis}
                    onChange={handleInputChange}
                    className={`form-input ${errors.numero_permis ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="Numéro du permis de conduire"
                  />
                  {errors.numero_permis && <span className="error-message">{errors.numero_permis}</span>}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Type de permis <span className="required">*</span>
                  </label>
                  <select
                    name="type_permis"
                    value={formData.type_permis}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={loading}
                  >
                    {typePermisOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Date d'expiration <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_expiration_permis"
                    value={formData.date_expiration_permis}
                    onChange={handleInputChange}
                    className={`form-input ${errors.date_expiration_permis ? 'error' : ''}`}
                    disabled={loading}
                  />
                  {errors.date_expiration_permis && <span className="error-message">{errors.date_expiration_permis}</span>}
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="form-section">
              <h3 className="form-title">
                <Phone size={20} />
                Informations de contact
              </h3>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">
                    <Phone size={16} />
                    Téléphone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.telephone ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="+212 6XX XXX XXX"
                  />
                  {errors.telephone && <span className="error-message">{errors.telephone}</span>}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    disabled={loading}
                    placeholder="email@example.com"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-field full-width">
                  <label className="form-label">
                    <MapPin size={16} />
                    Adresse
                  </label>
                  <textarea
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="form-textarea"
                    disabled={loading}
                    placeholder="Adresse complète"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="form-section">
              <h3 className="form-title">Statut</h3>
              
              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="actif"
                    checked={formData.actif}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <span className="checkbox-text">Chauffeur actif</span>
                </label>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="btn-group">
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
                {loading ? 'Ajout en cours...' : 'Ajouter le chauffeur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjouterChauffeur; 