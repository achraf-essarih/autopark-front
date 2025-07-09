const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Créer un nouvel utilisateur
  static async create(userData) {
    const { nom, prenom, email, mot_de_passe, password, role = 'responsable' } = userData;
    
    // Récupérer le mot de passe (soit mot_de_passe soit password)
    const plainPassword = mot_de_passe || password;
    
    if (!plainPassword) {
      throw new Error('Le mot de passe est requis');
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    const sql = `
      INSERT INTO users (nom, prenom, email, mot_de_passe, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [nom, prenom, email, hashedPassword, role]);
    
    // Retourner l'utilisateur créé (sans le mot de passe)
    return await this.findById(result.insertId);
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    const sql = `
      SELECT id, nom, prenom, email, role, actif, derniere_connexion, created_at, updated_at
      FROM users 
      WHERE id = ? AND actif = TRUE
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Trouver un utilisateur par email (pour l'authentification)
  static async findByEmail(email) {
    
    const sql = `
      SELECT id, nom, prenom, email, mot_de_passe, role, actif, derniere_connexion, created_at, updated_at
      FROM users 
      WHERE email = ? AND actif = TRUE
    `;
    
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  // Obtenir tous les utilisateurs (admin seulement)
  static async findAll() {
    const sql = `
      SELECT id, nom, prenom, email, role, actif, derniere_connexion, created_at, updated_at
      FROM users 
      WHERE actif = TRUE
      ORDER BY nom, prenom
    `;
    
    return await query(sql);
  }

  // Obtenir tous les responsables
  static async findResponsables() {
    const sql = `
      SELECT id, nom, prenom, email, role, actif, derniere_connexion, created_at, updated_at
      FROM users 
      WHERE role = 'responsable' AND actif = TRUE
      ORDER BY nom, prenom
    `;
    
    return await query(sql);
  }

  // Mettre à jour un utilisateur
  static async update(id, updateData) {
    const allowedFields = ['nom', 'prenom', 'email', 'role'];
    const fields = [];
    const values = [];
    
    // Construire la requête dynamiquement selon les champs à mettre à jour
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
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND actif = TRUE
    `;
    
    await query(sql, values);
    return await this.findById(id);
  }

  // Changer le mot de passe
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const sql = `
      UPDATE users 
      SET mot_de_passe = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND actif = TRUE
    `;
    
    await query(sql, [hashedPassword, id]);
    return await this.findById(id);
  }

  // Supprimer un utilisateur (soft delete)
  static async delete(id) {
    const sql = `
      UPDATE users 
      SET actif = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await query(sql, [id]);
    return true;
  }

  // Vérifier le mot de passe
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Mettre à jour la dernière connexion
  static async updateLastLogin(id) {
    const sql = `
      UPDATE users 
      SET derniere_connexion = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await query(sql, [id]);
  }

  // Compter les utilisateurs par rôle
  static async countByRole() {
    const sql = `
      SELECT role, COUNT(*) as count
      FROM users 
      WHERE actif = TRUE
      GROUP BY role
    `;
    
    return await query(sql);
  }
}

module.exports = User; 