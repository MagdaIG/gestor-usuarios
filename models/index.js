const Usuario = require('./Usuario');
const Rol = require('./Rol');
const UserProfile = require('./UserProfile');
const UserRoles = require('./UserRoles');

// Asociación uno a muchos: Un rol puede tener muchos usuarios (relación original)
Rol.hasMany(Usuario, {
  foreignKey: 'rol_id',
  as: 'usuarios',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Asociación muchos a uno: Un usuario pertenece a un rol (relación original)
Usuario.belongsTo(Rol, {
  foreignKey: 'rol_id',
  as: 'rol',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Asociación muchos a muchos: Un usuario puede tener múltiples roles
Usuario.belongsToMany(Rol, {
  through: UserRoles,
  as: 'roles',
  foreignKey: 'userId',
  otherKey: 'roleId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Asociación muchos a muchos: Un rol puede ser asignado a múltiples usuarios
Rol.belongsToMany(Usuario, {
  through: UserRoles,
  as: 'usersMany',
  foreignKey: 'roleId',
  otherKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Asociación uno a uno: Un usuario tiene un perfil
Usuario.hasOne(UserProfile, {
  foreignKey: 'userId',
  as: 'profile',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Asociación uno a uno: Un perfil pertenece a un usuario
UserProfile.belongsTo(Usuario, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Exportar modelos con asociaciones
module.exports = {
  Usuario,
  Rol,
  UserProfile,
  UserRoles
};
