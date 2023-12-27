import {Show, ShowUser} from "../models/models.ts";
import {Markup, Scenes} from "telegraf";
import {
    DATA_ADMIN,
    DATA_CANCEL,
    DATA_REMOVE_SHOW_CONFIRM,
    DATA_REMOVE_SHOW,
    DATA_EDIT_SHOW,
    DATA_ADD_SHOW,
    DATA_LIST_SHOW, getAddShowButton, CANCEL_BUTTON, ADMIN_INLINE_KEYBOARD
} from "../utils/buttons/adminButtons.js";
import {locale, sceneIds} from "../utils/consts.js";
import {handleCancel} from "../commands/handleAdmin.js";
import {paginate} from "../helpers/admin.js";
import {getMessageByLang} from "../helpers/other.js";

export async function handleShowList(ctx) {
    try {
        try {
            await ctx.deleteMessage()
        } catch (e) {
            console.log('handleShowList deleteMessage', e.message)
        }

        let page = parseInt(ctx?.update?.callback_query?.data?.replace(`${DATA_LIST_SHOW} `, ''))

        ctx.session.page = page < 0 ? 0 : page

        const userPage = ctx.session.page + 1

        const keyboards = Markup.inlineKeyboard([])

        const shows = await Show.findAll(paginate({raw: true, order: [['id', 'DESC']]}, {
            page: ctx.session.page,
            pageSize: 5
        }))

        shows.map((show) => {
            keyboards?.reply_markup?.inline_keyboard?.push([
                Markup.button.callback(`${show?.title ?? show?.id} ${show.active ? '(активна)' : '(не активна)'}`, `${DATA_EDIT_SHOW} ${show?.id}`),
            ])
        })

        keyboards?.reply_markup?.inline_keyboard?.push([
                Markup.button.callback(getMessageByLang('back', locale(ctx)), `${DATA_LIST_SHOW} ${page - 1}`),
                Markup.button.callback(getMessageByLang('next', locale(ctx)), `${DATA_LIST_SHOW} ${shows.length >= 5 ? ctx.session.page += 1 : ctx.session.page}`),
            ],
            [
                Markup.button.callback(getMessageByLang('add_show', locale(ctx)), DATA_ADD_SHOW),
                Markup.button.callback(getMessageByLang('admin_menu', locale(ctx)), DATA_ADMIN),
            ])

        const channelList = getMessageByLang('show_list', locale(ctx))

        await ctx.reply(channelList.replace(':userPage', userPage), keyboards)
    } catch (e) {
        console.log('handleShowList', e.message)
    }
}

export async function handleEditShow(ctx) {
    try {
        try {
            await ctx.deleteMessage()
        } catch (e) {
            console.log('handleEditShow deleteMessage', e.message)
        }

        const id = ctx?.update?.callback_query?.data?.replace(`${DATA_EDIT_SHOW} `, '')

        const show = await Show?.findOne({
            raw: true,
            where: {id}
        })

        return show?.id !== undefined
            ? await handleEditShowButtons(ctx, show)
            : ctx.reply(getMessageByLang('show_not_found', locale(ctx)))
    } catch (e) {
        console.log('handleEditShow', e.message)
    }
}

export async function handleEditShowButtons(ctx, show) {
    try {
        const message = getMessageByLang('show_remove', locale(ctx))
            .replace(':title', show?.title ?? show?.id)
            .replace(':active', show.active ? '(активна)' : '(не активна)')

        await ctx.replyWithHTML(message,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback('Удалить', `${DATA_REMOVE_SHOW} ${show?.id}`),
                ],
                [
                    Markup.button.callback('Меню администратора', DATA_ADMIN),
                ]
            ])
        )
    } catch (e) {
        console.log('handleEditShowButtons', e.message)
    }
}

export async function handleRemoveShow(ctx) {
    try {
        const id = ctx?.update?.callback_query?.data?.replace(`${DATA_REMOVE_SHOW} `, '')

        await ctx.deleteMessage()

        await ctx.reply(
            getMessageByLang('remove_show_confirm', locale(ctx)),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(getMessageByLang('yes', locale(ctx)), `${DATA_REMOVE_SHOW_CONFIRM} ${id}`),
                    Markup.button.callback(getMessageByLang('no', locale(ctx)), DATA_CANCEL),
                ]
            ])
        )

    } catch (e) {
        console.log('handleRemoveShow', e.message)
        await ctx.reply(getMessageByLang('show_not_found', locale(ctx)))
    }
}

export async function handleRemoveShowConfirm(ctx) {
    try {
        const id = ctx?.update?.callback_query?.data?.replace(`${DATA_REMOVE_SHOW_CONFIRM} `, '')

        const destroyShow = await Show.destroy({
            where: {id}
        })

        await ShowUser.destroy({
            where: {
                show_id: id
            }
        })

        if (destroyShow) {
            await ctx.deleteMessage()
            await ctx.reply('Показ удален!', ADMIN_INLINE_KEYBOARD(locale(ctx)))
        } else {
            await ctx.reply(getMessageByLang('remove_show_failed', locale(ctx)))
        }

    } catch (e) {
        console.log('handleRemoveShowConfirm', e.message)
        await ctx.reply(getMessageByLang('remove_show_failed', locale(ctx)))
    }
}

export async function handleAddShow(ctx) {
    await ctx.answerCbQuery()
    try {
        await ctx.scene.enter(sceneIds.admin.SCENE_ADD_SHOW)
    } catch (e) {
        console.log('handleAddShow', e.message)
        await onErrorAdd(ctx)
    }
}

async function onErrorAdd(ctx) {
    await ctx.reply(getMessageByLang('add_show_error', locale(ctx)), getAddShowButton(locale(ctx)))
}

export const SceneShowAdd = new Scenes.WizardScene(sceneIds.admin.SCENE_ADD_SHOW, async ctx => {
    try {
        await ctx.reply(
            getMessageByLang('send_show_text', locale(ctx)),
            CANCEL_BUTTON(locale(ctx))
        )
        return ctx.wizard.next();
    } catch (e) {
        console.log('SceneShowAdd step 1 ', e.message)
    }
}, async ctx => {
    try {
        if (ctx.update?.callback_query?.data === DATA_CANCEL) {
            return await handleCancel(ctx)
        } else if (!ctx.update?.message?.chat?.id || !ctx.update?.message?.message_id) {
            return await ctx.reply(getMessageByLang('send_message_from_chat', locale(ctx)))
        }

        ctx.session.forward_id         = ctx.update.message.chat.id
        ctx.session.forward_message_id = ctx.update.message.message_id

        await ctx.reply(getMessageByLang('send_limit_show', locale(ctx)), CANCEL_BUTTON(locale(ctx)))

        return ctx.wizard.next()
    } catch (e) {
        console.log('SceneShowAdd step 2', e.message)
    }
}, async ctx => {
    try {
        const limit = parseInt(ctx.update?.message?.text)

        if (ctx.update?.callback_query?.data === DATA_CANCEL) {
            return await handleCancel(ctx)
        }

        if (limit <= 0 || limit === 'NaN' || !limit) {
            return await ctx.reply(getMessageByLang('send_correct_limit_show', locale(ctx)), CANCEL_BUTTON(locale(ctx)))
        }

        await Show.create({
            forward_id:         ctx?.session?.forward_id,
            forward_message_id: ctx?.session?.forward_message_id,
            limit,
            active: true,
        })

        await ctx.replyWithHTML(
            getMessageByLang('add_show_success', locale(ctx)).replace(':limit', limit),
            ADMIN_INLINE_KEYBOARD(locale(ctx))
        )

        return ctx.scene.leave()
    } catch (e) {
        console.log('SceneShowAdd step 3', e.message)
    }
})
