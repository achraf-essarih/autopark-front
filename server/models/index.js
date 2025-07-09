const User = require('./User');
const Vehicle = require('./Vehicle');
const Intervention = require('./Intervention');
const Consommation = require('./Consommation');
const OrdreMission = require('./OrdreMission');

// Définition des associations entre les modèles

// Un utilisateur peut être responsable de plusieurs véhicules
User.hasMany(Vehicle, {
  foreignKey: 'responsable_id',
  as: 'vehicules'
});
Vehicle.belongsTo(User, {
  foreignKey: 'responsable_id',
  as: 'responsable'
});

// Un véhicule peut avoir plusieurs interventions
Vehicle.hasMany(Intervention, {
  foreignKey: 'vehicule_id',
  as: 'interventions'
});
Intervention.belongsTo(Vehicle, {
  foreignKey: 'vehicule_id',
  as: 'vehicule'
});

// Un utilisateur peut effectuer plusieurs interventions
User.hasMany(Intervention, {
  foreignKey: 'responsable_id',
  as: 'interventions'
});
Intervention.belongsTo(User, {
  foreignKey: 'responsable_id',
  as: 'responsable'
});

// Un véhicule peut avoir plusieurs consommations
Vehicle.hasMany(Consommation, {
  foreignKey: 'vehicule_id',
  as: 'consommations'
});
Consommation.belongsTo(Vehicle, {
  foreignKey: 'vehicule_id',
  as: 'vehicule'
});

// Un utilisateur peut enregistrer plusieurs consommations
User.hasMany(Consommation, {
  foreignKey: 'responsable_id',
  as: 'consommations'
});
Consommation.belongsTo(User, {
  foreignKey: 'responsable_id',
  as: 'responsable'
});

// Un véhicule peut avoir plusieurs ordres de mission
Vehicle.hasMany(OrdreMission, {
  foreignKey: 'vehicule_id',
  as: 'ordres_missions'
});
OrdreMission.belongsTo(Vehicle, {
  foreignKey: 'vehicule_id',
  as: 'vehicule'
});

// Un utilisateur peut créer plusieurs ordres de mission
User.hasMany(OrdreMission, {
  foreignKey: 'responsable_id',
  as: 'ordres_missions_crees'
});
OrdreMission.belongsTo(User, {
  foreignKey: 'responsable_id',
  as: 'responsable'
});

// Un admin peut approuver plusieurs ordres de mission
User.hasMany(OrdreMission, {
  foreignKey: 'approuve_par',
  as: 'ordres_missions_approuves'
});
OrdreMission.belongsTo(User, {
  foreignKey: 'approuve_par',
  as: 'approbateur'
});

module.exports = {
  User,
  Vehicle,
  Intervention,
  Consommation,
  OrdreMission
}; 