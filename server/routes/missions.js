const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(verifyToken);

// GET /api/missions - Récupérer toutes les missions
router.get('/', async (req, res) => {
  try {
    const [missions] = await db.execute(`
      SELECT m.*, 
             m.objet_mission as objet, 
             m.lieu_destination as destination, 
             m.observations as notes,
             v.nom_vehicule as vehicule_nom, 
             v.immatriculation 
      FROM ordres_missions m
      LEFT JOIN vehicles v ON m.vehicule_id = v.id
      ORDER BY m.date_depart DESC
    `);
    
    res.json({
      success: true,
      missions: missions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des missions'
    });
  }
});

// GET /api/missions/stats - Récupérer les statistiques des missions
router.get('/stats', async (req, res) => {
  try {
    const [totalCountResult] = await db.execute('SELECT COUNT(*) as total FROM ordres_missions');
    const [planifieeResult] = await db.execute('SELECT COUNT(*) as count FROM ordres_missions WHERE statut = "Planifié"');
    const [enCoursResult] = await db.execute('SELECT COUNT(*) as count FROM ordres_missions WHERE statut = "En cours"');
    const [termineeResult] = await db.execute('SELECT COUNT(*) as count FROM ordres_missions WHERE statut = "Terminé"');
    const [annuleeResult] = await db.execute('SELECT COUNT(*) as count FROM ordres_missions WHERE statut = "Annulé"');
    
    res.json({
      success: true,
      stats: {
        total: totalCountResult[0].total || 0,
        planifiee: planifieeResult[0].count || 0,
        enCours: enCoursResult[0].count || 0,
        terminee: termineeResult[0].count || 0,
        annulee: annuleeResult[0].count || 0
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

// POST /api/missions - Créer une nouvelle mission
router.post('/', async (req, res) => {
  try {
    const {
      vehicule_id,
      objet,
      destination,
      date_depart,
      date_retour,
      personnel_transporte,
      statut,
      kilometrage_depart,
      kilometrage_retour,
      notes
    } = req.body;

    // Validation des champs requis
    if (!vehicule_id || !objet || !destination || !date_depart) {
      return res.status(400).json({
        success: false,
        message: 'Les champs véhicule, objet, destination et date de départ sont requis'
      });
    }

    // Vérifier si le véhicule existe
    const [vehicle] = await db.execute(
      'SELECT id FROM vehicles WHERE id = ?',
      [vehicule_id]
    );

    if (vehicle.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    const [result] = await db.execute(`
      INSERT INTO ordres_missions (
        vehicule_id, personnel_transporte, lieu_destination, date_depart, date_retour,
        objet_mission, statut, kilometrage_depart, kilometrage_retour,
        observations, responsable_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      vehicule_id, personnel_transporte || '', destination, date_depart, date_retour,
      objet, statut || 'Planifié', kilometrage_depart || null, kilometrage_retour || null,
      notes || '', req.user.userId
    ]);

    // Récupérer la mission créée avec les informations du véhicule
    const [newMission] = await db.execute(`
      SELECT m.*, 
             m.objet_mission as objet, 
             m.lieu_destination as destination, 
             m.observations as notes,
             v.nom_vehicule as vehicule_nom, 
             v.immatriculation 
      FROM ordres_missions m
      LEFT JOIN vehicles v ON m.vehicule_id = v.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Mission créée avec succès',
      mission: newMission[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de la mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la mission'
    });
  }
});

// PUT /api/missions/:id - Mettre à jour une mission
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicule_id,
      objet,
      destination,
      date_depart,
      date_retour,
      personnel_transporte,
      statut,
      kilometrage_depart,
      kilometrage_retour,
      notes
    } = req.body;

    // Vérifier si la mission existe
    const [existingMission] = await db.execute(
      'SELECT id FROM ordres_missions WHERE id = ?',
      [req.params.id]
    );

    if (existingMission.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }

    // Vérifier si le véhicule existe
    const [vehicle] = await db.execute(
      'SELECT id FROM vehicles WHERE id = ?',
      [vehicule_id]
    );

    if (vehicle.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    await db.execute(`
      UPDATE ordres_missions SET
        vehicule_id = ?, personnel_transporte = ?, lieu_destination = ?, date_depart = ?, date_retour = ?,
        objet_mission = ?, statut = ?, kilometrage_depart = ?, kilometrage_retour = ?,
        observations = ?, responsable_id = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      vehicule_id, personnel_transporte || '', destination, date_depart, date_retour,
      objet, statut, kilometrage_depart || null, kilometrage_retour || null,
      notes || '', req.user.userId, req.params.id
    ]);

    // Récupérer la mission mise à jour
    const [updatedMission] = await db.execute(`
      SELECT m.*, 
             m.objet_mission as objet, 
             m.lieu_destination as destination, 
             m.observations as notes,
             v.nom_vehicule as vehicule_nom, 
             v.immatriculation 
      FROM ordres_missions m
      LEFT JOIN vehicles v ON m.vehicule_id = v.id
      WHERE m.id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      message: 'Mission mise à jour avec succès',
      mission: updatedMission[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la mission'
    });
  }
});

// DELETE /api/missions/:id - Supprimer une mission
router.delete('/:id', async (req, res) => {
  try {
    // Vérifier si la mission existe
    const [existingMission] = await db.execute(
      'SELECT id FROM ordres_missions WHERE id = ?',
      [req.params.id]
    );

    if (existingMission.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }

    await db.execute('DELETE FROM ordres_missions WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Mission supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la mission'
    });
  }
});

module.exports = router; 