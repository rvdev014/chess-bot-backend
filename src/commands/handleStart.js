import {UserService} from "../services/UserService.ts";
import {addProfileButton} from "../utils/buttons/userButtons.js";
import {getMessageByLang} from "../helpers/other.js";
import {locale} from "../utils/consts.js";
import {Friend, User} from "../models/models";

export default async function handleStart(ctx) {
    try {
        const referral = parseInt(ctx.startPayload) ?? 0
        const message = ctx.update.message
        const from = message.from

        await UserService.createUser({
            user_id: from.id,
            username: from.username,
            name: from.first_name,
            last_name: from.last_name ?? '',
            language_code: from.language_code,
            active: true
        })

        const startHello = getMessageByLang('start_hello', locale(ctx));

        await ctx.reply(startHello, addProfileButton(locale(ctx)))

        if (referral) {
            const friend = await User?.findOne({ where: {user_id: referral} })

            await Friend?.findOrCreate({
                where: {
                    user_id: ctx.from.id,
                    friend_id: referral
                },
                defaults: {
                    friend_name: friend?.username,
                    username: from.username
                }
            })
        }

    } catch (e) {
        console.error('handleStart', e.message, e)
    }
}
