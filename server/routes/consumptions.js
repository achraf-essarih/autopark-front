const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(verifyToken);

// GET /api/consumptions - Récupérer toutes les consommations
router.get('/', async (req, res) => {
  try {
    const [consumptions] = await db.execute(`
      SELECT c.*, v.nom_vehicule as vehicule_nom, v.immatriculation 
      FROM consommations c
      LEFT JOIN vehicles v ON c.vehicule_id = v.id
      ORDER BY c.date_consommation DESC
    `);
    
    res.json({
      success: true,
      consumptions: consumptions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des consommations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des consommations'
    });
  }
});

// GET /api/consumptions/stats - Récupérer les statistiques des consommations
router.get('/stats', async (req, res) => {
  try {
    const [totalCostResult] = await db.execute('SELECT SUM(montant) as total FROM consommations');
    const [totalLitersResult] = await db.execute('SELECT SUM(litres_carburant) as total FROM consommations');
    
    // Noms des mois en français
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    // D'abord, essayer de récupérer les données pour l'année courante
    const [monthlyResult] = await db.execute(`
      SELECT 
        MONTH(date_consommation) as month,
        YEAR(date_consommation) as year,
        SUM(montant) as total
      FROM consommations 
      WHERE YEAR(date_consommation) = YEAR(NOW())
      GROUP BY YEAR(date_consommation), MONTH(date_consommation)
      ORDER BY year, month
    `);

    let monthlyData = [];
    
    if (monthlyResult.length === 0) {
      // Si aucune donnée pour l'année courante, prendre les données de l'année la plus récente
      const [allMonthlyResult] = await db.execute(`
        SELECT 
          MONTH(date_consommation) as month,
          YEAR(date_consommation) as year,
          SUM(montant) as total
        FROM consommations 
        WHERE YEAR(date_consommation) = (
          SELECT MAX(YEAR(date_consommation)) FROM consommations
        )
        GROUP BY YEAR(date_consommation), MONTH(date_consommation)
        ORDER BY year, month
      `);
      
      monthlyData = allMonthlyResult.map(row => ({
        month: monthNames[row.month - 1],
        amount: parseFloat(row.total) || 0
      }));
      
      console.log('Données mensuelles (année la plus récente):', monthlyData);
    } else {
      monthlyData = monthlyResult.map(row => ({
        month: monthNames[row.month - 1],
        amount: parseFloat(row.total) || 0
      }));
      
      console.log('Données mensuelles (année courante):', monthlyData);
    }
    
    res.json({
      success: true,
      stats: {
        totalCost: parseFloat(totalCostResult[0].total) || 0,
        totalLiters: parseFloat(totalLitersResult[0].total) || 0,
        monthly: monthlyResult,
        monthlyData: monthlyData
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

// POST /api/consumptions - Créer une nouvelle consommation
router.post('/', async (req, res) => {
  try {
    const {
      vehicule_id,
      date_consommation,
      station_service,
      quantite,
      prix_unitaire,
      montant_total,
      kilometrage,
      type_carburant,
      notes
    } = req.body;

    // Validation des champs requis
    if (!vehicule_id || !date_consommation || !quantite || !prix_unitaire) {
      return res.status(400).json({
        success: false,
        message: 'Les champs véhicule, date, quantité et prix unitaire sont requis'
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
      INSERT INTO consommations (
        vehicule_id, date_consommation, station_service, litres_carburant,
        prix_litre, montant, kilometrage, note, responsable_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      vehicule_id, 
      date_consommation, 
      station_service || '', 
      quantite,
      prix_unitaire, 
      montant_total, 
      kilometrage || 0, 
      notes || '', 
      req.user.userId
    ]);

    // Récupérer la consommation créée avec les informations du véhicule
    const [newConsumption] = await db.execute(`
      SELECT c.*, v.nom_vehicule as vehicule_nom, v.immatriculation 
      FROM consommations c
      LEFT JOIN vehicles v ON c.vehicule_id = v.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Consommation créée avec succès',
      consumption: newConsumption[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de la consommation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la consommation'
    });
  }
});

// PUT /api/consumptions/:id - Mettre à jour une consommation
router.put('/:id', async (req, res) => {
  try {
    const {
      vehicule_id,
      date_consommation,
      station_service,
      quantite,
      prix_unitaire,
      montant_total,
      kilometrage,
      type_carburant,
      notes
    } = req.body;

    // Vérifier si la consommation existe
    const [existingConsumption] = await db.execute(
      'SELECT id FROM consommations WHERE id = ?',
      [req.params.id]
    );

    if (existingConsumption.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consommation non trouvée'
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
      UPDATE consommations SET
        vehicule_id = ?, date_consommation = ?, station_service = ?, litres_carburant = ?,
        prix_litre = ?, montant = ?, kilometrage = ?, note = ?, responsable_id = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      vehicule_id, 
      date_consommation, 
      station_service || '', 
      quantite,
      prix_unitaire, 
      montant_total, 
      kilometrage || 0, 
      notes || '', 
      req.user.userId, 
      req.params.id
    ]);

    // Récupérer la consommation mise à jour
    const [updatedConsumption] = await db.execute(`
      SELECT c.*, v.nom_vehicule as vehicule_nom, v.immatriculation 
      FROM consommations c
      LEFT JOIN vehicles v ON c.vehicule_id = v.id
      WHERE c.id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      message: 'Consommation mise à jour avec succès',
      consumption: updatedConsumption[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la consommation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la consommation'
    });
  }
});

// DELETE /api/consumptions/:id - Supprimer une consommation
router.delete('/:id', async (req, res) => {
  try {
    // Vérifier si la consommation existe
    const [existingConsumption] = await db.execute(
      'SELECT id FROM consommations WHERE id = ?',
      [req.params.id]
    );

    if (existingConsumption.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consommation non trouvée'
      });
    }

    await db.execute('DELETE FROM consommations WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Consommation supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la consommation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la consommation'
    });
  }
});

module.exports = router; 