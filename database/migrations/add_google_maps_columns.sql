-- Migration pour ajouter les colonnes Google Maps à la table missions
-- Exécuter ce script sur les bases de données existantes

ALTER TABLE missions 
ADD COLUMN destination_latitude DECIMAL(10, 8) NULL,
ADD COLUMN destination_longitude DECIMAL(11, 8) NULL,
ADD COLUMN google_maps_link VARCHAR(500) NULL,
ADD COLUMN distance_km DECIMAL(8, 2) NULL,
ADD COLUMN temps_estime_minutes INT NULL,
ADD COLUMN temps_reel_minutes INT NULL,
ADD COLUMN itineraire_optimise TEXT NULL,
ADD COLUMN lieu_depart VARCHAR(255) NULL DEFAULT 'Siège social',
ADD COLUMN depart_latitude DECIMAL(10, 8) NULL,
ADD COLUMN depart_longitude DECIMAL(11, 8) NULL,
ADD COLUMN distance_added_to_vehicle BOOLEAN DEFAULT FALSE;

-- Ajouter l'index pour les coordonnées de destination
ALTER TABLE missions 
ADD INDEX idx_destination_coords (destination_latitude, destination_longitude);

-- Mettre à jour les missions existantes avec un lieu de départ par défaut
UPDATE missions 
SET lieu_depart = 'Siège social' 
WHERE lieu_depart IS NULL; 