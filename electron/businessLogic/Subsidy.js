//const Sequelize = require("sequelize");
const models = require("../db/models");

//Initialize squelize operartor
//const Op = Sequelize.Op;

class Subsidy {

    static addSubsidy = subsidyObj => {
        const result = models.Subsidy.create(subsidyObj).then(() => {
            return {
                type: "Success",
                message: "Subsidy added successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error adding Subsidy"
            }
        })
        return result;
    };

    static editSubsidy = subsidyObj => {
        const results = models.Subsidy.update(subsidyObj, {
            where: {
                id: subsidyObj.id
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Subsidy updated successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error updating Subsidy"
            }
        });

        return results;
    };

    static removeSubsidy = subsidyId => {
        const result = models.Subsidy.destroy({
            where: {
                id: subsidyId
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Subsidy removed successfully"
            }
        }).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error removing Subsidy"
            }
        });
        return result;
    }

    static getSubsidies = () => {
        const subsidies = models.Subsidy.findAll({
            raw: true,
            include: [
                {
                    model: models.EnrollmentPeriod,
                    required: true
                }
            ],
            order: [[models.EnrollmentPeriod, 'coverageEndDate', 'DESC']]
        }).then(result => {
            const subsidyResults = result.map(subsidy => {
                return subsidy;
            })
            return subsidyResults;
        });
        return subsidies;
    };
}

module.exports = Subsidy;
