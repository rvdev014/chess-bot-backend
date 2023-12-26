import 'dotenv/config'
import './models/models'
import express from 'express'
import cors from 'cors'
import {createServer} from "http"
import socketInit from "./socket"
import sequelize from "./db"
import GameController from "./controllers/GameController"

const app = express()

app.use(cors())
app.use(express.json())

const server = createServer(app)

app.get('/game', GameController.index)
app.get('/game/search', GameController.searchOpponent)
app.get('/game/remove-from-queue', GameController.removeFromQueue)

socketInit(server)
/*export const redis = createClient();
redis.connect()
redis.on('connect', () => {
    console.log('Redis connected')
    redis.flushDb()
})*/

server.listen(process.env.PORT, async () => {
    try {
        await sequelize.authenticate()
        // await sequelize.sync({alter: true})
        console.log(`Server is running on port ${process.env.PORT}`)
    } catch (e: any) {
        console.error(`App crashed: ${e.message}`)
    }
})