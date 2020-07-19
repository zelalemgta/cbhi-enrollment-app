'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdministrativeDivision extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AdministrativeDivision.hasMany(models.Household);
    }
  };
  AdministrativeDivision.init({
    name: DataTypes.STRING,
    level: DataTypes.STRING,
    code: DataTypes.STRING,
    parent: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AdministrativeDivision',
  });
  return AdministrativeDivision;
};