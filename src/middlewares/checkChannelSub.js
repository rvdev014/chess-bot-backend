import {Channel} from "../models/models.ts";
import {Markup} from "telegraf";

export default async function checkChannelSub(ctx, next) {
    try {
        const from = ctx.message.from
        const channels = await Channel.findAll({raw: true,  where: {active: true}})

        const mustSubChannels = []

        for (const channel of channels) {

            try {
                const userMember = await ctx.telegram.getChatMember(channel.chat, from.id)

                if (userMember.status === 'left') {
                    mustSubChannels.push(channelUrlButton(channel))
                }
            } catch (e) {
                console.log('userMember', e.message)
            }
        }

        if (mustSubChannels.length > 0) {
            mustSubChannels.push([Markup.button.callback('Подписался ✔️', 'search')])
            return ctx.reply('Вы не подписаны на каналы:', Markup.inlineKeyboard(mustSubChannels))
        }

        return next()
    } catch (e) {
        console.log('checkChannelSub', e.message)
        await ctx.reply('Похоже вы не подписаны на каналы совсем')
    }
}


function channelUrlButton(channel) {
    return [Markup.button.url(channel.name, channel.link)]
}
