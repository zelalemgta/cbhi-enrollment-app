const Sequelize = require("sequelize");
const models = require("../db/models");
const { toEthiopian, toGregorian } = require("ethiopian-date");

//Initialize sequelize operartor
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

class EnrollmentRecord {

    static loadNewEnrollmentRecord = async (householdId) => {
        const activeEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.gte]: Date.now() }
            },
            raw: true
        });

        const householdObj = await models.Household.findByPk(householdId,
            {
                raw: true,
                subQuery: false,
                include: [{
                    model: models.Member,
                    required: true,
                    where: {
                        parentId: null
                    }
                }]
            })

        const newEnrollmentRecord = {
            HouseholdId: householdObj.id,
            householdHead: householdObj['Members.fullName'],
            cbhiId: householdObj.cbhiId,
            EnrollmentPeriodId: activeEnrollmentPeriod.id,
            enrollmentPeriod: `${convertDate(activeEnrollmentPeriod.coverageStartDate, 'ET')} - ${convertDate(activeEnrollmentPeriod.coverageEndDate, 'ET')}`,
        };
        return newEnrollmentRecord;
    }

    static addEnrollmentRecord = enrollmentRecordObj => {
        enrollmentRecordObj.receiptDate = convertDate(enrollmentRecordObj.receiptDate, 'GR');
        const result = models.EnrollmentRecord.create(enrollmentRecordObj).then(() => {
            models.Household.update(
                {
                    cbhiId: enrollmentRecordObj.cbhiId
                }, {
                where: {
                    id: enrollmentRecordObj.HouseholdId
                }
            })
            return {
                type: "Success",
                message: "Household Membership Renewed successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error Renewing Household Membership"
            }
        })
        return result;
    };

    // static editEnrollmentRecord = enrollmentRecordObj => {
    //     enrollmentRecordObj.receiptDate = convertDate(enrollmentRecordObj.receiptDate, 'GR');
    //     const results = models.EnrollmentRecord.update(enrollmentRecordObj, {
    //         where: {
    //             id: enrollmentRecordObj.id
    //         }
    //     }).then(() => {
    //         return {
    //             type: "Success",
    //             message: "Household Membership updated successfully"
    //         };
    //     }
    //     ).catch((error) => {
    //         console.log(error);
    //         return {
    //             type: "Error",
    //             message: "Error updating Household Membership"
    //         }
    //     });

    //     return results;
    // };

    // static updateBeneficiaryEnrollmentRecord = async (parentId) => {
    //     const activeEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
    //         where: {
    //             coverageEndDate: { [Op.gte]: Date.now() }
    //         }
    //     });

    //     // All ages of beneficiaries under the household will be automatically 
    //     // enrolled for current active year
    //     const beneficiaries = await models.Member.findAll({
    //         raw: true,
    //         subQuery: false,
    //         include: [{
    //             model: models.EnrollmentRecord,
    //             where: {
    //                 id: activeEnrollmentPeriod.id
    //             },
    //             required: false
    //         }],
    //         where: {
    //             [Op.and]: [
    //                 { parentId: parentId },
    //                 { '$EnrollmentRecord.id$': null }
    //             ]
    //         }
    //     });
    //     console.log(beneficiaries);
    //     return true
    // }

    // static getEnrollmentRecord = (id) => {
    //     const enrollmentRecord = models.EnrollmentRecord.findByPk(id, {
    //         raw: true
    //     }).then(result => {
    //         result.receiptDate = convertDate(result.receiptDate, 'ET');
    //         return result;
    //     });
    //     return enrollmentRecord;
    // };
}

module.exports = EnrollmentRecord;