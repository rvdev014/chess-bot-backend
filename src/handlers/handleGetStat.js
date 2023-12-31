import {Chat} from "../models/models.ts";
import {getChatMembersCount} from "../helpers/admin.js";
import {getMessageByLang} from "../helpers/other.js";
import {locale} from "../utils/consts";

export default async function handleGetStat(ctx) {
    await ctx.answerCbQuery()
    const chats = await Chat.scope('active').findAll({raw: true, where: {active: true}})

    const allMembersCount = await getChatMembersCount(ctx, chats)

    const text = getMessageByLang('channel_stat', locale(ctx))
        .replace(':chats', chats.length)
        .replace(':allMembersCount', allMembersCount);

    await ctx.reply(text, {parse_mode: 'HTML'})
}