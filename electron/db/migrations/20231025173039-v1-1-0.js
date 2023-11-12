'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn(
      'Profiles',
      'password',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    )

    await queryInterface.addColumn(
      'Households',
      'idCardIssued',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }
    )

    await queryInterface.removeColumn(
      'Subsidies',
      'targetedSubsidy'
    )

    await queryInterface.addColumn(
      'Subsidies',
      'regionTargetedSubsidy',
      {
        type: Sequelize.FLOAT,
        allowNull: true
      }
    )


    await queryInterface.addColumn(
      'Subsidies',
      'zoneTargetedSubsidy',
      {
        type: Sequelize.FLOAT,
        allowNull: true
      }
    )


    await queryInterface.addColumn(
      'Subsidies',
      'woredaTargetedSubsidy',
      {
        type: Sequelize.FLOAT,
        allowNull: true
      }
    )
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      'Profiles',
      'password'
    )

    await queryInterface.removeColumn(
      'Households',
      'idCardIssued'
    )

    await queryInterface.removeColumn(
      'Subsidies',
      'regionTargetedSubsidy'
    )

    await queryInterface.removeColumn(
      'Subsidies',
      'zoneTargetedSubsidy'
    )

    await queryInterface.removeColumn(
      'Subsidies',
      'woredaTargetedSubsidy'
    )

    await queryInterface.addColumn(
      'Subsidies',
      'targetedSubsidy',
      {
        type: Sequelize.FLOAT,
        allowNull: true
      }
    )
  }
};
