//const Sequelize = require("sequelize");
const models = require("../db/models");

//Initialize squelize operartor
//const Op = Sequelize.Op;

class EnrollmentPeriod {

    static addEnrollmentPeriod = enrollmentPeriodObj => {
        const result = models.EnrollmentPeriod.create(enrollmentPeriodObj).then(() => {
            return {
                type: "Success",
                message: "Enrollment Period created successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error creating Enrollment Period"
            }
        })
        return result;
    };

    static editEnrollmentPeriod = enrollmentPeriodObj => {
        const result = models.EnrollmentPeriod.update(enrollmentPeriodObj, {
            where: {
                id: enrollmentPeriodObj.id
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Enrollment Period updated successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error updating Enrollment Period"
            }
        });
        return result;
    };

    static getEnrollmentPeriods = () => {
        const enrollmentPeriods = models.EnrollmentPeriod.findAll({ raw: true }).then(result => {
            const enrollmentPeriodResults = result.map(enrollmentPeriod => {
                //enrollmentPeriod.enrollmentStartDate = Date.parse(enrollmentPeriod.enrollmentStartDate);
                enrollmentPeriod.active = Date.now() <= Date.parse(enrollmentPeriod.coverageEndDate) ? true : false;
                return enrollmentPeriod;
            })
            return enrollmentPeriodResults;
        });
        return enrollmentPeriods;
    };
}

module.exports = EnrollmentPeriod;
