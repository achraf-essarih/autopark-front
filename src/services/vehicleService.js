const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class VehicleService {
  // Obtenir le token d'authentification
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Obtenir tous les véhicules
  async getVehicles() {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des véhicules');
      }

      return {
        success: true,
        vehicles: data.vehicles || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      return {
        success: false,
        message: error.message,
        vehicles: []
      };
    }
  }

  // Obtenir un véhicule par ID
  async getVehicleById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération du véhicule');
      }

      return {
        success: true,
        vehicle: data.vehicle || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du véhicule:', error);
      return {
        success: false,
        message: error.message,
        vehicle: null
      };
    }
  }

  // Créer un nouveau véhicule
  async createVehicle(vehicleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehicleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création du véhicule');
      }

      return {
        success: true,
        vehicle: data.vehicle || data,
        message: 'Véhicule créé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création du véhicule:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Mettre à jour un véhicule
  async updateVehicle(id, vehicleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehicleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du véhicule');
      }

      return {
        success: true,
        vehicle: data.vehicle || data,
        message: 'Véhicule mis à jour avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du véhicule:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Supprimer un véhicule
  async deleteVehicle(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression du véhicule');
      }

      return {
        success: true,
        message: 'Véhicule supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du véhicule:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Obtenir les statistiques des véhicules
  async getVehicleStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des statistiques');
      }

      return {
        success: true,
        stats: data.stats || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        success: false,
        message: error.message,
        stats: {
          total: 0,
          excellent: 0,
          bon: 0,
          mauvais: 0,
          essence: 0,
          diesel: 0
        }
      };
    }
  }
}

export default new VehicleService(); 