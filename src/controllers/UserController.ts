import {Request, Response} from "express"
import {Friend, User} from "../models/models";

class UserController {
    public async friends(req: Request, res: Response): Promise<Response> {
        return res.json({message: 'Hello World'})
    }

    public async getUserFriends(req: Request, res: Response): Promise<Response> {
        try {
            const {chatId} = req.params
            const friends = await Friend.findAll({
                where: {user_id: chatId}
            });
            if (!friends) return res.status(404).json({message: 'User not found'})
            return res.json(friends)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e})
        }
    }

    public async getUserByChatId(req: Request, res: Response): Promise<Response> {
        try {
            const {chatId} = req.params
            const user = await User.findOne({
                where: {user_id: chatId}
            });
            if (!user) return res.status(404).json({message: 'User not found'})
            return res.json(user)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e})
        }
    }

    public async getFriends(req: Request, res: Response): Promise<Response> {
        try {
            const {chatId} = req.params
            const user = await User.findOne({
                where: {user_id: chatId}
            });

            if (!user) return res.status(404).json({message: 'User not found'})
            return res.json(user)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e})
        }
    }
}

export default new UserController()