const sequelize = require("./src/db.js");

await sequelize.authenticate()
await sequelize.sync({alter: true})
