require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const vehicleRoutes = require('./routes/vehicles');
const consumptionRoutes = require('./routes/consumptions');
const interventionRoutes = require('./routes/interventions');
const missionRoutes = require('./routes/missions');
const chauffeurRoutes = require('./routes/chauffeurs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/consumptions', consumptionRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur Auto Parc en fonctionnement',
    timestamp: new Date().toISOString(),
    database: 'MySQL'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Initialisation du serveur
const startServer = async () => {
  try {
    // Test de la connexion à la base de données
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log('⚠️  Démarrage du serveur sans connexion à la base de données');
      console.log('🔧 Veuillez configurer MySQL et exécuter le script database/create_database.sql');
      console.log('📋 Instructions:');
      console.log('   1. Ouvrir phpMyAdmin (http://localhost/phpmyadmin)');
      console.log('   2. Importer le fichier database/create_database.sql');
      console.log('   3. Redémarrer le serveur');
    } else {
      console.log('✅ Connexion à la base de données MySQL établie');
    }

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 API disponible sur http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log('');
      console.log('📧 Comptes par défaut:');
      console.log('   Admin: admin@autoparc.com / admin123');
      console.log('   Responsable: mohammed.alami@autoparc.com / password123');
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrage
startServer();

// Gestion de l'arrêt propre du serveur
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur en cours...');
  console.log('✅ Serveur arrêté');
  process.exit(0);
});

module.exports = app; 