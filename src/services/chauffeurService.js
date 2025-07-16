import api from './api';

const chauffeurService = {
  // Récupérer tous les chauffeurs
  async getChauffeurs() {
    try {
      const response = await api.get('/chauffeurs');
      return {
        success: true,
        chauffeurs: response.chauffeurs || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des chauffeurs:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des chauffeurs'
      };
    }
  },

  // Récupérer les chauffeurs actifs seulement
  async getChauffeursActifs() {
    try {
      const response = await api.get('/chauffeurs/actifs');
      return {
        success: true,
        chauffeurs: response.chauffeurs || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des chauffeurs actifs:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des chauffeurs actifs'
      };
    }
  },

  // Récupérer un chauffeur par ID
  async getChauffeurById(id) {
    try {
      const response = await api.get(`/chauffeurs/${id}`);
      return {
        success: true,
        chauffeur: response.chauffeur
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du chauffeur:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du chauffeur'
      };
    }
  },

  // Créer un nouveau chauffeur
  async createChauffeur(chauffeurData) {
    try {
      const response = await api.post('/chauffeurs', chauffeurData);
      return {
        success: true,
        message: response.message || 'Chauffeur créé avec succès',
        chauffeur: response.chauffeur
      };
    } catch (error) {
      console.error('Erreur lors de la création du chauffeur:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du chauffeur'
      };
    }
  },

  // Mettre à jour un chauffeur
  async updateChauffeur(id, chauffeurData) {
    try {
      const response = await api.put(`/chauffeurs/${id}`, chauffeurData);
      return {
        success: true,
        message: response.message || 'Chauffeur mis à jour avec succès',
        chauffeur: response.chauffeur
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du chauffeur:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du chauffeur'
      };
    }
  },

  // Supprimer un chauffeur
  async deleteChauffeur(id) {
    try {
      await api.delete(`/chauffeurs/${id}`);
      return {
        success: true,
        message: 'Chauffeur supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du chauffeur:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression du chauffeur'
      };
    }
  },

  // Vérifier la validité du permis
  async verifierPermis(id) {
    try {
      const response = await api.get(`/chauffeurs/${id}/permis`);
      return {
        success: true,
        permis: response.data.permis
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du permis:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la vérification du permis'
      };
    }
  },

  // Obtenir les statistiques des chauffeurs
  async getStatistiques() {
    try {
      const response = await api.get('/chauffeurs/statistiques');
      return {
        success: true,
        statistiques: response.statistiques
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des statistiques'
      };
    }
  }
};

export default chauffeurService; 