const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class InterventionService {
  // Obtenir le token d'authentification
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Obtenir toutes les interventions
  async getInterventions() {
    try {
      const response = await fetch(`${API_BASE_URL}/interventions`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des interventions');
      }

      return {
        success: true,
        interventions: data.interventions || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des interventions:', error);
      return {
        success: false,
        message: error.message,
        interventions: []
      };
    }
  }

  // Obtenir une intervention par ID
  async getInterventionById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/interventions/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération de l\'intervention');
      }

      return {
        success: true,
        intervention: data.intervention || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'intervention:', error);
      return {
        success: false,
        message: error.message,
        intervention: null
      };
    }
  }

  // Créer une nouvelle intervention
  async createIntervention(interventionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/interventions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(interventionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de l\'intervention');
      }

      return {
        success: true,
        intervention: data.intervention || data,
        message: 'Intervention créée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'intervention:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Mettre à jour une intervention
  async updateIntervention(id, interventionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/interventions/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(interventionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour de l\'intervention');
      }

      return {
        success: true,
        intervention: data.intervention || data,
        message: 'Intervention mise à jour avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'intervention:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Supprimer une intervention
  async deleteIntervention(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/interventions/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression de l\'intervention');
      }

      return {
        success: true,
        message: 'Intervention supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'intervention:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Obtenir les statistiques des interventions
  async getInterventionStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/interventions/stats`, {
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
          totalInterventions: 0,
          totalCost: 0,
          monthlyInterventions: 0,
          averageCost: 0
        }
      };
    }
  }

  // Obtenir les interventions par véhicule
  async getInterventionsByVehicle(vehicleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/interventions/vehicle/${vehicleId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des interventions du véhicule');
      }

      return {
        success: true,
        interventions: data.interventions || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des interventions du véhicule:', error);
      return {
        success: false,
        message: error.message,
        interventions: []
      };
    }
  }
}

export default new InterventionService(); 