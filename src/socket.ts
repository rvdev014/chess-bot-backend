import {Server as HttpServer} from "http"
import {Server as SocketServer} from "socket.io"
import {v4 as uuidv4} from "uuid"
import {TGame, TQueue} from "./types";

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
                    lastFen: null
                }

                socket.join(roomId)
                io.in(opponent.socketId).socketsJoin(roomId)

                io.in(roomId).fetchSockets().then((sockets) => {
                    sockets.forEach((socket) => {
                        socket.data.roomId = roomId
                    })
                })

                socket.emit("game:started", opponent, 'b', roomId)
                io.to(opponent.socketId).emit("game:started", currentClient, 'w', roomId)
                return
            }

            queue[socket.id] = currentClient
        })

        socket.on("game:search-cancel", () => {
            delete queue[socket.id]
        });

        socket.on("game:move", async (movement, gameFen) => {
            if (!games[socket.data.roomId]) return
            socket.to(socket.data.roomId).emit("game:move", movement)
            games[socket.data.roomId].lastFen = gameFen
        })

        socket.on("game:join-guest", async (roomId) => {
            const game = games[roomId]
            console.log('roomId', roomId)
            console.log('game', game)

            socket.join(roomId)
            socket.emit("game:join-guest", game)
            socket.to(roomId).emit("game:join-view")
        })

        socket.on("disconnect", async () => {
            // check if users left in the room
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