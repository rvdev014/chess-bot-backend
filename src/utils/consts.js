
export const sceneIds = {
    admin: {
        SCENE_ADD_PHRASE: 'SCENE_ADD_PHRASE',
        SCENE_ADD_CHANNEL: 'SCENE_ADD_CHANNEL',
        SCENE_EDIT_CHANNEL: 'SCENE_EDIT_CHANNEL',
        SCENE_DELETE_CHANNEL: 'SCENE_DELETE_CHANNEL',

        SCENE_ADD_SHOW: 'SCENE_ADD_SHOW',
        SCENE_EDIT_SHOW: 'SCENE_EDIT_SHOW',
        SCENE_DELETE_SHOW: 'SCENE_DELETE_SHOW',

        SCENE_MAILING: 'SCENE_MAILING',
    },
    user: {
        SCENE_ADD_AGE: 'SCENE_ADD_AGE',
        SCENE_CHANGE_LANGUAGE: 'SCENE_CHANGE_LANGUAGE',
    },
    payment: {
        SCENE_TARIFF_PLAN: 'SCENE_TARIFF_PLAN',
    }
}

export const languages = [
    {
        "key": "ru",
        "title": "Русский",
        "icon": "🇷🇺",
    },
    {
        "key": "en",
        "title": "English",
        "icon": "🇬🇧",
    }
]

export const from = (ctx) => {
    let from = {}

    if (ctx?.from?.id) {
        from = ctx.from
    } else if (ctx?.message?.from?.id) {
        from = ctx.message.from
    } else if (ctx?.update?.message?.from?.id) {
        from = ctx.update.message.from
    } else if (ctx?.update?.callback_query?.message?.chat?.id) {
        from = ctx.update.callback_query.message.chat
    }

    return from;
}
export const locale = (ctx) => {
    return from(ctx)?.language_code ?? 'en'
}