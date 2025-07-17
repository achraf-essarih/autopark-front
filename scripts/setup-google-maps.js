const fs = require('fs');
const path = require('path');

console.log('🗺️  Configuration de Google Maps API pour Auto-Parc');
console.log('================================================\n');

console.log('📋 Étapes pour obtenir votre clé API Google Maps:');
console.log('1. Allez sur https://console.cloud.google.com/');
console.log('2. Créez un nouveau projet ou sélectionnez un projet existant');
console.log('3. Activez les APIs suivantes:');
console.log('   - Maps JavaScript API');
console.log('   - Places API');
console.log('   - Directions API');
console.log('   - Geocoding API');
console.log('4. Créez une clé API dans "APIs & Services" > "Credentials"');
console.log('5. Configurez les restrictions (recommandé):');
console.log('   - Restriction de domaine pour production');
console.log('   - Restriction d\'API pour les APIs listées ci-dessus\n');

console.log('⚙️  Configuration des variables d\'environnement:');
console.log('Copiez le fichier env.example vers .env et remplacez:');
console.log('GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE');
console.log('REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE');
console.log('par votre vraie clé API.\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  try {
    // Copier env.example vers .env
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Fichier .env créé à partir d\'env.example');
    console.log('📝 Éditez maintenant le fichier .env pour ajouter votre clé API Google Maps\n');
  } catch (error) {
    console.log('❌ Erreur lors de la création du fichier .env:', error.message);
  }
} else {
  console.log('✅ Fichier .env existe déjà');
  
  // Vérifier si les clés Google Maps sont configurées
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('YOUR_GOOGLE_MAPS_API_KEY_HERE')) {
    console.log('⚠️  Attention: Vous devez encore configurer votre clé API Google Maps dans .env\n');
  } else {
    console.log('✅ Clé API Google Maps semble être configurée\n');
  }
}

console.log('🚀 Fonctionnalités Google Maps intégrées:');
console.log('- ✅ Sélection interactive de destinations sur carte');
console.log('- ✅ Calcul automatique de distance et temps de trajet');
console.log('- ✅ Autocomplétion d\'adresses pour le Maroc');
console.log('- ✅ Liens directs vers Google Maps pour navigation');
console.log('- ✅ Stockage des coordonnées GPS en base de données');
console.log('- ✅ Analyses géospatiales des missions');
console.log('- ✅ Optimisation des itinéraires\n');

console.log('📊 Nouvelles données stockées:');
console.log('- Coordonnées GPS de destination (latitude/longitude)');
console.log('- Distance en kilomètres');
console.log('- Temps estimé en minutes');
console.log('- Liens Google Maps');
console.log('- Point de départ configurable\n');

console.log('🔧 Pour démarrer l\'application avec Google Maps:');
console.log('1. Configurez votre clé API dans .env');
console.log('2. npm run dev');
console.log('3. Allez sur http://localhost:3001/ordres-missions');
console.log('4. Cliquez sur "Nouveau ordre de mission"');
console.log('5. Cliquez sur "Carte interactive" pour voir Google Maps\n');

console.log('⚡ Innovation géospatiale intégrée avec succès!'); 