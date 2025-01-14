import {Server as HttpServer} from "http"
import {Server as SocketServer} from "socket.io"
import {v4 as uuidv4} from "uuid"
import {ICreateRoomState, IGameOverState, IMoveState, TGame, TQueue} from "./types";
import {CLIENT_URL} from "./config";
import {bot} from "./index";
import {Markup} from "telegraf";
import {User} from "./models/models";
import {getMessageByLang} from "./helpers/other";

export const games: TGame = {}
export const queue: TQueue = {}

export default function socketInit(server: HttpServer) {
    const io = new SocketServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })

    io.on("connection", (socket) => {

        console.log('New client connected', socket.id)

        socket.on("game:search", async (userId: string) => {
            console.log('userId', userId)
            const currentClient = {
                userId,
                socketId: socket.id
            }
            const opponent = Object.values(queue).find((client) => client.socketId !== socket.id)
            if (opponent && opponent.socketId) {
                const roomId = uuidv4()

                delete queue[opponent.socketId]
                delete queue[socket.id]

                games[roomId] = {
                    roomId,
                    white: opponent,
                    black: currentClient,
                    currentTurn: 'white',
                    lastFen: null,
                    timeLimit: null,
                }

                socket.join(roomId)
                io.in(opponent.socketId).socketsJoin(roomId)

                io.in(roomId).fetchSockets().then((sockets) => {
                    sockets.forEach((socket) => {
                        socket.data.roomId = roomId
                        socket.data.side = socket.id === opponent.socketId ? 'white' : 'black'
                    })
                })

                socket.emit("game:started", {
                    opponent,
                    mySide: 'black',
                    roomId,
                    timeLimit: null,
                })
                io.to(opponent.socketId).emit("game:started", {
                    opponent: currentClient,
                    mySide: 'white',
                    roomId,
                    timeLimit: null,
                })
                return
            }

            queue[socket.id] = currentClient
        })

        socket.on('game:create-room', async (userId: string, createRoomState: ICreateRoomState) => {
            const roomId = uuidv4()
            const currentClient = {userId, socketId: socket.id}

            games[roomId] = {
                roomId,
                white: currentClient,
                black: {
                    socketId: null,
                    userId: createRoomState.friendId
                },
                currentTurn: 'white',
                lastFen: null,
                timeLimit: createRoomState.timeLimit || null,
            }

            const inviteUrl = `${CLIENT_URL}/friend/${roomId}`
            socket.emit("game:room-created", inviteUrl)

            socket.join(roomId)
            socket.data.roomId = roomId
            socket.data.side = 'white'

            try {
                const user: any = await User.findOne({
                    where: {user_id: currentClient.userId}
                });

                const locale = user?.language_code ?? 'ru';

                await bot.telegram.sendMessage(
                    createRoomState.friendId,
                    getMessageByLang('go_to_game_message', locale).replace(':username', user?.username ?? currentClient?.userId),
                    Markup.inlineKeyboard([
                        Markup.button.webApp(getMessageByLang('go_to_game_button', locale), inviteUrl)
                    ])
                )
            } catch (e) {
                console.log(e)
            }
        });

        socket.on("game:create-room-cancel", async () => {
            const roomId = socket.data.roomId;
            if (!games[roomId]) return

            delete games[roomId]
            socket.leave(roomId)
        });

        socket.on("game:join-friend", async (roomId) => {
            const game = games[roomId]
            if (!game) return socket.emit("game:join-friend-error", "Game not found")

            games[roomId] = {
                ...game,
                black: {
                    ...game.black,
                    socketId: socket.id,
                }
            }

            const opponent = game.white
            if (opponent && opponent.socketId) {
                socket.join(roomId)
                socket.data.roomId = roomId
                socket.data.side = 'black'
                socket.emit("game:started", {
                    opponent,
                    mySide: 'black',
                    roomId,
                    timeLimit: game.timeLimit,
                })
                io.to(opponent.socketId).emit("game:started", {
                    opponent: game.black,
                    mySide: 'white',
                    roomId,
                    timeLimit: game.timeLimit,
                })
            }

        });

        socket.on("game:search-cancel", () => {
            delete queue[socket.id]
        });

        socket.on("game:move", async (moveState: IMoveState) => {
            const roomId = socket.data.roomId;
            if (!games[roomId]) return

            const game = games[roomId]
            games[roomId] = {
                ...game,
                white: {...game.white, timeLeft: moveState.whiteTimeLeft},
                black: {...game.black, timeLeft: moveState.blackTimeLeft},
                currentTurn: moveState.side === 'white' ? 'black' : 'white',
                lastFen: moveState.lastFen
            }

            socket.to(roomId).emit("game:move", moveState)
        })

        socket.on("game:join-guest", async (roomId) => {
            const game = games[roomId]

            socket.join(roomId)
            socket.emit("game:join-guest", game)
            socket.to(roomId).emit("game:join-view")
        })

        socket.on("game:over", async (gameOverState: IGameOverState) => {
            const roomId = socket.data.roomId;
            if (!games[roomId]) return

            games[roomId] = {
                ...games[roomId],
                winner: gameOverState.winner,
                reason: gameOverState.reason,
                white: {...games[roomId].white, timeLeft: gameOverState.whiteTimeLeft},
                black: {...games[roomId].black, timeLeft: gameOverState.blackTimeLeft},
            }

            // save game to DB

            socket.to(roomId).emit("game:over", games[roomId])
            delete games[roomId]
        })

        socket.on("game:leave", async () => {
            const roomId = socket.data.roomId;
            if (!games[roomId]) return

            socket.to(roomId).emit("game:disconnected", socket.data.side)
            io.in(roomId).fetchSockets().then((sockets) => {
                delete games[roomId]
                sockets.forEach((socket) => {
                    socket.leave(roomId)
                })
            })
        });

        socket.on("disconnect", async () => {
            const roomId = socket.data.roomId
            if (roomId) {
                socket.to(roomId).emit("game:disconnected", socket.data.side)
                io.in(roomId).fetchSockets().then((sockets) => {
                    delete games[roomId]
                    sockets.forEach((socket) => {
                        socket.leave(roomId)
                    })
                })
            }

            delete queue[socket.id]
        })

    })

    return io
}