const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Intervention = sequelize.define('Intervention', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vehicles',
      key: 'id'
    }
  },
  type_intervention: {
    type: DataTypes.ENUM('assurance', 'vidange', 'vignette', 'controle', 'mecanique'),
    allowNull: false
  },
  date_intervention: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  mois_assurance: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12
    }
  },
  cout: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  kilometrage_intervention: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  prochaine_echeance: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('En cours', 'Terminé', 'En attente'),
    allowNull: false,
    defaultValue: 'En cours'
  },
  responsable_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'interventions',
  indexes: [
    {
      fields: ['vehicule_id']
    },
    {
      fields: ['type_intervention']
    },
    {
      fields: ['date_intervention']
    },
    {
      fields: ['responsable_id']
    }
  ]
});

module.exports = Intervention; 