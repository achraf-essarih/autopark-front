const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Configuration de la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'auto_parc_db'
});

// Middleware pour vérifier la connexion à la base de données
const checkDbConnection = (req, res, next) => {
  if (db.state === 'disconnected') {
    return res.status(500).json({ message: 'Erreur de connexion à la base de données' });
  }
  next();
};

// Récupérer tous les chauffeurs
router.get('/', checkDbConnection, (req, res) => {
  const query = `
    SELECT 
      id, nom, prenom, numero_permis, type_permis, 
      date_expiration_permis, telephone, email, adresse, 
      date_naissance, actif, created_at, updated_at
    FROM chauffeurs 
    ORDER BY nom ASC, prenom ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des chauffeurs:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des chauffeurs' });
    }
    
    res.json({ chauffeurs: results });
  });
});

// Récupérer les chauffeurs actifs seulement
router.get('/actifs', checkDbConnection, (req, res) => {
  const query = `
    SELECT 
      id, nom, prenom, numero_permis, type_permis, 
      date_expiration_permis, telephone, email, adresse, 
      date_naissance, actif, created_at, updated_at
    FROM chauffeurs 
    WHERE actif = 1
    ORDER BY nom ASC, prenom ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des chauffeurs actifs:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des chauffeurs actifs' });
    }
    
    res.json({ chauffeurs: results });
  });
});

// Obtenir les statistiques des chauffeurs (DOIT être avant /:id)
router.get('/statistiques', checkDbConnection, (req, res) => {
  const queries = {
    total: 'SELECT COUNT(*) as count FROM chauffeurs',
    actifs: 'SELECT COUNT(*) as count FROM chauffeurs WHERE actif = 1',
    permis_expires: `
      SELECT COUNT(*) as count 
      FROM chauffeurs 
      WHERE date_expiration_permis < CURDATE() AND actif = 1
    `,
    permis_bientot_expires: `
      SELECT COUNT(*) as count 
      FROM chauffeurs 
      WHERE date_expiration_permis <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
      AND date_expiration_permis >= CURDATE() 
      AND actif = 1
    `
  };

  const statistiques = {};
  const queryPromises = Object.keys(queries).map(key => {
    return new Promise((resolve, reject) => {
      db.query(queries[key], (err, results) => {
        if (err) {
          reject(err);
        } else {
          statistiques[key] = results[0].count;
          resolve();
        }
      });
    });
  });

  Promise.all(queryPromises)
    .then(() => {
      res.json({ statistiques });
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des statistiques:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    });
});

// Récupérer un chauffeur par ID
router.get('/:id', checkDbConnection, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      id, nom, prenom, numero_permis, type_permis, 
      date_expiration_permis, telephone, email, adresse, 
      date_naissance, actif, created_at, updated_at
    FROM chauffeurs 
    WHERE id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du chauffeur:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du chauffeur' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }
    
    res.json({ chauffeur: results[0] });
  });
});

// Créer un nouveau chauffeur
router.post('/', checkDbConnection, (req, res) => {
  const {
    nom, prenom, numero_permis, type_permis, date_expiration_permis,
    telephone, email, adresse, date_naissance, actif
  } = req.body;

  // Validation des champs obligatoires
  if (!nom || !prenom || !numero_permis || !type_permis || !date_expiration_permis || !telephone) {
    return res.status(400).json({ 
      message: 'Tous les champs obligatoires doivent être remplis' 
    });
  }

  // Vérifier si le numéro de permis existe déjà
  const checkQuery = 'SELECT id FROM chauffeurs WHERE numero_permis = ?';
  db.query(checkQuery, [numero_permis], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du numéro de permis:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification du numéro de permis' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Ce numéro de permis existe déjà' });
    }

    // Insérer le nouveau chauffeur
    const insertQuery = `
      INSERT INTO chauffeurs (
        nom, prenom, numero_permis, type_permis, date_expiration_permis,
        telephone, email, adresse, date_naissance, actif
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nom, prenom, numero_permis, type_permis, date_expiration_permis,
      telephone, email || null, adresse || null, date_naissance || null, 
      actif !== undefined ? actif : 1
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('Erreur lors de la création du chauffeur:', err);
        return res.status(500).json({ message: 'Erreur lors de la création du chauffeur' });
      }

      // Récupérer le chauffeur créé
      const selectQuery = `
        SELECT 
          id, nom, prenom, numero_permis, type_permis, 
          date_expiration_permis, telephone, email, adresse, 
          date_naissance, actif, created_at, updated_at
        FROM chauffeurs 
        WHERE id = ?
      `;

      db.query(selectQuery, [result.insertId], (err, results) => {
        if (err) {
          console.error('Erreur lors de la récupération du chauffeur créé:', err);
          return res.status(500).json({ message: 'Chauffeur créé mais erreur lors de la récupération' });
        }

        res.status(201).json({
          message: 'Chauffeur créé avec succès',
          chauffeur: results[0]
        });
      });
    });
  });
});

// Mettre à jour un chauffeur
router.put('/:id', checkDbConnection, (req, res) => {
  const { id } = req.params;
  const {
    nom, prenom, numero_permis, type_permis, date_expiration_permis,
    telephone, email, adresse, date_naissance, actif
  } = req.body;

  // Validation des champs obligatoires
  if (!nom || !prenom || !numero_permis || !type_permis || !date_expiration_permis || !telephone) {
    return res.status(400).json({ 
      message: 'Tous les champs obligatoires doivent être remplis' 
    });
  }

  // Vérifier si le chauffeur existe
  const checkQuery = 'SELECT id FROM chauffeurs WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du chauffeur:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification du chauffeur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    // Vérifier si le numéro de permis existe déjà pour un autre chauffeur
    const checkPermisQuery = 'SELECT id FROM chauffeurs WHERE numero_permis = ? AND id != ?';
    db.query(checkPermisQuery, [numero_permis, id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la vérification du numéro de permis:', err);
        return res.status(500).json({ message: 'Erreur lors de la vérification du numéro de permis' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Ce numéro de permis existe déjà' });
      }

      // Mettre à jour le chauffeur
      const updateQuery = `
        UPDATE chauffeurs SET
          nom = ?, prenom = ?, numero_permis = ?, type_permis = ?, 
          date_expiration_permis = ?, telephone = ?, email = ?, 
          adresse = ?, date_naissance = ?, actif = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const values = [
        nom, prenom, numero_permis, type_permis, date_expiration_permis,
        telephone, email || null, adresse || null, date_naissance || null, 
        actif !== undefined ? actif : 1, id
      ];

      db.query(updateQuery, values, (err, result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du chauffeur:', err);
          return res.status(500).json({ message: 'Erreur lors de la mise à jour du chauffeur' });
        }

        // Récupérer le chauffeur mis à jour
        const selectQuery = `
          SELECT 
            id, nom, prenom, numero_permis, type_permis, 
            date_expiration_permis, telephone, email, adresse, 
            date_naissance, actif, created_at, updated_at
          FROM chauffeurs 
          WHERE id = ?
        `;

        db.query(selectQuery, [id], (err, results) => {
          if (err) {
            console.error('Erreur lors de la récupération du chauffeur mis à jour:', err);
            return res.status(500).json({ message: 'Chauffeur mis à jour mais erreur lors de la récupération' });
          }

          res.json({
            message: 'Chauffeur mis à jour avec succès',
            chauffeur: results[0]
          });
        });
      });
    });
  });
});

// Supprimer un chauffeur
router.delete('/:id', checkDbConnection, (req, res) => {
  const { id } = req.params;

  // Vérifier si le chauffeur existe
  const checkQuery = 'SELECT id FROM chauffeurs WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du chauffeur:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification du chauffeur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    // Vérifier si le chauffeur est utilisé dans des missions
    const checkMissionsQuery = 'SELECT id FROM missions WHERE chauffeur_id = ? LIMIT 1';
    db.query(checkMissionsQuery, [id], (err, results) => {
      if (err) {
        console.error('Erreur lors de la vérification des missions:', err);
        return res.status(500).json({ message: 'Erreur lors de la vérification des missions' });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer ce chauffeur car il est assigné à des missions' 
        });
      }

      // Supprimer le chauffeur
      const deleteQuery = 'DELETE FROM chauffeurs WHERE id = ?';
      db.query(deleteQuery, [id], (err, result) => {
        if (err) {
          console.error('Erreur lors de la suppression du chauffeur:', err);
          return res.status(500).json({ message: 'Erreur lors de la suppression du chauffeur' });
        }

        res.json({ message: 'Chauffeur supprimé avec succès' });
      });
    });
  });
});

// Vérifier la validité du permis d'un chauffeur
router.get('/:id/permis', checkDbConnection, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      numero_permis, type_permis, date_expiration_permis,
      CASE 
        WHEN date_expiration_permis < CURDATE() THEN 'expired'
        WHEN date_expiration_permis <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring'
        ELSE 'valid'
      END as statut
    FROM chauffeurs 
    WHERE id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du permis:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification du permis' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }
    
    res.json({ permis: results[0] });
  });
});

module.exports = router; 