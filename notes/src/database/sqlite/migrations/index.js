const sqliteConnection = require("../../sqlite");
const createUsers = require("./createUsers");

async function migrationsRun() {
  const schemaas = [createUsers].join("");
  sqliteConnection()
    .then((db) => db.exec(schemaas))
    .catch((error) => console.error(error));
}
module.exports = migrationsRun;
