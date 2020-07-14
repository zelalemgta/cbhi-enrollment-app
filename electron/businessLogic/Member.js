const Sequelize = require("sequelize");
const models = require("../db/models");

//Initialize squelize operartor
const Op = Sequelize.Op;

class Member {

    static addMember = memberObj => {
        const result = models.Member.create(memberObj).then(() => {
            return {
                type: "Success",
                message: "Member created successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error creating Member"
            }
        })
        return result;
    };

    static editMember = memberObj => {
        const result = models.Member.update(memberObj, {
            where: {
                id: memberObj.id
            }
        }).then(() => {
            return {
                type: "Success",
                message: "Member updated successfully"
            };
        }
        ).catch((error) => {
            console.log(error);
            return {
                type: "Error",
                message: "Error updating Member"
            }
        });
        return result;
    };

    // static count = () => {
    //     let totalCount = models.Member.count().then(total => {
    //         return total;
    //     });
    //     return totalCount;
    // };

    // static getA = () => {
    //     return models.Member.findAll({ raw: true }).then(members => members);
    // }

    static getMember = (id) => {
        const memberObj = models.Member.findByPk(id, { raw: true }).then(member => {
            return member;
        })
        return memberObj;
    }

    static getMembers = (query) => {
        const { orderBy, orderDirection, page, pageSize, search } = query;
        let filiteredMembersList = models.Member.findAndCountAll({
            raw: true,
            offset: page * pageSize,
            limit: pageSize,
            where: {
                [Op.or]: [
                    { fullName: { [Op.substring]: search } },
                    { cbhiId: { [Op.substring]: search } },
                    // { id: { [Op.eq]: query.value } }
                ]
            },
            order: orderBy ? [[orderBy.field, orderDirection]] : []
        }).then(result => {
            result.page = page;
            return result;
        });
        return filiteredMembersList;
    };
}

module.exports = Member;
