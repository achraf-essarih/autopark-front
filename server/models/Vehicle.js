const { query } = require('../config/database');

class Vehicle {
  // Créer un nouveau véhicule
  static async create(vehicleData) {
    const {
      nom_vehicule, marque, modele, date_mise_circulation, immatriculation,
      mode_carburant, boite_vitesses, rapport = '5 Rapport', nombre_ports,
      etat_mecanique = 'Bon', puissance_fiscale, plein_reservoir,
      kilometrage = 0, consommation_l100, description = '', responsable_id
    } = vehicleData;
    
    const sql = `
      INSERT INTO vehicles (
        nom_vehicule, marque, modele, date_mise_circulation, immatriculation,
        mode_carburant, boite_vitesses, rapport, nombre_ports, etat_mecanique,
        puissance_fiscale, plein_reservoir, kilometrage, consommation_l100,
        description, responsable_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      nom_vehicule, marque, modele, date_mise_circulation, immatriculation,
      mode_carburant, boite_vitesses, rapport, nombre_ports, etat_mecanique,
      puissance_fiscale, plein_reservoir, kilometrage, consommation_l100,
      description, responsable_id
    ]);
    
    return await this.findById(result.insertId);
  }

  // Trouver un véhicule par ID
  static async findById(id) {
    const sql = `
      SELECT v.*, 
             CONCAT(u.prenom, ' ', u.nom) as nom_responsable,
             u.email as email_responsable
      FROM vehicles v
      LEFT JOIN users u ON v.responsable_id = u.id
      WHERE v.id = ? AND v.actif = TRUE
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Obtenir tous les véhicules
  static async findAll() {
    const sql = `
      SELECT v.*, 
             CONCAT(u.prenom, ' ', u.nom) as nom_responsable,
             u.email as email_responsable
      FROM vehicles v
      LEFT JOIN users u ON v.responsable_id = u.id
      WHERE v.actif = TRUE
      ORDER BY v.nom_vehicule
    `;
    
    return await query(sql);
  }

  // Obtenir les véhicules d'un responsable
  static async findByResponsable(responsableId) {
    const sql = `
      SELECT v.*, 
             CONCAT(u.prenom, ' ', u.nom) as nom_responsable,
             u.email as email_responsable
      FROM vehicles v
      LEFT JOIN users u ON v.responsable_id = u.id
      WHERE v.responsable_id = ? AND v.actif = TRUE
      ORDER BY v.nom_vehicule
    `;
    
    return await query(sql, [responsableId]);
  }

  // Rechercher des véhicules
  static async search(searchTerm) {
    const sql = `
      SELECT v.*, 
             CONCAT(u.prenom, ' ', u.nom) as nom_responsable,
             u.email as email_responsable
      FROM vehicles v
      LEFT JOIN users u ON v.responsable_id = u.id
      WHERE v.actif = TRUE AND (
        v.nom_vehicule LIKE ? OR
        v.marque LIKE ? OR
        v.modele LIKE ? OR
        v.immatriculation LIKE ?
      )
      ORDER BY v.nom_vehicule
    `;
    
    const searchPattern = `%${searchTerm}%`;
    return await query(sql, [searchPattern, searchPattern, searchPattern, searchPattern]);
  }

  // Mettre à jour un véhicule
  static async update(id, updateData) {
    const allowedFields = [
      'nom_vehicule', 'marque', 'modele', 'date_mise_circulation', 'immatriculation',
      'mode_carburant', 'boite_vitesses', 'rapport', 'nombre_ports', 'etat_mecanique',
      'puissance_fiscale', 'plein_reservoir', 'kilometrage', 'consommation_l100',
      'description', 'responsable_id'
    ];
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }
    
    values.push(id);
    
    const sql = `
      UPDATE vehicles 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND actif = TRUE
    `;
    
    await query(sql, values);
    return await this.findById(id);
  }

  // Mettre à jour le kilométrage
  static async updateKilometrage(id, nouveauKilometrage) {
    const sql = `
      UPDATE vehicles 
      SET kilometrage = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND actif = TRUE
    `;
    
    await query(sql, [nouveauKilometrage, id]);
    return await this.findById(id);
  }

  // Supprimer un véhicule (soft delete)
  static async delete(id) {
    const sql = `
      UPDATE vehicles 
      SET actif = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await query(sql, [id]);
    return true;
  }

  // Vérifier si l'immatriculation existe déjà
  static async findByImmatriculation(immatriculation, excludeId = null) {
    let sql = `
      SELECT id, immatriculation 
      FROM vehicles 
      WHERE immatriculation = ? AND actif = TRUE
    `;
    let params = [immatriculation];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const results = await query(sql, params);
    return results[0] || null;
  }

  // Statistiques des véhicules
  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_vehicules,
        COUNT(CASE WHEN etat_mecanique = 'Excellent' THEN 1 END) as excellent,
        COUNT(CASE WHEN etat_mecanique = 'Bon' THEN 1 END) as bon,
        COUNT(CASE WHEN etat_mecanique = 'Mauvais' THEN 1 END) as mauvais,
        COUNT(CASE WHEN mode_carburant = 'Essence' THEN 1 END) as essence,
        COUNT(CASE WHEN mode_carburant = 'Diesel' THEN 1 END) as diesel,
        AVG(kilometrage) as kilometrage_moyen,
        AVG(consommation_l100) as consommation_moyenne
      FROM vehicles 
      WHERE actif = TRUE
    `;
    
    const results = await query(sql);
    return results[0];
  }

  // Véhicules nécessitant une attention (kilométrage élevé ou mauvais état)
  static async getVehiculesAttention() {
    const sql = `
      SELECT v.*, 
             CONCAT(u.prenom, ' ', u.nom) as nom_responsable
      FROM vehicles v
      LEFT JOIN users u ON v.responsable_id = u.id
      WHERE v.actif = TRUE AND (
        v.kilometrage > 100000 OR 
        v.etat_mecanique = 'Mauvais'
      )
      ORDER BY v.etat_mecanique ASC, v.kilometrage DESC
    `;
    
    return await query(sql);
  }
}

module.exports = Vehicle; 