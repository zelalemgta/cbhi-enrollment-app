const db = require("./models/index");
const path = require("path");
const Umzug = require("umzug");

module.exports = function initDatabase() {
  const umzug = new Umzug({
    // The configured instance of Sequelize.
    // Optional if `model` is passed.
    sequelize: db.sequelize,
    migrations: {
      // The path to the migrations directory.
      params: [db.sequelize.getQueryInterface(), db.Sequelize],
      path: path.join(__dirname, "migrations")
    },
    storage: 'sequelize',
    storageOptions: {
      sequelize: db.sequelize
    }
  });
  umzug.pending().then(migrations => {
    migrations.length > 0 && umzug.up();
  });
};
