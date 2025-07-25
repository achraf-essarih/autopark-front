

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS auto_parc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE auto_parc_db;

-- Table des utilisateurs (admins et responsables)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('admin', 'responsable') NOT NULL DEFAULT 'responsable',
    actif BOOLEAN DEFAULT TRUE,
    derniere_connexion DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Table des véhicules
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_vehicule VARCHAR(100) NOT NULL,
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    date_mise_circulation DATE NOT NULL,
    immatriculation VARCHAR(20) NOT NULL UNIQUE,
    mode_carburant ENUM('Essence', 'Diesel') NOT NULL,
    boite_vitesses ENUM('Manuelle', 'Automatique') NOT NULL,
    rapport ENUM('5 Rapport', '6 Rapport') NOT NULL DEFAULT '5 Rapport',
    nombre_ports ENUM('2 Port', '4 Port', '5 Port') NOT NULL,
    etat_mecanique ENUM('Mauvais', 'Bon', 'Excellent') NOT NULL DEFAULT 'Bon',
    puissance_fiscale INT NOT NULL CHECK (puissance_fiscale >= 1 AND puissance_fiscale <= 50),
    plein_reservoir DECIMAL(5,2) NOT NULL CHECK (plein_reservoir >= 10.0 AND plein_reservoir <= 200.0),
    kilometrage INT NOT NULL DEFAULT 0 CHECK (kilometrage >= 0),
    consommation_l100 DECIMAL(4,2) NOT NULL CHECK (consommation_l100 >= 3.0 AND consommation_l100 <= 25.0),
    description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    responsable_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_immatriculation (immatriculation),
    INDEX idx_responsable (responsable_id),
    INDEX idx_actif (actif)
);

-- Table des interventions
CREATE TABLE interventions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicule_id INT NOT NULL,
    type_intervention ENUM('assurance', 'vidange', 'vignette', 'controle', 'mecanique') NOT NULL,
    date_intervention DATE NOT NULL,
    mois_assurance INT NULL CHECK (mois_assurance >= 1 AND mois_assurance <= 12),
    cout DECIMAL(10,2) DEFAULT 0.00,
    kilometrage_intervention INT NULL,
    prochaine_echeance DATE NULL,
    note TEXT,
    statut ENUM('En cours', 'Terminé', 'En attente') NOT NULL DEFAULT 'En cours',
    responsable_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicule (vehicule_id),
    INDEX idx_type (type_intervention),
    INDEX idx_date (date_intervention),
    INDEX idx_responsable (responsable_id)
);

-- Table des consommations
CREATE TABLE consommations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicule_id INT NOT NULL,
    date_consommation DATE NOT NULL,
    montant DECIMAL(8,2) NOT NULL CHECK (montant > 0),
    kilometrage INT NOT NULL CHECK (kilometrage >= 0),
    litres_carburant DECIMAL(6,2) NULL CHECK (litres_carburant > 0),
    prix_litre DECIMAL(5,2) NULL CHECK (prix_litre > 0),
    consommation_calculee DECIMAL(4,2) NULL COMMENT 'Consommation en L/100km calculée automatiquement',
    station_service VARCHAR(100),
    note TEXT,
    responsable_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicule (vehicule_id),
    INDEX idx_date (date_consommation),
    INDEX idx_responsable (responsable_id)
);

-- Table des chauffeurs
CREATE TABLE chauffeurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    numero_permis VARCHAR(50) UNIQUE,
    type_permis ENUM('B', 'C', 'D', 'BE', 'CE', 'DE') NOT NULL DEFAULT 'B',
    date_expiration_permis DATE NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(255),
    adresse TEXT,
    date_naissance DATE,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nom (nom, prenom),
    INDEX idx_permis (numero_permis),
    INDEX idx_actif (actif)
);

-- Table des missions
CREATE TABLE missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicule_id INT NOT NULL,
    chauffeur_id INT NULL,
    objet VARCHAR(255) NOT NULL,
    date_depart DATE NOT NULL,
    date_retour DATE NOT NULL,
    destination VARCHAR(255) NOT NULL,
    personnel_transporte VARCHAR(255),
    statut ENUM('Planifié', 'En cours', 'Terminé', 'Annulé') NOT NULL DEFAULT 'Planifié',
    notes TEXT,
    responsable_id INT NOT NULL,
    
    -- Nouvelles colonnes pour Google Maps
    destination_latitude DECIMAL(10, 8) NULL,
    destination_longitude DECIMAL(11, 8) NULL,
    google_maps_link VARCHAR(500) NULL,
    distance_km DECIMAL(8, 2) NULL,
    temps_estime_minutes INT NULL,
    temps_reel_minutes INT NULL,
    itineraire_optimise TEXT NULL,
    lieu_depart VARCHAR(255) NULL DEFAULT 'Siège social',
    depart_latitude DECIMAL(10, 8) NULL,
    depart_longitude DECIMAL(11, 8) NULL,
    distance_added_to_vehicle BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id) ON DELETE SET NULL,
    FOREIGN KEY (responsable_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicule (vehicule_id),
    INDEX idx_chauffeur (chauffeur_id),
    INDEX idx_date_depart (date_depart),
    INDEX idx_statut (statut),
    INDEX idx_responsable (responsable_id),
    INDEX idx_destination_coords (destination_latitude, destination_longitude)
);

-- Insérer l'administrateur par défaut
INSERT INTO users (nom, prenom, email, mot_de_passe, role) VALUES 
('Administrateur', 'Système', 'admin@autoparc.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjKDFOgXgqnJDOZxLDMVmfHcQzjm3y', 'admin');

-- Insérer des responsables de test
INSERT INTO users (nom, prenom, email, mot_de_passe, role) VALUES 
('Alami', 'Mohammed', 'mohammed.alami@autoparc.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'responsable'),
('Benali', 'Fatima', 'fatima.benali@autoparc.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'responsable'),
('Elhajji', 'Ahmed', 'ahmed.elhajji@autoparc.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'responsable');

-- Insérer des chauffeurs de test
INSERT INTO chauffeurs (nom, prenom, numero_permis, type_permis, date_expiration_permis, telephone, email) VALUES
('Alami', 'Mohammed', 'B123456789', 'B', '2026-12-31', '0612345678', 'mohammed.alami@chauffeur.com'),
('Benali', 'Fatima', 'B987654321', 'B', '2025-08-15', '0687654321', 'fatima.benali@chauffeur.com'),
('Elhajji', 'Ahmed', 'C456789123', 'C', '2027-03-20', '0698765432', 'ahmed.elhajji@chauffeur.com'),
('Tazi', 'Youssef', 'B789123456', 'B', '2025-11-10', '0623456789', 'youssef.tazi@chauffeur.com'),
('Benjelloun', 'Aicha', 'B321654987', 'B', '2026-05-25', '0634567890', 'aicha.benjelloun@chauffeur.com');

-- Insérer des véhicules de test
INSERT INTO vehicles (nom_vehicule, marque, modele, date_mise_circulation, immatriculation, mode_carburant, boite_vitesses, nombre_ports, etat_mecanique, puissance_fiscale, plein_reservoir, kilometrage, consommation_l100, description, responsable_id) VALUES
('Dacia Logan 1', 'Dacia', 'Logan', '2020-03-15', '123456-A-78', 'Diesel', 'Manuelle', '4 Port', 'Bon', 6, 50.00, 45000, 6.50, 'Véhicule de service principal', 2),
('Renault Clio 2', 'Renault', 'Clio', '2019-07-22', '789123-B-45', 'Essence', 'Manuelle', '5 Port', 'Excellent', 5, 45.00, 32000, 7.20, 'Véhicule urbain', 3),
('Ford Transit', 'Ford', 'Transit', '2021-01-10', '456789-C-12', 'Diesel', 'Manuelle', '2 Port', 'Bon', 9, 80.00, 25000, 9.50, 'Véhicule utilitaire', 4);

-- Note: Les mots de passe hachés correspondent à:
-- admin123 pour l'admin
-- password123 pour les responsables 

-- Créer un mot de passe simple "123456"
UPDATE users 
SET mot_de_passe = '$2a$10$xsX6HVtWCNM6KJQB0mToleWa8Wz6kJYkITb4koGSf0Tb7kdEnZzWu' 
WHERE email = 'admin@autoparc.com'; 