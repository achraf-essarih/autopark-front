const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(verifyToken);

// GET /api/vehicles - Récupérer tous les véhicules
router.get('/', async (req, res) => {
  try {
    const [vehicles] = await db.execute(`
      SELECT * FROM vehicles 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      vehicles: vehicles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des véhicules'
    });
  }
});

// GET /api/vehicles/stats - Récupérer les statistiques des véhicules
router.get('/stats', async (req, res) => {
  try {
    const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM vehicles');
    const [excellentResult] = await db.execute('SELECT COUNT(*) as count FROM vehicles WHERE etat_mecanique = "Excellent"');
    const [bonResult] = await db.execute('SELECT COUNT(*) as count FROM vehicles WHERE etat_mecanique = "Bon"');
    const [mauvaisResult] = await db.execute('SELECT COUNT(*) as count FROM vehicles WHERE etat_mecanique = "Mauvais"');
    const [essenceResult] = await db.execute('SELECT COUNT(*) as count FROM vehicles WHERE mode_carburant = "Essence"');
    const [dieselResult] = await db.execute('SELECT COUNT(*) as count FROM vehicles WHERE mode_carburant = "Diesel"');
    
    res.json({
      success: true,
      stats: {
        total: totalResult[0].total,
        excellent: excellentResult[0].count,
        bon: bonResult[0].count,
        mauvais: mauvaisResult[0].count,
        essence: essenceResult[0].count,
        diesel: dieselResult[0].count
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// GET /api/vehicles/:id - Récupérer un véhicule par ID
router.get('/:id', async (req, res) => {
  try {
    const [vehicles] = await db.execute(
      'SELECT * FROM vehicles WHERE id = ?',
      [req.params.id]
    );
    
    if (vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }
    
    res.json({
      success: true,
      vehicle: vehicles[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du véhicule'
    });
  }
});

// POST /api/vehicles - Créer un nouveau véhicule
router.post('/', async (req, res) => {
  try {
    const {
      nom,
      marque,
      modele,
      date_mise_circulation,
      immatriculation,
      carburant,
      boite_vitesses,
      rapport,
      nombre_portes,
      etat_mecanique,
      puissance_fiscale,
      plein_reservoir,
      kilometrage,
      consommation_100km,
      description
    } = req.body;

    // Validation des champs requis
    if (!nom || !marque || !modele || !immatriculation) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, marque, modèle et immatriculation sont requis'
      });
    }

    // Validation de la consommation
    if (consommation_100km && (consommation_100km < 3.0 || consommation_100km > 25.0)) {
      return res.status(400).json({
        success: false,
        message: 'La consommation doit être entre 3.0 et 25.0 L/100km. Valeur saisie: ' + consommation_100km
      });
    }

    // Validation de la puissance fiscale
    if (puissance_fiscale && (puissance_fiscale < 1 || puissance_fiscale > 50)) {
      return res.status(400).json({
        success: false,
        message: 'La puissance fiscale doit être entre 1 et 50 CV'
      });
    }

    // Validation du plein de réservoir
    if (plein_reservoir && (plein_reservoir < 10.0 || plein_reservoir > 200.0)) {
      return res.status(400).json({
        success: false,
        message: 'Le plein de réservoir doit être entre 10.0 et 200.0 litres'
      });
    }

    // Vérifier si l'immatriculation existe déjà
    const [existingVehicle] = await db.execute(
      'SELECT id FROM vehicles WHERE immatriculation = ?',
      [immatriculation]
    );

    if (existingVehicle.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un véhicule avec cette immatriculation existe déjà'
      });
    }

    const [result] = await db.execute(`
      INSERT INTO vehicles (
        nom_vehicule, marque, modele, date_mise_circulation, immatriculation,
        mode_carburant, boite_vitesses, rapport, nombre_ports, etat_mecanique,
        puissance_fiscale, plein_reservoir, kilometrage, consommation_l100,
        description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      nom, marque, modele, date_mise_circulation, immatriculation,
      carburant, boite_vitesses, rapport, nombre_portes, etat_mecanique,
      puissance_fiscale, plein_reservoir, kilometrage, consommation_100km,
      description
    ]);

    // Récupérer le véhicule créé
    const [newVehicle] = await db.execute(
      'SELECT * FROM vehicles WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Véhicule créé avec succès',
      vehicle: newVehicle[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du véhicule'
    });
  }
});

// PUT /api/vehicles/:id - Mettre à jour un véhicule
router.put('/:id', async (req, res) => {
  try {
    const {
      nom,
      marque,
      modele,
      date_mise_circulation,
      immatriculation,
      carburant,
      boite_vitesses,
      rapport,
      nombre_portes,
      etat_mecanique,
      puissance_fiscale,
      plein_reservoir,
      kilometrage,
      consommation_100km,
      description
    } = req.body;

    // Vérifier si le véhicule existe
    const [existingVehicle] = await db.execute(
      'SELECT id FROM vehicles WHERE id = ?',
      [req.params.id]
    );

    if (existingVehicle.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    // Vérifier si l'immatriculation existe déjà pour un autre véhicule
    const [duplicateVehicle] = await db.execute(
      'SELECT id FROM vehicles WHERE immatriculation = ? AND id != ?',
      [immatriculation, req.params.id]
    );

    if (duplicateVehicle.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un autre véhicule avec cette immatriculation existe déjà'
      });
    }

    await db.execute(`
      UPDATE vehicles SET
        nom_vehicule = ?, marque = ?, modele = ?, date_mise_circulation = ?, immatriculation = ?,
        mode_carburant = ?, boite_vitesses = ?, rapport = ?, nombre_ports = ?, etat_mecanique = ?,
        puissance_fiscale = ?, plein_reservoir = ?, kilometrage = ?, consommation_l100 = ?,
        description = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      nom, marque, modele, date_mise_circulation, immatriculation,
      carburant, boite_vitesses, rapport, nombre_portes, etat_mecanique,
      puissance_fiscale, plein_reservoir, kilometrage, consommation_100km,
      description, req.params.id
    ]);

    // Récupérer le véhicule mis à jour
    const [updatedVehicle] = await db.execute(
      'SELECT * FROM vehicles WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Véhicule mis à jour avec succès',
      vehicle: updatedVehicle[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du véhicule'
    });
  }
});

// DELETE /api/vehicles/:id - Supprimer un véhicule
router.delete('/:id', async (req, res) => {
  try {
    // Vérifier si le véhicule existe
    const [existingVehicle] = await db.execute(
      'SELECT id FROM vehicles WHERE id = ?',
      [req.params.id]
    );

    if (existingVehicle.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    // Vérifier s'il y a des consommations liées
    const [consumptions] = await db.execute(
      'SELECT id FROM consommations WHERE vehicule_id = ?',
      [req.params.id]
    );

    // Vérifier s'il y a des interventions liées
    const [interventions] = await db.execute(
      'SELECT id FROM interventions WHERE vehicule_id = ?',
      [req.params.id]
    );

    // Vérifier s'il y a des missions liées
    const [missions] = await db.execute(
      'SELECT id FROM ordres_missions WHERE vehicule_id = ?',
      [req.params.id]
    );

    if (consumptions.length > 0 || interventions.length > 0 || missions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce véhicule car il a des données associées (consommations, interventions ou missions)'
      });
    }

    await db.execute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);

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

module.exports = router; 