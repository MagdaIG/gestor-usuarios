'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modificar tabla roles para usar UUID
    await queryInterface.changeColumn('roles', 'id', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    });

    // Modificar tabla usuarios para usar UUID
    await queryInterface.changeColumn('usuarios', 'id', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    });

    // Modificar rol_id en usuarios para usar UUID
    await queryInterface.changeColumn('usuarios', 'rol_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Agregar índice único para email si no existe
    try {
      await queryInterface.addIndex('usuarios', ['correo'], {
        unique: true,
        name: 'uq_usuarios_email'
      });
    } catch (error) {
      // El índice ya existe, continuar
      console.log('Índice uq_usuarios_email ya existe');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir cambios
    await queryInterface.changeColumn('usuarios', 'rol_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    });

    await queryInterface.changeColumn('usuarios', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    });

    await queryInterface.changeColumn('roles', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    });
  }
};
