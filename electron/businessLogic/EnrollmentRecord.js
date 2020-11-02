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
        const householdPaymentObj = {
            HouseholdId: householdId,
            householdHead: householdPayments[0]['Household.Members.fullName'],
            cbhiId: householdPayments[0].cbhiId,
            isPaying: householdPayments[0].isPaying,
            EnrollmentPeriodId: activeEnrollmentPeriod.id,
            enrollmentPeriod: `${convertDate(activeEnrollmentPeriod.coverageStartDate, 'ET')} <--> ${convertDate(activeEnrollmentPeriod.coverageEndDate, 'ET')}`,
            minPaymentDate: convertDate(activeEnrollmentPeriod.coverageStartDate),
            maxPaymentDate: convertDate(activeEnrollmentPeriod.coverageEndDate),
            totalPaid: {
                receipts: householdPayments.reduce((a, b) => a !== "" ? a + ", " + b.receiptNo : b.receiptNo, ""),
                totalContribution: householdPayments.reduce((a, b) => a + (b.contributionAmount ? b.contributionAmount : 0), 0),
                totalRegistrationFee: householdPayments.reduce((a, b) => a + (b.registrationFee ? b.registrationFee : 0), 0),
                totalAddBeneficiaryFee: householdPayments.reduce((a, b) => a + (b.additionalBeneficiaryFee ? b.additionalBeneficiaryFee : 0), 0),
                totalOtherFees: householdPayments.reduce((a, b) => a + (b.otherFees ? b.otherFees : 0), 0)
            }
        }
        return householdPaymentObj;
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