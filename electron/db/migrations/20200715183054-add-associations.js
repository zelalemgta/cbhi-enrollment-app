'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      'Households', // name of Source model
      'AdministrativeDivisionId', // name of the key we're adding 
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'AdministrativeDivisions', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    );

    await queryInterface.addColumn(
      'Members', // name of Source model
      'HouseholdId', // name of the key we're adding 
      {
        type: Sequelize.UUID,
        references: {
          model: 'Households', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    );

    await queryInterface.addColumn(
      'EnrollmentRecords',
      'HouseholdId',
      {
        type: Sequelize.UUID,
        references: {
          model: 'Households',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    );

    await queryInterface.addColumn(
      'EnrollmentRecords',
      'EnrollmentPeriodId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'EnrollmentPeriods',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    );

    await queryInterface.addColumn(
      'Subsidies',
      'EnrollmentPeriodId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'EnrollmentPeriods',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    );

  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      'Households', // name of Source model
      'AdministrativeDivisionId' // key we want to remove
    );
    await queryInterface.removeColumn(
      'Members', // name of Source model
      'HouseholdId' // key we want to remove
    );
    await queryInterface.removeColumn(
      'EnrollmentRecords', // name of Source model
      'HouseholdId' // key we want to remove
    );
    await queryInterface.removeColumn(
      'EnrollmentRecords', // name of Source model
      'EnrollmentPeriodId' // key we want to remove
    );
    await queryInterface.removeColumn(
      'Subsidies', // name of Source model
      'EnrollmentPeriodId' // key we want to remove
    );
  }
};
