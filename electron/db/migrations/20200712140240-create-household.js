'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Households', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        autoIncrement: false,
        primaryKey: true,
      },
      cbhiId: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Households');
  }
};