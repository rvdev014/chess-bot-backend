import {Server as HttpServer} from "http"
import {Server as SocketServer} from "socket.io"
import {v4 as uuidv4} from "uuid"
import {IGameOverState, IMoveState, TGame, TQueue} from "./types";
import {redis} from "./index";

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

            let opponent: any = await redis.get(`queue:${socket.id}`);
            opponent = JSON.parse(opponent)

            console.log('opponent', opponent)

            if (!opponent) {
                return
            }

            const roomId = uuidv4()

            await redis.del(`queue:${opponent.socketId}`)
            await redis.del(`queue:${socket.id}`)

            await redis.set(`games:${roomId}`, JSON.stringify({
                // @ts-ignore
                roomId: roomId,
                white: opponent,
                black: currentClient,
                currentTurn: 'white',
                lastFen: null,
            }))

            socket.join(roomId)
            io.in(opponent.socketId).socketsJoin(roomId)

            io.in(roomId).fetchSockets().then((sockets) => {
                sockets.forEach((socket) => {
                    socket.data.roomId = roomId
                })
            })

            socket.emit("game:started", opponent, 'black', roomId)
            io.to(opponent.socketId).emit("game:started", currentClient, 'white', roomId)

            // @ts-ignore
            await redis.set(`queue:${socket.id}`, JSON.stringify(currentClient))

        })

        socket.on("game:search-cancel", () => {
            redis.del(`queue:${socket.id}`).then(r => console.log(r))
        });

        socket.on("game:move", async (moveState: IMoveState) => {
            const roomId = socket.data.roomId;

            let game: any = await redis.get(`games:${roomId}`);
            game = JSON.parse(game)

            if (!game) return

            await redis.set(`games:${roomId}`, JSON.stringify({
                ...game,
                white: {...game.white, timeLeft: moveState.whiteTimeLeft},
                black: {...game.black, timeLeft: moveState.blackTimeLeft},
                currentTurn: moveState.side === 'white' ? 'black' : 'white',
                lastFen: moveState.lastFen
            }))

            socket.to(roomId).emit("game:move", moveState)
        })

        socket.on("game:join-guest", async (roomId) => {
            let game: any = await redis.get(`games:${roomId}`);
            game = JSON.parse(game)

            socket.join(roomId)
            socket.emit("game:join-guest", game)
            socket.to(roomId).emit("game:join-view")
        })

        socket.on("game:over", async (gameOverState: IGameOverState) => {
            const roomId = socket.data.roomId;

            let game: any = await redis.get(`games:${roomId}`);
            game = JSON.parse(game)

            if (!game) return

            await redis.set(`games:${roomId}`, JSON.stringify({
                ...game,
                winner: gameOverState.winner,
                reason: gameOverState.reason,
                white: {...game.white, timeLeft: gameOverState.whiteTimeLeft},
                black: {...game.black, timeLeft: gameOverState.blackTimeLeft},
            }))

            socket.to(roomId).emit("game:over", game)

            await redis.del(`games:${roomId}`)
        })

        socket.on("disconnect", async () => {
            const roomId = socket.data.roomId

            if (roomId) {
                socket.to(roomId).emit("game:disconnected")
                io.in(roomId).fetchSockets().then((sockets) => {

                    redis.del(`games:${roomId}`)

                    sockets.forEach((socket) => {
                        socket.leave(roomId)
                    })
                })
            }

            await redis.del(`queue:${socket.id}`)

        })
    })

    return io
}