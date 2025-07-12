const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const fixAdminUser = async () => {
  try {
    console.log('🔧 Vérification et correction de l\'utilisateur admin...');
    
    // Vérifier si l'admin existe
    const existingAdmin = await query('SELECT * FROM users WHERE email = ?', ['admin@autoparc.com']);
    
    if (existingAdmin.length === 0) {
      console.log('❌ Aucun utilisateur admin trouvé. Création en cours...');
      
      // Créer l'utilisateur admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await query(
        'INSERT INTO users (nom, prenom, email, mot_de_passe, role, actif) VALUES (?, ?, ?, ?, ?, ?)',
        ['Administrateur', 'Système', 'admin@autoparc.com', hashedPassword, 'admin', true]
      );
      
      console.log('✅ Utilisateur admin créé avec succès!');
    } else {
      console.log('ℹ️  Utilisateur admin trouvé. Vérification des données...');
      
      const admin = existingAdmin[0];
      console.log('📋 Données actuelles:');
      console.log(`   - ID: ${admin.id}`);
      console.log(`   - Nom: ${admin.nom} ${admin.prenom}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Rôle: ${admin.role}`);
      console.log(`   - Actif: ${admin.actif}`);
      
      // Vérifier si le rôle est correct
      if (admin.role !== 'admin') {
        console.log('🔄 Correction du rôle...');
        await query('UPDATE users SET role = ? WHERE email = ?', ['admin', 'admin@autoparc.com']);
        console.log('✅ Rôle corrigé en admin');
      }
      
      // Vérifier si l'utilisateur est actif
      if (!admin.actif) {
        console.log('🔄 Activation de l\'utilisateur...');
        await query('UPDATE users SET actif = ? WHERE email = ?', [true, 'admin@autoparc.com']);
        console.log('✅ Utilisateur activé');
      }
      
      // Réinitialiser le mot de passe à admin123
      console.log('🔄 Réinitialisation du mot de passe...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await query('UPDATE users SET mot_de_passe = ? WHERE email = ?', [hashedPassword, 'admin@autoparc.com']);
      console.log('✅ Mot de passe réinitialisé à "admin123"');
    }
    
    // Vérification finale
    const finalAdmin = await query('SELECT * FROM users WHERE email = ?', ['admin@autoparc.com']);
    
    if (finalAdmin.length > 0) {
      const admin = finalAdmin[0];
      console.log('\n🎉 Utilisateur admin configuré avec succès!');
      console.log('📧 Credentials de connexion:');
      console.log('   Email: admin@autoparc.com');
      console.log('   Mot de passe: admin123');
      console.log(`   Rôle: ${admin.role}`);
      console.log(`   Statut: ${admin.actif ? 'Actif' : 'Inactif'}`);
      
      // Tester le mot de passe
      const isPasswordValid = await bcrypt.compare('admin123', admin.mot_de_passe);
      console.log(`   Mot de passe valide: ${isPasswordValid ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction de l\'utilisateur admin:', error);
    throw error;
  }
};

// Exécuter le script si appelé directement
if (require.main === module) {
  fixAdminUser()
    .then(() => {
      console.log('\n✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur lors de l\'exécution du script:', error);
      process.exit(1);
    });
}

module.exports = { fixAdminUser }; 