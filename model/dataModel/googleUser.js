const database = require("../index");

module.exports = (sequelize, Sequelize) => {
    const GoogleUser = sequelize.define("googleUser", {
        firstName: {
            type: Sequelize.STRING,
        },
        lastName: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        googleId: {
            type: Sequelize.STRING,
        },
        role: {
            type: Sequelize.STRING,
        }
    })

    return GoogleUser;
}