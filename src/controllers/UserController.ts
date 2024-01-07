import {Request, Response} from "express"
import {Friend, User} from "../models/models";
import {bot} from "../index";
import {Markup} from "telegraf";

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

    public async share(req: Request, res: Response): Promise<Response> {
        try {
            const {userId} = req.params
            const {friendIds, inviteUrl} = req.body

            console.log('userId', userId)
            console.log('friendIds', friendIds)
            console.log('inviteUrl', inviteUrl)

            const friends = await Friend.findAll({
                where: {
                    user_id: userId,
                    friend_id: friendIds
                },
                include: {
                    model: User,
                    as: 'user'
                }
            });

            console.log('friends', friends)

            // BUG
            // TODO: send message to friends

            friends.forEach((friend: any) => {
                bot.telegram.sendMessage(
                    friend.user.id,
                    `Ваш друг @${friend.user.username} приглашает вас сыграть с ним в шахматы. Перейдите по ссылке ${inviteUrl}`,
                    Markup.inlineKeyboard([
                        Markup.button.webApp('Перейти в игру', inviteUrl)
                    ])
                )
            })

            return res.json({message: 'Success'})
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