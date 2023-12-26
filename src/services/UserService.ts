import {Queue, User} from "../models/models";
import {redis} from "../index";

class GameService {
    public async setSocketId(userId: string, socketId: string) {
        await redis.set(`socketId_${userId}`, socketId)
        /*await User.update({socket_id: socketId}, {
            where: {id: userId}
        })*/
    }

    public async findBySocketId(socketId: string) {
        return await User.findOne({
            where: {socket_id: socketId},
        })
    }

    public async removeSocketId(socketId: string) {
        await User.update({socket_id: null}, {
            where: {socket_id: socketId}
        })
    }
}

export default new GameService()