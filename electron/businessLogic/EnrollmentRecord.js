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
    } else if (calendar === 'ETC') {
        const dateObj = new Date(date);
        const [year, month, day] = [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
        const convertedDate = toEthiopian(year, month, day);
        //Returned Date Format DD/MM/YYYY
        return `${convertedDate[0]}-${convertedDate[1]}-${convertedDate[2]}`
    }
    else {
        const dateObj = new Date(date);
        const [year, month, day] = [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
        const convertedDate = toEthiopian(year, month, day);
        //Returned Date Format DD/MM/YYYY
        return `${convertedDate[2]}/${convertedDate[1]}/${convertedDate[0]}`
    }
}

class EnrollmentRecord {

    static checkActiveEnrollmentPeriod = async () => {
        let response = {};
        const activeEnrollmentPeriod = await models.EnrollmentPeriod.findAll({
            where: {
                [Op.and]: [
                    { coverageStartDate: { [Op.lte]: new Date().setHours(0, 0, 0, 0) } },
                    { coverageEndDate: { [Op.gte]: new Date().setHours(0, 0, 0, 0) } }
                ]
            },
            raw: true
        });
        if (activeEnrollmentPeriod.length === 0) {
            response = {
                type: "Error",
                message: "No Active Enrollment Period! Please make sure you have created a new Enrollment Period in settings page"
            }
        } else if (activeEnrollmentPeriod.length > 1) {
            response = {
                type: "Error",
                message: "There is more than one(1) Active Enrollment Period! Please make sure you only have on Active Enrollment Period for current fiscal year in settings page"
            }
        } else {
            response = {
                type: "Success",
                message: ""
            }
        }
        return response;
    }

    static loadNewEnrollmentRecord = async (householdId) => {
        const activeEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                [Op.and]: [
                    { coverageStartDate: { [Op.lte]: new Date().setHours(0, 0, 0, 0) } },
                    { coverageEndDate: { [Op.gte]: new Date().setHours(0, 0, 0, 0) } }
                ]
            },
            raw: true,
            order: [['coverageEndDate', 'DESC']]
        });

        const householdObj = await models.Household.findByPk(householdId,
            {
                raw: true,
                subQuery: false,
                include: [{
                    model: models.Member,
                    required: true,
                    where: {
                        isHouseholdHead: true
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

    static loadHouseholdPayment = async (householdId) => {
        const activeEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                [Op.and]: [
                    { coverageStartDate: { [Op.lte]: new Date().setHours(0, 0, 0, 0) } },
                    { coverageEndDate: { [Op.gte]: new Date().setHours(0, 0, 0, 0) } }
                ]
            },
            raw: true,
            order: [['coverageEndDate', 'DESC']]
        });

        const householdPayments = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { HouseholdId: householdId },
                    { EnrollmentPeriodId: activeEnrollmentPeriod.id }
                ]
            },
            include: [
                {
                    model: models.Household,
                    required: true,
                    include: [
                        {
                            model: models.Member,
                            required: true,
                            where: {
                                isHouseholdHead: true
                            }
                        }
                    ]
                }
            ],
            subQuery: false,
            raw: true,
        });
        const householdPaymentsObj = {
            HouseholdId: householdId,
            householdHead: householdPayments.length > 0 ? householdPayments[0]['Household.Members.fullName'] : "Unpaid Member",
            cbhiId: householdPayments.length > 0 ? householdPayments[0].cbhiId : "Undefined",
            address: householdPayments.length > 0 ? householdPayments[0]['Household.address'] : "Undefined",
            isPaying: householdPayments.length > 0 ? householdPayments[0].isPaying : "Undefined",
            idCardIssued: householdPayments.length > 0 ? householdPayments[0]['Household.idCardIssued'] : "Undefined",
            enrolledDate: householdPayments.length > 0 ? convertDate(householdPayments[0]['Household.enrolledDate'], 'ET') : "Undefined",
            EnrollmentPeriodId: activeEnrollmentPeriod.id,
            enrollmentPeriod: `${convertDate(activeEnrollmentPeriod.coverageStartDate, 'ET')} <--> ${convertDate(activeEnrollmentPeriod.coverageEndDate, 'ET')}`,
            minPaymentDate: convertDate(activeEnrollmentPeriod.coverageStartDate),
            maxPaymentDate: convertDate(activeEnrollmentPeriod.coverageEndDate),
            paymentRecords: householdPayments.map((paymentRecord => { return { ...paymentRecord, receiptDate: convertDate(paymentRecord.receiptDate, 'ETC') } }))
        }
        return householdPaymentsObj
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

    static updateEnrollmentRecord = enrollmentRecordObj => {
        enrollmentRecordObj.receiptDate = convertDate(enrollmentRecordObj.receiptDate, 'GR');
        const result = models.EnrollmentRecord.update(enrollmentRecordObj, {
            where: {
                id: enrollmentRecordObj.id
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Household payment updated successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error updating household payment"
            }
        })
        return result;
    };

    static removeEnrollmentRecord = enrollmentRecordId => {
        const result = models.EnrollmentRecord.destroy({ where: { id: enrollmentRecordId } })
            .then(() => {
                return {
                    type: "Success",
                    message: "Household payment record removed successfully"
                };
            }
            ).catch((error) => {
                console.log(error);
                return {
                    type: "Error",
                    message: "Error removing household payment record"
                }
            })
        return result
    };
}

module.exports = EnrollmentRecord;