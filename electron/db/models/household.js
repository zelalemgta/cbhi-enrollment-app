'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class Household extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Household.belongsTo(models.AdministrativeDivision);
      Household.hasMany(models.Member);
      Household.hasMany(models.EnrollmentRecord);
    }
  };
  Household.init({
    id: {
      allowNull: true,
      primaryKey: true,
      autoIncrement: false,
      type: DataTypes.UUID
    },
    cbhiId: DataTypes.STRING,
    address: DataTypes.TEXT,
    enrolledDate: DataTypes.DATEONLY,
    isDeleted: DataTypes.BOOLEAN
  }, {
    hooks: {
      beforeCreate: (household, options) => {
        household.id = uuidv4();
      }
    },
    sequelize,
    modelName: 'Household',
  });
  return Household;
};