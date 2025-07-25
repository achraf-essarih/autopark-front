const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const googleMapsService = require('../services/googleMapsService');

// Appliquer le middleware d'authentification à toutes les routes
router.use(verifyToken);

// GET /api/missions/stats - Récupérer les statistiques des missions
router.get('/stats', async (req, res) => {
  try {
    // Compter le nombre total de missions
    const [totalResult] = await db.execute(`
      SELECT COUNT(*) as totalMissions FROM missions
    `);

    // Compter par statut
    const [statusResult] = await db.execute(`
      SELECT statut, COUNT(*) as count 
      FROM missions 
      GROUP BY statut
    `);

    // Missions du mois en cours
    const [monthResult] = await db.execute(`
      SELECT COUNT(*) as currentMonthMissions 
      FROM missions 
      WHERE MONTH(date_depart) = MONTH(CURRENT_DATE()) 
      AND YEAR(date_depart) = YEAR(CURRENT_DATE())
    `);

    res.json({
      success: true,
      stats: {
        totalMissions: totalResult[0].totalMissions,
        currentMonthMissions: monthResult[0].currentMonthMissions,
        byStatus: statusResult.reduce((acc, curr) => {
          acc[curr.statut] = curr.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des missions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// GET /api/missions/analytics/geospatial - Analyser les données géospatiales
router.get('/analytics/geospatial', async (req, res) => {
  try {
    // Statistiques géospatiales
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_missions,
        COUNT(destination_latitude) as missions_with_coordinates,
        AVG(distance_km) as avg_distance,
        SUM(distance_km) as total_distance,
        AVG(temps_estime_minutes) as avg_duration
      FROM missions
      WHERE date_depart >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    `);

    // Top destinations
    const [topDestinations] = await db.execute(`
      SELECT 
        destination as destination,
        COUNT(*) as frequency,
        AVG(distance_km) as avg_distance,
        destination_latitude,
        destination_longitude
      FROM missions
      WHERE destination_latitude IS NOT NULL
      GROUP BY destination, destination_latitude, destination_longitude
      ORDER BY frequency DESC
      LIMIT 10
    `);

    // Missions par zone géographique (approximative)
    const [zoneStats] = await db.execute(`
      SELECT 
        CASE 
          WHEN destination_latitude BETWEEN 33.5 AND 34.5 AND destination_longitude BETWEEN -7.5 AND -6.5 THEN 'Rabat-Casablanca'
          WHEN destination_latitude BETWEEN 34.0 AND 35.0 AND destination_longitude BETWEEN -5.5 AND -4.5 THEN 'Fès-Meknès'
          WHEN destination_latitude BETWEEN 31.5 AND 32.5 AND destination_longitude BETWEEN -8.5 AND -7.5 THEN 'Marrakech'
          WHEN destination_latitude BETWEEN 35.0 AND 36.0 AND destination_longitude BETWEEN -6.0 AND -5.0 THEN 'Nord'
          ELSE 'Autres'
        END as zone,
        COUNT(*) as missions_count,
        AVG(distance_km) as avg_distance
      FROM missions
      WHERE destination_latitude IS NOT NULL AND destination_longitude IS NOT NULL
      GROUP BY zone
      ORDER BY missions_count DESC
    `);

    res.json({
      success: true,
      analytics: {
        globalStats: stats[0],
        topDestinations,
        zoneStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse géospatiale:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse géospatiale'
    });
  }
});

// GET /api/missions - Récupérer toutes les missions
router.get('/', async (req, res) => {
  try {
    const [missions] = await db.execute(`
      SELECT m.*, 
             v.nom_vehicule as vehicule_nom, 
             v.immatriculation,
             c.nom as chauffeur_nom,
             c.prenom as chauffeur_prenom
      FROM missions m
      LEFT JOIN vehicles v ON m.vehicule_id = v.id
      LEFT JOIN chauffeurs c ON m.chauffeur_id = c.id
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

// GET /api/missions/:id - Récupérer une mission spécifique
router.get('/:id', async (req, res) => {
  try {
    const [missions] = await db.execute(`
      SELECT m.*, 
             v.nom_vehicule as vehicule_nom, 
             v.immatriculation,
             c.nom as chauffeur_nom,
             c.prenom as chauffeur_prenom
      FROM missions m
      LEFT JOIN vehicles v ON m.vehicule_id = v.id
      LEFT JOIN chauffeurs c ON m.chauffeur_id = c.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (missions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }

    res.json({
      success: true,
      mission: missions[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la mission'
    });
  }
});

// POST /api/missions - Créer une nouvelle mission
router.post('/', async (req, res) => {
  try {
    const {
      vehicule_id,
      chauffeur_id,
      objet,
      object, // Alternative field name
      destination,
      date_depart,
      date_retour,
      personnel_transporte,
      statut,
      kilometrage_depart,
      kilometrage_retour,
      notes,
      // Nouvelles données Google Maps
      destination_latitude,
      destination_longitude,
      google_maps_link,
      distance_km,
      temps_estime_minutes,
      temps_reel_minutes,
      itineraire_optimise,
      lieu_depart,
      depart_latitude,
      depart_longitude
    } = req.body;

    // Handle different field names for objet
    const finalObjet = objet || object;

    // Debug log pour comprendre les données reçues
    console.log('Données reçues pour création mission:', {
      vehicule_id,
      chauffeur_id,
      objet,
      object,
      finalObjet,
      destination,
      date_depart,
      date_retour
    });

    // Validation des champs requis
    if (!vehicule_id || !finalObjet || !destination || !date_depart) {
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

    // Vérifier si le chauffeur existe (optionnel)
    if (chauffeur_id) {
      const [chauffeur] = await db.execute(
        'SELECT id FROM chauffeurs WHERE id = ?',
        [chauffeur_id]
      );

      if (chauffeur.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Chauffeur non trouvé'
        });
      }
    }

    // Calculer automatiquement la distance et le temps si les coordonnées sont fournies
    let calculatedData = {
      distance_km: distance_km,
      temps_estime_minutes: temps_estime_minutes,
      google_maps_link: google_maps_link
    };

    if (destination_latitude && destination_longitude) {
      // Générer le lien Google Maps
      if (!google_maps_link) {
        calculatedData.google_maps_link = googleMapsService.generateGoogleMapsLink(
          depart_latitude, depart_longitude, destination_latitude, destination_longitude
        );
      }

      // Calculer la distance et le temps si pas déjà fournis
      if ((!distance_km || !temps_estime_minutes) && depart_latitude && depart_longitude) {
        const mapsData = await googleMapsService.calculateDistanceAndTime(
          depart_latitude, depart_longitude, destination_latitude, destination_longitude
        );

        if (mapsData) {
          if (!distance_km) calculatedData.distance_km = mapsData.distance_km;
          if (!temps_estime_minutes) calculatedData.temps_estime_minutes = mapsData.temps_estime_minutes;
        } else {
          // Fallback: utiliser la formule haversine
          if (!distance_km) {
            calculatedData.distance_km = googleMapsService.calculateHaversineDistance(
              depart_latitude, depart_longitude, destination_latitude, destination_longitude
            );
          }
        }
      }
    }

    // Déterminer si cette mission sera créée comme terminée avec une distance
    const finalStatut = statut || 'Planifié';
    const isCompletedWithDistance = finalStatut === 'Terminé' && calculatedData.distance_km;

    const [result] = await db.execute(`
      INSERT INTO missions (
        vehicule_id, chauffeur_id, personnel_transporte, destination, date_depart, date_retour,
        objet, statut,
        notes, responsable_id,
        destination_latitude, destination_longitude, google_maps_link, 
        distance_km, temps_estime_minutes, temps_reel_minutes, itineraire_optimise,
        lieu_depart, depart_latitude, depart_longitude, distance_added_to_vehicle,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      vehicule_id, 
      chauffeur_id || null, 
      personnel_transporte || '', 
      destination, 
      date_depart, 
      date_retour,
      finalObjet, 
      finalStatut,
      notes || '', 
      req.user.userId,
      destination_latitude || null, 
      destination_longitude || null, 
      calculatedData.google_maps_link || null,
      calculatedData.distance_km || null, 
      calculatedData.temps_estime_minutes || null,
      temps_reel_minutes || null,
      itineraire_optimise || null,
      lieu_depart || 'Siège social',
      depart_latitude || null, 
      depart_longitude || null,
      isCompletedWithDistance
    ]);

    // Si la mission est créée comme terminée avec une distance, ajouter cette distance au kilométrage du véhicule
    if (isCompletedWithDistance) {
      await db.execute(`
        UPDATE vehicles 
        SET kilometrage = kilometrage + ?, updated_at = NOW() 
        WHERE id = ?
      `, [calculatedData.distance_km, vehicule_id]);

      console.log(`Distance de ${calculatedData.distance_km} km ajoutée au véhicule ${vehicule_id} suite à la création de la mission terminée`);
    }

    // Récupérer la mission créée avec les informations du véhicule
    const [newMission] = await db.execute(`
      SELECT m.*, 
             v.nom_vehicule as vehicule_nom, 
             v.immatriculation,
             c.nom as chauffeur_nom,
             c.prenom as chauffeur_prenom
      FROM missions m
      LEFT JOIN vehicles v ON m.vehicule_id = v.id
      LEFT JOIN chauffeurs c ON m.chauffeur_id = c.id
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
      chauffeur_id,
      objet,
      object, // Alternative field name
      destination,
      date_depart,
      date_retour,
      personnel_transporte,
      statut,
      kilometrage_depart,
      kilometrage_retour,
      notes,
      // Nouvelles données Google Maps
      destination_latitude,
      destination_longitude,
      google_maps_link,
      distance_km,
      temps_estime_minutes,
      temps_reel_minutes,
      itineraire_optimise,
      lieu_depart,
      depart_latitude,
      depart_longitude
    } = req.body;

    // Handle different field names for objet
    const finalObjet = objet || object;

    // Vérifier si la mission existe
    const [existingMission] = await db.execute(
      'SELECT id FROM missions WHERE id = ?',
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

    // Vérifier si le chauffeur existe (optionnel)
    if (chauffeur_id) {
      const [chauffeur] = await db.execute(
        'SELECT id FROM chauffeurs WHERE id = ?',
        [chauffeur_id]
      );

      if (chauffeur.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Chauffeur non trouvé'
        });
      }
    }

    // Calculer automatiquement la distance et le temps si les coordonnées sont fournies
    let calculatedData = {
      distance_km: distance_km,
      temps_estime_minutes: temps_estime_minutes,
      google_maps_link: google_maps_link
    };

    if (destination_latitude && destination_longitude) {
      // Générer le lien Google Maps
      if (!google_maps_link) {
        calculatedData.google_maps_link = googleMapsService.generateGoogleMapsLink(
          depart_latitude, depart_longitude, destination_latitude, destination_longitude
        );
      }

      // Calculer la distance et le temps si pas déjà fournis
      if ((!distance_km || !temps_estime_minutes) && depart_latitude && depart_longitude) {
        const mapsData = await googleMapsService.calculateDistanceAndTime(
          depart_latitude, depart_longitude, destination_latitude, destination_longitude
        );

        if (mapsData) {
          if (!distance_km) calculatedData.distance_km = mapsData.distance_km;
          if (!temps_estime_minutes) calculatedData.temps_estime_minutes = mapsData.temps_estime_minutes;
        } else {
          // Fallback: utiliser la formule haversine
          if (!distance_km) {
            calculatedData.distance_km = googleMapsService.calculateHaversineDistance(
              depart_latitude, depart_longitude, destination_latitude, destination_longitude
            );
          }
        }
      }
    }

    // Récupérer la mission actuelle pour vérifier le changement de statut
    const [currentMission] = await db.execute(
      'SELECT statut, distance_km, distance_added_to_vehicle, vehicule_id FROM missions WHERE id = ?',
      [req.params.id]
    );

    const isStatusChangingToCompleted = currentMission[0].statut !== 'Terminé' && statut === 'Terminé';
    const hasDistance = calculatedData.distance_km || currentMission[0].distance_km;
    const notAlreadyAdded = !currentMission[0].distance_added_to_vehicle;

    await db.execute(`
      UPDATE missions SET
        vehicule_id = ?, chauffeur_id = ?, personnel_transporte = ?, destination = ?, 
        date_depart = ?, date_retour = ?, objet = ?, statut = ?, 
        notes = ?, responsable_id = ?,
        destination_latitude = ?, destination_longitude = ?, google_maps_link = ?,
        distance_km = ?, temps_estime_minutes = ?, temps_reel_minutes = ?, itineraire_optimise = ?,
        lieu_depart = ?, depart_latitude = ?, depart_longitude = ?,
        distance_added_to_vehicle = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      vehicule_id, chauffeur_id || null, personnel_transporte || '', destination, 
      date_depart, date_retour, finalObjet, statut, 
      notes || '', req.user.userId,
      destination_latitude || null, destination_longitude || null, calculatedData.google_maps_link || null,
      calculatedData.distance_km || null, calculatedData.temps_estime_minutes || null, temps_reel_minutes || null, itineraire_optimise || null,
      lieu_depart || 'Siège social', depart_latitude || null, depart_longitude || null,
      (isStatusChangingToCompleted && hasDistance && notAlreadyAdded) ? true : currentMission[0].distance_added_to_vehicle,
      req.params.id
    ]);

    // Si la mission est marquée comme terminée et a une distance, ajouter cette distance au kilométrage du véhicule
    if (isStatusChangingToCompleted && hasDistance && notAlreadyAdded) {
      const distanceToAdd = calculatedData.distance_km || currentMission[0].distance_km;
      
      await db.execute(`
        UPDATE vehicles 
        SET kilometrage = kilometrage + ?, updated_at = NOW() 
        WHERE id = ?
      `, [distanceToAdd, vehicule_id]);

      console.log(`Distance de ${distanceToAdd} km ajoutée au véhicule ${vehicule_id} suite à la mission ${req.params.id}`);
    }

    // Récupérer la mission mise à jour
    const [updatedMission] = await db.execute(`
      SELECT m.*, 
             v.nom_vehicule as vehicule_nom, 
             v.immatriculation,
             c.nom as chauffeur_nom,
             c.prenom as chauffeur_prenom
      FROM missions m
      LEFT JOIN vehicles v ON m.vehicule_id = v.id
      LEFT JOIN chauffeurs c ON m.chauffeur_id = c.id
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
      'SELECT id FROM missions WHERE id = ?',
      [req.params.id]
    );

    if (existingMission.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée'
      });
    }

    await db.execute('DELETE FROM missions WHERE id = ?', [req.params.id]);

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