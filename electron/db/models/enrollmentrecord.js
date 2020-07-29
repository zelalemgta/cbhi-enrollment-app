'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EnrollmentRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EnrollmentRecord.belongsTo(models.Household);
      EnrollmentRecord.belongsTo(models.EnrollmentPeriod);
    }
  };
  EnrollmentRecord.init({
    contributionAmount: DataTypes.FLOAT,
    registrationFee: DataTypes.FLOAT,
    penalty: DataTypes.FLOAT,
    otherFees: DataTypes.FLOAT,
    receiptNo: DataTypes.STRING,
    receiptDate: DataTypes.DATEONLY,
    isPaying: DataTypes.BOOLEAN,
    cbhiId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EnrollmentRecord',
  });
  return EnrollmentRecord;
};