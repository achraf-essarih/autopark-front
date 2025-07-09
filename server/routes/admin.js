const express = require('express');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Middleware pour vérifier que l'utilisateur est admin
router.use(verifyToken);
router.use(isAdmin);

// Routes pour gérer les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

router.get('/responsables', async (req, res) => {
  try {
    const responsables = await User.findResponsables();
    
    res.json({
      success: true,
      responsables
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des responsables:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des responsables'
    });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { nom, prenom, email, password, role = 'responsable' } = req.body;
    // Validation des données
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }
    
    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.toLowerCase().trim(),
      password,
      role
    });
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur'
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Validation de l'email
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'email invalide'
        });
      }
      
      // Vérifier si l'email existe déjà (sauf pour cet utilisateur)
      if (email.toLowerCase() !== user.email.toLowerCase()) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Cet email est déjà utilisé'
          });
        }
      }
    }
    
    // Préparer les données à mettre à jour
    const updateData = {};
    if (nom) updateData.nom = nom.trim();
    if (prenom) updateData.prenom = prenom.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role;
    
    // Mettre à jour
    const updatedUser = await User.update(id, updateData);
    
    res.json({
      success: true,
      message: 'Utilisateur modifié avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'utilisateur'
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Soft delete
    await User.delete(id);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
});

// Routes pour gérer les véhicules
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll();
    
    res.json({
      success: true,
      vehicles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des véhicules'
    });
  }
});

router.get('/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }
    
    res.json({
      success: true,
      vehicle
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du véhicule'
    });
  }
});

router.post('/vehicles', async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Validation des données obligatoires
    const requiredFields = ['nom_vehicule', 'marque', 'modele', 'date_mise_circulation', 'immatriculation', 'mode_carburant', 'boite_vitesses', 'nombre_ports', 'puissance_fiscale', 'plein_reservoir', 'consommation_l100'];
    
    for (const field of requiredFields) {
      if (!vehicleData[field]) {
        return res.status(400).json({
          success: false,
          message: `Le champ ${field} est obligatoire`
        });
      }
    }
    
    // Validation des valeurs numériques
    if (vehicleData.puissance_fiscale < 1 || vehicleData.puissance_fiscale > 50) {
      return res.status(400).json({
        success: false,
        message: 'La puissance fiscale doit être entre 1 et 50'
      });
    }
    
    if (vehicleData.plein_reservoir < 10 || vehicleData.plein_reservoir > 200) {
      return res.status(400).json({
        success: false,
        message: 'Le réservoir doit être entre 10 et 200 litres'
      });
    }
    
    if (vehicleData.consommation_l100 < 3 || vehicleData.consommation_l100 > 25) {
      return res.status(400).json({
        success: false,
        message: 'La consommation doit être entre 3 et 25 L/100km'
      });
    }
    
    // Vérifier si l'immatriculation existe déjà
    const existingVehicle = await Vehicle.findByImmatriculation(vehicleData.immatriculation);
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Cette immatriculation est déjà utilisée'
      });
    }
    
    // Créer le véhicule
    const vehicle = await Vehicle.create(vehicleData);
    
    res.status(201).json({
      success: true,
      message: 'Véhicule créé avec succès',
      vehicle
    });
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du véhicule'
    });
  }
});

router.put('/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }
    
    // Validations
    if (updateData.puissance_fiscale && (updateData.puissance_fiscale < 1 || updateData.puissance_fiscale > 50)) {
      return res.status(400).json({
        success: false,
        message: 'La puissance fiscale doit être entre 1 et 50'
      });
    }
    
    if (updateData.plein_reservoir && (updateData.plein_reservoir < 10 || updateData.plein_reservoir > 200)) {
      return res.status(400).json({
        success: false,
        message: 'Le réservoir doit être entre 10 et 200 litres'
      });
    }
    
    if (updateData.consommation_l100 && (updateData.consommation_l100 < 3 || updateData.consommation_l100 > 25)) {
      return res.status(400).json({
        success: false,
        message: 'La consommation doit être entre 3 et 25 L/100km'
      });
    }
    
    // Vérifier si l'immatriculation existe déjà (sauf pour ce véhicule)
    if (updateData.immatriculation && updateData.immatriculation !== vehicle.immatriculation) {
      const existingVehicle = await Vehicle.findByImmatriculation(updateData.immatriculation, id);
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Cette immatriculation est déjà utilisée'
        });
      }
    }
    
    // Mettre à jour
    const updatedVehicle = await Vehicle.update(id, updateData);
    
    res.json({
      success: true,
      message: 'Véhicule modifié avec succès',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Erreur lors de la modification du véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du véhicule'
    });
  }
});

router.delete('/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }
    
    // Soft delete
    await Vehicle.delete(id);
    
    res.json({
      success: true,
      message: 'Véhicule supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du véhicule'
    });
  }
});

// Route pour les statistiques
router.get('/stats', async (req, res) => {
  try {
    const userStats = await User.countByRole();
    const vehicleStats = await Vehicle.getStatistics();
    
    const stats = {
      totalUsers: userStats.reduce((total, stat) => total + parseInt(stat.count), 0),
      totalAdmins: userStats.find(stat => stat.role === 'admin')?.count || 0,
      totalResponsables: userStats.find(stat => stat.role === 'responsable')?.count || 0,
      totalVehicles: vehicleStats.total_vehicules || 0,
      vehiclesExcellent: vehicleStats.excellent || 0,
      vehiclesBon: vehicleStats.bon || 0,
      vehiclesMauvais: vehicleStats.mauvais || 0,
      vehiclesEssence: vehicleStats.essence || 0,
      vehiclesDiesel: vehicleStats.diesel || 0,
      kilometrageMoyen: parseFloat(vehicleStats.kilometrage_moyen || 0),
      consommationMoyenne: parseFloat(vehicleStats.consommation_moyenne || 0)
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

module.exports = router; 