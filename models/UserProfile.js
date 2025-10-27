const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'userId', // Especificar el nombre exacto de la columna
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'bio',
    validate: {
      len: {
        args: [0, 1000],
        msg: 'La biografía no puede exceder 1000 caracteres'
      }
    }
  },
  avatarUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'avatarUrl',
    validate: {
      isUrl: {
        msg: 'Debe ser una URL válida'
      }
    }
  }
}, {
  tableName: 'UserProfiles',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserProfile;
