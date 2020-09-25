//const Sequelize = require("sequelize");
const models = require("../db/models");
const { toEthiopian, toGregorian } = require("ethiopian-date");

//Initialize squelize operartor
//const Op = Sequelize.Op;

const convertDate = (date, calendar) => {
    if (calendar === 'GR') {
        const etDate = date.split('-').map(Number);
        const convertedDate = toGregorian(...etDate);
        return `${convertedDate[0]}-${convertedDate[1]}-${convertedDate[2]}`;
    } else {
        const dateObj = new Date(date);
        const [year, month, day] = [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
        const convertedDate = toEthiopian(year, month, day);
        //Returned Date Format YYY-MM-DD
        return `${convertedDate[0]}-${convertedDate[1]}-${convertedDate[2]}`
    }
}

class EnrollmentPeriod {

    static addEnrollmentPeriod = enrollmentPeriodObj => {
        enrollmentPeriodObj.enrollmentStartDate = convertDate(enrollmentPeriodObj.enrollmentStartDate, 'GR')
        enrollmentPeriodObj.enrollmentEndDate = convertDate(enrollmentPeriodObj.enrollmentEndDate, 'GR')
        enrollmentPeriodObj.coverageStartDate = convertDate(enrollmentPeriodObj.coverageStartDate, 'GR')
        enrollmentPeriodObj.coverageEndDate = convertDate(enrollmentPeriodObj.coverageEndDate, 'GR')
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
        enrollmentPeriodObj.enrollmentStartDate = convertDate(enrollmentPeriodObj.enrollmentStartDate, 'GR')
        enrollmentPeriodObj.enrollmentEndDate = convertDate(enrollmentPeriodObj.enrollmentEndDate, 'GR')
        enrollmentPeriodObj.coverageStartDate = convertDate(enrollmentPeriodObj.coverageStartDate, 'GR')
        enrollmentPeriodObj.coverageEndDate = convertDate(enrollmentPeriodObj.coverageEndDate, 'GR')
        const results = models.EnrollmentPeriod.update(enrollmentPeriodObj, {
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

        return results;
    };

    static getEnrollmentPeriods = () => {
        const enrollmentPeriods = models.EnrollmentPeriod.findAll({ raw: true }).then(result => {
            const enrollmentPeriodResults = result.map(enrollmentPeriod => {
                enrollmentPeriod.active = new Date().setHours(0, 0, 0, 0) <= Date.parse(enrollmentPeriod.coverageEndDate) ? true : false;
                enrollmentPeriod.enrollmentStartDate = convertDate(enrollmentPeriod.enrollmentStartDate, 'ET')
                enrollmentPeriod.enrollmentEndDate = convertDate(enrollmentPeriod.enrollmentEndDate, 'ET')
                enrollmentPeriod.coverageStartDate = convertDate(enrollmentPeriod.coverageStartDate, 'ET')
                enrollmentPeriod.coverageEndDate = convertDate(enrollmentPeriod.coverageEndDate, 'ET')
                return enrollmentPeriod;
            })
            return enrollmentPeriodResults;
        });
        return enrollmentPeriods;
    };
}

module.exports = EnrollmentPeriod;
