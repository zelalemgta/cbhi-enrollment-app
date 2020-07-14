'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EnrollmentPeriods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      enrollmentYear: {
        type: Sequelize.INTEGER
      },
      enrollmentStartDate: {
        type: Sequelize.DATEONLY
      },
      enrollmentEndDate: {
        type: Sequelize.DATEONLY
      },
      coverageStartDate: {
        type: Sequelize.DATEONLY
      },
      coverageEndDate: {
        type: Sequelize.DATEONLY
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
    await queryInterface.dropTable('EnrollmentPeriods');
  }
};