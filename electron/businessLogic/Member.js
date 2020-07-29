const Sequelize = require("sequelize");
const models = require("../db/models");
const { toEthiopian, toGregorian } = require("ethiopian-date");

//Initialize squelize operartor
const Op = Sequelize.Op;

const convertDate = (date, calendar) => {
    if (calendar === 'GR') {
        const etDate = date.split('/');
        const convertedDate = toGregorian(parseInt(etDate[2]), parseInt(etDate[1]), parseInt(etDate[0]));
        return `${convertedDate[0]}-${convertedDate[1]}-${convertedDate[2]}`;
    } else {
        const dateObj = new Date(date);
        const [year, month, day] = [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
        const convertedDate = toEthiopian(year, month, day);
        //Returned Date Format DD/MM/YYYY
        return `${convertedDate[2]}/${convertedDate[1]}/${convertedDate[0]}`
    }
}

const calculateAge = (dateOfBirth) => {
    var diff = new Date().getTime() - new Date(dateOfBirth).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

class Member {

    static addMember = memberObj => {
        memberObj.dateOfBirth = convertDate(memberObj.dateOfBirth, 'GR');
        memberObj.enrolledDate = convertDate(memberObj.enrolledDate, 'GR');
        if (memberObj.HouseholdId) {
            const result = models.Member.create(memberObj).then(() => {
                return {
                    type: "Success",
                    message: "Member created successfully"
                };
            }).catch((error) => {
                console.log(error);
                return {
                    type: "Error",
                    message: "Error creating Member"
                }
            })
            return result;
        } else {
            const result = models.Household.create({
                cbhiId: memberObj.cbhiId,
                AdministrativeDivisionId: memberObj.AdministrativeDivisionId,
                enrolledDate: memberObj.enrolledDate,
                Members: [{
                    fullName: memberObj.fullName,
                    dateOfBirth: memberObj.dateOfBirth,
                    gender: memberObj.gender,
                    cbhiId: memberObj.cbhiId,
                    relationship: memberObj.relationship,
                    profession: memberObj.profession,
                    parentId: memberObj.parentId,
                    enrolledDate: memberObj.enrolledDate,
                }]
            }, {
                include: [models.Member]
            }).then(() => {
                return {
                    type: "Success",
                    message: "Member created successfully"
                };
            }).catch((error) => {
                console.log(error);
                return {
                    type: "Error",
                    message: "Error creating Member"
                }
            })
            return result;
        }
    };

    static editMember = memberObj => {
        memberObj.dateOfBirth = convertDate(memberObj.dateOfBirth, 'GR');
        memberObj.enrolledDate = convertDate(memberObj.enrolledDate, 'GR');
        const result = models.Member.update(memberObj, {
            where: {
                id: memberObj.id
            }
        }).then(async () => {
            memberObj.parentId || await models.Household.update({
                cbhiId: memberObj.cbhiId,
                enrolledDate: memberObj.enrolledDate,
                AdministrativeDivisionId: memberObj.AdministrativeDivisionId
            }, { where: { id: memberObj.HouseholdId } });
            return {
                type: "Success",
                message: "Member updated successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error updating Member"
            }
        });
        return result;
    };

    static removeMember = memberId => {
        const result = models.Member.destroy({
            where: {
                id: memberId
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Member removed successfully"
            }
        }).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error removing Member"
            }
        });
        return result;
    }

    static getMember = (id) => {
        const memberObj = models.Member.findByPk(id, {
            include: [{
                model: models.Household,
                required: true,
                include: [models.AdministrativeDivision]
            }],
            raw: true
        }).then(member => {
            member.age = calculateAge(member.dateOfBirth);
            member.dateOfBirth = convertDate(member.dateOfBirth, 'ET');
            member.enrolledDate = convertDate(member.enrolledDate, 'ET');
            return member;
        })
        return memberObj;
    }

    static getMembers = async (query) => {
        const { orderBy, orderDirection, page, pageSize, search } = query;
        const activeYear = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.gte]: Date.now() }
            }
        });
        let filiteredMembersList = models.Household.findAndCountAll({
            include: [
                {
                    model: models.AdministrativeDivision,
                    required: false,
                },
                {
                    model: models.Member,
                    required: true
                },
                {
                    model: models.EnrollmentRecord,
                    where: {
                        EnrollmentPeriodId: activeYear ? activeYear.id : 0
                    },
                    required: false
                }
            ],
            subQuery: false,
            raw: true,
            offset: page * pageSize,
            limit: pageSize,
            where: {
                [Op.or]: [
                    { '$Members.fullName$': { [Op.substring]: search } },
                    { cbhiId: { [Op.substring]: search } },
                    { '$AdministrativeDivision.name$': { [Op.substring]: search } }
                ]
            },
            order: orderBy ? [[orderBy.field, orderDirection]] : []
        }).then(result => {
            result.page = page;
            return result;
        });
        return filiteredMembersList;
    };

    static getAllMembers = async () => {
        const activeYear = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.gte]: Date.now() }
            }
        });
        const allMembersList = await models.Household.findAll({
            include: [
                {
                    model: models.AdministrativeDivision,
                    required: false,
                },
                {
                    model: models.Member,
                    required: true
                },
                {
                    model: models.EnrollmentRecord,
                    where: {
                        EnrollmentPeriodId: activeYear ? activeYear.id : 0
                    },
                    required: false
                }
            ],
            subQuery: false,
            raw: true,
            order: [["id", "ASC"], [models.Member, 'enrolledDate', 'ASC']]
        });
        return allMembersList;
    }
}

module.exports = Member;
