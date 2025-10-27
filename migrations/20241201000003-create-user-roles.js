'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserRoles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Crear índice único compuesto
    await queryInterface.addIndex('UserRoles', ['userId', 'roleId'], {
      unique: true,
      name: 'uq_user_roles_user_role'
    });

    // Crear índices individuales para mejor performance
    await queryInterface.addIndex('UserRoles', ['userId']);
    await queryInterface.addIndex('UserRoles', ['roleId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserRoles');
  }
};
