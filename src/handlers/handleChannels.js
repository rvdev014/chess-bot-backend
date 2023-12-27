import {Channel} from "../models/models.ts";
import {Markup} from "telegraf";
import {
    DATA_ADD_CHANNEL,
    DATA_ADMIN,
    DATA_LIST_CHANNEL,
    DATA_EDIT_CHANNEL,
    DATA_REMOVE_CHANNEL,
    DATA_REMOVE_CHANNEL_CONFIRM,
    DATA_CANCEL, ADMIN_INLINE_KEYBOARD, CANCEL_BUTTON
} from "../utils/buttons/adminButtons.js";

import {Composer, Scenes} from "telegraf";
import {locale, sceneIds} from "../utils/consts.js";
import {getAddChannelButton, getCancelButton} from "../utils/buttons/adminButtons.js";
import {paginate} from "../helpers/admin.js";
import {getMessageByLang, isInviteLink} from "../helpers/other.js";

export async function handleChannelList(ctx) {
    try {
        try {
            await ctx.deleteMessage()
        } catch (e) {
            console.log('handleChannelList deleteMessage', e.message)
        }

        let page = parseInt(ctx?.update?.callback_query?.data?.replace(`${DATA_LIST_CHANNEL} `, ''))

        ctx.session.page = page < 0 ? 0 : page

        const userPage  = ctx.session.page + 1

        const keyboards = Markup.inlineKeyboard([])

        const channels  = await Channel.findAll(paginate({raw: true, order: [['id', 'DESC']]}, {page: ctx.session.page, pageSize: 5}))

        channels.map((channel) => {
            keyboards?.reply_markup?.inline_keyboard?.push([
                Markup.button.callback(
                    `${channel?.name ?? channel?.link ?? channel?.id} ${channel?.active ? '(активна)' : '(не активна)'}`,
                    `${DATA_EDIT_CHANNEL} ${channel?.id}`
                ),
            ])
        })

        const nextPage = channels.length >= 5 ? ctx.session.page += 1 : ctx.session.page;

        keyboards?.reply_markup?.inline_keyboard?.push([
                Markup.button.callback(getMessageByLang('back', locale(ctx)), `${DATA_LIST_CHANNEL} ${page - 1}`),
                Markup.button.callback(getMessageByLang('next', locale(ctx)), `${DATA_LIST_CHANNEL} ${nextPage}`),
            ],
            [
                Markup.button.callback(getMessageByLang('add_channel', locale(ctx)), DATA_ADD_CHANNEL),
                Markup.button.callback(getMessageByLang('admin_menu', locale(ctx)), DATA_ADMIN),
            ])

        const channelList = getMessageByLang('channel_list', locale(ctx))

        await ctx.reply(channelList.replace(':userPage', userPage), keyboards)
    } catch (e) {
        console.log('handleChannelsList', e.message)
    }
}

export async function handleEditChannel(ctx) {
    try {
        try {
            await ctx.deleteMessage()
        } catch (e) {
            console.log('handleEditChannel deleteMessage', e.message)
        }

        const id = ctx?.update?.callback_query?.data?.replace(`${DATA_EDIT_CHANNEL} `, '')

        const channel = await Channel?.findOne({
            raw: true,
            where: {id}
        })

        return channel?.id !== undefined
            ? await handleEditChannelButtons(ctx, channel)
            : ctx.reply(getMessageByLang('channel_not_found', locale(ctx)))
    } catch (e) {
        console.log(e)
    }
}

export async function handleEditChannelButtons(ctx, channel) {
    try {
        await ctx.replyWithHTML(
            `Удалить канал\n\n<b>${channel?.name ?? channel?.link ?? channel?.id} ${channel?.active ? '(активна)' : '(не активна)'}</b>`,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(getMessageByLang('remove', locale(ctx)), `${DATA_REMOVE_CHANNEL} ${channel?.id}`),
                ],
                [
                    Markup.button.callback(getMessageByLang('admin_menu', locale(ctx)), DATA_ADMIN),
                ]
            ]))
    } catch (e) {
        console.log('handleEditChannelButtons', e.message)
    }
}

export async function handleRemoveChannel(ctx) {
    try {
        const id = ctx?.update?.callback_query?.data?.replace(`${DATA_REMOVE_CHANNEL} `, '')

        await ctx.deleteMessage()

        await ctx.reply(
            getMessageByLang('remove_confirm', locale(ctx)),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(getMessageByLang('yes', locale(ctx)), `${DATA_REMOVE_CHANNEL_CONFIRM} ${id}`),
                    Markup.button.callback(getMessageByLang('no', locale(ctx)), DATA_CANCEL),
                ]
            ])
        )

    } catch (e) {
        console.log('handleRemoveChannel', e.message)
        await ctx.reply(getMessageByLang('channel_not_found', locale(ctx)))
    }
}

export async function handleRemoveChannelConfirm(ctx) {
    try {
        const id = ctx?.update?.callback_query?.data?.replace(`${DATA_REMOVE_CHANNEL_CONFIRM} `, '')

        console.log('id', id)
        const destroyChannel = await Channel.destroy({
            where: {id}
        })

        if (destroyChannel) {
            await ctx.deleteMessage()
            await ctx.reply(getMessageByLang('channel_not_found', locale(ctx)), ADMIN_INLINE_KEYBOARD(locale(ctx)))
        } else {
            await ctx.reply(getMessageByLang('remove_failed', locale(ctx)))
        }

    } catch (e) {
        console.log('handleRemoveChannelConfirm', e.message)
        await ctx.reply(getMessageByLang('remove_failed', locale(ctx)))
    }
}

export async function handleAddChannel(ctx) {
    await ctx.answerCbQuery()
    try {
        await ctx.scene.enter(sceneIds.admin.SCENE_ADD_CHANNEL)
    } catch (e) {
        console.log('handleAddChannel', e.message)
        await onErrorAdd(ctx)
    }
}

async function onErrorAdd(ctx) {
    await ctx.reply(getMessageByLang('add_channel_error', locale(ctx)), getAddChannelButton(locale(ctx)))
}

const channelUrlStep = new Composer()
channelUrlStep.on('text', async ctx => {
    try {
        const message = ctx.update.message
        const inviteLink = message.text

        if (!isInviteLink(message)) {
            return await ctx.reply(getMessageByLang('invite_link_example', locale(ctx)), {
                disable_web_page_preview: true
            })
        }

        ctx.wizard.state.channel_link = inviteLink

        await ctx.reply(getMessageByLang('send_post_from_channel', locale(ctx)))

        return await ctx.wizard.next()
    } catch (e) {
        console.log('channelUrlStep', e.message)
        await onErrorAdd(ctx)
    }
})
channelUrlStep.on('message', ctx => ctx.reply(
    getMessageByLang('invite_link_example', locale(ctx)),
    getCancelButton(locale(ctx)))
)


const channelForwardStep = new Composer()
channelForwardStep.on('message', async ctx => {
    const message = ctx.update.message
    const channel = message?.forward_from_chat

    try {
        if (!channel) {
            return await ctx.reply(
                getMessageByLang('post_from_channel', locale(ctx)),
                getCancelButton(getMessageByLang('cancel', locale(ctx)))
            )
        }

        try {
            await Channel.create({
                name: channel.title,
                chat: channel.id,
                link: ctx?.wizard?.state?.channel_link,
                active: true,
            })

            await ctx.replyWithHTML(
                getMessageByLang('add_channel_success', locale(ctx)).replace(':title', channel.title),
                getAddChannelButton(locale(ctx))
            )

            await ctx.scene.leave()

        } catch (e) {

            const errorMessage = e?.message?.indexOf('повторяющееся значение ключа') > -1 ?
                getMessageByLang('channel_already_added', locale(ctx)) :
                e?.message ?? getMessageByLang('add_channel_error', locale(ctx))

            return await ctx.reply(errorMessage, CANCEL_BUTTON(locale(ctx)))
        }
    } catch (e) {
        console.log('channelForwardStep', e.message)
        await onErrorAdd(ctx)
    }
})

export const SceneChannelAdd = new Scenes.WizardScene(
    sceneIds.admin.SCENE_ADD_CHANNEL,
    channelUrlStep,
    channelForwardStep
)

SceneChannelAdd.enter(ctx => ctx.reply(
    getMessageByLang('invite_link_example', locale(ctx)),
    getCancelButton(locale(ctx)))
)
