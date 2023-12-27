import {PaymentLog, User} from "../models/models.ts";
import {
    addPaymentMethodButtons,
    addTariffPlanButton,
    DATA_TARIFF_PLAN_DAY, DATA_TARIFF_PLAN_FOREVER,
    DATA_TARIFF_PLAN_MONTH,
    DATA_TARIFF_PLAN_WEEK
} from "../utils/buttons/paymentButtons.js";
import {getMessageByLang} from "../helpers/other.js";
import {locale} from "../utils/consts.js";
import axios from "axios";
import { v4 } from 'uuid';
import crypto from "crypto";

export async function handleTariffPlan(ctx) {
    try {
        await ctx.deleteMessage()
        const user = await User?.findOne({
            where: {user_id: ctx.from.id}
        })

        if (user.payment_expired_at > new Date()) {
            await ctx.reply(
                getMessageByLang('payment_expired_at', locale(ctx))
                    .replace(':payment_expired_at', user.payment_expired_at)
            )
        } else {
            await ctx.replyWithHTML(getMessageByLang('donate_tariff', locale(ctx)), addTariffPlanButton(locale(ctx)))
        }

    } catch (error) {
        console.log('handleTariffPlan', error)
        await ctx.reply(getMessageByLang('donate_tariff_error', locale(ctx)))
    }
}

export async function handleChangeTariffPlan(ctx) {
    try {
        await ctx.deleteMessage()

        let sum = 0;

        switch (ctx.update.callback_query.data) {
            case DATA_TARIFF_PLAN_DAY:
                sum = 99;
                break;
            case DATA_TARIFF_PLAN_WEEK:
                sum = 299;
                break;
            case DATA_TARIFF_PLAN_MONTH:
                sum = 699;
                break;
            case DATA_TARIFF_PLAN_FOREVER:
                sum = 5999;
                break;
            default:
                await ctx.reply(getMessageByLang('choose_correct_payment_type', locale(ctx)));
                return
        }

        await ctx.reply(
            getMessageByLang('choose_payment_type', locale(ctx)),
            addPaymentMethodButtons(ctx, sum)
        )
    } catch (e) {
        console.log('handleChangeTariffPlan', e.message)
        await ctx.reply(getMessageByLang('choose_tariff_error', locale(ctx)))
    }
}

export async function handlePaymentSendRequest(ctx) {
    await ctx.answerCbQuery()
    // await ctx.deleteMessage()

    try {
        const tariff = ctx.update.callback_query.data.replace('DATA_PAYMENT ', '')
        const [price, method] = tariff.split(' ')
        const data = {
            "amount": price,
            "payment": v4(),
            "method": method,
            "shop": process.env.PAYOK_SHOP_ID,
            "desc": getMessageByLang('subscription_desc', locale(ctx)).replace(':price', price),
        }

        data.sign = crypto.createHash('md5').update([
            data.amount,
            data.payment,
            data.shop,
            data.desc,
            process.env.PAYOK_SECRET
        ].join('|'), 'utf-8').digest('hex')

        const payment = await PaymentLog.findOne({ where: { user_id: ctx.from.id, status: 'new' } })
            .then(function(obj) {
                const values = {
                    "status": "new",
                    "user_id": ctx.from.id,
                    "uuid": data.payment,
                    "entity": "payok",
                    "data": data
                }

                if(obj)
                    return obj.update(values);

                return PaymentLog.create(values);
            })

        const request = await axios.post('https://payok.io/pay', data,{
            headers: {
                "content-type": "application/json"
            }
        }).then(response => {
            console.log(response.data, response.status)
        }).catch(error => {
            console.log('error', error, `error ${error?.message}`)
        })

    } catch (e) {
        console.log(e)
    }
}

export async function handlePaymentCheck(ctx) {
    await ctx.reply(getMessageByLang('payment_success', locale(ctx)))
}