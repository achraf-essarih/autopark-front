import api from './api';

const missionService = {
  async getMissions() {
    try {
      const response = await api.get('/missions');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des missions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des missions'
      };
    }
  },

  async getMission(id) {
    try {
      const response = await api.get(`/missions/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la mission:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération de la mission'
      };
    }
  },

  async createMission(missionData) {
    try {
      const response = await api.post('/missions', missionData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la mission:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création de la mission'
      };
    }
  },

  async updateMission(id, missionData) {
    try {
      const response = await api.put(`/missions/${id}`, missionData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la mission:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour de la mission'
      };
    }
  },

  async deleteMission(id) {
    try {
      const response = await api.delete(`/missions/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression de la mission:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression de la mission'
      };
    }
  },

  async getGeospatialAnalytics() {
    try {
      const response = await api.get('/missions/analytics/geospatial');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses géospatiales:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des analyses'
      };
    }
  },

  async getMissionStats() {
    try {
      const response = await api.get('/missions/stats');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des missions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des statistiques'
      };
    }
  },

  // Service utilitaire pour calculer la distance entre deux points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  // Service pour formater les liens Google Maps
  formatGoogleMapsLink(fromLat, fromLng, toLat, toLng) {
    return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
  },

  // Service pour valider les coordonnées
  validateCoordinates(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
};

export default missionService; 