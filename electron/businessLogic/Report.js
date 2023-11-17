const Sequelize = require("sequelize");
const models = require("../db/models");
const { maleGenderValues, femaleGenderValues } = require("../../src/shared/constants");
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
        const previousEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.lt]: selectedEnrollmentPeriod.coverageEndDate }
            },
            order: [['coverageEndDate', 'DESC'], ['coverageStartDate', 'DESC']],
            raw: true
        });

        let previousYearHouseholdIdList = [];
        const filterStartDate = toGregorian(args.dateFrom.split('-').map(Number)).join('-');
        const filterEndDate = toGregorian(args.dateTo.split('-').map(Number)).join('-');
        if (previousEnrollmentPeriod) {
            // *** Get previous enrolled households ID list 
            const previousYearEnrolledHouseholdsList = await models.EnrollmentRecord.findAll({
                attributes: ['HouseholdId'],
                where: {
                    [Op.and]: [
                        { EnrollmentPeriodId: previousEnrollmentPeriod.id },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                raw: true
            })
            previousYearHouseholdIdList = previousYearEnrolledHouseholdsList.map((enrollmentRecordObj) => enrollmentRecordObj.HouseholdId)
        }

        const newEnrollmentStat = await models.EnrollmentRecord.findAll(
            {
                attributes: ['isPaying',
                    [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalNewEnrollments'],
                ],
                where: {
                    [Op.and]: [
                        { HouseholdId: { [Op.notIn]: previousYearHouseholdIdList } },
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
                attributes: ['isPaying',
                    [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalRenewals'],
                ],
                where: {
                    [Op.and]: [
                        { HouseholdId: { [Op.in]: previousYearHouseholdIdList } },
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

        const previousEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.lt]: selectedEnrollmentPeriod.coverageEndDate }
            },
            order: [['coverageEndDate', 'DESC'], ['coverageStartDate', 'DESC']],
            raw: true
        });

        let previousYearHouseholdIdList = [];

        if (previousEnrollmentPeriod) {
            // *** Get previous enrolled households ID list 
            const previousYearEnrolledHouseholdsList = await models.EnrollmentRecord.findAll({
                attributes: ['HouseholdId'],
                where: {
                    [Op.and]: [
                        { EnrollmentPeriodId: previousEnrollmentPeriod.id },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                raw: true
            })
            previousYearHouseholdIdList = previousYearEnrolledHouseholdsList.map((enrollmentRecordObj) => enrollmentRecordObj.HouseholdId)
        }

        const newEnrollmentStat = await models.EnrollmentRecord.findAll(
            {
                attributes: ['isPaying',
                    [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalNewEnrollments']
                ],
                where: {
                    [Op.and]: [
                        { HouseholdId: { [Op.notIn]: previousYearHouseholdIdList } },
                        { enrollmentPeriodId: enrollmentPeriodId },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                group: ['isPaying'],
                raw: true
            })
        const renewalStat = await models.EnrollmentRecord.findAll(
            {
                attributes: ['isPaying',
                    [Sequelize.fn('count', Sequelize.col('HouseholdId')), 'totalRenewals']
                ],
                where: {
                    [Op.and]: [
                        { HouseholdId: { [Op.in]: previousYearHouseholdIdList } },
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
        return ((totalHouseholdsEnrolled / enrollmentPeriod.eligibleHouseholds) * 100).toFixed(2);
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
            attributes: [
                'Household.Members.gender',
                [Sequelize.fn('count', Sequelize.col('Household.Members.Id')), 'count']
            ],
            group: [['Household.Members.gender']]
        });

        householdsByGender.maleHouseholds = filteredHouseholds.filter((householdObj) => maleGenderValues.includes(householdObj.gender)).reduce((a, b) => a + b.count, 0)
        householdsByGender.femaleHouseholds = filteredHouseholds.filter((householdObj) => femaleGenderValues.includes(householdObj.gender)).reduce((a, b) => a + b.count, 0)

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
        return totalContribution + (subsidies ? (subsidies.generalSubsidy + subsidies.regionTargetedSubsidy + subsidies.zoneTargetedSubsidy + subsidies.woredaTargetedSubsidy + subsidies.other) : 0);
    };

    /********************* - Enrollment Excel Reports - ***************************/

    static generateEnrollmentReport = async (args) => {
        //  *** Get current year enrollment period Id        
        const currentEnrollmentPeriod = await models.EnrollmentPeriod.findByPk(args.enrollmentPeriodId, { raw: true });
        //  *** Get previous year enrollment period Id
        const previousEnrollmentPeriod = await models.EnrollmentPeriod.findOne({
            where: {
                coverageEndDate: { [Op.lt]: currentEnrollmentPeriod.coverageEndDate }
            },
            order: [['coverageEndDate', 'DESC'], ['coverageStartDate', 'DESC']],
            raw: true
        });
        let previousYearHouseholdIdList = [];
        const filterStartDate = toGregorian(args.dateFrom.split('-').map(Number)).join('-');
        const filterEndDate = toGregorian(args.dateTo.split('-').map(Number)).join('-');
        if (previousEnrollmentPeriod) {
            // *** Get previous enrolled households ID list 
            const previousYearEnrolledHouseholdsList = await models.EnrollmentRecord.findAll({
                attributes: ['HouseholdId'],
                where: {
                    [Op.and]: [
                        { EnrollmentPeriodId: previousEnrollmentPeriod.id },
                        { contributionAmount: { [Op.not]: null } }
                    ]
                },
                raw: true
            })
            previousYearHouseholdIdList = previousYearEnrolledHouseholdsList.map((enrollmentRecordObj) => enrollmentRecordObj.HouseholdId)
        }
        // *********** Get Newly Enrolled CBHI Members ********************
        const getTotalNewlyEnrolledMembers = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { HouseholdId: { [Op.notIn]: previousYearHouseholdIdList } },
                    { EnrollmentPeriodId: currentEnrollmentPeriod.id },
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

            attributes: [
                'isPaying',
                'Household.Members.gender',
                'Household.Members.isHouseholdHead',
                [Sequelize.fn('count', Sequelize.col('Household.Members.id')), 'count']
            ],
            group: [['isPaying'], ['Household.Members.isHouseholdHead'], ['Household.Members.gender']],
            raw: true
        })

        // *********** Get Newly Enrolled CBHI Members within specified date range ****************
        const getTotalNewlyEnrolledMembersByDateRange = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { HouseholdId: { [Op.notIn]: previousYearHouseholdIdList } },
                    { EnrollmentPeriodId: currentEnrollmentPeriod.id },
                    { contributionAmount: { [Op.not]: null } },
                    { receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
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

            attributes: [
                'isPaying',
                'Household.Members.gender',
                'Household.Members.isHouseholdHead',
                [Sequelize.fn('count', Sequelize.col('Household.Members.id')), 'count']
            ],
            group: [['isPaying'], ['Household.Members.isHouseholdHead'], ['Household.Members.gender']],
            raw: true
        })

        //  ********** Get Renewing CBHI Members *****************
        const getTotalRenewingMembers = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { HouseholdId: { [Op.in]: previousYearHouseholdIdList } },
                    { EnrollmentPeriodId: currentEnrollmentPeriod.id },
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

            attributes: [
                'isPaying',
                'Household.Members.gender',
                'Household.Members.isHouseholdHead',
                [Sequelize.fn('count', Sequelize.col('Household.Members.id')), 'count']
            ],
            group: [['isPaying'], ['Household.Members.isHouseholdHead'], ['Household.Members.gender']],
            raw: true
        })

        //  ********** Get Renewing CBHI Members within specified date range *********************************
        const getTotalRenewingMembersByDateRange = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { HouseholdId: { [Op.in]: previousYearHouseholdIdList } },
                    { EnrollmentPeriodId: currentEnrollmentPeriod.id },
                    { contributionAmount: { [Op.not]: null } },
                    { receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
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

            attributes: [
                'isPaying',
                'Household.Members.gender',
                'Household.Members.isHouseholdHead',
                [Sequelize.fn('count', Sequelize.col('Household.Members.id')), 'count']
            ],
            group: [['isPaying'], ['Household.Members.isHouseholdHead'], ['Household.Members.gender']],
            raw: true
        })

        // *********** Get Total CBHI Members by ID card distribution ****************
        const getTotalMembersWithIdCard = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { EnrollmentPeriodId: currentEnrollmentPeriod.id },
                    { contributionAmount: { [Op.not]: null } }
                ]
            },
            include: [
                {
                    model: models.Household,
                    required: true,
                    where: {
                        idCardIssued: { [Op.eq]: true }
                    }
                }
            ],

            attributes: [
                'isPaying',
                [Sequelize.fn('count', Sequelize.col('Household.id')), 'count']
            ],
            group: [['isPaying']],
            raw: true
        })

        return {
            enrollmentYear: currentEnrollmentPeriod.enrollmentYear,
            eligibleHouseholds: currentEnrollmentPeriod.eligibleHouseholds,
            previousYearEnrolledMembers: previousYearHouseholdIdList.length,
            getTotalNewlyEnrolledMembers,
            getTotalNewlyEnrolledMembersByDateRange,
            getTotalRenewingMembers,
            getTotalRenewingMembersByDateRange,
            getTotalMembersWithIdCard
        }
    }

    /********************* - Contribution Excel Reports - ***************************/

    static generateContributionReport = async (args) => {
        //  *** Get current year enrollment period Id        
        const currentEnrollmentPeriod = await models.EnrollmentPeriod.findByPk(args.enrollmentPeriodId, { raw: true });

        const filterStartDate = toGregorian(args.dateFrom.split('-').map(Number)).join('-');
        const filterEndDate = toGregorian(args.dateTo.split('-').map(Number)).join('-');

        // *********** Get Newly Enrolled CBHI Members ********************
        const getTotalContributionCollection = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { EnrollmentPeriodId: currentEnrollmentPeriod.id },
                    { isPaying: { [Op.eq]: true } }
                    //{ receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
                ]
            },
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContributionAmount'],
                [Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee'],
                [Sequelize.fn('sum', Sequelize.col('additionalBeneficiaryFee')), 'totalAdditionalBeneficiaryFee'],
                [Sequelize.fn('sum', Sequelize.col('otherFees')), 'totalOtherFees']
            ],
            raw: true
        })

        // *********** Get Contribution report within specified date range ****************
        const getTotalContributionCollectionByDateRange = await models.EnrollmentRecord.findAll({
            where: {
                [Op.and]: [
                    { EnrollmentPeriodId: currentEnrollmentPeriod.id },
                    { isPaying: { [Op.eq]: true } },
                    { receiptDate: { [Op.between]: [filterStartDate, filterEndDate] } }
                ]
            },
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('contributionAmount')), 'totalContributionAmount'],
                [Sequelize.fn('sum', Sequelize.col('registrationFee')), 'totalRegistrationFee'],
                [Sequelize.fn('sum', Sequelize.col('additionalBeneficiaryFee')), 'totalAdditionalBeneficiaryFee'],
                [Sequelize.fn('sum', Sequelize.col('otherFees')), 'totalOtherFees']
            ],
            raw: true
        })

        // *********** Get Subsidies ***************
        const getSubsidies = await models.Subsidy.findOne({
            raw: true,
            where: { EnrollmentPeriodId: currentEnrollmentPeriod.id }
        });

        return {
            enrollmentYear: currentEnrollmentPeriod.enrollmentYear,
            getTotalContributionCollection,
            getTotalContributionCollectionByDateRange,
            getSubsidies
        }
    }

}

module.exports = Report;
