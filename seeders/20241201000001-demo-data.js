'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insertar roles iniciales con UUIDs
    const roles = [
      {
        id: uuidv4(),
        nombre: 'Administrador',
        descripcion: 'Rol con acceso completo al sistema',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        nombre: 'Usuario',
        descripcion: 'Rol básico de usuario',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        nombre: 'Moderador',
        descripcion: 'Rol con permisos de moderación',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('roles', roles, {});

    // Obtener el ID del rol de Administrador
    const adminRole = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE nombre = 'Administrador'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminRole.length > 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Insertar usuario administrador por defecto
      await queryInterface.bulkInsert('usuarios', [
        {
          id: uuidv4(),
          nombre: 'Administrador del Sistema',
          correo: 'admin@sistema.com',
          password: hashedPassword,
          activo: true,
          rol_id: adminRole[0].id,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
