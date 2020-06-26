const electron = require("electron");
const db = require("./models/index");
const path = require("path");
const Umzug = require("umzug");
const { app } = electron;

module.exports = function initDatabase() {
  const umzug = new Umzug({
    // The configured instance of Sequelize.
    // Optional if `model` is passed.
    sequelize: db.sequelize,
    migrations: {
      // The path to the migrations directory.
      params: [db.sequelize.getQueryInterface(), db.Sequelize],
      path: path.join(app.getAppPath(), "electron/db/migrations")
    }
  });
  umzug.pending().then(migrations => {
    migrations.length > 0 && umzug.up();
  });
};
