const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  // Connexion utilisateur
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Stocker le token et les informations utilisateur
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: error.message || 'Erreur de connexion au serveur'
      };
    }
  }

  // Déconnexion
  async logout() {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage dans tous les cas
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }

    try {
      // Vérifier si le token n'est pas expiré
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Obtenir le token
  getToken() {
    return localStorage.getItem('token');
  }

  // Vérifier le rôle de l'utilisateur
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Vérifier si l'utilisateur est admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Vérifier si l'utilisateur est responsable
  isResponsable() {
    return this.hasRole('responsable');
  }

  // Obtenir le profil utilisateur depuis le serveur
  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Aucun token disponible');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération du profil');
      }

      // Mettre à jour les informations utilisateur locales
      localStorage.setItem('user', JSON.stringify(data.user));

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Changer le mot de passe
  async changePassword(oldPassword, newPassword) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Aucun token disponible');
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      }

      return {
        success: true,
        message: 'Mot de passe modifié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new AuthService(); 