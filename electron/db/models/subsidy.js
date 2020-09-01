'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subsidy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subsidy.belongsTo(models.EnrollmentPeriod);
    }
  };
  Subsidy.init({
    generalSubsidy: DataTypes.FLOAT,
    targetedSubsidy: DataTypes.FLOAT,
    other: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Subsidy',
  });
  return Subsidy;
};