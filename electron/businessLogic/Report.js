const Sequelize = require("sequelize");
const models = require("../db/models");
const { toGregorian } = require("ethiopian-date");

//Initialize squelize operartor
const Op = Sequelize.Op;

const calculateDateOfBirth = (age) => {
    const currentDate = new Date().getTime();
    const ageInMilliseconds = age * (1000 * 60 * 60 * 24 * 365.25);
    const dateOfBirth = new Date(currentDate - ageInMilliseconds);
    return `${dateOfBirth.getFullYear()}-${dateOfBirth.getMonth() + 1}-${dateOfBirth.getDate()}`;
}

class Report {

    /********************* - Enrollment Dashboard Reports - ***************************/

    static getEligibleHouseholds = async (enrollmentPeriodId) => {
        const enrollmentPeriod = await models.EnrollmentPeriod.findByPk(enrollmentPeriodId, { raw: true });
        return enrollmentPeriod.eligibleHouseholds;
    };

    static getHouseholdsEnrolled = async (enrollmentPeriodId) => {
        const totalHouseholdsEnrolled = await models.EnrollmentRecord.count(
            {
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                raw: true
            }
        );
        return totalHouseholdsEnrolled;
    };

    static getBeneficiariesEnrolled = async (enrollmentPeriodId) => {
        const beneficiariesByStatus = {
            indigent: 0,
            paying: 0
        }
        const totalBeneficiariesEnrolled = await models.EnrollmentRecord.findAll(
            {
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
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
                            }
                        ]
                    }
                ],
                attributes: ['isPaying', [Sequelize.fn('count', Sequelize.col('Household.Members.id')), 'count']],
                //attributes: [[Sequelize.fn('count', Sequelize.col('Household.Members.id')), 'count']],
                group: ['isPaying'],
                raw: true
            });
        totalBeneficiariesEnrolled.map(result => result.isPaying ? beneficiariesByStatus.paying = result.count : beneficiariesByStatus.indigent = result.count)
        return beneficiariesByStatus;
    }

    static getMonthlyEnrollmentStats = async (args) => {
        const enrollmentStat = {
            newPayingMembers: 0,
            newIndigents: 0,
            renewedPayingMembers: 0,
            renewedIndigents: 0,
        }
        const selectedEnrollmentPeriod = await models.EnrollmentPeriod.findByPk(args.enrollmentPeriodId, { raw: true });
        const filterStartDate = toGregorian(args.dateFrom.split('-').map(Number)).join('-');
        const filterEndDate = toGregorian(args.dateTo.split('-').map(Number)).join('-');

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
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: args.enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } },
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
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: args.enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } },
                        { receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
                    ]
                },
                group: ['isPaying'],
                raw: true
            })
        newEnrollmentStat.map(stat => {
            if (stat.isPaying) {
                enrollmentStat.newPayingMembers = stat.totalNewEnrollments;
            }
            else
                enrollmentStat.newIndigents = stat.totalNewEnrollments
            return enrollmentStat;
        });
        renewalStat.map(stat => {
            if (stat.isPaying) {
                enrollmentStat.renewedPayingMembers = stat.totalRenewals;
            }
            else
                enrollmentStat.renewedIndigents = stat.totalRenewals

            return enrollmentStat;
        });
        return enrollmentStat;

    }

    static getTotalEnrollmentStats = async (enrollmentPeriodId) => {
        const enrollmentStat = {
            newPayingMembers: 0,
            newIndigents: 0,
            renewedPayingMembers: 0,
            renewedIndigents: 0
        }
        const selectedEnrollmentPeriod = await models.EnrollmentPeriod.findByPk(enrollmentPeriodId, { raw: true });
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
                    [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalNewEnrollments']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
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
                    [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalRenewals']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                group: ['isPaying'],
                raw: true
            })
        newEnrollmentStat.map(stat => {
            if (stat.isPaying) {
                enrollmentStat.newPayingMembers = stat.totalNewEnrollments;
            }
            else
                enrollmentStat.newIndigents = stat.totalNewEnrollments
            return enrollmentStat;
        });
        renewalStat.map(stat => {
            if (stat.isPaying) {
                enrollmentStat.renewedPayingMembers = stat.totalRenewals;
            }
            else
                enrollmentStat.renewedIndigents = stat.totalRenewals

            return enrollmentStat;
        });
        return enrollmentStat;
    };

    static getEnrollmentRate = async (enrollmentPeriodId) => {
        const enrollmentPeriod = await models.EnrollmentPeriod.findByPk(enrollmentPeriodId, { raw: true });
        const totalHouseholdsEnrolled = await models.EnrollmentRecord.count(
            {
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                raw: true
            }
        );
        return +((totalHouseholdsEnrolled / enrollmentPeriod.eligibleHouseholds) * 100).toFixed(2);
    };

    static getRenewalRate = async (enrollmentPeriodId) => {
        const enrollmentPeriod = await models.EnrollmentPeriod.findByPk(enrollmentPeriodId, { raw: true });
        const previousEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.lt]: enrollmentPeriod.coverageEndDate }
            },
            order: [['coverageEndDate', 'DESC']],
            raw: true
        });

        const totalHouseholdsEnrolled = await models.EnrollmentRecord.findAll(
            {
                include: [
                    {
                        model: models.Household,
                        required: true,
                        where: {
                            enrolledDate: { [Op.notBetween]: [enrollmentPeriod.coverageStartDate, enrollmentPeriod.coverageEndDate] }
                        }
                    },
                ],
                attributes: [[Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalRenewals']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                raw: true
            }
        );

        const previousTotalHouseholdsEnrolled = previousEnrollmentPeriod ? await models.EnrollmentRecord.count(
            {
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: previousEnrollmentPeriod.id },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                raw: true
            }
        ) : 0;
        const renewalRate = previousTotalHouseholdsEnrolled === 0 ? 0 : +((totalHouseholdsEnrolled[0].totalRenewals / previousTotalHouseholdsEnrolled) * 100).toFixed(2)
        return renewalRate;
    };

    static getHouseholdsByGender = async (enrollmentPeriodId) => {
        const householdsByGender = {
            maleHouseholds: 0,
            femaleHouseholds: 0
        }
        const filteredHouseholds = await models.EnrollmentRecord.findAll({
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
            where: {
                [Op.and]: [
                    { enrollmentPeriodId: enrollmentPeriodId },
                    { contributionAmount: { [Op.not]: null } }
                ]
            },
            raw: true,
            attributes: [[Sequelize.col('Household.Members.gender'), 'gender'], [Sequelize.fn('count', Sequelize.col('Household.Members.Id')), 'count']],
            group: [Sequelize.col('Household.Members.gender')]
        });
        filteredHouseholds.map(result =>
            result.gender === "Male" ? householdsByGender.maleHouseholds = result.count : householdsByGender.femaleHouseholds = result.count
        )
        return householdsByGender;
    }

    static getTotalEnrollmentByStatus = async (enrollmentPeriodId) => {
        const enrollmentByStatus = {
            indigent: 0,
            paying: 0
        }
        const filteredHouseholds = await models.EnrollmentRecord.count(
            {
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                attributes: ['isPaying', [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'count']],
                group: ['isPaying'],
                raw: true
            }
        );
        filteredHouseholds.map(result => result.isPaying ? enrollmentByStatus.paying = result.count : enrollmentByStatus.indigent = result.count)
        return enrollmentByStatus;
    }

    static getTotalAdditionalBeneficiariesByStatus = async (enrollmentPeriodId) => {
        //At runtime, a date from Now will be calculated for a beneficiary to mark as 18 & above
        const dob = calculateDateOfBirth(18);
        const additionalBeneficiariesByStatus = {
            indigent: 0,
            paying: 0
        }
        const filteredHouseholds = await models.EnrollmentRecord.count(
            {
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
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
                                    [Op.and]: [
                                        { dateOfBirth: { [Op.lte]: dob } },
                                        { relationship: { [Op.notIn]: ['Household Head', 'Husband', 'Wife'] } },
                                        { profession: { [Op.not]: 'Disabled' } }
                                    ]

                                }
                            }
                        ]
                    }
                ],
                attributes: ['isPaying', [Sequelize.fn('count', Sequelize.col('Household.Members.id')), 'count']],
                group: ['isPaying'],
                raw: true
            }
        );
        filteredHouseholds.map(result => result.isPaying ? additionalBeneficiariesByStatus.paying = result.count : additionalBeneficiariesByStatus.indigent = result.count)
        return additionalBeneficiariesByStatus;
    }

    /********************* - Contribution Dashboard Reports - ***************************/

    static getSubsidies = async (enrollmentPeriodId) => {
        const subsidies = await models.Subsidy.findOne({
            raw: true,
            where: {
                EnrollmentPeriodId: enrollmentPeriodId
            }
        });
        return subsidies;
    }

    static getMonthlyContributionStats = async (args) => {
        const contributionStats = {
            newMembersContributions: 0,
            renewedMembersContributions: 0,
            registrationFees: 0,
            additionalBeneficiariesFees: 0,
            otherFees: 0
        }
        const selectedEnrollmentPeriod = await models.EnrollmentPeriod.findByPk(args.enrollmentPeriodId, { raw: true });
        const filterStartDate = toGregorian(args.dateFrom.split('-').map(Number)).join('-');
        const filterEndDate = toGregorian(args.dateTo.split('-').map(Number)).join('-');
        const newEnrollmentStats = await models.EnrollmentRecord.findAll(
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
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContributionAmount'],
                    [Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee'],
                    [Sequelize.fn('sum', Sequelize.col('additionalBeneficiaryFee')), 'totalAdditionalBeneficiaryFee'],
                    [Sequelize.fn('sum', Sequelize.col('otherFees')), 'totalOtherFee']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: args.enrollmentPeriodId },
                        { isPaying: true },
                        { receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
                    ]
                },
                raw: true
            })
        const renewalStats = await models.EnrollmentRecord.findAll(
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
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContributionAmount'],
                    [Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee'],
                    [Sequelize.fn('sum', Sequelize.col('additionalBeneficiaryFee')), 'totalAdditionalBeneficiaryFee'],
                    [Sequelize.fn('sum', Sequelize.col('otherFees')), 'totalOtherFee']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: args.enrollmentPeriodId },
                        { isPaying: true },
                        { receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
                    ]
                },
                group: ['isPaying'],
                raw: true
            })

        newEnrollmentStats.map(result => {
            contributionStats.newMembersContributions = result.totalContributionAmount ? result.totalContributionAmount : 0;
            contributionStats.registrationFees += result.totalRegistrationFee;
            contributionStats.additionalBeneficiariesFees += result.totalAdditionalBeneficiaryFee;
            contributionStats.otherFees += result.totalOtherFee;
            return contributionStats;
        });

        renewalStats.map(result => {
            contributionStats.renewedMembersContributions = result.totalContributionAmount ? result.totalContributionAmount : 0;
            contributionStats.registrationFees += result.totalRegistrationFee;
            contributionStats.additionalBeneficiariesFees += result.totalAdditionalBeneficiaryFee;
            contributionStats.otherFees += result.totalOtherFee;
            return contributionStats;
        });
        return contributionStats;

    }

    static getTotalContributionStats = async (enrollmentPeriodId) => {
        const contributionStats = {
            newMembersContributions: 0,
            renewedMembersContributions: 0,
            registrationFees: 0,
            additionalBeneficiariesFees: 0,
            otherFees: 0
        }
        const selectedEnrollmentPeriod = await models.EnrollmentPeriod.findByPk(enrollmentPeriodId, { raw: true });
        const newEnrollmentStats = await models.EnrollmentRecord.findAll(
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
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContributionAmount'],
                    [Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee'],
                    [Sequelize.fn('sum', Sequelize.col('additionalBeneficiaryFee')), 'totalAdditionalBeneficiaryFee'],
                    [Sequelize.fn('sum', Sequelize.col('otherFees')), 'totalOtherFee']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { isPaying: true }
                    ]
                },
                raw: true
            })
        const renewalStats = await models.EnrollmentRecord.findAll(
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
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContributionAmount'],
                    [Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee'],
                    [Sequelize.fn('sum', Sequelize.col('additionalBeneficiaryFee')), 'totalAdditionalBeneficiaryFee'],
                    [Sequelize.fn('sum', Sequelize.col('otherFees')), 'totalOtherFee']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { isPaying: true }
                    ]
                },
                group: ['isPaying'],
                raw: true
            })

        newEnrollmentStats.map(result => {
            contributionStats.newMembersContributions = result.totalContributionAmount ? result.totalContributionAmount : 0;
            contributionStats.registrationFees += result.totalRegistrationFee;
            contributionStats.additionalBeneficiariesFees += result.totalAdditionalBeneficiaryFee;
            contributionStats.otherFees += result.totalOtherFee;
            return contributionStats;
        });

        renewalStats.map(result => {
            contributionStats.renewedMembersContributions = result.totalContributionAmount;
            contributionStats.registrationFees += result.totalRegistrationFee;
            contributionStats.additionalBeneficiariesFees += result.totalAdditionalBeneficiaryFee;
            contributionStats.otherFees += result.totalOtherFee;
            return contributionStats;
        });
        return contributionStats;
    }

    static getTotalContribution = async (enrollmentPeriodId) => {
        const contributions = await models.EnrollmentRecord.findAll(
            {
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContribution'],
                    [Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee'],
                    [Sequelize.fn('sum', Sequelize.col('additionalBeneficiaryFee')), 'totalAdditionalBeneficiaryFee'],
                    [Sequelize.fn('sum', Sequelize.col('otherFees')), 'totalOtherFee']
                ],
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { isPaying: true }
                    ]
                },
                raw: true
            });
        const totalContributions = contributions[0].totalContribution + contributions[0].totalRegistrationFee +
            contributions[0].totalAdditionalBeneficiaryFee + contributions[0].totalOtherFee
        return totalContributions;
    };

    static getTotalContributionCollected = async (enrollmentPeriodId) => {
        const subsidies = await this.getSubsidies(enrollmentPeriodId);
        const totalContribution = await this.getTotalContribution(enrollmentPeriodId);
        return totalContribution + (subsidies ? (subsidies.generalSubsidy + subsidies.targetedSubsidy + subsidies.other) : 0);
    };

    /********************* - Enrollment Excel Reports - ***************************/

    static getTotalNewlyRegisteredMembers = async (args) => {
        const enrollmentPeriod = await models.EnrollmentPeriod.findByPk(args.enrollmentPeriodId, { raw: true });
        const previousEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.lt]: enrollmentPeriod.coverageEndDate }
            },
            order: [['coverageEndDate', 'DESC']],
            raw: true
        });

        const previousYearMembersEnrolled = previousEnrollmentPeriod ? await models.EnrollmentRecord.findAll(
            {
                where: {
                    [Op.and]: [
                        { enrollmentPeriodId: previousEnrollmentPeriod.id },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                raw: true
            }
        ) : [];

        const totalNewlyRegisteredMembers = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { enrollmentPeriodId: args.enrollmentPeriodId },
                    { contributionAmount: { [Op.not]: null } }
                ]
            },
            include: [
                {
                    model: models.Household,
                    required: true,
                    where: {
                        id: { [Op.notIn]: previousYearMembersEnrolled }
                    },
                    include: [models.Member]
                },
            ],
            //raw: true
        })

        return totalNewlyRegisteredMembers
    }

    /********************* - Contribution Excel Reports - ***************************/
}

module.exports = Report;
