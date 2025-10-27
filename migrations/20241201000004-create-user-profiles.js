'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserProfiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      avatarUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
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

    // Crear índice único para userId
    await queryInterface.addIndex('UserProfiles', ['userId'], {
      unique: true,
      name: 'uq_user_profiles_user_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserProfiles');
  }
};
