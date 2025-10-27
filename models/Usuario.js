const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      msg: 'El correo electrónico ya está registrado'
    },
    validate: {
      isEmail: {
        msg: 'Debe ser un correo electrónico válido'
      },
      notEmpty: {
        msg: 'El correo es requerido'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La contraseña es requerida'
      },
      len: {
        args: [6, 255],
        msg: 'La contraseña debe tener al menos 6 caracteres'
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  rol_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'roles',
      key: 'id'
    }
  }
}, {
  tableName: 'usuarios',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    }
  }
});

// Método para verificar contraseña
Usuario.prototype.verificarPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para obtener datos sin contraseña
Usuario.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = Usuario;
