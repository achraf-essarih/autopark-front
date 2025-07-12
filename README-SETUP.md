# Auto Parc - Système de Gestion de Parc Automobile

## 🚀 Vue d'ensemble

Système complet de gestion de parc automobile avec authentification, base de données et interface d'administration.

### ✨ Fonctionnalités

- **🔐 Authentification complète** : Login sécurisé pour admins et responsables
- **👨‍💼 Panel d'administration** : Gestion des responsables avec CRUD complet
- **🚗 Gestion des véhicules** : Ajout, modification, suivi des véhicules
- **⛽ Suivi des consommations** : Enregistrement et analyse des carburants
- **🔧 Gestion des interventions** : Maintenance, assurance, contrôles techniques
- **📋 Ordres de mission** : Planification et suivi des déplacements
- **📊 Rapports détaillés** : Statistiques et analyses

## 🛠️ Technologies utilisées

### Backend
- **Node.js** + **Express.js** : Serveur API REST
- **MySQL** + **Sequelize ORM** : Base de données et modélisation
- **JWT** : Authentification sécurisée
- **bcrypt** : Hachage des mots de passe

### Frontend
- **React 19** : Interface utilisateur moderne
- **React Router** : Navigation et routes protégées
- **Axios** : Communication avec l'API
- **Lucide React** : Icônes modernes

## 📋 Prérequis

1. **Node.js** (version 16 ou supérieure)
2. **MySQL** (version 5.7 ou supérieure)
3. **npm** ou **yarn**

## ⚙️ Installation

### 1. Cloner le projet
```bash
git clone <url-du-projet>
cd auto-parc
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de la base de données

#### Créer la base de données MySQL
```sql
CREATE DATABASE auto_parc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Configurer les variables d'environnement
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos paramètres
DB_HOST=localhost
DB_PORT=3306
DB_USER=votre_utilisateur_mysql
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=auto_parc_db
JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe
PORT=5000
NODE_ENV=development
```

### 4. Initialiser la base de données
La base de données est automatiquement initialisée avec les données de test grâce au script SQL `database/create_database.sql` que vous avez importé dans phpMyAdmin.

## 🚀 Démarrage

### Mode développement (Frontend + Backend)
```bash
npm run dev
```

### Démarrage séparé
```bash
# Backend uniquement (port 5000)
npm run server

# Frontend uniquement (port 3000)
npm start
```

## 🔑 Comptes de démonstration

Les comptes de démonstration suivants sont disponibles :

### 👤 Administrateur
- **Email :** admin@autoparc.com
- **Mot de passe :** admin123
- **Rôle :** Accès complet à l'administration

### 👨‍💼 Responsables
- **Email :** mohammed.alami@autoparc.com / **Mot de passe :** password123
- **Email :** fatima.benali@autoparc.com / **Mot de passe :** password123
- **Email :** ahmed.elhajji@autoparc.com / **Mot de passe :** password123

## 📊 Structure de la base de données

### Tables principales

#### `users` - Utilisateurs
```sql
- id (PK)
- nom, prenom
- email (unique)
- mot_de_passe (hashé)
- role (admin/responsable)
- actif (boolean)
- derniere_connexion
- created_at, updated_at
```

#### `vehicles` - Véhicules
```sql
- id (PK)
- nom_vehicule
- marque, modele
- date_mise_circulation
- immatriculation (unique)
- mode_carburant (Essence/Diesel)
- boite_vitesses (Manuelle/Automatique)
- nombre_ports, etat_mecanique
- puissance_fiscale, plein_reservoir
- kilometrage, consommation_l100
- description
- responsable_id (FK)
- actif (boolean)
```

#### `interventions` - Interventions
```sql
- id (PK)
- vehicule_id (FK)
- type_intervention (assurance/vidange/vignette/controle/mecanique)
- date_intervention
- cout, kilometrage_intervention
- prochaine_echeance
- note, statut
- responsable_id (FK)
```

#### `consommations` - Consommations
```sql
- id (PK)
- vehicule_id (FK)
- date_consommation
- montant, kilometrage
- litres_carburant, prix_litre
- consommation_calculee
- station_service, note
- responsable_id (FK)
```

#### `ordres_missions` - Ordres de mission
```sql
- id (PK)
- vehicule_id (FK)
- type_mission, objet_mission
- date_depart, date_retour
- lieu_destination, personnel_transporte
- kilometrage_depart, kilometrage_retour
- distance_parcourue (calculée)
- statut, observations
- responsable_id, approuve_par (FK)
```

## 🔐 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/change-password` - Changer mot de passe

### Administration (Admin uniquement)
- `GET /api/admin/responsables` - Liste des responsables
- `POST /api/admin/responsables` - Créer responsable
- `GET /api/admin/responsables/:id` - Détails responsable
- `PUT /api/admin/responsables/:id` - Modifier responsable
- `DELETE /api/admin/responsables/:id` - Supprimer responsable
- `GET /api/admin/statistics` - Statistiques générales

## 🎯 Guide d'utilisation

### Pour les Administrateurs

1. **Connexion :** Utilisez l'email admin@autoparc.com
2. **Accès au panel :** Automatiquement redirigé vers `/admin/dashboard`
3. **Gestion des responsables :**
   - Ajouter de nouveaux responsables
   - Modifier les informations existantes
   - Désactiver des comptes
   - Voir l'historique et les statistiques

### Pour les Responsables

1. **Connexion :** Utilisez votre email professionnel
2. **Tableau de bord :** Vue d'ensemble des véhicules et activités
3. **Gestion quotidienne :**
   - Enregistrer les consommations de carburant
   - Planifier les interventions
   - Créer des ordres de mission
   - Générer des rapports

## 🔧 Développement

### Structure du projet
```
auto-parc/
├── src/                     # Frontend React
│   ├── components/          # Composants réutilisables
│   ├── pages/              # Pages de l'application
│   ├── services/           # Services API
│   └── utils/              # Utilitaires
├── server/                 # Backend Node.js
│   ├── config/             # Configuration DB
│   ├── models/             # Modèles Sequelize
│   ├── routes/             # Routes API
│   ├── middleware/         # Middleware Express
│   └── scripts/            # Scripts utilitaires
└── public/                 # Assets statiques
```

### Commandes utiles
```bash
# Réinitialiser la base de données (réimporter le fichier SQL)
# Via phpMyAdmin : Importer database/create_database.sql

# Tester la connexion API
curl http://localhost:5000/api/health

# Voir les logs du serveur
npm run server

# Build de production
npm run build
```

## 🚨 Sécurité

- **Mots de passe :** Hachés avec bcrypt (salt rounds: 10)
- **JWT :** Tokens avec expiration (24h)
- **Validation :** Toutes les entrées sont validées
- **CORS :** Configuré pour le domaine frontend
- **Authentification :** Routes protégées par middleware

## 📝 Notes importantes

1. **Changement des mots de passe par défaut** : Modifiez immédiatement le mot de passe admin en production
2. **Variables d'environnement** : Ne jamais committer le fichier `.env` 
3. **Base de données** : Effectuez des sauvegardes régulières
4. **JWT Secret** : Utilisez une clé longue et complexe en production

## 🆘 Dépannage

### Erreurs courantes

**Erreur de connexion à la base de données :**
```bash
# Vérifier que MySQL est démarré
sudo service mysql start

# Vérifier les paramètres de connexion dans .env
```

**Erreur de port déjà utilisé :**
```bash
# Changer le port dans .env ou arrêter le processus
lsof -ti:5000 | xargs kill -9
```

**Erreur de token JWT :**
```bash
# Supprimer les tokens locaux
localStorage.clear()
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez cette documentation
2. Consultez les logs du serveur
3. Vérifiez la configuration de la base de données
4. Contactez l'équipe de développement

---

🎉 **Le système Auto Parc est maintenant prêt à être utilisé !** 