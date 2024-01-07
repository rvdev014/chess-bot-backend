import {Request, Response} from "express"
import {Friend, User} from "../models/models";
import {bot} from "../index";
import {Markup} from "telegraf";
import {Op} from "sequelize";
import {getMessageByLang} from "../helpers/other";

class UserController {
    public async friends(req: Request, res: Response): Promise<Response> {
        return res.json({message: 'Hello World'})
    }

    public async getUserFriends(req: Request, res: Response): Promise<Response> {
        try {
            const {chatId} = req.params

            if (chatId === 'null') return res.json([])

            const friends = await Friend.findAll({
                where: {[Op.or]: [{user_id: chatId}, {friend_id: chatId}]}
            });

            if (!friends) return res.json([])

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
                where: {[Op.or]: [{user_id: userId, friend_id: friendIds}, {friend_id: userId, user_id: friendIds}]},
            });

            friends.map((friend: any, key) => {
                const locale = friend?.language_code ?? 'ru';

                const id   = parseInt(friend?.friend_id) === parseInt(userId) ? friend?.user_id   : friend?.friend_id;
                const name = parseInt(friend?.friend_id) === parseInt(userId) ? friend?.user_name : friend?.friend_name;

                try {
                    bot.telegram.sendMessage(
                        id,
                        getMessageByLang('go_to_game_message', locale).replace(':username', name),
                        Markup.inlineKeyboard([
                            Markup.button.webApp(getMessageByLang('go_to_game_button', locale), inviteUrl)
                        ])
                    )
                } catch (e: any) {
                    console.log(e?.message)
                }

            })

            // friends.forEach((friend: any) => {
            //     const locale = friend?.dataValues?.language_code ?? 'ru';
            //     console.log(locale, friend?.dataValues)
            //     bot.telegram.sendMessage(
            //         friend?.dataValues?.id,
            //         getMessageByLang('go_to_game_message', locale).replace(':username', friend?.dataValues?.username),
            //         Markup.inlineKeyboard([
            //             Markup.button.webApp(getMessageByLang('go_to_game_button', locale), inviteUrl)
            //         ])
            //     )
            // })

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