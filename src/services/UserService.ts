import {Queue, User} from "../models/models";
// import {redis} from "../index";
import {UserAttributes} from "../models/types";

class GameService {
    public async setSocketId(userId: string, socketId: string) {
        // await redis.set(`socketId_${userId}`, socketId)
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

export class UserService {

    public static async createUser(data: UserAttributes) {
        await User.findOrCreate({where: {user_id: data.user_id}, defaults: data})
    }

}

export default new GameService()