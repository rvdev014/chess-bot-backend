import {User} from "../models/models.ts";
import {locale, sceneIds} from "../utils/consts.js";
import {Composer, Scenes} from "telegraf";
import {addBackButton, addProfileButton} from "../utils/buttons/userButtons.js";
import {getMessageByLang} from "../helpers/other.js";

export async function handleAddGender(ctx) {
    await ctx.answerCbQuery()
    await User?.update(
        {
            gender: ctx.update.callback_query.data.replace('DATA_GENDER_', '').toLocaleLowerCase()
        },
        {
            where: {user_id: ctx.from.id}
        }
    )

    try {
        await ctx.deleteMessage()
        await ctx.reply(getMessageByLang('settings_menu', locale(ctx)), addProfileButton(locale(ctx)))
    } catch (e) {
        console.log('handleAddGender', e.message)
    }
}

const ageStep = new Composer()
ageStep.on('text', async ctx => {
    try {
        await ctx.deleteMessage()
        const message = ctx.update.message

        if (parseInt(message.text) > 0 && parseInt(message.text) > 7 && parseInt(message.text) <= 100) {

            await User?.update(
                {
                    age: parseInt(message.text)
                },
                {
                    where: {user_id: ctx.from.id}
                }
            )
            await ctx.scene.leave()
            await ctx.reply(getMessageByLang('great', locale(ctx)), addProfileButton(locale(ctx)));
        } else {
            await ctx.reply(getMessageByLang('send_age', locale(ctx)))
        }

    } catch (e) {
        console.log('ageStep', e.message)
    }
})
ageStep.on('message', ctx => ctx.reply(getMessageByLang('send_correct_age', locale(ctx))))

export const sceneAddAge = new Scenes.WizardScene(sceneIds.user.SCENE_ADD_AGE, ageStep)
sceneAddAge.enter(ctx => {
    return ctx.reply(
        getMessageByLang('send_age', locale(ctx)),
        addBackButton(ctx)
    )
})