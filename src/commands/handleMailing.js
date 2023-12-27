import _ from 'lodash';
import {locale, sceneIds} from "../utils/consts.js";
import {Markup, Scenes} from "telegraf";
import {
    ADMIN_INLINE_KEYBOARD,
    DATA_CANCEL,
    DATA_MAILING_CANCEL,
    DATA_MAILING_CONFIRM,
    getCancelButton
} from "../utils/buttons/adminButtons.js";
import {User} from "../models/models.ts";
import {paginate} from "../helpers/admin.js";

export async function handleMailing(ctx) {
    try {
        await ctx.deleteMessage()
        await ctx.answerCbQuery()
        await ctx.scene.enter(sceneIds.admin.SCENE_MAILING)
    } catch (e) {
        console.log('handleMailing', e.message)
    }
}

export const sceneAddMailing = new Scenes.WizardScene(sceneIds.admin.SCENE_MAILING, async ctx => {
        await ctx.replyWithHTML('Отправьте сообщение для рассылки.', getCancelButton(locale(ctx)))

        return ctx.wizard.next()
    },
    async (ctx) => {
        try {
            if (ctx.update?.callback_query?.data === DATA_MAILING_CONFIRM) {
                try {
                    const updateMsg = await ctx.replyWithHTML(`🕘 <b>Рассылается</b> 0 / 60`)

                    ctx.session = {
                        page: 0
                    }

                    let success = 0
                    let error = 0
                    let length = 0

                    async function waitedProcess() {

                        const users = await User.findAll(paginate({
                                    raw: true,
                                    where: {
                                        active: true,
                                    },
                                },
                                {
                                    page: ctx.session.page,
                                    pageSize: 60
                                })
                        )

                        if (!users?.length || users?.length === 0) {

                            try {
                                length += users?.length
                                await ctx.telegram.editMessageText(updateMsg?.chat?.id, updateMsg?.message_id, updateMsg?.message_id, `🕘 Рассылается ${success + error} / ${length}`,)
                            } catch (e) {
                                console.log('Mailing editMessageText', e.message)
                            }

                            return await ctx.replyWithHTML(`✅ <b>Рассылка завершена\n\nУдалось отправить:</b> ${success}<b>\nНе удалось:</b>${error}\n\n❗️ Тем, кому не удалось отправить, это пользователи, которые остановили бота!`,
                                ADMIN_INLINE_KEYBOARD(locale(ctx))
                            )
                        }

                        const [firstStep, lastStep] = _.chunk(users, users.length / 2)

                        if (users.length % 2 !== 0) {
                            if (lastStep) {
                                lastStep?.push(users[users.length - 1])
                            } else {
                                firstStep?.push(users[users.length - 1])
                            }
                        }

                        length += (firstStep?.length ?? 0) + (lastStep?.length ?? 0)

                        firstStep?.map(async (user) => {
                            try {
                                await ctx.telegram.copyMessage(user.user_id, ctx.update?.callback_query.message.chat.id, ctx.update?.callback_query.message.message_id - 1, {
                                    disable_web_page_preview: true
                                })
                                success++
                            } catch (e) {
                                error++
                                console.log('firstStep', e.message)
                            }
                        })

                        lastStep?.map(async (user) => {
                            try {
                                await ctx.telegram.forwardMessage(user.user_id, ctx.update?.callback_query.message.chat.id, ctx.update?.callback_query.message.message_id - 1, {
                                    disable_web_page_preview: true
                                })
                                success++
                            } catch (e) {
                                error++
                                console.log('lastStep', e.message)
                            }
                        })

                        try {
                            await ctx.telegram.editMessageText(updateMsg?.chat?.id, updateMsg?.message_id, updateMsg?.message_id, `🕘 Рассылается ${success + error} / ${length}`,)
                        } catch (e) {
                            console.log('Mailing editMessageText', e.message)
                        }

                        if (users.length > 0) {

                            ctx.session.page += 1

                            setTimeout(async () => await waitedProcess(), 1000)

                        } else {

                            return await ctx.replyWithHTML(`✅ <b>Рассылка завершена\n\nУдалось отправить:</b> ${success}<b>\nНе удалось:</b>${error}\n\n❗️ Тем, кому не удалось отправить, это пользователи, которые остановили бота!`,
                                ADMIN_INLINE_KEYBOARD(locale(ctx))
                            )

                        }

                    }

                    setTimeout(async () => await waitedProcess(), 0)

                } catch (e) {
                    console.log('DATA_MAILING_CONFIRM', e.message)
                    await ctx.reply('Что-то пошло не так с рассылкой! Обратитесь к разработчику.')
                }

                return await ctx.scene.leave()

            } else if (ctx.update?.callback_query?.data === DATA_MAILING_CANCEL) {
                await ctx.deleteMessage()
                return await ctx.reply('Отправьте текст рассылки', getCancelButton(locale(ctx)))
            } else if (ctx.update?.callback_query?.data === DATA_CANCEL) {
                await handleCancel(ctx)
                return await ctx.scene.leave()
            }

            await ctx.reply(`Вы уверены, что хотите отправить рассылку ?. \n\nНажмите "✅ ДА". чтобы запустить рассылку или "🔙 Назад", чтобы внести изменения`,
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback('✅ ДА', DATA_MAILING_CONFIRM),
                        Markup.button.callback('🔙 Назад', DATA_MAILING_CANCEL),
                    ],
                ])
            )
        } catch (e) {
            console.log('sceneAddMailing', e.message)
        }
    })


export async function handleCancel(ctx) {
    try {
        await ctx.deleteMessage()
        await ctx.scene.leave()
        await ctx.reply('Отменено.', ADMIN_INLINE_KEYBOARD(locale(ctx)))
    } catch (e) {
        console.log('handleCancel', e.message)
    }
}
