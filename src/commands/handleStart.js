import {UserService} from "../services/UserService.ts";
import {addProfileButton} from "../utils/buttons/userButtons.js";
import {getMessageByLang} from "../helpers/other.js";
import {locale} from "../utils/consts.js";

export default async function handleStart(ctx) {
    try {
        const referral = ctx.startPayload
        const message = ctx.update.message
        const from = message.from

        await UserService.createUser({
            user_id: from.id,
            username: from.username,
            name: from.first_name,
            last_name: from.last_name,
            language_code: from.language_code,
            active: true,
            referral
        })

        const startHello = getMessageByLang('start_hello', locale(ctx));

        await ctx.reply(startHello, addProfileButton(locale(ctx)))
    } catch (e) {
        console.error('handleStart', e.message)
    }
}
