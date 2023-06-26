const database = require("../index");

module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("products", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        brand: {
            type: Sequelize.STRING,
            allowNull: false
        },
        years: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description:{
            type: Sequelize.STRING,
            allowNull: false
        },
        modal:{
            type: Sequelize.STRING,
            allowNull: false
        },
        images:{
            type: Sequelize.STRING,
            allowNull: false
        },
        shortDescription:{
            type: Sequelize.STRING,
            allowNull: false
        },
        userId:{
            type: Sequelize.INTEGER,
            allowNull: false
        }
    })

    return Product;
}