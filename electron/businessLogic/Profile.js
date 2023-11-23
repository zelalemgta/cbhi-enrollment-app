const Sequelize = require("sequelize");
const models = require("../db/models");

//Initialize squelize operartor
const Op = Sequelize.Op;

class Profile {

    static addProfile = profileObj => {
        const result = models.Profile.create({
            zoneName: profileObj.zoneName,
            woredaName: profileObj.woredaName,
            contributionAmount: profileObj.contributionAmount,
            registrationFee: profileObj.registrationFee,
            additionalBeneficiaryFee: profileObj.additionalBeneficiaryFee,
            password: profileObj.newPassword
        }).then(() => {
            return {
                type: "Success",
                message: "Profile created successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error creating profile"
            }
        })
        return result;
    };

    static editProfile = profileObj => {
        const result = models.Profile.update({
            zoneName: profileObj.zoneName,
            woredaName: profileObj.woredaName,
            contributionAmount: profileObj.contributionAmount,
            registrationFee: profileObj.registrationFee,
            additionalBeneficiaryFee: profileObj.additionalBeneficiaryFee,
            password: profileObj.newPassword
        }, {
            where: {
                id: profileObj.id
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Profile updated successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error updating profile"
            }
        });
        return result;
    };

    static getProfile = () => {
        const profile = models.Profile.findOne({ raw: true }).then(result => {
            return result;
        });
        return profile;
    };

    static login = async (accountPassword) => {
        const profile = await models.Profile.findOne({ where: { password: { [Op.eq]: accountPassword } } })
        if (profile) return { success: true }
        else return { success: false, errorMessage: "Incorrect Password! Please try again" }
    }
}

module.exports = Profile;
