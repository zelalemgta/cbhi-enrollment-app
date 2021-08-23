const Sequelize = require("sequelize");
const models = require("../db/models");
const AdministrativeDivision = require("./AdministrativeDivision");
const { relationshipOptions } = require("../../src/shared/constants");
const { toEthiopian, toGregorian } = require("ethiopian-date");

//Initialize squelize operartor
const Op = Sequelize.Op;

const convertDate = (date, calendar) => {
  if (calendar === "GR") {
    const etDate = date.split("-").map(Number);
    const convertedDate = toGregorian(...etDate);
    return `${convertedDate[0]}-${convertedDate[1]}-${convertedDate[2]}`;
  } else {
    const dateObj = new Date(date);
    const [year, month, day] = [
      dateObj.getFullYear(),
      dateObj.getMonth() + 1,
      dateObj.getDate(),
    ];
    const convertedDate = toEthiopian(year, month, day);
    //Returned Date Format YYY-MM-DD
    return `${convertedDate[0]}-${convertedDate[1]}-${convertedDate[2]}`;
  }
};

const calculateAge = (dateOfBirth) => {
  var diff = new Date().getTime() - new Date(dateOfBirth).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const validateDate = (dateValue) => {
  try {
    convertDate(dateValue, "GR");
    return true;
  } catch (err) {
    return false;
  }
};

class Member {
  static addMember = (memberObj) => {
    memberObj.dateOfBirth = convertDate(memberObj.dateOfBirth, "GR");
    memberObj.enrolledDate = convertDate(memberObj.enrolledDate, "GR");
    if (memberObj["Household.id"]) {
      memberObj.HouseholdId = memberObj["Household.id"];
      const result = models.Member.create(memberObj)
        .then(() => {
          return {
            type: "Success",
            message: "Member created successfully",
          };
        })
        .catch((error) => {
          console.log(error);
          return {
            type: "Error",
            message: "Error creating Member",
          };
        });
      return result;
    } else {
      const result = models.Household.create(
        {
          cbhiId: memberObj["Household.cbhiId"],
          AdministrativeDivisionId:
            memberObj["Household.AdministrativeDivisionId"], //memberObj.AdministrativeDivisionId,
          address: memberObj["Household.address"],
          enrolledDate: memberObj.enrolledDate,
          Members: [
            {
              fullName: memberObj.fullName,
              dateOfBirth: memberObj.dateOfBirth,
              gender: memberObj.gender,
              cbhiId: memberObj.cbhiId,
              relationship: memberObj.relationship,
              profession: memberObj.profession,
              isHouseholdHead: memberObj.isHouseholdHead,
              enrolledDate: memberObj.enrolledDate,
            },
          ],
        },
        {
          include: [models.Member],
        }
      )
        .then(() => {
          return {
            type: "Success",
            message: "Member created successfully",
          };
        })
        .catch((error) => {
          console.log(error);
          return {
            type: "Error",
            message: "Error creating Member",
          };
        });
      return result;
    }
  };

  static editMember = (memberObj) => {
    memberObj.dateOfBirth = convertDate(memberObj.dateOfBirth, "GR");
    memberObj.enrolledDate = convertDate(memberObj.enrolledDate, "GR");
    const result = models.Member.update(memberObj, {
      where: {
        id: memberObj.id,
      },
    })
      .then(() => {
        memberObj.isHouseholdHead &&
          models.Household.update(
            {
              cbhiId: memberObj["Household.cbhiId"],
              AdministrativeDivisionId:
                memberObj["Household.AdministrativeDivisionId"],
              address: memberObj["Household.address"],
              enrolledDate: memberObj.enrolledDate,
            },
            { where: { id: memberObj["Household.id"] } }
          ).then(async () => {
            const activeEnrollmentPeriod =
              await models.EnrollmentPeriod.findOne({
                where: {
                  coverageEndDate: { [Op.gte]: Date.now() },
                },
                raw: true,
                order: [["coverageEndDate", "DESC"]],
              });
            await models.EnrollmentRecord.update(
              {
                cbhiId: memberObj["Household.cbhiId"],
              },
              {
                where: {
                  [Op.and]: [
                    { EnrollmentPeriodId: activeEnrollmentPeriod.id },
                    { HouseholdId: memberObj["Household.id"] },
                  ],
                },
              }
            );
          });
        return {
          type: "Success",
          message: "Member updated successfully",
        };
      })
      .catch((error) => {
        console.log(error);
        return {
          type: "Error",
          message: "Error updating Member",
        };
      });
    return result;
  };

  static removeMember = (memberId) => {
    const result = models.Member.destroy({
      where: {
        id: memberId,
      },
    })
      .then(() => {
        return {
          type: "Success",
          message: "Member removed successfully",
        };
      })
      .catch((error) => {
        console.log(error);
        return {
          type: "Error",
          message: "Error removing Member",
        };
      });
    return result;
  };

  static getMember = (id) => {
    const memberObj = models.Member.findByPk(id, {
      include: [
        {
          model: models.Household,
          required: true,
          include: [models.AdministrativeDivision],
        },
      ],
      raw: true,
    }).then((member) => {
      member.age = calculateAge(member.dateOfBirth);
      member.dateOfBirth = convertDate(member.dateOfBirth, "ET");
      member.enrolledDate = convertDate(member.enrolledDate, "ET");
      return member;
    });
    return memberObj;
  };

  static getMembers = async (query) => {
    const { filters, orderBy, orderDirection, page, pageSize, search } = query;
    const activeYear = await models.EnrollmentPeriod.findOne({
      where: {
        coverageEndDate: { [Op.gte]: Date.now() },
      },
    });
    let filiteredMembersList = models.Household.findAndCountAll({
      //(Removed for Better Performance)
      //***This adds significant time on the total query.
      //**** */ Household size will be calculated for each individual record
      //
      // attributes: {
      //     include: [[Sequelize.literal(`(
      //         SELECT COUNT(*)
      //         FROM Members AS member
      //         WHERE
      //             member.HouseholdId = Household.id
      //             AND
      //             member.isDeleted IS NOT 1
      //     )`), "householdSize"]]
      // },
      include: [
        {
          model: models.AdministrativeDivision,
          where: {
            [Op.or]: [
              {
                id: filters.administrativeDivisionId
                  ? { [Op.is]: filters.administrativeDivisionId }
                  : { [Op.not]: filters.administrativeDivisionId },
              },
              {
                parent: filters.administrativeDivisionId
                  ? { [Op.is]: filters.administrativeDivisionId }
                  : { [Op.not]: -1 },
              },
            ],
          },
          required: true,
        },
        {
          model: models.Member,
          where: {
            [Op.and]: [
              {
                isHouseholdHead:
                  search !== ""
                    ? { [Op.or]: [{ [Op.is]: true }, { [Op.not]: true }] }
                    : { [Op.is]: true },
              },
              {
                gender: filters.gender
                  ? { [Op.is]: filters.gender }
                  : { [Op.not]: null },
              },
            ],
          },
          required: true,
        },
        {
          model: models.EnrollmentRecord,
          where: {
            [Op.and]: [
              { EnrollmentPeriodId: activeYear ? activeYear.id : 0 },
              //This will filter the first household payment only since we might have multiple payments for
              //a single household.
              { contributionAmount: { [Op.not]: null } },
            ],
          },
          required: false,
        },
      ],
      subQuery: false,
      raw: true,
      offset: page * pageSize,
      limit: pageSize,
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { "$Members.fullName$": { [Op.substring]: search } },
              Sequelize.where(
                Sequelize.literal("Household.cbhiId || '/' || Members.cbhiId"),
                { [Op.substring]: search }
              ),
            ],
          },
          {
            "$EnrollmentRecords.id$":
              filters.membershipStatus !== ""
                ? filters.membershipStatus === 1
                  ? { [Op.not]: null }
                  : { [Op.is]: null }
                : { [Op.or]: [{ [Op.is]: null }, { [Op.not]: null }] },
          },
          {
            "$EnrollmentRecords.isPaying$":
              filters.membershipType !== ""
                ? { [Op.is]: filters.membershipType }
                : { [Op.or]: [{ [Op.is]: null }, { [Op.not]: null }] },
          },
        ],
      },
      order: orderBy
        ? [[Sequelize.literal(orderBy.field + " " + orderDirection)]]
        : [],
    }).then((result) => {
      result.page = result.count > page * pageSize ? page : 0;
      return result;
    });
    return filiteredMembersList;
  };

  static getBeneficiaries = async (householdId) => {
    const beneficiaries = await models.Member.findAll({
      where: {
        [Op.and]: [
          { HouseholdId: { [Op.is]: householdId } },
          { isHouseholdHead: { [Op.not]: true } },
        ],
      },
      order: [["enrolledDate", "ASC"]],
      raw: true,
    });
    return beneficiaries;
  };

  static getAllMembers = async () => {
    const activeYear = await models.EnrollmentPeriod.findOne({
      where: {
        coverageEndDate: { [Op.gte]: Date.now() },
      },
    });
    const allMembersList = await models.Household.findAll({
      attributes: {
        include: [
          [
            Sequelize.fn(
              "SUM",
              Sequelize.col("EnrollmentRecords.registrationFee")
            ),
            "registrationFee",
          ],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.col("EnrollmentRecords.contributionAmount")
            ),
            "contributionAmount",
          ],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.col("EnrollmentRecords.additionalBeneficiaryFee")
            ),
            "additionalBeneficiaryFee",
          ],
          [
            Sequelize.fn("SUM", Sequelize.col("EnrollmentRecords.otherFees")),
            "otherFees",
          ],
          [
            Sequelize.fn(
              "GROUP_CONCAT",
              Sequelize.col("EnrollmentRecords.receiptNo")
            ),
            "receiptNo",
          ],
          [
            Sequelize.fn(
              "GROUP_CONCAT",
              Sequelize.col("EnrollmentRecords.receiptDate")
            ),
            "receiptDate",
          ],
          [
            Sequelize.fn("MAX", Sequelize.col("EnrollmentRecords.isPaying")),
            "isPaying",
          ],
        ],
        exclude: [
          "id",
          "address",
          "enrolledDate",
          "createdAt",
          "updatedAt",
          "isDeleted",
          "AdministrativeDivisionId",
        ],
      },
      include: [
        {
          model: models.AdministrativeDivision,
          required: false,
          attributes: {
            exclude: [
              "id",
              "parent",
              "code",
              "level",
              "createdAt",
              "updatedAt",
              "isDeleted",
              "EnrollmentPeriodId",
              "HouseholdId",
            ],
          },
        },
        {
          model: models.Member,
          required: true,
          attributes: {
            exclude: [
              "id",
              "createdAt",
              "updatedAt",
              "isDeleted",
              "EnrollmentPeriodId",
              "HouseholdId",
            ],
          },
        },
        {
          model: models.EnrollmentRecord,
          attributes: {
            exclude: [
              "id",
              "additionalBeneficiaryFee",
              "otherFees",
              "receiptNo",
              "createdAt",
              "updatedAt",
              "EnrollmentPeriodId",
              "HouseholdId",
              "cbhiId",
            ],
          },
          where: {
            [Op.and]: [
              { EnrollmentPeriodId: activeYear ? activeYear.id : 0 },
              { receiptNo: { [Op.not]: null } },
            ],
          },
          required: false,
        },
      ],
      group: "Members.id",
      subQuery: false,
      raw: true,
      order: [
        ["createdAt", "ASC"],
        [models.Member, "createdAt", "ASC"],
        [models.Member, "enrolledDate", "ASC"],
      ],
    });
    return allMembersList;
  };

  static excelDataParser = async (enrollmentData) => {
    let response = {};
    let parsedData = [];
    const administrativeDivisions =
      await AdministrativeDivision.getAllAdministrativeDivisions();
    for (let i = 0; i < enrollmentData.length; i++) {
      //Check if first record is household head
      if (i === 0 && enrollmentData[i].isHouseholdHead !== 1) {
        response = {
          type: "Error",
          message: "The first member should be a household head",
        };
        parsedData = [];
        break;
      }
      if (
        !enrollmentData[i].fullName ||
        !enrollmentData[i].fullName.trim() ||
        !enrollmentData[i].gender ||
        !enrollmentData[i].gender.trim() ||
        (enrollmentData[i].isHouseholdHead === 1 &&
          (!enrollmentData[i].cbhiId || !enrollmentData[i].cbhiId.trim()))
      ) {
        response = {
          type: "Error",
          message: "Missing data at Row " + (i + 2) + ".",
        };
        parsedData = [];
        break;
      }
      if (!validateDate(enrollmentData[i].dateOfBirth)) {
        response = {
          type: "Error",
          message: "Invalid birth date at Row " + (i + 2) + ".",
        };
        parsedData = [];
        break;
      }

      if (!validateDate(enrollmentData[i].enrolledDate)) {
        response = {
          type: "Error",
          message: "Invalid enrollment date at Row " + (i + 2) + ".",
        };
        parsedData = [];
        break;
      }

      if (
        enrollmentData[i].isHouseholdHead === 1 &&
        (!enrollmentData[i].administrativeDivision ||
          !String(enrollmentData[i].administrativeDivision).trim())
      ) {
        response = {
          type: "Error",
          message:
            "Administrative Division (Kebele/Gote) not provided at Row " +
            (i + 2) +
            ".",
        };
        parsedData = [];
        break;
      } else if (enrollmentData[i].isHouseholdHead === 1) {
        const administrativeDivisionObj = await administrativeDivisions.filter(
          (obj) =>
            obj.name === String(enrollmentData[i].administrativeDivision).trim()
        );
        if (!administrativeDivisionObj[0]) {
          response = {
            type: "Error",
            message:
              "Invalid Administrative Division at Row " +
              (i + 2) +
              ". Please make sure you have defined all Administrative divisions in the system",
          };
          parsedData = [];
          break;
        }
      }
      //if passed all above validations, start building object for persisting to database
      const memberObj = {
        fullName: enrollmentData[i].fullName.trim(),
        dateOfBirth: convertDate(enrollmentData[i].dateOfBirth.trim(), "GR"),
        gender: enrollmentData[i].gender.trim(),
        cbhiId: enrollmentData[i].isHouseholdHead
          ? enrollmentData[i].cbhiId
          : "",
        beneficiaryCBHIId: enrollmentData[i].beneficiaryCBHIId
          ? enrollmentData[i].beneficiaryCBHIId.trim()
          : "",
        administrativeDivisionId: enrollmentData[i].isHouseholdHead
          ? administrativeDivisions.filter(
              (obj) =>
                obj.name ===
                String(enrollmentData[i].administrativeDivision).trim()
            )[0].id
          : "",
        relationship: enrollmentData[i].relationship
          ? enrollmentData[i].relationship.trim()
          : "",
        profession: enrollmentData[i].profession
          ? enrollmentData[i].profession.trim()
          : "",
        enrolledDate: convertDate(enrollmentData[i].enrolledDate.trim(), "GR"),
        isHouseholdHead: enrollmentData[i].isHouseholdHead === 1,
      };
      parsedData.push(memberObj);
    }
    if (parsedData.length) {
      response = {
        type: "Success",
        message: "Analyzing Excel data completed",
        data: parsedData,
      };
    }
    return response;
  };

  static importEnrollmentData = async (parsedMemberData) => {
    let householdId;
    let response = {};
    let householdCount = 0;
    for (let i = 0; i < parsedMemberData.length; i++) {
      if (parsedMemberData[i].isHouseholdHead) {
        const householdObj = await models.Household.create(
          {
            cbhiId: parsedMemberData[i].cbhiId,
            AdministrativeDivisionId:
              parsedMemberData[i].administrativeDivisionId,
            enrolledDate: parsedMemberData[i].enrolledDate,
            Members: [
              {
                fullName: parsedMemberData[i].fullName,
                dateOfBirth: parsedMemberData[i].dateOfBirth,
                gender: parsedMemberData[i].gender,
                cbhiId: parsedMemberData[i].beneficiaryCBHIId,
                relationship: relationshipOptions[0],
                profession: parsedMemberData[i].profession,
                isHouseholdHead: true,
                enrolledDate: parsedMemberData[i].enrolledDate,
              },
            ],
          },
          {
            include: [models.Member],
          }
        );
        householdId = householdObj.id;
        householdCount += 1;
      } else {
        parsedMemberData[i].HouseholdId = householdId;
        parsedMemberData[i].isHouseholdHead = false;
        parsedMemberData[i].cbhiId = parsedMemberData[i].beneficiaryCBHIId;
        await models.Member.create(parsedMemberData[i]);
      }
    }
    response = {
      type: "Success",
      message:
        householdCount + " Households imported to the system successfully.",
    };
    return response;
  };
}

module.exports = Member;
