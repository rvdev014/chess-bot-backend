import {session, Scenes} from "telegraf";

import handleStart from "./commands/handleStart.js";
import handleHelp from "./commands/handleHelp.js";
import handleMessage from "./handlers/handleMessage.js";
import handleAdmin, {handleCancel} from "./commands/handleAdmin.js";
import handleGetDataBase from "./handlers/handleGetDataBase.js";
import handleGetStat from "./handlers/handleGetStat.js";
import handleCheckRef from "./handlers/handleCheckRef.js";
import checkAdminLock from "./middlewares/checkAdminLock.js";
import {
    DATA_ADD_CHANNEL,
    DATA_GET_DB, DATA_GET_STAT, DATA_MAILING, DATA_ADMIN, DATA_CANCEL, DATA_ADD_SHOW,
} from "./utils/buttons/adminButtons.js";
import checkChannelSub from "./middlewares/checkChannelSub.js";
import {
    DATA_PROFILE,
    DATA_GENDER_FEMALE,
    DATA_GENDER_MALE,
    DATA_GENDER, DATA_AGE, DATA_INVITATION_LINK, DATA_LANGUAGE, DATA_FRIEND_LIST, DATA_ABOUT_ME,
} from "./utils/buttons/userButtons.js";
import {handleAddGender, sceneAddAge} from "./handlers/handleUserRegister.js";
import {
    handleChangeTariffPlan,
    handlePaymentCheck,
    handlePaymentSendRequest,
    handleTariffPlan
} from "./handlers/handlePayments.js";
import {
    DATA_PAYMENT_CHECK,
    DATA_TARIFF_PLAN,
    DATA_TARIFF_PLAN_DAY,
    DATA_TARIFF_PLAN_FOREVER,
    DATA_TARIFF_PLAN_MONTH,
    DATA_TARIFF_PLAN_WEEK
} from "./utils/buttons/paymentButtons.js";
import {
    handleActionProfile, handleLanguage, handlePlayGame,
    handleProfile,
    handleProfileAge, handleProfileFriendList,
    handleProfileGender,
    handleProfileInvitationLink, handleProfileLanguage,
} from "./handlers/handleProfile.js";
import {handleMailing, sceneAddMailing} from "./commands/handleMailing.js";
import {getAdmins} from "./helpers/admin.js";
import {
    handleChannelList,
    handleEditChannel,
    handleRemoveChannel,
    handleRemoveChannelConfirm,
    handleAddChannel,
    SceneChannelAdd,
} from "./handlers/handleChannels.js";
import {
    handleAddShow,
    handleEditShow, handleRemoveShow,
    handleRemoveShowConfirm,
    handleShowList,
    SceneShowAdd
} from "./handlers/handleShows.js";
import {WEBHOOK_DOMAIN, WEBHOOK_PATH} from "./config.ts";

export async function runBot(bot) {
    console.log('Starting bot...')

    const stage = new Scenes.Stage([
        SceneChannelAdd,
        sceneAddAge,
        sceneAddMailing,
        SceneShowAdd
    ])

    bot.use(session())
    bot.use(stage.middleware())

    bot.start(handleStart)
    bot.help(handleHelp)

    bot.command('admin', checkAdminLock, handleAdmin)
    bot.action(DATA_ADMIN, checkAdminLock, handleAdmin)

    bot.action(DATA_GET_DB, checkAdminLock, handleGetDataBase)

    bot.action(DATA_ADD_CHANNEL, checkAdminLock, handleAddChannel)

    const DATA_LIST_CHANNEL = new RegExp(/DATA_LIST_CHANNEL (.+)/i)
    bot.action(DATA_LIST_CHANNEL, checkAdminLock, handleChannelList)

    const DATA_EDIT_CHANNEL = new RegExp(/DATA_EDIT_CHANNEL (.+)/i)
    bot.action(DATA_EDIT_CHANNEL, checkAdminLock, handleEditChannel)

    const DATA_REMOVE_CHANNEL = new RegExp(/DATA_REMOVE_CHANNEL (.+)/i)
    bot.action(DATA_REMOVE_CHANNEL, checkAdminLock, handleRemoveChannel)

    const DATA_REMOVE_CHANNEL_CONFIRM = new RegExp(/DATA_REMOVE_CHANNEL_CONFIRM (.+)/i)
    bot.action(DATA_REMOVE_CHANNEL_CONFIRM, checkAdminLock, handleRemoveChannelConfirm)

    bot.action(DATA_ADD_SHOW, checkAdminLock, handleAddShow)

    const DATA_LIST_SHOW = new RegExp(/DATA_LIST_SHOW (.+)/i)
    bot.action(DATA_LIST_SHOW, checkAdminLock, handleShowList)

    const DATA_EDIT_SHOW = new RegExp(/DATA_EDIT_SHOW (.+)/i)
    bot.action(DATA_EDIT_SHOW, checkAdminLock, handleEditShow)

    const DATA_REMOVE_SHOW = new RegExp(/DATA_REMOVE_SHOW (.+)/i)
    bot.action(DATA_REMOVE_SHOW, checkAdminLock, handleRemoveShow)

    const DATA_REMOVE_SHOW_CONFIRM = new RegExp(/DATA_REMOVE_SHOW_CONFIRM (.+)/i)
    bot.action(DATA_REMOVE_SHOW_CONFIRM, checkAdminLock, handleRemoveShowConfirm)

    bot.action(DATA_CANCEL, checkAdminLock, handleCancel)

    bot.action(DATA_GET_STAT, checkAdminLock, handleGetStat)

    bot.action(DATA_MAILING, checkAdminLock, handleMailing)

    // Временно сделано командой, в будущем добавится кнопка "Реф ссылки"
    bot.command('ref', checkAdminLock, handleCheckRef)

    const DATA_CHANGE_LANGUAGE = new RegExp(/DATA_CHANGE_LANGUAGE (.+)/i)
    bot.action(DATA_CHANGE_LANGUAGE, handleLanguage)

    const DATA_PAYMENT = new RegExp(/DATA_PAYMENT (.+)/i)
    bot.action(DATA_PAYMENT, handlePaymentSendRequest)

    bot.command('profile', handleProfile)
    bot.command('play', handlePlayGame)
    bot.action(DATA_PROFILE, handleActionProfile)
    bot.action(DATA_ABOUT_ME, handleActionProfile)
    bot.action(DATA_GENDER, handleProfileGender)
    bot.action(DATA_AGE, handleProfileAge)
    bot.action(DATA_LANGUAGE, handleProfileLanguage)
    bot.action(DATA_INVITATION_LINK, handleProfileInvitationLink)
    bot.action(DATA_FRIEND_LIST, handleProfileFriendList)
    bot.action(DATA_GENDER_MALE, handleAddGender)
    bot.action(DATA_GENDER_FEMALE, handleAddGender)

    bot.command(DATA_TARIFF_PLAN, handleTariffPlan)
    bot.action(DATA_TARIFF_PLAN, handleTariffPlan)
    bot.action(DATA_TARIFF_PLAN_DAY, handleChangeTariffPlan)
    bot.action(DATA_TARIFF_PLAN_WEEK, handleChangeTariffPlan)
    bot.action(DATA_TARIFF_PLAN_MONTH, handleChangeTariffPlan)
    bot.action(DATA_TARIFF_PLAN_FOREVER, handleChangeTariffPlan)
    bot.action(DATA_PAYMENT_CHECK, handlePaymentCheck)
    bot.on('message', checkChannelSub, handleMessage)

    bot.telegram.getMe().then((botInfo) => {
        bot.options.username = botInfo.username
    })

    bot.catch(console.error)

    const options  = {};

    if (WEBHOOK_DOMAIN) {
        options.webhook = {
            domain: WEBHOOK_DOMAIN,
            hookPath: WEBHOOK_PATH,
        }
    }

    bot.launch(options).then(() => console.log('Bot started!')).catch((error) => console.log(error))

    await bot.telegram.sendMessage(getAdmins()[0], 'Я запущен')

    console.info(`Bot ${bot.botInfo.username} is up and running`)
}
