import sequelize from "./db"
import './models/models'

(async () => {
    await sequelize.authenticate()
    await sequelize.sync({alter: true})
})()
