const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'auto_parc_db',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Pool de connexions pour de meilleures performances
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de la connexion
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion à MySQL réussie');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à MySQL:', error.message);
    return false;
  }
}

// Fonction pour exécuter des requêtes
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution de la requête:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  execute: pool.execute.bind(pool)
}; 