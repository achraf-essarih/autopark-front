const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AdminService {
  // Obtenir le token d'authentification
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Gestion des utilisateurs
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des utilisateurs');
      }

      return {
        success: true,
        users: data.users || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return {
        success: false,
        message: error.message,
        users: []
      };
    }
  }

  async getResponsables() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/responsables`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des responsables');
      }

      return {
        success: true,
        responsables: data.responsables || data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des responsables:', error);
      return {
        success: false,
        message: error.message,
        responsables: []
      };
    }
  }

  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de l\'utilisateur');
      }

      return {
        success: true,
        user: data.user || data,
        message: 'Utilisateur créé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      }

      return {
        success: true,
        user: data.user || data,
        message: 'Utilisateur modifié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async deleteUser(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression de l\'utilisateur');
      }

      return {
        success: true,
        message: 'Utilisateur supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Gestion des véhicules
  async getVehicles() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vehicles`, {
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

  async createVehicle(vehicleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vehicles`, {
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

  async updateVehicle(id, vehicleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vehicles/${id}`, {
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
        message: 'Véhicule modifié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du véhicule:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async deleteVehicle(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vehicles/${id}`, {
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

  // Statistiques du tableau de bord
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
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
          totalUsers: 0,
          totalVehicles: 0,
          totalInterventions: 0,
          totalConsommations: 0
        }
      };
    }
  }

  // Rapports
  async getReports(type, dateRange) {
    try {
      const params = new URLSearchParams({
        type,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`${API_BASE_URL}/admin/reports?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la génération du rapport');
      }

      return {
        success: true,
        report: data.report || data
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      return {
        success: false,
        message: error.message,
        report: null
      };
    }
  }
}

export default new AdminService(); 