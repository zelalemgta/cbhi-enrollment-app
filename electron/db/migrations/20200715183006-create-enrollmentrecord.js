'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EnrollmentRecords', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        autoIncrement: false,
        primaryKey: true,
      },
      contributionAmount: {
        type: Sequelize.FLOAT
      },
      registrationFee: {
        type: Sequelize.FLOAT
      },
      additionalBeneficiaryFee: {
        type: Sequelize.FLOAT
      },
      otherFees: {
        type: Sequelize.FLOAT
      },
      receiptNo: {
        type: Sequelize.STRING
      },
      receiptDate: {
        type: Sequelize.DATEONLY
      },
      isPaying: {
        type: Sequelize.BOOLEAN
      },
      cbhiId: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('EnrollmentRecords');
  }
};