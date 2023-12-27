import {Chat, User} from "../models/models.ts";
import {getChatMembersCount} from "../helpers/admin.js";
import {getMessageByLang} from "../helpers/other.js";
import {locale} from "../utils/consts.js";

export default async function handleCheckRef(ctx) {
    const message = ctx.update.message
    try {
        const referral = message.text.split(' ')?.[1]
        if (referral) {
            const usersByRef = await User.findAll({where: {referral}, raw: true})
            const chatsByRef = await Chat.scope('active').findAll({where: {referral}, raw: true})

            const chatMembersCount = await getChatMembersCount(ctx, chatsByRef)

            const text = getMessageByLang('referral_stat', locale(ctx))
                .replace(':referral', referral)
                .replace(':usersByRef', usersByRef?.length || 0)
                .replace(':chatsByRef', chatsByRef?.length || 0)
                .replace(':chatMembersCount', chatMembersCount)

            await ctx.telegram.sendMessage(message.from.id, text, {parse_mode: 'HTML'})

        } else {
            await ctx.telegram.sendMessage(message.from.id, getMessageByLang('send_referral_link', locale(ctx)))
        }
    } catch (e) {
        console.log('handleCheckRef', e.message)
        await ctx.telegram.sendMessage(message.from.id, getMessageByLang('referral_link_error', locale(ctx)))
    }
}
