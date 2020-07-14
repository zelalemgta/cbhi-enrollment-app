//const Sequelize = require("sequelize");
const models = require("../db/models");

//Initialize squelize operartor
//const Op = Sequelize.Op;

class Profile {

    static addProfile = profileObj => {
        const result = models.Profile.create(profileObj).then(() => {
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
        const result = models.Profile.update(profileObj, {
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
}

module.exports = Profile;
