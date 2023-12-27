import fs from 'fs'
import {User} from "../models/models.ts";
import {getMessageByLang} from "../helpers/other.js";
import {locale} from "../utils/consts.js";

export default async function handleGetDataBase(ctx) {
    ctx.answerCbQuery()

    try {
        const users = await User.scope('active').findAll({attributes: ['user_id'], raw: true})
        const writeContent = getIdsContent(users)
        const filePath = `db-csv.csv`

        await writeAndDownloadFile(ctx, filePath, writeContent)

    } catch (e) {
        console.log('handleGetDataBase', e.message)
    }
}

async function writeAndDownloadFile(ctx, filePath, writeContent) {
    try {
        fs.writeFileSync(filePath, writeContent, console.log)
        console.log('Success write to file!')
        await ctx.replyWithChatAction('UPLOAD_DOCUMENT')
        await ctx.replyWithDocument({source: filePath})
    } catch (e) {
        console.log(e)
        await ctx.reply(getMessageByLang('error_dump_db', locale(ctx)))
    }
}


function getIdsContent(users) {
    return users.map(user => user.user_id).join('\n')
}
