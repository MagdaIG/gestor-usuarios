const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserRoles = sequelize.define('UserRoles', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'userId', // Especificar el nombre exacto de la columna
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'roleId', // Especificar el nombre exacto de la columna
    references: {
      model: 'roles',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'UserRoles',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'roleId'],
      name: 'uq_user_roles_user_role'
    }
  ]
});

module.exports = UserRoles;
