const electron = require("electron");
const path = require('path');
const { app } = electron;

module.exports = {
    development: {
        dialect: 'sqlite',
        storage: path.join(app.getPath("userData"), "cbhi_db.sqlite3"),
        // Use a different storage type. Default: sequelize
        migrationStorage: "sequelize",
    },
    production: {
        dialect: 'sqlite',
        storage: path.join(app.getPath("userData"), "cbhi_db.sqlite3"),
        // Use a different storage type. Default: sequelize
        migrationStorage: "sequelize",
    }
}