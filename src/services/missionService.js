const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class MissionService {
  // Obtenir le token d'authentification
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Obtenir toutes les missions
  async getMissions() {
    try {
      const response = await fetch(`${API_BASE_URL}/missions`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des missions');
      }

      return {
        success: true,
        missions: data.missions || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des missions:', error);
      return {
        success: false,
        message: error.message,
        missions: []
      };
    }
  }

  // Obtenir une mission par ID
  async getMissionById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération de la mission');
      }

      return {
        success: true,
        mission: data.mission || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la mission:', error);
      return {
        success: false,
        message: error.message,
        mission: null
      };
    }
  }

  // Créer une nouvelle mission
  async createMission(missionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/missions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(missionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la mission');
      }

      return {
        success: true,
        mission: data.mission || data,
        message: 'Mission créée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création de la mission:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Mettre à jour une mission
  async updateMission(id, missionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(missionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour de la mission');
      }

      return {
        success: true,
        mission: data.mission || data,
        message: 'Mission mise à jour avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la mission:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Supprimer une mission
  async deleteMission(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression de la mission');
      }

      return {
        success: true,
        message: 'Mission supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la mission:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Obtenir les statistiques des missions
  async getMissionStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/stats`, {
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
          totalMissions: 0,
          completedMissions: 0,
          pendingMissions: 0,
          totalDistance: 0
        }
      };
    }
  }

  // Obtenir les missions par véhicule
  async getMissionsByVehicle(vehicleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/vehicle/${vehicleId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des missions du véhicule');
      }

      return {
        success: true,
        missions: data.missions || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des missions du véhicule:', error);
      return {
        success: false,
        message: error.message,
        missions: []
      };
    }
  }

  // Obtenir les missions par responsable
  async getMissionsByResponsable(responsableId) {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/responsable/${responsableId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des missions du responsable');
      }

      return {
        success: true,
        missions: data.missions || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des missions du responsable:', error);
      return {
        success: false,
        message: error.message,
        missions: []
      };
    }
  }
}

export default new MissionService(); 