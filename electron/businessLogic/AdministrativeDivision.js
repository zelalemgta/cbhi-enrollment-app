const Sequelize = require("sequelize");
const models = require("../db/models");

//Initialize squelize operartor
const Op = Sequelize.Op;

class AdministrativeDivision {

    static addKebele = kebeleObj => {
        kebeleObj.level = "Kebele";
        const result = models.AdministrativeDivision.create(kebeleObj).then(() => {
            return {
                type: "Success",
                message: "Kebele created successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error creating Kebele"
            }
        })
        return result;
    };

    static editKebele = kebeleObj => {
        const result = models.AdministrativeDivision.update(kebeleObj, {
            where: {
                id: kebeleObj.id
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Kebele updated successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error updating Kebele"
            }
        });
        return result;
    };

    static getAdministrativeDivisions = () => {
        const administrativeDivisions = models.AdministrativeDivision.findAll({
            raw: true
        }).then(result => {
            return result;
        });
        return administrativeDivisions;
    };

    static getKebeles = () => {
        const kebeles = models.AdministrativeDivision.findAll({
            where: {
                level: 'Kebele'
            },
            raw: true
        }).then(result => {
            return result;
        });
        return kebeles;
    };

    static addGote = goteObj => {
        goteObj.level = "Gote";
        const result = models.AdministrativeDivision.create(goteObj).then(() => {
            return {
                type: "Success",
                message: "Gote created successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error creating Gote"
            }
        })
        return result;
    };

    static editGote = goteObj => {
        const result = models.AdministrativeDivision.update(goteObj, {
            where: {
                id: goteObj.id
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Gote updated successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error updating Gote"
            }
        });
        return result;
    };

    static getGotes = (parentId) => {
        const gotes = models.AdministrativeDivision.findAll({
            where: {
                [Op.and]: [
                    { level: 'Gote' },
                    { parent: parentId }
                ]
            },
            raw: true
        }).then(result => {
            return result;
        });
        return gotes;
    };
}

module.exports = AdministrativeDivision;
