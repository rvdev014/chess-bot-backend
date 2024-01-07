import {Markup} from "telegraf";
import {getMessageByLang} from "../../helpers/other.js";
import {languages, locale} from "../consts.js";
import {DATA_TARIFF_PLAN} from "./paymentButtons.js";

export const DATA_PROFILE = 'DATA_PROFILE'
export const DATA_GENDER = 'DATA_GENDER'
export const DATA_AGE = 'DATA_AGE'
export const DATA_LANGUAGE = 'DATA_LANGUAGE'
export const DATA_CHANGE_LANGUAGE = 'DATA_CHANGE_LANGUAGE'
export const DATA_FRIEND_LIST = 'DATA_FRIEND_LIST'
export const DATA_ABOUT_ME = 'DATA_ABOUT_ME'
export const DATA_INVITATION_LINK = 'DATA_INVITATION_LINK'
export const DATA_GENDER_MALE = 'DATA_GENDER_MALE'
export const DATA_GENDER_FEMALE = 'DATA_GENDER_FEMALE'

export function addGenderButton(ctx) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(getMessageByLang('boy', locale(ctx)), DATA_GENDER_MALE),
            Markup.button.callback(getMessageByLang('girl', locale(ctx)), DATA_GENDER_FEMALE),
        ],
        [
            Markup.button.callback(getMessageByLang('back', locale(ctx)), DATA_PROFILE),
        ]
    ])
}

export function addLanguageButton(ctx) {
    return generateButtons(ctx, languages, DATA_CHANGE_LANGUAGE)
}

export function generateButtons(ctx, models, key) {
    const buttons = [];
    let backAdded = false;

    for (let i = 0; i < models.length; i += 2) {

        let [text, data, nextText, nextData] = getButtonKeys(ctx, models, i, key);

        let button = [
            Markup.button.callback(text, data)
        ];

        if (nextText !== undefined && nextData !== undefined) {
            button.push(Markup.button.callback(nextText, nextData))
        }

        if (button.length === 1) {
            backAdded = true;
            button.push(Markup.button.callback(getMessageByLang('back', locale(ctx)), DATA_PROFILE))
        }

        buttons.push(button);
    }

    if (!backAdded) {
        buttons.push([
            Markup.button.callback(getMessageByLang('back', locale(ctx)), DATA_PROFILE),
        ]);
    }

    return Markup.inlineKeyboard(buttons);
}

export function getButtonKeys(ctx, models, i, key) {
    const model = models[i];
    const nextModel = models[i + 1];

    let text = model?.title;
    let data = `${key} ${model?.key}`;

    let nextText = nextModel?.title;
    let nextData = `${key} ${nextModel?.key}`;

    if (key === DATA_CHANGE_LANGUAGE) {

        text = `${model.title} ${model.icon}`

        if (nextModel !== undefined) {
            nextText = `${nextModel.title} ${nextModel.icon}`
        }

    }

    return [text, data, nextText, nextData]
}

export function addBackButton(ctx) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(getMessageByLang('back', locale(ctx)), DATA_PROFILE),
        ],
    ])
}


export function addLinkWithBackButton(ctx) {
    const message = getMessageByLang('invite_link_click', locale(ctx))
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(getMessageByLang('back', locale(ctx)), DATA_PROFILE),
            Markup.button.switchToChat(getMessageByLang('forward', locale(ctx)), `${message} https://t.me/${process.env.BOT_NAME}?start=${ctx.from.id}`),
        ],
    ])
}

export function addProfileButton(locale) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(getMessageByLang('gender', locale), DATA_GENDER),
            Markup.button.callback(getMessageByLang('age', locale), DATA_AGE),
        ],
        [
            Markup.button.callback(getMessageByLang('invite_link_user', locale), DATA_INVITATION_LINK),
            Markup.button.callback(getMessageByLang('friend_list', locale), DATA_FRIEND_LIST),
        ],
        [
            // Markup.button.callback(getMessageByLang('choose_language', locale), DATA_LANGUAGE),
            Markup.button.callback(getMessageByLang('donate', locale), DATA_TARIFF_PLAN),
            Markup.button.callback(getMessageByLang('about_me', locale), DATA_ABOUT_ME),
        ],
        [
            Markup.button.callback(getMessageByLang('back', locale), DATA_PROFILE),
        ]
    ])
}

export const webAppButton = (ctx) => {

    try {
        setTimeout(() => {
            ctx.deleteMessage(ctx?.message?.message_id + 1)
        }, 30000)
    } catch (e) {
        console.log('webAppButton deleteMessage', e.message)
    }

    return Markup.inlineKeyboard([
        Markup.button.webApp(getMessageByLang('play', locale(ctx)), `${process.env.WEB_APP_URL}`)
    ])
};