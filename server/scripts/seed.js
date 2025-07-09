const { sequelize } = require('../config/database');
const { User, Vehicle, Intervention, Consommation, OrdreMission } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Démarrage du seeding de la base de données...');

    // Synchronisation forcée (supprime et recrée les tables)
    await sequelize.sync({ force: true });
    console.log('✅ Base de données réinitialisée');

    // Création de l'administrateur
    const admin = await User.create({
      nom: 'Administrateur',
      prenom: 'Système',
      email: 'admin@autoparc.com',
      mot_de_passe: 'admin123',
      role: 'admin'
    });
    console.log('✅ Administrateur créé');

    // Création de responsables de test
    const responsables = await User.bulkCreate([
      {
        nom: 'Alami',
        prenom: 'Mohammed',
        email: 'mohammed.alami@autoparc.com',
        mot_de_passe: 'password123',
        role: 'responsable'
      },
      {
        nom: 'Benali',
        prenom: 'Fatima',
        email: 'fatima.benali@autoparc.com',
        mot_de_passe: 'password123',
        role: 'responsable'
      },
      {
        nom: 'Elhajji',
        prenom: 'Ahmed',
        email: 'ahmed.elhajji@autoparc.com',
        mot_de_passe: 'password123',
        role: 'responsable'
      }
    ]);
    console.log('✅ Responsables créés');

    // Création de véhicules de test
    const vehicules = await Vehicle.bulkCreate([
      {
        nom_vehicule: 'Dacia Logan 1',
        marque: 'Dacia',
        modele: 'Logan',
        date_mise_circulation: '2020-03-15',
        immatriculation: '123456-A-78',
        mode_carburant: 'Diesel',
        boite_vitesses: 'Manuelle',
        rapport: '5 Rapport',
        nombre_ports: '4 Port',
        etat_mecanique: 'Bon',
        puissance_fiscale: 6,
        plein_reservoir: 50.0,
        kilometrage: 45000,
        consommation_l100: 6.5,
        description: 'Véhicule de service principal',
        responsable_id: responsables[0].id
      },
      {
        nom_vehicule: 'Renault Clio 2',
        marque: 'Renault',
        modele: 'Clio',
        date_mise_circulation: '2019-07-22',
        immatriculation: '789123-B-45',
        mode_carburant: 'Essence',
        boite_vitesses: 'Manuelle',
        rapport: '5 Rapport',
        nombre_ports: '5 Port',
        etat_mecanique: 'Excellent',
        puissance_fiscale: 5,
        plein_reservoir: 45.0,
        kilometrage: 32000,
        consommation_l100: 7.2,
        description: 'Véhicule urbain',
        responsable_id: responsables[1].id
      },
      {
        nom_vehicule: 'Ford Transit',
        marque: 'Ford',
        modele: 'Transit',
        date_mise_circulation: '2021-01-10',
        immatriculation: '456789-C-12',
        mode_carburant: 'Diesel',
        boite_vitesses: 'Manuelle',
        rapport: '6 Rapport',
        nombre_ports: '2 Port',
        etat_mecanique: 'Bon',
        puissance_fiscale: 9,
        plein_reservoir: 80.0,
        kilometrage: 25000,
        consommation_l100: 9.5,
        description: 'Véhicule utilitaire',
        responsable_id: responsables[2].id
      }
    ]);
    console.log('✅ Véhicules créés');

    // Création d'interventions de test
    const interventions = await Intervention.bulkCreate([
      {
        vehicule_id: vehicules[0].id,
        type_intervention: 'vidange',
        date_intervention: '2025-01-10',
        cout: 350.00,
        kilometrage_intervention: 44800,
        prochaine_echeance: '2025-07-10',
        note: 'Vidange complète avec changement de filtre',
        statut: 'Terminé',
        responsable_id: responsables[0].id
      },
      {
        vehicule_id: vehicules[1].id,
        type_intervention: 'assurance',
        date_intervention: '2025-01-01',
        mois_assurance: 12,
        cout: 2400.00,
        note: 'Renouvellement assurance annuelle',
        statut: 'Terminé',
        responsable_id: responsables[1].id
      },
      {
        vehicule_id: vehicules[2].id,
        type_intervention: 'controle',
        date_intervention: '2025-01-15',
        cout: 450.00,
        kilometrage_intervention: 24900,
        prochaine_echeance: '2026-01-15',
        note: 'Contrôle technique annuel',
        statut: 'En cours',
        responsable_id: responsables[2].id
      }
    ]);
    console.log('✅ Interventions créées');

    // Création de consommations de test
    const consommations = await Consommation.bulkCreate([
      {
        vehicule_id: vehicules[0].id,
        date_consommation: '2025-01-20',
        montant: 675.00,
        kilometrage: 45000,
        litres_carburant: 50.0,
        prix_litre: 13.50,
        station_service: 'Total Maroc',
        note: 'Plein complet',
        responsable_id: responsables[0].id
      },
      {
        vehicule_id: vehicules[1].id,
        date_consommation: '2025-01-18',
        montant: 540.00,
        kilometrage: 32000,
        litres_carburant: 40.0,
        prix_litre: 13.50,
        station_service: 'Shell',
        responsable_id: responsables[1].id
      },
      {
        vehicule_id: vehicules[2].id,
        date_consommation: '2025-01-22',
        montant: 1080.00,
        kilometrage: 25000,
        litres_carburant: 80.0,
        prix_litre: 13.50,
        station_service: 'Afriquia',
        note: 'Plein utilitaire',
        responsable_id: responsables[2].id
      }
    ]);
    console.log('✅ Consommations créées');

    // Création d'ordres de mission de test
    const ordresMissions = await OrdreMission.bulkCreate([
      {
        vehicule_id: vehicules[0].id,
        type_mission: 'Mission officielle',
        objet_mission: 'Réunion avec partenaires à Casablanca',
        date_depart: '2025-01-25',
        date_retour: '2025-01-25',
        lieu_destination: 'Casablanca',
        personnel_transporte: 'Directeur + 2 accompagnants',
        kilometrage_depart: 45000,
        kilometrage_retour: 45150,
        statut: 'Planifié',
        observations: 'Départ prévu à 8h00',
        responsable_id: responsables[0].id,
        approuve_par: admin.id,
        date_approbation: new Date()
      },
      {
        vehicule_id: vehicules[1].id,
        type_mission: 'Formation',
        objet_mission: 'Formation du personnel à Rabat',
        date_depart: '2025-01-28',
        date_retour: '2025-01-30',
        lieu_destination: 'Rabat',
        personnel_transporte: '3 employés',
        statut: 'En cours',
        observations: 'Formation de 3 jours',
        responsable_id: responsables[1].id
      }
    ]);
    console.log('✅ Ordres de mission créés');

    console.log('\n🎉 Seeding terminé avec succès!');
    console.log('\n📋 Comptes créés:');
    console.log('👤 Admin: admin@autoparc.com / admin123');
    console.log('👤 Responsable 1: mohammed.alami@autoparc.com / password123');
    console.log('👤 Responsable 2: fatima.benali@autoparc.com / password123');
    console.log('👤 Responsable 3: ahmed.elhajji@autoparc.com / password123');
    console.log('\n📊 Données créées:');
    console.log(`🚗 ${vehicules.length} véhicules`);
    console.log(`🔧 ${interventions.length} interventions`);
    console.log(`⛽ ${consommations.length} consommations`);
    console.log(`📋 ${ordresMissions.length} ordres de mission`);

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Démarrage du seeding
seedDatabase(); 