import sequelize from "./db"

(async () => {
    await sequelize.authenticate()
    await sequelize.sync({alter: true})
})()
