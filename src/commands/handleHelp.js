import {getMessageByLang} from "../helpers/other.js";
import {locale} from "../utils/consts.js";

export default async function handleHelp(ctx) {
    await ctx.reply(getMessageByLang('help', locale(ctx)))
}
