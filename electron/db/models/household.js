'use strict';
const {
  Model
} = require('sequelize');
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
    cbhiId: DataTypes.STRING,
    enrolledDate: DataTypes.DATEONLY,
    isDeleted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Household',
  });
  return Household;
};