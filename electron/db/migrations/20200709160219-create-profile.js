'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      zoneName: {
        type: Sequelize.STRING
      },
      woredaName: {
        type: Sequelize.STRING
      },
      eligibleHouseholds: {
        type: Sequelize.INTEGER
      },
      contributionAmount: {
        type: Sequelize.FLOAT
      },
      registrationFee: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('Profiles');
  }
};