import sequelize from "./src/db.js";

await sequelize.authenticate()
await sequelize.sync({alter: true})
