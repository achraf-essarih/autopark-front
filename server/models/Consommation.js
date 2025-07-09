const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Consommation = sequelize.define('Consommation', {
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
  date_consommation: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  kilometrage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  litres_carburant: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    validate: {
      min: 0.1
    }
  },
  prix_litre: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0.1
    }
  },
  consommation_calculee: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Consommation en L/100km calculée automatiquement'
  },
  station_service: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  note: {
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
  }
}, {
  tableName: 'consommations',
  indexes: [
    {
      fields: ['vehicule_id']
    },
    {
      fields: ['date_consommation']
    },
    {
      fields: ['responsable_id']
    }
  ]
});

// Hook pour calculer automatiquement les litres et la consommation
Consommation.beforeSave(async (consommation) => {
  // Si le prix par litre est fourni, calculer les litres
  if (consommation.prix_litre && !consommation.litres_carburant) {
    consommation.litres_carburant = consommation.montant / consommation.prix_litre;
  }
  
  // Si les litres ne sont pas fournis mais qu'on a le montant, estimer avec un prix moyen
  if (!consommation.litres_carburant && consommation.montant) {
    const prixMoyenGasoil = 13.50; // Prix moyen en MAD
    consommation.litres_carburant = consommation.montant / prixMoyenGasoil;
  }
});

module.exports = Consommation; 