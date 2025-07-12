const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(verifyToken);

// GET /api/interventions - Récupérer toutes les interventions
router.get('/', async (req, res) => {
  try {
    const [interventions] = await db.execute(`
      SELECT i.*, v.nom_vehicule as vehicule_nom, v.immatriculation 
      FROM interventions i
      LEFT JOIN vehicles v ON i.vehicule_id = v.id
      ORDER BY i.date_intervention DESC
    `);
    
    res.json({
      success: true,
      interventions: interventions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des interventions'
    });
  }
});

// GET /api/interventions/stats - Récupérer les statistiques des interventions
router.get('/stats', async (req, res) => {
  try {
    const [totalCostResult] = await db.execute('SELECT SUM(cout) as total FROM interventions');
    const [totalCountResult] = await db.execute('SELECT COUNT(*) as total FROM interventions');
    const [maintenanceResult] = await db.execute('SELECT COUNT(*) as count FROM interventions WHERE type_intervention = "Maintenance"');
    const [reparationResult] = await db.execute('SELECT COUNT(*) as count FROM interventions WHERE type_intervention = "Réparation"');
    const [controleResult] = await db.execute('SELECT COUNT(*) as count FROM interventions WHERE type_intervention = "Contrôle"');
    
    res.json({
      success: true,
      stats: {
        totalCost: totalCostResult[0].total || 0,
        totalCount: totalCountResult[0].total || 0,
        maintenance: maintenanceResult[0].count || 0,
        reparation: reparationResult[0].count || 0,
        controle: controleResult[0].count || 0
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

// POST /api/interventions - Créer une nouvelle intervention
router.post('/', async (req, res) => {
  try {
    const {
      vehicule_id,
      type_intervention,
      date_intervention,
      description,
      cout,
      statut,
      notes
    } = req.body;

    // Validation des champs requis
    if (!vehicule_id || !type_intervention || !date_intervention) {
      return res.status(400).json({
        success: false,
        message: 'Les champs véhicule, type et date sont requis'
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
      INSERT INTO interventions (
        vehicule_id, type_intervention, date_intervention, cout,
        statut, note, responsable_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      vehicule_id, type_intervention, date_intervention, cout || 0,
      statut || 'En cours', (description || notes || ''), req.user.userId
    ]);

    // Récupérer l'intervention créée avec les informations du véhicule
    const [newIntervention] = await db.execute(`
      SELECT i.*, v.nom_vehicule as vehicule_nom, v.immatriculation 
      FROM interventions i
      LEFT JOIN vehicles v ON i.vehicule_id = v.id
      WHERE i.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Intervention créée avec succès',
      intervention: newIntervention[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'intervention'
    });
  }
});

// PUT /api/interventions/:id - Mettre à jour une intervention
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicule_id,
      type_intervention,
      date_intervention,
      description,
      cout,
      statut,
      notes
    } = req.body;

    // Vérifier si l'intervention existe
    const [existingIntervention] = await db.execute(
      'SELECT id FROM interventions WHERE id = ?',
      [req.params.id]
    );

    if (existingIntervention.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Intervention non trouvée'
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
      UPDATE interventions SET
        vehicule_id = ?, type_intervention = ?, date_intervention = ?, cout = ?,
        statut = ?, note = ?, responsable_id = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      vehicule_id, type_intervention, date_intervention, cout || 0,
      statut || 'En cours', (description || notes || ''), req.user.userId, req.params.id
    ]);

    // Récupérer l'intervention mise à jour
    const [updatedIntervention] = await db.execute(`
      SELECT i.*, v.nom_vehicule as vehicule_nom, v.immatriculation 
      FROM interventions i
      LEFT JOIN vehicles v ON i.vehicule_id = v.id
      WHERE i.id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      message: 'Intervention mise à jour avec succès',
      intervention: updatedIntervention[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'intervention:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'intervention'
    });
  }
});

// DELETE /api/interventions/:id - Supprimer une intervention
router.delete('/:id', async (req, res) => {
  try {
    // Vérifier si l'intervention existe
    const [existingIntervention] = await db.execute(
      'SELECT id FROM interventions WHERE id = ?',
      [req.params.id]
    );

    if (existingIntervention.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Intervention non trouvée'
      });
    }

    await db.execute('DELETE FROM interventions WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Intervention supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'intervention:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'intervention'
    });
  }
});

module.exports = router; 