'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EnrollmentPeriod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  EnrollmentPeriod.init({
    enrollmentYear: DataTypes.INTEGER,
    enrollmentStartDate: DataTypes.DATEONLY,
    enrollmentEndDate: DataTypes.DATEONLY,
    coverageStartDate: DataTypes.DATEONLY,
    coverageEndDate: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'EnrollmentPeriod',
  });
  return EnrollmentPeriod;
};