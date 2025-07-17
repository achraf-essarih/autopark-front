import React, { useState, useEffect } from 'react';
import { X, Users, Plus, List, User, Mail, Lock, Edit2, Trash2, AlertCircle } from 'lucide-react';
import adminService from '../services/adminService';
import '../styles/glassmorphism.css';

const SettingsModal = ({ isOpen, onClose, user }) => {
  const [activeSection, setActiveSection] = useState('add-responsible');
  const [responsibles, setResponsibles] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && activeSection === 'list-responsibles') {
      loadResponsibles();
    }
  }, [isOpen, activeSection]);

  const loadResponsibles = async () => {
    try {
      setLoading(true);
      const response = await adminService.getResponsables();
      if (response.success) {
        setResponsibles(response.responsables);
      } else {
        setError(response.message || 'Erreur lors du chargement des responsables');
      }
    } catch (error) {
      setError(error.message || 'Erreur lors du chargement des responsables');
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
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (editingId) {
        const response = await adminService.updateUser(editingId, formData);
        if (response.success) {
          setSuccess('Responsable modifié avec succès');
          setEditingId(null);
        } else {
          setError(response.message || 'Erreur lors de la modification');
          return;
        }
      } else {
        const response = await adminService.createUser(formData);
        if (response.success) {
          setSuccess('Responsable ajouté avec succès');
        } else {
          setError(response.message || 'Erreur lors de la création');
          return;
        }
      }
      
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: ''
      });
      
      if (activeSection === 'list-responsibles') {
        loadResponsibles();
      }
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (responsible) => {
    setFormData({
      nom: responsible.nom,
      prenom: responsible.prenom,
      email: responsible.email,
      password: ''
    });
    setEditingId(responsible.id);
    setActiveSection('add-responsible');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce responsable ?')) {
      try {
        setLoading(true);
        const response = await adminService.deleteUser(id);
        if (response.success) {
          setSuccess('Responsable supprimé avec succès');
          loadResponsibles();
        } else {
          setError(response.message || 'Erreur lors de la suppression');
        }
      } catch (error) {
        setError(error.message || 'Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const renderAddResponsibleForm = () => (
    <div className="settings-content">
      <div className="settings-content-header">
        <h3>{editingId ? 'Modifier le responsable' : 'Ajouter un nouveau responsable'}</h3>
        <p>Remplissez le formulaire pour {editingId ? 'modifier' : 'ajouter'} un responsable</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              <User size={16} />
              Nom
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Entrez le nom"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <User size={16} />
              Prénom
            </label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Entrez le prénom"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Entrez l'email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Mot de passe {editingId && <span className="optional">(laisser vide pour ne pas changer)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Entrez le mot de passe"
              required={!editingId}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Plus size={16} />
            {loading ? 'En cours...' : (editingId ? 'Modifier le responsable' : 'Ajouter le responsable')}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setEditingId(null);
                setFormData({ nom: '', prenom: '', email: '', password: '' });
                clearMessages();
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderResponsiblesList = () => (
    <div className="settings-content">
      <div className="settings-content-header">
        <h3>Liste des responsables</h3>
        <p>Gérez tous les responsables du système</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✓ {success}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des responsables...</p>
          </div>
        ) : responsibles.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>Aucun responsable trouvé</h3>
            <p>Commencez par ajouter un nouveau responsable</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {responsibles.map(responsible => (
                <tr key={responsible.id}>
                  <td>{responsible.nom}</td>
                  <td>{responsible.prenom}</td>
                  <td>{responsible.email}</td>
                  <td>
                    <span className={`status ${responsible.actif ? 'active' : 'inactive'}`}>
                      {responsible.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>{new Date(responsible.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(responsible)}
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(responsible.id)}
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

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2>Paramètres Admin</h2>
          <button className="settings-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-modal-content">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              <button 
                className={`settings-nav-item ${activeSection === 'add-responsible' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('add-responsible');
                  clearMessages();
                }}
              >
                <Plus size={18} />
                Ajouter responsable
              </button>
              
              <button 
                className={`settings-nav-item ${activeSection === 'list-responsibles' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('list-responsibles');
                  clearMessages();
                }}
              >
                <List size={18} />
                Liste des responsables
              </button>
            </nav>
          </div>

          <div className="settings-main">
            {activeSection === 'add-responsible' && renderAddResponsibleForm()}
            {activeSection === 'list-responsibles' && renderResponsiblesList()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 