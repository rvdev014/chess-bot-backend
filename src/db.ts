import 'dotenv/config'
import {Sequelize} from 'sequelize'

export default new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASS,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT as unknown as number,
    }
)