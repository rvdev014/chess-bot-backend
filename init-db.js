const sequelize = require("./src/db.js");

(async () => {
    await sequelize.authenticate()
    await sequelize.sync({alter: true})
})()
