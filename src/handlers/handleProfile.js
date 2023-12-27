import {addBackButton, addGenderButton, addLanguageButton, addProfileButton} from "../utils/buttons/userButtons.js";
import {locale, sceneIds} from "../utils/consts.js";
import {getMessageByLang} from "../helpers/other.js";
import {User} from "../models/models.ts";

export async function handleActionProfile(ctx) {
    try {
        // await ctx.deleteMessage()
        await ctx.reply(getMessageByLang('profile_desc', locale(ctx)), addProfileButton(locale(ctx)))
    } catch (e) {
        console.log('handleActionProfile', e.message)
    }
}

export async function handleProfile(ctx) {
    try {
        await ctx.reply(getMessageByLang('profile_desc', locale(ctx)), addProfileButton(locale(ctx)))
    } catch (e) {
        console.log('handleProfile', e.message)
    }
}

export async function handleProfileGender(ctx) {
    try {
        await ctx.deleteMessage()
        await ctx.reply(getMessageByLang('choose_gender', locale(ctx)), addGenderButton(ctx))
    } catch (e) {
        console.log('handleProfileGender', e.message)
    }
}

export async function handleProfileAge(ctx) {
    try {
        await ctx.deleteMessage()
        await ctx.scene.enter(sceneIds.user.SCENE_ADD_AGE)
    } catch (e) {
        console.log(e)
    }
}

export async function handleProfileLanguage(ctx) {
    try {
        await ctx.deleteMessage()
        await ctx.reply(getMessageByLang('choose_language', locale(ctx)), addLanguageButton(ctx))
    } catch (e) {
        console.log('handleProfileLanguage', e.message)
    }
}

export async function handleLanguage(ctx) {
    await ctx.answerCbQuery()
    await ctx.deleteMessage()

    try {
        await User?.update(
            {
                language_code: ctx.update.callback_query.data.replace('DATA_LANGUAGE ', '')
            },
            {
                where: {user_id: ctx.from.id}
            }
        )

    } catch (e) {
        console.log(e)
    }

    await ctx.reply(getMessageByLang('change_language_success', locale(ctx)), addProfileButton(locale(ctx)))
}

export async function handleProfileInvitationLink(ctx) {
    try {
        await ctx.deleteMessage()
        const message = getMessageByLang('invite_link', locale(ctx))
        await ctx.replyWithHTML(
            `<b>${message}</b>\n\nhttps://t.me/${process.env.BOT_NAME}?start=${ctx.from.id}`,
            addBackButton(locale(ctx))
        )
    } catch (e) {
        console.log(e)
    }
}
