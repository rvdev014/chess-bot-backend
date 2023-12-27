import {ADMIN_INLINE_KEYBOARD} from "../utils/buttons/adminButtons.js";
import {getMessageByLang} from "../helpers/other.js";
import {locale} from "../utils/consts.js";

export default async function handleAdmin(ctx) {

    try {
        await ctx.deleteMessage()
    } catch (e) {
        console.log('handleAdmin deleteMessage', e.message)
    }

    await ctx.reply(getMessageByLang('hello_admin', locale(ctx)), ADMIN_INLINE_KEYBOARD(locale(ctx)))
}

export async function handleCancel(ctx) {
    try {
        await ctx.deleteMessage()
        await ctx.scene.leave()
        await ctx.reply(getMessageByLang('canceled', locale(ctx)), ADMIN_INLINE_KEYBOARD(locale(ctx)))
    } catch (e) {
        console.log('handleCancel', e.message)
    }
}
