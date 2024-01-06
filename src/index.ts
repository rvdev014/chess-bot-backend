import 'dotenv/config'
import './models/models'
import express from 'express'
import cors from 'cors'
import {createServer} from "http"
import socketInit from "./socket"
import sequelize from "./db"
import GameController from "./controllers/GameController"
import {Telegraf} from "telegraf";
import {runBot} from "./bot";
import {BOT_TOKEN, PORT, WEBHOOK_DOMAIN, WEBHOOK_PATH} from "./config";
import {createClient} from "redis";
import UserController from "./controllers/UserController";

const app = express()

app.use(cors())
app.use(express.json())

const server = createServer(app)

app.get('/user/:chatId', UserController.getUserByChatId)
app.get('/user/:chatId/friends', UserController.getUserFriends)
app.get('/game', GameController.index)
app.get('/game/search', GameController.searchOpponent)
app.get('/game/remove-from-queue', GameController.removeFromQueue)

export const bot = new Telegraf(BOT_TOKEN);

socketInit(server)
export const redis = createClient();
redis.connect().then(r => console.log(r)).catch(error => console.log(error))
redis.on('connect', () => {
    console.log('Redis connected')
    redis.flushDb().then(r => console.log(r)).catch(error => console.log(error))
})

if (WEBHOOK_DOMAIN) {
    app.use(bot.webhookCallback(WEBHOOK_PATH));
}

server.listen(PORT, async () => {
    try {
        await sequelize.authenticate()
        // await sequelize.sync({alter: true})
        await runBot(bot);
        console.log(`Server is running on port ${process.env.PORT}`)
    } catch (e: any) {
        console.error(`App crashed: ${e.message}`)
    }
})