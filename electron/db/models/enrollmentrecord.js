'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
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
    id: {
      allowNull: true,
      primaryKey: true,
      autoIncrement: false,
      type: DataTypes.UUID
    },
    contributionAmount: DataTypes.FLOAT,
    registrationFee: DataTypes.FLOAT,
    additionalBeneficiaryFee: DataTypes.FLOAT,
    otherFees: DataTypes.FLOAT,
    receiptNo: DataTypes.STRING,
    receiptDate: DataTypes.DATEONLY,
    isPaying: DataTypes.BOOLEAN,
    cbhiId: DataTypes.STRING
  }, {
    hooks: {
      beforeCreate: (household, options) => {
        household.id = uuidv4();
      }
    },
    sequelize,
    modelName: 'EnrollmentRecord',
  });
  return EnrollmentRecord;
};