'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Member.belongsTo(models.Household);
    }
  };
  Member.init({
    id: {
      allowNull: true,
      primaryKey: true,
      autoIncrement: false,
      type: DataTypes.UUID,
    },
    fullName: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
    gender: DataTypes.STRING,
    cbhiId: DataTypes.STRING,
    relationship: DataTypes.STRING,
    profession: DataTypes.STRING,
    parentId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    enrolledDate: DataTypes.DATEONLY,
    isDeleted: DataTypes.BOOLEAN
  }, {
    hooks: {
      beforeCreate: (member, options) => {
        member.id = uuidv4();
      }
    },
    sequelize,
    modelName: 'Member',
  });
  return Member;
};
