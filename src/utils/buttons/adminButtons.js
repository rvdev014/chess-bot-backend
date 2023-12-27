import { Markup } from 'telegraf'
import {getMessageByLang} from "../../helpers/other.js";
export const DATA_GET_DB                    = 'DATA_GET_DB'
export const DATA_GET_STAT                  = 'DATA_GET_STAT'
export const DATA_ADMIN                     = 'DATA_ADMIN'

export const DATA_ADD_CHANNEL               = 'DATA_ADD_CHANNEL'
export const DATA_EDIT_CHANNEL              = 'DATA_EDIT_CHANNEL'
export const DATA_LIST_CHANNEL              = 'DATA_LIST_CHANNEL'
export const DATA_REMOVE_CHANNEL            = 'DATA_REMOVE_CHANNEL'
export const DATA_REMOVE_CHANNEL_CONFIRM    = 'DATA_REMOVE_CHANNEL_CONFIRM'

export const DATA_ADD_SHOW                  = 'DATA_ADD_SHOW'
export const DATA_EDIT_SHOW                 = 'DATA_EDIT_SHOW'
export const DATA_LIST_SHOW                 = 'DATA_LIST_SHOW'
export const DATA_REMOVE_SHOW               = 'DATA_REMOVE_SHOW'
export const DATA_REMOVE_SHOW_CONFIRM       = 'DATA_REMOVE_SHOW_CONFIRM'

export const DATA_MAILING_CONFIRM           = 'DATA_MAILING_CONFIRM'
export const DATA_MAILING_CANCEL            = 'DATA_MAILING_CANCEL'
export const DATA_MAILING                   = 'DATA_MAILING'

export const DATA_CANCEL                    = 'cancel'

export function ADMIN_INLINE_KEYBOARD(locale) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(getMessageByLang('channels', locale), `${DATA_LIST_CHANNEL} 0`),
            Markup.button.callback(getMessageByLang('shows', locale), `${DATA_LIST_SHOW} 0`),
        ],
        [
            Markup.button.callback(getMessageByLang('statistic', locale), DATA_GET_STAT),
            Markup.button.callback(getMessageByLang('export_db', locale), DATA_GET_DB),
        ],
        [
            Markup.button.callback(getMessageByLang('newsletter', locale), DATA_MAILING),
        ],
    ]);
}

export function getAddChannelButton(locale) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(getMessageByLang('add_more', locale), DATA_ADD_CHANNEL),
        ],
        [
            Markup.button.callback(getMessageByLang('admin_menu', locale), DATA_ADMIN)
        ]
    ])
}

export function getAddShowButton(locale) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(getMessageByLang('add_show_again', locale), DATA_ADD_SHOW),
        ],
        [
            Markup.button.callback(getMessageByLang('admin_menu', locale), DATA_ADMIN)
        ]
    ])
}

export function CANCEL_BUTTON(locale) {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(getMessageByLang('cancel', locale), DATA_CANCEL),
        ],
    ])
}

export function getCancelButton(locale) {
    return Markup.inlineKeyboard([
        Markup.button.callback(getMessageByLang('cancel', locale), DATA_CANCEL)
    ])
}

export const DATA_PHRASE_TYPE_PHOTO = 'photo'
export const DATA_PHRASE_TYPE_STICKER = 'sticker'
export const DATA_PHRASE_TYPE_GIF = 'gif'
