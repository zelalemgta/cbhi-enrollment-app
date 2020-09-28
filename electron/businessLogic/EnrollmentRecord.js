const Sequelize = require("sequelize");
const models = require("../db/models");
const { toEthiopian, toGregorian } = require("ethiopian-date");

//Initialize sequelize operartor
const Op = Sequelize.Op;

const convertDate = (date, calendar) => {
    if (calendar === 'GR') {
        const etDate = date.split('-').map(Number);
        const convertedDate = toGregorian(...etDate);
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

    static checkActiveEnrollmentPeriod = async () => {
        const activeEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.gte]: new Date().setHours(0, 0, 0, 0) }
            },
            raw: true
        });
        return activeEnrollmentPeriod ? true : false;
    }

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
            enrollmentPeriod: `${convertDate(activeEnrollmentPeriod.coverageStartDate, 'ET')} <--> ${convertDate(activeEnrollmentPeriod.coverageEndDate, 'ET')}`,
            minRegDate: convertDate(activeEnrollmentPeriod.enrollmentStartDate),
            maxRegDate: convertDate(activeEnrollmentPeriod.enrollmentEndDate)
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
}

module.exports = EnrollmentRecord;