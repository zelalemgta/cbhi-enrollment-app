'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Members', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        autoIncrement: false,
        primaryKey: true,
      },
      fullName: {
        type: Sequelize.STRING
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY
      },
      gender: {
        type: Sequelize.STRING
      },
      cbhiId: {
        type: Sequelize.STRING
      },
      relationship: {
        type: Sequelize.STRING
      },
      profession: {
        type: Sequelize.STRING
      },
      parentId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      enrolledDate: {
        type: Sequelize.DATEONLY
      },
      isDeleted: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Members');
  }
};