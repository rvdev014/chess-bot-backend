import {Server as HttpServer} from "http"
import {Server as SocketServer} from "socket.io"
import {v4 as uuidv4} from "uuid"
import {IGameOverState, IMoveState, TGame, TQueue} from "./types";

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

        socket.on("game:search", async (userId: string) => {
            const currentClient = {
                userId,
                socketId: socket.id
            }
            const opponent = Object.values(queue).find((client) => client.socketId !== socket.id)
            if (opponent) {
                const roomId = uuidv4()

                delete queue[opponent.socketId]
                delete queue[socket.id]

                games[roomId] = {
                    roomId,
                    white: opponent,
                    black: currentClient,
                    currentTurn: 'white',
                    lastFen: null,
                }

                socket.join(roomId)
                io.in(opponent.socketId).socketsJoin(roomId)

                io.in(roomId).fetchSockets().then((sockets) => {
                    sockets.forEach((socket) => {
                        socket.data.roomId = roomId
                    })
                })

                socket.emit("game:started", opponent, 'black', roomId)
                io.to(opponent.socketId).emit("game:started", currentClient, 'white', roomId)
                return
            }

            queue[socket.id] = currentClient
        })

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

        socket.on("disconnect", async () => {
            const roomId = socket.data.roomId
            if (roomId) {
                socket.to(roomId).emit("game:disconnected")
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