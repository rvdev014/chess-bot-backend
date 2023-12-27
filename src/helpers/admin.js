export function getAdmins() {
    const splitArr = process.env.BOT_ADMINS?.split(',') || []
    return splitArr.map(item => +item)
}

export function isAdmin(userId) {
    return getAdmins().includes(userId)
}

export async function getChatMembersCount(ctx, chats) {
    let allMembersCount = 0
    for (const chat of chats) {
        const chatMembersCount = await ctx.telegram.getChatMembersCount(chat.chatId)
        if (chatMembersCount) {
            allMembersCount += chatMembersCount
        }
    }
    return allMembersCount
}

export const paginate = (query, {page, pageSize}) => {
    const offset = page * pageSize;
    const limit = pageSize;

    return {
        ...query,
        offset,
        limit,
    };
}
