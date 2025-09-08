// Feedback model using Sequelize for SQLite
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  generationId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['task', 'testcase', 'code', 'risk']]
    }
  },
  rating: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['positive', 'negative']]
    }
  },
  comment: {
    type: DataTypes.TEXT
  },
  originalContent: {
    type: DataTypes.TEXT
  },
  conversationHistory: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  updatedAt: false // We only need createdAt
});

module.exports = Feedback;