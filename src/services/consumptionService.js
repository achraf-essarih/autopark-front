const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ConsumptionService {
  // Obtenir le token d'authentification
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Obtenir toutes les consommations
  async getConsumptions() {
    try {
      const response = await fetch(`${API_BASE_URL}/consumptions`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des consommations');
      }

      return {
        success: true,
        consumptions: data.consumptions || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des consommations:', error);
      return {
        success: false,
        message: error.message,
        consumptions: []
      };
    }
  }

  // Obtenir une consommation par ID
  async getConsumptionById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/consumptions/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération de la consommation');
      }

      return {
        success: true,
        consumption: data.consumption || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la consommation:', error);
      return {
        success: false,
        message: error.message,
        consumption: null
      };
    }
  }

  // Créer une nouvelle consommation
  async createConsumption(consumptionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/consumptions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(consumptionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la consommation');
      }

      return {
        success: true,
        consumption: data.consumption || data,
        message: 'Consommation créée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création de la consommation:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Mettre à jour une consommation
  async updateConsumption(id, consumptionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/consumptions/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(consumptionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour de la consommation');
      }

      return {
        success: true,
        consumption: data.consumption || data,
        message: 'Consommation mise à jour avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la consommation:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Supprimer une consommation
  async deleteConsumption(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/consumptions/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression de la consommation');
      }

      return {
        success: true,
        message: 'Consommation supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la consommation:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Obtenir les statistiques des consommations
  async getConsumptionStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/consumptions/stats`, {
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
          totalConsumption: 0,
          totalCost: 0,
          monthlyConsumption: 0,
          averageConsumption: 0
        }
      };
    }
  }

  // Obtenir les consommations par véhicule
  async getConsumptionsByVehicle(vehicleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/consumptions/vehicle/${vehicleId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des consommations du véhicule');
      }

      return {
        success: true,
        consumptions: data.consumptions || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des consommations du véhicule:', error);
      return {
        success: false,
        message: error.message,
        consumptions: []
      };
    }
  }
}

export default new ConsumptionService(); 