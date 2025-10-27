const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'El nombre del rol ya existe'
    },
    validate: {
      notEmpty: {
        msg: 'El nombre del rol es requerido'
      },
      len: {
        args: [2, 50],
        msg: 'El nombre del rol debe tener entre 2 y 50 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'roles'
});

module.exports = Rol;
