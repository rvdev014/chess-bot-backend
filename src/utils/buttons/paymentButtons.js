import {Markup} from "telegraf";
import {getMessageByLang} from "../../helpers/other.js";
import {DATA_PROFILE, generateButtons} from "./userButtons.js";
import {paymentMethods} from "../paymentConsts.js";

export const DATA_TARIFF_PLAN           = 'DATA_TARIFF_PLAN'
export const DATA_TARIFF_PLAN_DAY       = 'DATA_TARIFF_PLAN_DAY'
export const DATA_TARIFF_PLAN_WEEK      = 'DATA_TARIFF_PLAN_WEEK'
export const DATA_TARIFF_PLAN_MONTH     = 'DATA_TARIFF_PLAN_MONTH'
export const DATA_TARIFF_PLAN_FOREVER   = 'DATA_TARIFF_PLAN_FOREVER'
export const DATA_PAYMENT               = 'DATA_PAYMENT'
export const DATA_PAYMENT_CHECK         = 'DATA_PAYMENT_CHECK'

export function addTariffPlanButton(locale) {
    return Markup.inlineKeyboard([
        [
            Markup.button.webApp('1$', 'https://payok.io/payment_link/41d6b-5t676-2l58s'),
            Markup.button.webApp('5$', 'https://payok.io/payment_link/nn5ey-9b37v-o86n8'),
            Markup.button.webApp('10$', 'https://payok.io/payment_link/7my51-l8d7u-3vukz'),
        ],
        [
            Markup.button.webApp('50$', 'https://payok.io/payment_link/woez4-k3l66-z7k73'),
            Markup.button.webApp('100$', 'https://payok.io/payment_link/v00yu-ag374-133vu'),
            Markup.button.webApp('500$', 'https://payok.io/payment_link/z8618-759v0-eb9in'),
        ],
        [
            Markup.button.webApp('1k$', 'https://payok.io/payment_link/pdczi-c5z09-6stck'),
            Markup.button.webApp('1.5k$', 'https://payok.io/payment_link/803d2-1l79b-g9dvi'),
            Markup.button.callback(getMessageByLang('back', locale), DATA_PROFILE),
        ]
    ])
}

export function addPaymentMethodButtons(ctx, sum) {
    return generateButtons(ctx, paymentMethods, `${DATA_PAYMENT} ${sum}`)
}
