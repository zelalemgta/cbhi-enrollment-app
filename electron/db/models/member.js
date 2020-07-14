'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Member.init({
    fullName: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
    gender: DataTypes.STRING,
    cbhiId: DataTypes.STRING,
    administrativeDivisionId: DataTypes.INTEGER,
    relationship: DataTypes.STRING,
    profession: DataTypes.STRING,
    parentId: DataTypes.INTEGER,
    enrolledDate: DataTypes.DATEONLY,
    isDeleted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Member',
  });
  return Member;
};