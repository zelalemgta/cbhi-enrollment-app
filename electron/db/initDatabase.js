const db = require("./models/index");
const path = require("path");
const Umzug = require("umzug");

module.exports = function initDatabase() {

  const migrationsConfig = {
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
  }

  const seedersConfig = {
    // The configured instance of Sequelize.
    // Optional if `model` is passed.
    sequelize: db.sequelize,
    migrations: {
      // The path to the migrations directory.
      params: [db.sequelize.getQueryInterface(), db.Sequelize],
      path: path.join(__dirname, "seeders")
    },
    storage: 'sequelize',
    storageOptions: {
      sequelize: db.sequelize,
      modelName: 'SequelizeData'
    }
  };

  var migrator = new Umzug(migrationsConfig);
  var seeder = new Umzug(seedersConfig);

  migrator.pending().then(migrations => {
    migrations.length > 0 && migrator.up();
  });

  seeder.pending().then(seeds => {
    seeds.length > 0 && seeder.up();
  });
};
