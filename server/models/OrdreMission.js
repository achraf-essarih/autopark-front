const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrdreMission = sequelize.define('OrdreMission', {
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
  type_mission: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  objet_mission: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  date_depart: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_retour: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  lieu_destination: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  personnel_transporte: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  kilometrage_depart: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  kilometrage_retour: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  distance_parcourue: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  statut: {
    type: DataTypes.ENUM('Planifié', 'En cours', 'Terminé', 'Annulé'),
    allowNull: false,
    defaultValue: 'Planifié'
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responsable_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approuve_par: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date_approbation: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'ordres_missions',
  indexes: [
    {
      fields: ['vehicule_id']
    },
    {
      fields: ['date_depart']
    },
    {
      fields: ['statut']
    },
    {
      fields: ['responsable_id']
    }
  ]
});

// Hook pour calculer automatiquement la distance parcourue
OrdreMission.beforeSave(async (ordre) => {
  if (ordre.kilometrage_depart && ordre.kilometrage_retour) {
    ordre.distance_parcourue = ordre.kilometrage_retour - ordre.kilometrage_depart;
  }
});

module.exports = OrdreMission; 