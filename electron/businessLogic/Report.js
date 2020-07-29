const Sequelize = require("sequelize");
const models = require("../db/models");
const { toEthiopian, toGregorian } = require("ethiopian-date");

//Initialize squelize operartor
const Op = Sequelize.Op;

class Report {

    static getEligibleHouseholds = async (enrollmentPeriodId) => {
        const enrollmentPeriod = await models.EnrollmentPeriod.findByPk(enrollmentPeriodId, { raw: true });
        return enrollmentPeriod.eligibleHouseholds;
    };

    static getMonthlyEnrollmentStat = async (args) => {
        const enrollmentStat = {
            newPayingMembers: 0,
            newIndigents: 0,
            renewedPayingMembers: 0,
            renewedIndigents: 0,
            newMembersContributions: 0,
            renewedMembersContribution: 0,
            registrationFees: 0
        }
        const selectedEnrollmentPeriod = await models.EnrollmentPeriod.findByPk(args.enrollmentPeriodId, { raw: true });
        const gregorianDate = selectedEnrollmentPeriod.coverageStartDate.split('-');
        const etDate = toEthiopian(gregorianDate[0], gregorianDate[1], gregorianDate[2]);
        const filterStartDate = toGregorian(args.month < etDate[1] ? etDate[0] + 1 : etDate[0], args.month, 1).join('-');
        const filterEndDate = toGregorian(args.month < etDate[1] ? etDate[0] + 1 : etDate[0], args.month, 30).join('-');

        const newEnrollmentStat = await models.EnrollmentRecord.findAll(
            {
                include: [
                    {
                        model: models.Household,
                        required: true,
                        where: {
                            enrolledDate: { [Op.between]: [selectedEnrollmentPeriod.coverageStartDate, selectedEnrollmentPeriod.coverageEndDate] }
                        }
                    },
                ],
                attributes: ['isPaying',
                    [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalNewEnrollments'],
                    [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContributionAmount'],
                    [Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: args.enrollmentPeriodId },
                        { receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
                    ]
                },
                group: ['isPaying'],
                raw: true
            })
        const renewalStat = await models.EnrollmentRecord.findAll(
            {
                include: [
                    {
                        model: models.Household,
                        required: true,
                        where: {
                            enrolledDate: { [Op.notBetween]: [selectedEnrollmentPeriod.coverageStartDate, selectedEnrollmentPeriod.coverageEndDate] }
                        }
                    },
                ],
                attributes: ['isPaying',
                    [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalRenewals'],
                    [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContributionAmount']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: args.enrollmentPeriodId },
                        { receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
                    ]
                },
                group: ['isPaying'],
                raw: true
            })
        newEnrollmentStat.map(stat => {
            if (stat.isPaying) {
                enrollmentStat.newPayingMembers = stat.totalNewEnrollments;
                enrollmentStat.newMembersContributions = stat.totalContributionAmount;
                enrollmentStat.registrationFees = stat.totalRegistrationFee;
            }
            else
                enrollmentStat.newIndigents = stat.totalNewEnrollments
            return enrollmentStat;
        });
        renewalStat.map(stat => {
            if (stat.isPaying) {
                enrollmentStat.renewedPayingMembers = stat.totalRenewals;
                enrollmentStat.renewedMembersContribution = stat.totalContributionAmount;
            }
            else
                enrollmentStat.renewedIndigents = stat.totalRenewals

            return enrollmentStat;
        });
        return enrollmentStat;

    }

    static getTotalActiveMembers = async (enrollmentPeriodId) => {
        const totalActiveMembers = await models.EnrollmentRecord.count(
            {
                where: {
                    enrollmentPeriodId: enrollmentPeriodId
                },
                raw: true
            }
        );
        return totalActiveMembers;
    };

    static getTotalContribution = async (enrollmentPeriodId) => {
        const totalContribution = await models.EnrollmentRecord.findAll(
            {
                attributes: [[Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContribution']],
                where: {
                    enrollmentPeriodId: enrollmentPeriodId
                },
                raw: true
            });
        return totalContribution[0].totalContribution ? totalContribution[0].totalContribution : 0;
    };

    static getTotalRegistrationFee = async (enrollmentPeriodId,) => {
        const totalRegistrationFee = await models.EnrollmentRecord.findAll(
            {
                attributes: [[Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee']],
                where: {
                    enrollmentPeriodId: enrollmentPeriodId
                },
                raw: true
            });
        return totalRegistrationFee[0].totalRegistrationFee ? totalRegistrationFee[0].totalRegistrationFee : 0;
    };
}

module.exports = Report;
